/**
 * @file        public.module.ts
 * @description Public ABDM routes module (branding)
 * @module      abdm/public
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-29
 */

import { Module } from '@nestjs/common';
import { PublicAbdmController } from './public.controller';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [SessionModule],
  controllers: [PublicAbdmController],
})
export class PublicAbdmModule {}
