/**
 * @file        abha.module.ts
 * @description Module wrapping and exporting AbhaService.
 * @module      abha
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Module } from '@nestjs/common';
import { AbhaService } from './abha.service';
import { TenantModule } from '../tenant/tenant.module';
import { AuditModule } from '../audit/audit.module';
import { CryptoService } from '../../abdm/crypto.service';

@Module({
  imports: [TenantModule, AuditModule],
  providers: [AbhaService, CryptoService],
  exports: [AbhaService],
})
export class AbhaModule {}
