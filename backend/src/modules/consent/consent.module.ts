/**
 * @file        consent.module.ts
 * @description Module wrapping and exporting ConsentService.
 * @module      consent
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Module } from '@nestjs/common';
import { ConsentService } from './consent.service';
import { TenantModule } from '../tenant/tenant.module';
import { AuditModule } from '../audit/audit.module';
import { CryptoService } from '../../abdm/crypto.service';

@Module({
  imports: [TenantModule, AuditModule],
  providers: [ConsentService, CryptoService],
  exports: [ConsentService],
})
export class ConsentModule {}
