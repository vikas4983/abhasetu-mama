/**
 * @file        stakeholder-profile.service.ts
 * @description Stakeholder facility profile — photo, DOB, contact details
 * @module      abdm/admin
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-26
 */

import { Injectable } from '@nestjs/common';
import { DbService } from '../../db/db.service';

export interface StakeholderProfile {
  user_id: number;
  photo_url: string | null;
  date_of_birth: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  bio: string | null;
  facility_name: string | null;
  updated_at?: string;
}

@Injectable()
export class StakeholderProfileService {
  constructor(private readonly db: DbService) {}

  async ensureTable() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS stakeholder_profiles (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        photo_url VARCHAR(500),
        date_of_birth DATE,
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(10),
        bio TEXT,
        facility_name VARCHAR(255),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  }

  async getProfile(userId: number) {
    await this.ensureTable();
    const userRes = await this.db.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [userId],
    );
    if (!userRes.rows[0]) {
      return { status: 'error', message: 'User not found.' };
    }
    const profileRes = await this.db.query(
      'SELECT * FROM stakeholder_profiles WHERE user_id = $1',
      [userId],
    );
    const user = userRes.rows[0];
    const profile = profileRes.rows[0] as StakeholderProfile | undefined;
    return {
      status: 'success',
      user: { name: user.name, email: user.email, role: user.role },
      profile: profile || {
        user_id: userId,
        photo_url: null,
        date_of_birth: null,
        phone: null,
        address: null,
        city: null,
        state: null,
        pincode: null,
        bio: null,
        facility_name: user.name,
      },
    };
  }

  async saveProfile(userId: number, data: Partial<StakeholderProfile>) {
    await this.ensureTable();
    await this.db.query(
      `INSERT INTO stakeholder_profiles (user_id, photo_url, date_of_birth, phone, address, city, state, pincode, bio, facility_name, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         photo_url = COALESCE($2, stakeholder_profiles.photo_url),
         date_of_birth = COALESCE($3, stakeholder_profiles.date_of_birth),
         phone = COALESCE($4, stakeholder_profiles.phone),
         address = COALESCE($5, stakeholder_profiles.address),
         city = COALESCE($6, stakeholder_profiles.city),
         state = COALESCE($7, stakeholder_profiles.state),
         pincode = COALESCE($8, stakeholder_profiles.pincode),
         bio = COALESCE($9, stakeholder_profiles.bio),
         facility_name = COALESCE($10, stakeholder_profiles.facility_name),
         updated_at = NOW()`,
      [
        userId,
        data.photo_url ?? null,
        data.date_of_birth || null,
        data.phone || null,
        data.address || null,
        data.city || null,
        data.state || null,
        data.pincode || null,
        data.bio || null,
        data.facility_name || null,
      ],
    );
    await this.db.query(
      'INSERT INTO audit_logs (id, timestamp, event, status, details) VALUES ($1, NOW(), $2, $3, $4)',
      [`PROF-${Date.now()}`, 'stakeholder.profile.updated', 'SUCCESS', `userId=${userId}`],
    );
    return { status: 'success', message: 'Profile saved.' };
  }

  async updatePhoto(userId: number, photoUrl: string) {
    await this.ensureTable();
    await this.db.query(
      `INSERT INTO stakeholder_profiles (user_id, photo_url, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE SET photo_url = $2, updated_at = NOW()`,
      [userId, photoUrl],
    );
    return { status: 'success', photo_url: photoUrl };
  }
}
