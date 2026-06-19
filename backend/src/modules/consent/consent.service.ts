/**
 * @file        consent.service.ts
 * @description Service for managing patient consent requests and state updates.
 * @module      consent
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Injectable } from '@nestjs/common';
import { CryptoService } from '../../abdm/crypto.service';
import { TenantService } from '../tenant/tenant.service';
import { AuditService } from '../audit/audit.service';
import * as crypto from 'crypto';

@Injectable()
export class ConsentService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly tenantService: TenantService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * @description Initiates a consent request for a patient.
   * @param {any} body - Request body containing patient details and purpose.
   * @param {any} [context] - Request client context.
   * @returns {Promise<any>} Consent initiation result.
   */
  async requestConsent(body: any, context?: { ip?: string; userAgent?: string }): Promise<any> {
    const { abhaAddress, purpose, hiTypes } = body;
    if (!abhaAddress) {
      return { status: 'error', message: 'ABHA Address is required.' };
    }

    const config = await this.tenantService.getConfig();
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

    await this.auditService.addDetailedLog('Consent Request Initiated', 'SUCCESS', `Consent request initiated for patient: ${abhaAddress}`, {
      abhaId: abhaAddress,
      request: body,
      response: result,
      clientId: config.ABDM_CLIENT_ID,
      clientIp: context?.ip,
      userAgent: context?.userAgent,
    });

    return result;
  }
}
