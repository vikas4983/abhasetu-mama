/**
 * @file        uhi.module.ts
 * @description NestJS module configuring UHI teleconsultation networks.
 * @module      abdm/uhi
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Module } from '@nestjs/common';
import { UhiController } from './uhi.controller';
import { UhiService } from './uhi.service';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [SessionModule],
  controllers: [UhiController],
  providers: [UhiService],
  exports: [UhiService],
})
export class UhiModule {}
