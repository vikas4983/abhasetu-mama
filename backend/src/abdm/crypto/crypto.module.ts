/**
 * @file        crypto.module.ts
 * @description Dedicated NestJS module exporting the CryptoService.
 * @module      abdm/crypto
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';

@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}
