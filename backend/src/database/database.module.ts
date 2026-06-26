/**
 * @file        database.module.ts
 * @description Database migration module
 * @module      database
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Module } from '@nestjs/common';
import { MigrationService } from './migration.service';

@Module({
  providers: [MigrationService],
})
export class DatabaseModule {}
