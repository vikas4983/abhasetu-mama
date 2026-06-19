/**
 * @file        facility.module.ts
 * @description Module wrapping and exporting FacilityService.
 * @module      facility
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Module } from '@nestjs/common';
import { FacilityService } from './facility.service';
import { DbModule } from '../../database/db.module';

@Module({
  imports: [DbModule],
  providers: [FacilityService],
  exports: [FacilityService],
})
export class FacilityModule {}
