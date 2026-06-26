/**
 * @file        consent-hiu.module.ts
 * @description NestJS module configuring consent authorization and record decryption layers.
 * @module      abdm/consent-hiu
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Module } from '@nestjs/common';
import { ConsentHiuController } from './consent-hiu.controller';
import { ConsentHiuService } from './consent-hiu.service';
import { CryptoModule } from '../crypto/crypto.module';
import { SessionModule } from '../session/session.module';
import { HealthRecordsModule } from '../health-records/health-records.module';

@Module({
  imports: [CryptoModule, SessionModule, HealthRecordsModule],
  controllers: [ConsentHiuController],
  providers: [ConsentHiuService],
  exports: [ConsentHiuService],
})
export class ConsentHiuModule {}
