/**
 * @file        callbacks.module.ts
 * @description ABDM async callback handlers module
 * @module      abdm/callbacks
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Module } from '@nestjs/common';
import { CallbacksController } from './callbacks.controller';
import { CallbacksService } from './callbacks.service';

@Module({
  controllers: [CallbacksController],
  providers: [CallbacksService],
  exports: [CallbacksService],
})
export class CallbacksModule {}
