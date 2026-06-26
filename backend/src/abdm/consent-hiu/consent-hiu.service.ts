/**
 * @file        consent-hiu.service.ts
 * @description Milestone 3 HIU: consent requests, artefact fetch, health info transfer
 * @module      abdm/consent-hiu
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-21
 * @modified    2026-06-26
 */

import { Injectable } from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';
import { SessionService } from '../session/session.service';
import { AbdmGatewayService } from '../common/abdm-gateway.service';
import { AbdmTransactionService } from '../common/abdm-transaction.service';
import { HealthRecordsService } from '../health-records/health-records.service';
import { DbService } from '../../db/db.service';
import { ABDM_ENDPOINTS } from '../../constants/abdm.constants';
import { isSimulationEnabled } from '../utils/simulation.util';
import { resolveAxiosError } from '../utils/error-resolver.util';
import * as crypto from 'crypto';

@Injectable()
export class ConsentHiuService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly sessionService: SessionService,
    private readonly gateway: AbdmGatewayService,
    private readonly txnService: AbdmTransactionService,
    private readonly healthRecords: HealthRecordsService,
    private readonly db: DbService,
  ) {}

  /**
   * @description Handles consent request initiation and record fetching
   */
  async handleConsent(body: Record<string, unknown>, context?: { ip?: string; userAgent?: string }): Promise<Record<string, unknown>> {
    const action = body.action as string;
    const abhaAddress = body.abhaAddress as string;
    const config = await this.sessionService.getConfig();
    const hiuId = config.ABDM_HIU_ID || process.env.ABDM_HIU_ID || '';

    if (action === 'request-consent') {
      if (!abhaAddress) {
        return { status: 'error', message: 'ABHA Address is required.' };
      }

      const requestId = crypto.randomUUID();
      const keyMaterial = this.cryptoService.generateEphemeralKeys();

      try {
        await this.txnService.createTransaction('CONSENT_INIT', requestId, undefined, { abhaAddress });
        const data = await this.gateway.request({
          path: ABDM_ENDPOINTS.CONSENT_REQUEST_INIT,
          useGatewayBase: true,
          body: {
            requestId,
            timestamp: new Date().toISOString(),
            consent: {
              purpose: { text: (body.purpose as string) || 'Care Management', code: 'CAREMGT' },
              patient: { id: abhaAddress },
              hiu: { id: hiuId },
              hiTypes: (body.hiTypes as string[]) || ['Prescription', 'DiagnosticReport'],
              permission: {
                accessMode: 'VIEW',
                dateRange: { from: new Date(Date.now() - 365 * 86400000).toISOString(), to: new Date().toISOString() },
                dataEraseAt: new Date(Date.now() + 30 * 86400000).toISOString(),
                frequency: { unit: 'HOUR', value: 1 },
              },
            },
          },
          extraHeaders: { 'X-HIU-ID': hiuId },
        });

        await this.db.query(
          `INSERT INTO abdm.consent_requests (request_id, abha_address, purpose, hi_types, status)
           VALUES ($1, $2, $3, $4, 'INITIATED')`,
          [requestId, abhaAddress, body.purpose || 'CAREMGT', body.hiTypes || ['Prescription']],
        );

        return {
          status: 'success',
          message: 'Consent request initiated',
          consentRequestId: requestId,
          keyMaterial,
          data,
          simulated: false,
        };
      } catch (e: unknown) {
        if (!isSimulationEnabled()) {
          const resolved = resolveAxiosError(e);
          return { status: 'error', message: resolved.userMessage };
        }
        return {
          status: 'success',
          message: 'Consent request initiated (simulated)',
          consentRequestId: requestId,
          consentId: `AR-${Math.floor(100000 + Math.random() * 900000)}`,
          keyMaterial,
          patient: abhaAddress,
          simulated: true,
        };
      }
    }

    if (action === 'fetch-records') {
      const consentId = body.consentId as string;
      if (!consentId) {
        return { status: 'error', message: 'Consent ID is required.' };
      }

      const requestId = crypto.randomUUID();
      const keyMaterial = this.cryptoService.generateEphemeralKeys();

      try {
        await this.gateway.request({
          path: ABDM_ENDPOINTS.HEALTH_INFO_REQUEST,
          useGatewayBase: true,
          body: {
            requestId,
            timestamp: new Date().toISOString(),
            hiRequest: {
              consent: { id: consentId },
              dateRange: { from: new Date(Date.now() - 365 * 86400000).toISOString(), to: new Date().toISOString() },
              dataPushUrl: `${process.env.ABDM_CALLBACK_BASE_URL || 'http://localhost:3001'}/api/abdm/health-records/data-push`,
              keyMaterial: {
                cryptoAlg: 'ECDH',
                curve: 'Curve25519',
                dhPublicKey: { expiry: new Date(Date.now() + 3600000).toISOString(), parameters: 'Curve25519/32byte random key', keyValue: keyMaterial.publicKey },
                nonce: keyMaterial.nonce,
              },
            },
          },
          extraHeaders: { 'X-HIU-ID': hiuId },
        });

        const artefactRes = await this.db.query(
          `SELECT artefact FROM abdm.consent_artefacts WHERE consent_id = $1`,
          [consentId],
        );

        if (artefactRes.rowCount && artefactRes.rowCount > 0) {
          const bundles = await this.healthRecords.fetchRecordsForConsent(
            abhaAddress || '',
            (body.hiTypes as string[]) || ['Prescription'],
          );
          return { status: 'success', message: 'Records fetched', fhirBundles: bundles, simulated: false };
        }

        return { status: 'success', message: 'Health info request sent; awaiting HIP push', requestId, simulated: false };
      } catch (e: unknown) {
        if (!isSimulationEnabled()) {
          const resolved = resolveAxiosError(e);
          return { status: 'error', message: resolved.userMessage };
        }
        return this.simulatedFetch(consentId, keyMaterial, body, context);
      }
    }

    if (action === 'fetch-consent-artefact') {
      const requestId = crypto.randomUUID();
      try {
        const data = await this.gateway.request({
          path: ABDM_ENDPOINTS.CONSENT_FETCH,
          useGatewayBase: true,
          body: { requestId, timestamp: new Date().toISOString(), consentId: body.consentId },
          extraHeaders: { 'X-HIU-ID': hiuId },
        });
        return { status: 'success', data, simulated: false };
      } catch (e: unknown) {
        const resolved = resolveAxiosError(e);
        return { status: 'error', message: resolved.userMessage };
      }
    }

    return { status: 'error', message: 'Invalid Action specified.' };
  }

  private async simulatedFetch(
    consentId: string,
    keyMaterial: { publicKey: string; nonce: string; privateKey: string },
    body: Record<string, unknown>,
    context?: { ip?: string; userAgent?: string },
  ): Promise<Record<string, unknown>> {
    const config = await this.sessionService.getConfig();
    const peerKeys = this.cryptoService.generateEphemeralKeys();
    const { aesKey, iv } = this.cryptoService.deriveFideliusSymmetricKey(
      keyMaterial.privateKey,
      peerKeys.publicKey,
      keyMaterial.nonce,
      peerKeys.nonce,
    );
    const decryptedString = this.cryptoService.decryptFhirPayload('e2k81792HJSKDFHKSJDHF839217...', aesKey, iv);
    const decryptedBundle = JSON.parse(decryptedString);
    const result = {
      status: 'success',
      message: 'Health records decrypted (simulated)',
      consentId,
      fhirBundle: decryptedBundle,
      simulated: true,
    };
    await this.sessionService.addDetailedLog('Health Records Decrypted', 'SUCCESS', `Consent: ${consentId}`, {
      request: body,
      response: { consentId, fhirBundleType: decryptedBundle?.resourceType },
      clientId: config.ABDM_CLIENT_ID,
      clientIp: context?.ip,
      userAgent: context?.userAgent,
    });
    return result;
  }
}
