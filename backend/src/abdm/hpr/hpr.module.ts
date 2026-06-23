/**
 * @file        hpr.module.ts
 * @description NestJS module configuring HPR professionals registration.
 * @module      abdm/hpr
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Module } from '@nestjs/common';
import { HprController } from './hpr.controller';
import { HprService } from './hpr.service';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [SessionModule],
  controllers: [HprController],
  providers: [HprService],
  exports: [HprService],
})
export class HprModule {}
