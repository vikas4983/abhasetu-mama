/**
 * @file        records.service.ts
 * @description Service handling FHIR packages, link context, medical records retrieval, and ABHA card downloading.
 * @module      records
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Injectable } from '@nestjs/common';
import { CryptoService } from '../../abdm/crypto.service';
import { TenantService } from '../tenant/tenant.service';
import { AuditService } from '../audit/audit.service';
import { ABDM_ENDPOINTS, ABDM_HEADERS } from '../../constants/abdm.constants';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class RecordsService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly tenantService: TenantService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * @description Handles HIP care contexts discovery and linking.
   */
  async handleHip(body: any, context?: { ip?: string; userAgent?: string }): Promise<any> {
    const { action, abhaAddress, patientName, contextType, detail, otp, txnId } = body;
    const config = await this.tenantService.getConfig();

    if (action === 'discover-link') {
      if (!abhaAddress || !patientName) {
        return { status: 'error', message: 'ABHA Address and Patient Name are required.' };
      }

      const matchedPatient = {
        referenceNumber: `PAT-${Math.floor(100000 + Math.random() * 900000)}`,
        display: patientName,
        careContexts: [
          {
            referenceNumber: `EMR-CTX-${Math.floor(1000 + Math.random() * 9000)}`,
            display: `${contextType || 'OPD Consultation'} - ${detail || 'Chronic Care visit'}`,
            hiType: contextType === 'Prescription' ? 'Prescription' : contextType === 'Lab Report' ? 'DiagnosticReport' : 'OPConsultation'
          }
        ]
      };

      const result = {
        status: 'success',
        message: 'Patient matched successfully in EMR database.',
        transactionId: crypto.randomUUID(),
        txnId: crypto.randomUUID(),
        matchedPatient,
        simulated: true,
      };

      await this.auditService.addDetailedLog('HIP Patient Discovery', 'SUCCESS', `Discovered care contexts for ABHA Address: ${abhaAddress}`, {
        abhaId: abhaAddress,
        request: body,
        response: result,
        clientId: config.ABDM_CLIENT_ID,
        clientIp: context?.ip,
        userAgent: context?.userAgent,
      });

      return result;

    } else if (action === 'confirm-link') {
      if (!otp || !txnId) {
        return { status: 'error', message: 'OTP and transaction context ID are required.' };
      }

      if (otp === '123456') {
        const result = {
          status: 'success',
          message: 'Care context linked successfully under ABDM Gateway!',
          linkingStatus: 'SUCCESS',
          linkedAt: new Date().toISOString(),
          referenceNumber: `LINK-${Math.floor(100000 + Math.random() * 900000)}`,
          simulated: true,
        };

        await this.auditService.addDetailedLog('HIP Care Context Link Confirmed', 'SUCCESS', `Successfully linked care contexts for txn: ${txnId}`, {
          request: body,
          response: result,
          clientId: config.ABDM_CLIENT_ID,
          clientIp: context?.ip,
          userAgent: context?.userAgent,
        });

        return result;
      } else {
        const result = { status: 'error', message: 'Invalid OTP code. Please enter 123456.' };
        await this.auditService.addDetailedLog('HIP Care Context Link Failed', 'ERROR', 'Failed to link care context: Invalid OTP', {
          request: body,
          response: result,
          clientId: config.ABDM_CLIENT_ID,
          clientIp: context?.ip,
          userAgent: context?.userAgent,
        });
        return result;
      }
    }

    return { status: 'error', message: 'Invalid Action.' };
  }

  /**
   * @description Fetches and decrypts health records under a given consent.
   */
  async fetchRecords(body: any, context?: { ip?: string; userAgent?: string }): Promise<any> {
    const { consentId } = body;
    if (!consentId) {
      return { status: 'error', message: 'Consent ID is required.' };
    }

    const config = await this.tenantService.getConfig();
    const ourKeys = this.cryptoService.generateEphemeralKeys();
    const peerKeys = this.cryptoService.generateEphemeralKeys();

    const { aesKey, iv } = this.cryptoService.deriveFideliusSymmetricKey(
      ourKeys.privateKey,
      peerKeys.publicKey,
      ourKeys.nonce,
      peerKeys.nonce
    );

    const fhirMockBundle = 'e2k81792HJSKDFHKSJDHF839217...';
    const decryptedString = this.cryptoService.decryptFhirPayload(fhirMockBundle, aesKey, iv);
    const decryptedBundle = JSON.parse(decryptedString);

    const result = {
      status: 'success',
      message: 'Health records fetched and decrypted successfully via Fidelius protocol.',
      consentId: consentId,
      securityDetails: {
        exchangeCurve: 'Curve25519 (secp256r1/Weierstrass params)',
        symmetricAlgorithm: 'AES-256-GCM',
        derivedKeyPreview: `${aesKey.subarray(0, 8).toString('hex')}...`,
        saltPreview: `${iv.subarray(0, 6).toString('hex')}...`,
      },
      fhirBundle: decryptedBundle,
      simulated: true,
    };

    await this.auditService.addDetailedLog('Health Records Decrypted', 'SUCCESS', `Decrypted clinical records under Consent: ${consentId}`, {
      request: body,
      response: {
        consentId: result.consentId,
        securityDetails: result.securityDetails,
        fhirBundleType: result.fhirBundle?.resourceType
      },
      clientId: config.ABDM_CLIENT_ID,
      clientIp: context?.ip,
      userAgent: context?.userAgent,
    });

    return result;
  }

  /**
   * @description Downloads citizen ABHA card from the gateway.
   */
  async downloadAbhaCard(xToken: string, token: string, abhaBaseUrl: string): Promise<any> {
    const cleanXToken = xToken.startsWith('Bearer ') ? xToken.substring(7) : xToken;
    try {
      const response = await axios.get(`${abhaBaseUrl}${ABDM_ENDPOINTS.ABHA_CARD}`, {
        headers: {
          [ABDM_HEADERS.X_TOKEN]: `Bearer ${cleanXToken}`,
          'X-token': `Bearer ${cleanXToken}`,
          [ABDM_HEADERS.REQUEST_ID]: crypto.randomUUID(),
          [ABDM_HEADERS.TIMESTAMP]: new Date().toISOString(),
          [ABDM_HEADERS.AUTHORIZATION]: `Bearer Token ${token}`
        },
        responseType: 'arraybuffer'
      });
      return { status: 'success', data: response.data, contentType: response.headers['content-type'] || 'image/png' };
    } catch (e: any) {
      let errorMsg = e.message;
      let errorDetails = null;
      if (e.response?.data) {
        try {
          const rawBuffer = Buffer.from(e.response.data);
          const parsed = JSON.parse(rawBuffer.toString('utf8'));
          errorMsg = parsed.message || parsed.description || errorMsg;
          errorDetails = parsed;
        } catch (jsonErr) {
          // not json
        }
      }
      return { status: 'error', message: errorMsg, details: errorDetails };
    }
  }
}
