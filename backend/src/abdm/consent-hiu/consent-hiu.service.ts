/**
 * @file        consent-hiu.service.ts
 * @description Dedicated service for Milestone 3 Consent requests, authorizations, and clinical records transfers.
 * @module      abdm/consent-hiu
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Injectable } from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';
import { SessionService } from '../session/session.service';
import * as crypto from 'crypto';

@Injectable()
export class ConsentHiuService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly sessionService: SessionService
  ) {}

  /**
   * @description Handles consent request initiation and record fetching decryption via Fidelius protocol.
   */
  async handleConsent(body: any, context?: { ip?: string; userAgent?: string }): Promise<any> {
    const { action, abhaAddress, purpose, hiTypes, consentId } = body;
    const config = await this.sessionService.getConfig();

    if (action === 'request-consent') {
      if (!abhaAddress) {
        return { status: 'error', message: 'ABHA Address is required.' };
      }

      const keyMaterial = this.cryptoService.generateEphemeralKeys();
      const result = {
        status: 'success',
        message: 'Consent request initiated successfully. Awaiting patient approval.',
        consentRequestId: crypto.randomUUID(),
        consentId: `AR-${Math.floor(100000 + Math.random() * 900000)}`,
        keyMaterial: {
          publicKey: keyMaterial.publicKey,
          nonce: keyMaterial.nonce,
        },
        patient: abhaAddress,
        purpose: purpose || 'Clinical Referral',
        hiTypes: hiTypes || ['Prescription', 'DiagnosticReport'],
        simulated: true,
      };

      await this.sessionService.addDetailedLog('Consent Request Initiated', 'SUCCESS', `Consent request initiated for patient: ${abhaAddress}`, {
        abhaId: abhaAddress,
        request: body,
        response: result,
        clientId: config.ABDM_CLIENT_ID,
        clientIp: context?.ip,
        userAgent: context?.userAgent,
      });

      return result;

    } else if (action === 'fetch-records') {
      if (!consentId) {
        return { status: 'error', message: 'Consent ID is required.' };
      }

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

      await this.sessionService.addDetailedLog('Health Records Decrypted', 'SUCCESS', `Decrypted clinical records under Consent: ${consentId}`, {
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

    return { status: 'error', message: 'Invalid Action specified.' };
  }
}
