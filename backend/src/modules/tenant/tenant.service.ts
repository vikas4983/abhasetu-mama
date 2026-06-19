/**
 * @file        tenant.service.ts
 * @description Service for managing tenant-specific settings and application configuration parameters.
 * @module      tenant
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Injectable } from '@nestjs/common';
import { DbService } from '../../database/db.service';

@Injectable()
export class TenantService {
  constructor(private readonly db: DbService) {}

  /**
   * @description Fetches all keys and values from the database configuration settings.
   * @returns {Promise<Record<string, any>>} Config object.
   */
  async getConfig(): Promise<Record<string, any>> {
    const res = await this.db.query('SELECT key, value FROM config');
    const config: any = {};
    for (const row of res.rows) {
      if (row.value === 'true') {
        config[row.key] = true;
      } else if (row.value === 'false') {
        config[row.key] = false;
      } else {
        config[row.key] = row.value;
      }
    }
    return config;
  }

  /**
   * @description Upserts new configuration key-value pairs in the config database.
   * @param {any} newConfig - Object containing config settings.
   * @returns {Promise<any>} Status response object.
   */
  async saveConfig(newConfig: any): Promise<any> {
    for (const [key, value] of Object.entries(newConfig)) {
      await this.db.query(
        'INSERT INTO config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        [key, String(value)]
      );
    }
    return { status: 'success', message: 'Config updated successfully' };
  }
}
