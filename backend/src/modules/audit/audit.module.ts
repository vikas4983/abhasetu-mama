/**
 * @file        audit.module.ts
 * @description Module wrapping and exporting AuditService.
 * @module      audit
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { DbModule } from '../../database/db.module';

@Module({
  imports: [DbModule],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
