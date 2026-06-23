/**
 * @file        clinical.module.ts
 * @description NestJS module configuring clinical catalogs and medical specialties.
 * @module      abdm/clinical
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-21
 * @modified    2026-06-22
 */

import { Module } from '@nestjs/common';
import { ClinicalController } from './clinical.controller';
import { ClinicalService } from './clinical.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ClinicalController],
  providers: [ClinicalService],
  exports: [ClinicalService],
})
export class ClinicalModule {}
