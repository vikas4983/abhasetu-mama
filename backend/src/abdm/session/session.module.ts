/**
 * @file        session.module.ts
 * @description NestJS module configuring session control layers and caching gateways.
 * @module      abdm/session
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-21
 * @modified    2026-06-22
 */

import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { CryptoModule } from '../crypto/crypto.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [CryptoModule, AuthModule],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
