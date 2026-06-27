/**
 * @file        pincode-directory.service.ts
 * @description Paginated CRUD and CSV import for India Post pincode directory
 * @module      abdm/admin
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-26
 */

import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

export interface PincodeDirectoryRow {
  id: number;
  circle_name: string | null;
  region_name: string | null;
  division_name: string | null;
  office_name: string;
  pincode: string;
  office_type: string | null;
  delivery: string | null;
  district: string | null;
  state_name: string;
  latitude: string | null;
  longitude: string | null;
}

export interface PincodeListQuery {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  district?: string;
  pincode?: string;
}

@Injectable()
export class PincodeDirectoryService {
  private readonly logger = new Logger(PincodeDirectoryService.name);
  private importInProgress = false;

  constructor(private readonly db: DbService) {}

  /**
   * @description Ensure pincode_directory table exists (idempotent)
   */
  async ensureSchema(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS pincode_directory (
        id SERIAL PRIMARY KEY,
        circle_name VARCHAR(200),
        region_name VARCHAR(200),
        division_name VARCHAR(200),
        office_name VARCHAR(255) NOT NULL,
        pincode VARCHAR(10) NOT NULL,
        office_type VARCHAR(20),
        delivery VARCHAR(50),
        district VARCHAR(150),
        state_name VARCHAR(100) NOT NULL,
        latitude VARCHAR(30),
        longitude VARCHAR(30),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_pincode_directory_pincode ON pincode_directory(pincode);
      CREATE INDEX IF NOT EXISTS idx_pincode_directory_state ON pincode_directory(state_name);
      CREATE INDEX IF NOT EXISTS idx_pincode_directory_district ON pincode_directory(district);
    `);
    try {
      await this.db.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_pincode_directory_office_pin
          ON pincode_directory (pincode, lower(trim(office_name)))
      `);
    } catch {
      this.logger.warn('Pincode unique index pending — remove duplicates from admin console');
    }
  }

  /** @description Normalize pincode to 6 digits */
  private normalizePincode(pincode: string): string {
    return (pincode || '').replace(/\D/g, '').slice(0, 6);
  }

  /** @description Check duplicate by pincode + office name */
  async isDuplicate(officeName: string, pincode: string, excludeId?: number): Promise<boolean> {
    await this.ensureSchema();
    const cleanPin = this.normalizePincode(pincode);
    if (!cleanPin || cleanPin.length !== 6 || !officeName?.trim()) {
      return false;
    }
    const params: unknown[] = [cleanPin, officeName.trim()];
    let sql = `SELECT id FROM pincode_directory WHERE pincode = $1 AND lower(trim(office_name)) = lower(trim($2))`;
    if (excludeId != null) {
      sql += ` AND id <> $3`;
      params.push(excludeId);
    }
    sql += ' LIMIT 1';
    const res = await this.db.query(sql, params);
    return res.rows.length > 0;
  }

  /** @description Count rows that would be removed as duplicates (keeps lowest id) */
  async countDuplicates(): Promise<number> {
    await this.ensureSchema();
    const res = await this.db.query(`
      SELECT COUNT(*)::int AS c FROM pincode_directory a
      WHERE EXISTS (
        SELECT 1 FROM pincode_directory b
        WHERE b.pincode = a.pincode
          AND lower(trim(b.office_name)) = lower(trim(a.office_name))
          AND b.id < a.id
      )
    `);
    return res.rows[0]?.c ?? 0;
  }

  /**
   * @description Remove duplicate post offices — keeps the row with the smallest id
   */
  async removeDuplicates(): Promise<{ status: string; removed: number; message: string }> {
    await this.ensureSchema();
    const res = await this.db.query(`
      DELETE FROM pincode_directory a
      USING pincode_directory b
      WHERE a.id > b.id
        AND a.pincode = b.pincode
        AND lower(trim(a.office_name)) = lower(trim(b.office_name))
      RETURNING a.id
    `);
    const removed = res.rowCount ?? res.rows.length;
    await this.syncLegacyFromDirectory();
    try {
      await this.db.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_pincode_directory_office_pin
          ON pincode_directory (pincode, lower(trim(office_name)))
      `);
    } catch {
      /* index may already exist */
    }
    this.logger.log(`Removed ${removed} duplicate pincode directory rows`);
    return {
      status: 'success',
      removed,
      message: removed > 0 ? `Removed ${removed} duplicate record(s).` : 'No duplicates found.',
    };
  }

  /**
   * @description Paginated list with filters (OWASP: parameterized queries only)
   */
  async list(query: PincodeListQuery): Promise<{ rows: PincodeDirectoryRow[]; total: number; page: number; limit: number }> {
    await this.ensureSchema();
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 25));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (query.pincode) {
      conditions.push(`pincode = $${idx++}`);
      params.push(query.pincode.replace(/\D/g, '').slice(0, 6));
    }
    if (query.state) {
      conditions.push(`state_name ILIKE $${idx++}`);
      params.push(`%${query.state}%`);
    }
    if (query.district) {
      conditions.push(`district ILIKE $${idx++}`);
      params.push(`%${query.district}%`);
    }
    if (query.search) {
      conditions.push(`(office_name ILIKE $${idx} OR pincode LIKE $${idx + 1} OR district ILIKE $${idx})`);
      params.push(`%${query.search}%`, `${query.search.replace(/\D/g, '')}%`);
      idx += 2;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await this.db.query(`SELECT COUNT(*)::int AS total FROM pincode_directory ${where}`, params);
    const total = countRes.rows[0]?.total ?? 0;

    const listRes = await this.db.query(
      `SELECT id, circle_name, region_name, division_name, office_name, pincode, office_type, delivery, district, state_name, latitude, longitude
       FROM pincode_directory ${where}
       ORDER BY pincode ASC, office_name ASC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset],
    );

    return { rows: listRes.rows, total, page, limit };
  }

  /**
   * @description Dashboard stats for admin charts
   */
  async getStats(): Promise<Record<string, unknown>> {
    await this.ensureSchema();
    const duplicateCount = await this.countDuplicates();
    const [totalRes, stateRes, recentRes, legacyRes] = await Promise.all([
      this.db.query('SELECT COUNT(*)::int AS c FROM pincode_directory'),
      this.db.query(`SELECT state_name, COUNT(*)::int AS count FROM pincode_directory GROUP BY state_name ORDER BY count DESC LIMIT 10`),
      this.db.query('SELECT COUNT(*)::int AS c FROM pincode_directory WHERE created_at > NOW() - INTERVAL \'7 days\''),
      this.db.query('SELECT COUNT(*)::int AS c FROM pincodes'),
    ]);

    return {
      totalOffices: totalRes.rows[0]?.c ?? 0,
      uniquePincodesLegacy: legacyRes.rows[0]?.c ?? 0,
      importedLast7Days: recentRes.rows[0]?.c ?? 0,
      duplicateRows: duplicateCount,
      topStates: stateRes.rows,
    };
  }

  /**
   * @description Create a single post office row
   */
  async create(row: Omit<PincodeDirectoryRow, 'id'>): Promise<{ status: string; id?: number; message?: string }> {
    await this.ensureSchema();
    const pincode = this.normalizePincode(row.pincode);
    if (pincode.length !== 6) {
      return { status: 'error', message: 'Pincode must be exactly 6 digits.' };
    }
    if (!row.office_name?.trim()) {
      return { status: 'error', message: 'Office name is required.' };
    }
    if (await this.isDuplicate(row.office_name, pincode)) {
      return { status: 'error', message: 'Duplicate record: this pincode and office name already exist.' };
    }
    const res = await this.db.query(
      `INSERT INTO pincode_directory (circle_name, region_name, division_name, office_name, pincode, office_type, delivery, district, state_name, latitude, longitude)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [
        row.circle_name, row.region_name, row.division_name, row.office_name.trim(),
        pincode, row.office_type, row.delivery, row.district, row.state_name,
        row.latitude, row.longitude,
      ],
    );
    await this.syncLegacyPincode(pincode, row.district || '', row.state_name);
    return { status: 'success', id: res.rows[0].id };
  }

  /**
   * @description Update post office row by id
   */
  async update(id: number, row: Partial<PincodeDirectoryRow>): Promise<{ status: string }> {
    await this.db.query(
      `UPDATE pincode_directory SET
        circle_name = COALESCE($1, circle_name),
        region_name = COALESCE($2, region_name),
        division_name = COALESCE($3, division_name),
        office_name = COALESCE($4, office_name),
        pincode = COALESCE($5, pincode),
        office_type = COALESCE($6, office_type),
        delivery = COALESCE($7, delivery),
        district = COALESCE($8, district),
        state_name = COALESCE($9, state_name),
        latitude = COALESCE($10, latitude),
        longitude = COALESCE($11, longitude)
       WHERE id = $12`,
      [
        row.circle_name ?? null, row.region_name ?? null, row.division_name ?? null,
        row.office_name ?? null, row.pincode ?? null, row.office_type ?? null,
        row.delivery ?? null, row.district ?? null, row.state_name ?? null,
        row.latitude ?? null, row.longitude ?? null, id,
      ],
    );
    return { status: 'success' };
  }

  /**
   * @description Delete post office row by id
   */
  async delete(id: number): Promise<{ status: string }> {
    await this.db.query('DELETE FROM pincode_directory WHERE id = $1', [id]);
    return { status: 'success' };
  }

  /**
   * @description Import CSV from project root or env path (batched for performance)
   */
  async importFromCsv(filePath?: string): Promise<{ status: string; imported: number; skipped: number; message: string }> {
    if (this.importInProgress) {
      return { status: 'error', imported: 0, skipped: 0, message: 'Import already in progress.' };
    }

    const resolved = filePath
      || process.env.PINCODE_CSV_PATH
      || path.join(process.cwd(), '../pincode_directory.csv');

    if (!fs.existsSync(resolved)) {
      return { status: 'error', imported: 0, skipped: 0, message: `CSV not found at ${resolved}` };
    }

    this.importInProgress = true;
    await this.ensureSchema();

    let imported = 0;
    let skipped = 0;
    const batch: unknown[][] = [];
    const BATCH_SIZE = 500;

    const flush = async () => {
      if (batch.length === 0) return;
      const placeholders = batch.map((_, i) => {
        const b = i * 11;
        return `($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7},$${b + 8},$${b + 9},$${b + 10},$${b + 11})`;
      }).join(',');
      const flat = batch.flat();
      const insertRes = await this.db.query(
        `INSERT INTO pincode_directory (circle_name, region_name, division_name, office_name, pincode, office_type, delivery, district, state_name, latitude, longitude)
         SELECT v.* FROM (VALUES ${placeholders}) AS v(circle_name, region_name, division_name, office_name, pincode, office_type, delivery, district, state_name, latitude, longitude)
         WHERE NOT EXISTS (
           SELECT 1 FROM pincode_directory p
           WHERE p.pincode = v.pincode AND lower(trim(p.office_name)) = lower(trim(v.office_name))
         )`,
        flat,
      );
      imported += insertRes.rowCount ?? 0;
      batch.length = 0;
    };

    try {
      const rl = readline.createInterface({ input: fs.createReadStream(resolved, { encoding: 'utf8' }), crlfDelay: Infinity });
      let isHeader = true;

      for await (const line of rl) {
        if (isHeader) { isHeader = false; continue; }
        const cols = this.parseCsvLine(line);
        if (cols.length < 10) { skipped++; continue; }

        const [circle, region, division, office, pincode, officeType, delivery, district, state, lat, lng] = cols;
        const cleanPin = (pincode || '').replace(/\D/g, '').slice(0, 6);
        if (!cleanPin || cleanPin.length !== 6) { skipped++; continue; }

        batch.push([
          circle || null, region || null, division || null, office || 'Unknown',
          cleanPin, officeType || null, delivery || null, district || null,
          state || 'UNKNOWN', lat === 'NA' ? null : lat, lng === 'NA' ? null : lng,
        ]);

        if (batch.length >= BATCH_SIZE) await flush();
      }

      await flush();
      await this.syncLegacyFromDirectory();

      this.logger.log(`Pincode CSV import complete: ${imported} rows, ${skipped} skipped`);
      return { status: 'success', imported, skipped, message: `Imported ${imported} post offices.` };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Import failed';
      return { status: 'error', imported, skipped, message: msg };
    } finally {
      this.importInProgress = false;
    }
  }

  /** @description Sync unique pincode → district/state into legacy pincodes table */
  private async syncLegacyPincode(pincode: string, district: string, state: string): Promise<void> {
    if (!pincode || !state) return;
    await this.db.query(
      `INSERT INTO pincodes (pincode, district, state) VALUES ($1, $2, $3) ON CONFLICT (pincode) DO UPDATE SET district = EXCLUDED.district, state = EXCLUDED.state`,
      [pincode, district || 'Unknown', state],
    );
  }

  private async syncLegacyFromDirectory(): Promise<void> {
    await this.db.query(`
      INSERT INTO pincodes (pincode, district, state)
      SELECT DISTINCT pincode, COALESCE(district, 'Unknown'), state_name FROM pincode_directory
      ON CONFLICT (pincode) DO UPDATE SET district = EXCLUDED.district, state = EXCLUDED.state
    `);
  }

  /** @description Minimal CSV parser for quoted fields */
  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }
}
