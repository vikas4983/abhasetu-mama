/**
 * @file        records.module.ts
 * @description Module wrapping and exporting RecordsService.
 * @module      records
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Module } from '@nestjs/common';
import { RecordsService } from './records.service';
import { TenantModule } from '../tenant/tenant.module';
import { AuditModule } from '../audit/audit.module';
import { CryptoService } from '../../abdm/crypto.service';

@Module({
  imports: [TenantModule, AuditModule],
  providers: [RecordsService, CryptoService],
  exports: [RecordsService],
})
export class RecordsModule {}
