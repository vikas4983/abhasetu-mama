/**
 * @file        stakeholder-ops.service.ts
 * @description Facility operations data (beds, tests, pharmacy, blood bank, appointments)
 * @module      abdm/admin
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-26
 */

import { Injectable } from '@nestjs/common';
import { DbService } from '../../db/db.service';

@Injectable()
export class StakeholderOpsService {
  constructor(private readonly db: DbService) {}

  async ensureTable() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS stakeholder_ops (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL,
        data JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  private defaultData(role: string): Record<string, unknown> {
    const beds = Array.from({ length: 24 }, (_, i) => ({
      id: `B-${101 + i}`,
      ward: i < 8 ? 'General' : i < 16 ? 'ICU' : 'Private',
      status: i % 5 === 0 ? 'occupied' : i % 7 === 0 ? 'maintenance' : 'available',
      patient: i % 5 === 0 ? `Patient ${i + 1}` : null,
    }));

    const all: Record<string, Record<string, unknown>> = {
      hospital: {
        beds,
        appointments: [
          { id: 'A1', patient: 'Aarav Sharma', abha: 'aarav@sbx', doctor: 'Dr. Mehta', slot: '10:00', status: 'confirmed', type: 'OPD' },
          { id: 'A2', patient: 'Priya Nair', abha: 'priya@sbx', doctor: 'Dr. Singh', slot: '10:30', status: 'pending', type: 'OPD' },
          { id: 'A3', patient: 'Rahul Verma', abha: 'rahul@sbx', doctor: 'Dr. Mehta', slot: '11:00', status: 'confirmed', type: 'Follow-up' },
        ],
        staff: [
          { id: 'S1', name: 'Dr. Ananya Mehta', role: 'doctor', dept: 'Cardiology', available: true, slots: ['09:00-12:00', '16:00-18:00'] },
          { id: 'S2', name: 'Dr. Raj Singh', role: 'doctor', dept: 'General', available: true, slots: ['10:00-14:00'] },
          { id: 'S3', name: 'Nurse Kavita', role: 'nurse', dept: 'ICU', available: true, slots: ['08:00-20:00'] },
          { id: 'S4', name: 'Lab Tech Ravi', role: 'lab', dept: 'Pathology', available: false, slots: [] },
          { id: 'S5', name: 'Admin Pooja', role: 'staff', dept: 'Front desk', available: true, slots: ['09:00-18:00'] },
        ],
        bloodBank: [
          { component: 'Whole Blood', group: 'O+', units: 12, demand: 'high' },
          { component: 'Whole Blood', group: 'A+', units: 8, demand: 'medium' },
          { component: 'Whole Blood', group: 'B-', units: 2, demand: 'rare' },
          { component: 'Platelets', group: 'O+', units: 5, demand: 'high' },
          { component: 'PRP', group: 'AB+', units: 3, demand: 'low' },
          { component: 'FFP', group: 'A-', units: 4, demand: 'medium' },
        ],
      },
      lab: {
        tests: [
          { id: 'T1', name: 'CBC', price: 350, homeCollection: true, areas: ['Jabalpur', 'Bhopal'], bookings: 420 },
          { id: 'T2', name: 'Lipid Profile', price: 650, homeCollection: true, areas: ['Jabalpur'], bookings: 280 },
          { id: 'T3', name: 'HbA1c', price: 450, homeCollection: false, areas: ['Jabalpur', 'Indore'], bookings: 310 },
          { id: 'T4', name: 'Thyroid Panel', price: 550, homeCollection: true, areas: ['Bhopal'], bookings: 190 },
        ],
        areaCoverage: ['Jabalpur', 'Bhopal', 'Indore', 'Nagpur'],
      },
      pharmacy: {
        medicines: [
          { id: 'M1', name: 'Paracetamol 650mg', salts: 'Paracetamol', rxRequired: false, stock: 240, price: 40, area: 'Jabalpur Central' },
          { id: 'M2', name: 'Amoxicillin 500mg', salts: 'Amoxicillin', rxRequired: true, stock: 85, price: 120, area: 'Jabalpur Central' },
          { id: 'M3', name: 'Insulin Glargine', salts: 'Insulin glargine', rxRequired: true, stock: 22, price: 890, area: 'Bhopal North' },
          { id: 'M4', name: 'Cetirizine 10mg', salts: 'Cetirizine', rxRequired: false, stock: 150, price: 25, area: 'Jabalpur Central' },
        ],
        location: { address: 'MG Road, Jabalpur', serveRadiusKm: 15 },
        topAreas: ['Jabalpur Central', 'Wright Town', 'Gwarighat'],
      },
      individual_doctor: {
        appointments: [
          { id: 'D1', patient: 'Suresh K.', mobile: '******7890', slot: '2026-06-27 09:00', mode: 'telemedicine', status: 'pending' },
          { id: 'D2', patient: 'Meena R.', mobile: '******6543', slot: '2026-06-27 10:30', mode: 'in-person', status: 'confirmed' },
          { id: 'D3', patient: 'Vikram P.', mobile: '******4321', slot: '2026-06-27 11:00', mode: 'telemedicine', status: 'pending' },
        ],
        availability: [
          { day: 'Mon', slots: ['09:00', '09:30', '10:00', '10:30', '11:00'] },
          { day: 'Wed', slots: ['14:00', '14:30', '15:00', '15:30'] },
          { day: 'Fri', slots: ['09:00', '09:30', '10:00'] },
        ],
      },
    };
    return all[role] || {};
  }

  async getOpsForUser(userId: number, role: string) {
    await this.ensureTable();
    const res = await this.db.query('SELECT data FROM stakeholder_ops WHERE user_id = $1', [userId]);
    if (res.rows[0]?.data) {
      return { status: 'success', data: res.rows[0].data };
    }
    const defaults = this.defaultData(role);
    await this.db.query(
      'INSERT INTO stakeholder_ops (user_id, role, data) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO NOTHING',
      [userId, role, JSON.stringify(defaults)],
    );
    return { status: 'success', data: defaults };
  }

  async saveOps(userId: number, role: string, data: Record<string, unknown>) {
    await this.ensureTable();
    await this.db.query(
      `INSERT INTO stakeholder_ops (user_id, role, data, updated_at) VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE SET data = $3, updated_at = NOW()`,
      [userId, role, JSON.stringify(data)],
    );
    await this.db.query(
      'INSERT INTO audit_logs (id, timestamp, event, status, details) VALUES ($1, NOW(), $2, $3, $4)',
      [`OPS-${Date.now()}`, 'stakeholder.ops.updated', 'SUCCESS', `userId=${userId} role=${role}`],
    );
    return { status: 'success', message: 'Operations data saved.' };
  }

  async getFacilityInsights(facilityUserId: number) {
    const userRes = await this.db.query('SELECT id, name, email, role, status FROM users WHERE id = $1', [facilityUserId]);
    if (!userRes.rows[0]) {
      return { status: 'error', message: 'Facility not found.' };
    }
    const user = userRes.rows[0];
    const ops = await this.getOpsForUser(facilityUserId, user.role);
    return {
      status: 'success',
      facility: user,
      ops: ops.data,
      charts: this.buildCharts(user.role, ops.data as Record<string, unknown>),
    };
  }

  private buildCharts(role: string, data: Record<string, unknown>) {
    if (role === 'hospital') {
      const h = data as { beds?: { status: string }[]; bloodBank?: { group: string; units: number; component?: string }[] };
      const beds = h.beds || [];
      return {
        bedStatus: {
          labels: ['Available', 'Occupied', 'Maintenance'],
          values: [
            beds.filter((b) => b.status === 'available').length,
            beds.filter((b) => b.status === 'occupied').length,
            beds.filter((b) => b.status === 'maintenance').length,
          ],
        },
        bloodGroups: (h.bloodBank || []).map((b) => ({
          label: `${b.group} (${b.component || 'WB'})`,
          value: b.units,
        })),
      };
    }
    if (role === 'lab') {
      const tests = (data as { tests?: { name: string; bookings: number }[] }).tests || [];
      return { topTests: tests.map((t) => ({ label: t.name, value: t.bookings })) };
    }
    if (role === 'pharmacy') {
      const meds = (data as { medicines?: { name: string; stock: number }[] }).medicines || [];
      return { stockLevels: meds.map((m) => ({ label: m.name, value: m.stock })) };
    }
    if (role === 'individual_doctor') {
      const appts = (data as { appointments?: { status: string }[] }).appointments || [];
      return {
        appointmentStatus: {
          labels: ['Pending', 'Confirmed', 'Rejected'],
          values: [
            appts.filter((a) => a.status === 'pending').length,
            appts.filter((a) => a.status === 'confirmed').length,
            appts.filter((a) => a.status === 'rejected').length,
          ],
        },
      };
    }
    return {};
  }
}
