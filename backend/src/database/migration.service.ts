/**
 * @file        migration.service.ts
 * @description Runs versioned SQL migrations on application startup
 * @module      database
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DbService } from '../db/db.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MigrationService implements OnModuleInit {
  private readonly logger = new Logger(MigrationService.name);

  constructor(private readonly db: DbService) {}

  async onModuleInit(): Promise<void> {
    await this.runMigrations();
  }

  async runMigrations(): Promise<void> {
    await this.db.query('CREATE SCHEMA IF NOT EXISTS abdm');
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS abdm.schema_migrations (
        version VARCHAR(50) PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      this.logger.warn('No migrations directory found');
      return;
    }

    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      const version = file.replace('.sql', '');
      const applied = await this.db.query(
        'SELECT 1 FROM abdm.schema_migrations WHERE version = $1',
        [version],
      );
      if (applied.rowCount && applied.rowCount > 0) continue;

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      this.logger.log(`Applying migration: ${file}`);
      await this.db.query(sql);
      await this.db.query(
        'INSERT INTO abdm.schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING',
        [version],
      );
    }
  }
}
