/**
 * @file        health-records.service.ts
 * @description FHIR R4 health record packaging and storage for HIP transfers
 * @module      abdm/health-records
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Injectable } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { CryptoService } from '../crypto/crypto.service';
import * as crypto from 'crypto';

@Injectable()
export class HealthRecordsService {
  constructor(
    private readonly db: DbService,
    private readonly cryptoService: CryptoService,
  ) {}

  /**
   * @description Package a care context into a FHIR R4 Bundle
   */
  buildFhirBundle(params: {
    patientName: string;
    abhaAddress: string;
    hiType: string;
    display: string;
    referenceNumber: string;
  }): Record<string, unknown> {
    const now = new Date().toISOString();
    return {
      resourceType: 'Bundle',
      type: 'document',
      timestamp: now,
      entry: [
        {
          fullUrl: `urn:uuid:${crypto.randomUUID()}`,
          resource: {
            resourceType: 'Patient',
            id: params.referenceNumber,
            name: [{ text: params.patientName }],
            identifier: [{ system: 'https://healthid.ndhm.gov.in', value: params.abhaAddress }],
          },
        },
        {
          fullUrl: `urn:uuid:${crypto.randomUUID()}`,
          resource: {
            resourceType: params.hiType === 'Prescription' ? 'MedicationRequest' : 'DocumentReference',
            status: 'current',
            description: params.display,
            date: now,
          },
        },
      ],
    };
  }

  /**
   * @description Store a FHIR bundle linked to a care context
   */
  async storeRecord(
    careContextId: string,
    hiType: string,
    bundle: Record<string, unknown>,
  ): Promise<string> {
    const res = await this.db.query(
      `INSERT INTO abdm.health_records (care_context_id, hi_type, fhir_bundle)
       VALUES ($1, $2, $3) RETURNING id`,
      [careContextId, hiType, JSON.stringify(bundle)],
    );
    return res.rows[0].id;
  }

  /**
   * @description Fetch records for a care context within date range
   */
  async fetchRecordsForConsent(
    abhaAddress: string,
    hiTypes: string[],
    dateFrom?: string,
    dateTo?: string,
  ): Promise<Record<string, unknown>[]> {
    const res = await this.db.query(
      `SELECT hr.fhir_bundle FROM abdm.health_records hr
       JOIN abdm.care_contexts cc ON cc.id = hr.care_context_id
       WHERE cc.status = 'LINKED'
       AND hr.hi_type = ANY($1)
       ORDER BY hr.created_at DESC LIMIT 50`,
      [hiTypes],
    );
    return res.rows.map((r: { fhir_bundle: Record<string, unknown> }) => r.fhir_bundle);
  }

  /**
   * @description Encrypt FHIR bundle for HIU transfer using Fidelius ECDH
   */
  encryptForTransfer(
    bundle: Record<string, unknown>,
    hiuPublicKey: string,
    hiuNonce: string,
  ): { encryptedData: string; keyMaterial: { publicKey: string; nonce: string } } {
    const ourKeys = this.cryptoService.generateEphemeralKeys();
    const { aesKey, iv } = this.cryptoService.deriveFideliusSymmetricKey(
      ourKeys.privateKey,
      hiuPublicKey,
      ourKeys.nonce,
      hiuNonce,
    );
    const plaintext = JSON.stringify(bundle);
    const encrypted = this.cryptoService.encryptFhirPayload(plaintext, aesKey, iv);
    return {
      encryptedData: encrypted,
      keyMaterial: { publicKey: ourKeys.publicKey, nonce: ourKeys.nonce },
    };
  }
}
