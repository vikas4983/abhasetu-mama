/**
 * @file        health-records.module.ts
 * @description FHIR health records module
 * @module      abdm/health-records
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Module } from '@nestjs/common';
import { HealthRecordsService } from './health-records.service';
import { HealthRecordsController } from './health-records.controller';
import { CryptoModule } from '../crypto/crypto.module';

@Module({
  imports: [CryptoModule],
  controllers: [HealthRecordsController],
  providers: [HealthRecordsService],
  exports: [HealthRecordsService],
})
export class HealthRecordsModule {}
