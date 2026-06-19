/**
 * @file        scan-share.module.ts
 * @description Module wrapping and exporting ScanShareService.
 * @module      scan-share
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Module } from '@nestjs/common';
import { ScanShareService } from './scan-share.service';
import { TenantModule } from '../tenant/tenant.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TenantModule, AuditModule],
  providers: [ScanShareService],
  exports: [ScanShareService],
})
export class ScanShareModule {}
