/**
 * @file        phr.module.ts
 * @description NestJS module for PHR and HIECM locker integration
 * @module      abdm/phr
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Module } from '@nestjs/common';
import { PhrController } from './phr.controller';
import { PhrService } from './phr.service';
import { CryptoModule } from '../crypto/crypto.module';
import { SessionModule } from '../session/session.module';
import { AbdmCommonModule } from '../common/common.module';

@Module({
  imports: [CryptoModule, SessionModule, AbdmCommonModule],
  controllers: [PhrController],
  providers: [PhrService],
  exports: [PhrService],
})
export class PhrModule {}
