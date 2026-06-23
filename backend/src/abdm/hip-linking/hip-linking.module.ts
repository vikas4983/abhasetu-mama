/**
 * @file        hip-linking.module.ts
 * @description NestJS module configuring care context linking and scan-share workflows.
 * @module      abdm/hip-linking
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Module } from '@nestjs/common';
import { HipLinkingController } from './hip-linking.controller';
import { HipLinkingService } from './hip-linking.service';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [SessionModule],
  controllers: [HipLinkingController],
  providers: [HipLinkingService],
  exports: [HipLinkingService],
})
export class HipLinkingModule {}
