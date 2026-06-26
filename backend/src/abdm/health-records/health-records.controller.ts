/**
 * @file        health-records.controller.ts
 * @description HIU endpoint to receive encrypted health information push
 * @module      abdm/health-records
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { HealthRecordsService } from './health-records.service';
import { DbService } from '../../db/db.service';

@Controller('health-records')
export class HealthRecordsController {
  constructor(
    private readonly healthRecordsService: HealthRecordsService,
    private readonly db: DbService,
  ) {}

  /**
   * @description HIU data-push URL — receives encrypted FHIR from HIP
   */
  @Post('data-push')
  @HttpCode(HttpStatus.ACCEPTED)
  async receiveDataPush(@Body() body: Record<string, unknown>) {
    const entries = (body.entries as unknown[]) || [];
    await this.db.query(
      `INSERT INTO abdm.health_info_transfers (consent_id, record_count, status)
       VALUES ($1, $2, 'RECEIVED')`,
      [(body.consentId as string) || 'unknown', entries.length],
    );
    return { status: 'ACK' };
  }

  /**
   * @description List stored health records for display
   */
  @Get()
  async listRecords() {
    const res = await this.db.query(
      `SELECT id, hi_type, fhir_bundle, created_at FROM abdm.health_records ORDER BY created_at DESC LIMIT 20`,
    );
    return { status: 'success', records: res.rows };
  }
}
