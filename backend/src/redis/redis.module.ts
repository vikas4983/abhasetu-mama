/**
 * @file        redis.module.ts
 * @description Global Redis module for ABDM caching
 * @module      redis
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
