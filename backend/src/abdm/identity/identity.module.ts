/**
 * @file        identity.module.ts
 * @description NestJS module configuring enrollment layers, profiles, and demographic onboardings.
 * @module      abdm/identity
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Module } from '@nestjs/common';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { CryptoModule } from '../crypto/crypto.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [CryptoModule, SessionModule],
  controllers: [IdentityController],
  providers: [IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
