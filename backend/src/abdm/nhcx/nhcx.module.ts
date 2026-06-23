/**
 * @file        nhcx.module.ts
 * @description NestJS module configuring NHCX claim adjudications.
 * @module      abdm/nhcx
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Module } from '@nestjs/common';
import { NhcxController } from './nhcx.controller';
import { NhcxService } from './nhcx.service';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [SessionModule],
  controllers: [NhcxController],
  providers: [NhcxService],
  exports: [NhcxService],
})
export class NhcxModule {}
