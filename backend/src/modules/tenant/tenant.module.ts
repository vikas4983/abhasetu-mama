/**
 * @file        tenant.module.ts
 * @description Module wrapping and exporting TenantService.
 * @module      tenant
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { DbModule } from '../../database/db.module';

@Module({
  imports: [DbModule],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
