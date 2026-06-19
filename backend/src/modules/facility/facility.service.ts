/**
 * @file        facility.service.ts
 * @description Service for managing healthcare facility configurations, stakeholder registration, and pincodes lookup.
 * @module      facility
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Injectable } from '@nestjs/common';
import { DbService } from '../../database/db.service';
import axios from 'axios';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class FacilityService {
  constructor(private readonly db: DbService) {}

  /**
   * @description Get district and state for a given Indian pincode.
   * Leverages local database, and falls back to a public pincode API.
   * @param {string} pincode - Pincode.
   * @returns {Promise<any>} Pincode details.
   */
  async getPincodeDetails(pincode: string): Promise<any> {
    // 1. Query local database
    const res = await this.db.query('SELECT district, state FROM pincodes WHERE pincode = $1', [pincode]);
    if (res.rowCount && res.rowCount > 0) {
      return {
        status: 'success',
        pincode,
        district: res.rows[0].district,
        state: res.rows[0].state,
        source: 'local_db'
      };
    }

    // 2. Fallback to official India Post public API
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`, { timeout: 4000 });
      if (response.data && response.data[0] && response.data[0].Status === 'Success') {
        const postOffice = response.data[0].PostOffice[0];
        const district = postOffice.District;
        const state = postOffice.State;

        // Cache in local database for future fast lookups
        await this.db.query(
          'INSERT INTO pincodes (pincode, district, state) VALUES ($1, $2, $3) ON CONFLICT (pincode) DO NOTHING',
          [pincode, district, state]
        );

        return {
          status: 'success',
          pincode,
          district,
          state,
          source: 'india_post_api'
        };
      }
    } catch (e: any) {
      console.warn(`External pincode API lookup failed for ${pincode}:`, e.message);
    }

    // 3. Heuristic range for Madhya Pradesh (450000 - 489999)
    const pinNum = parseInt(pincode);
    if (!isNaN(pinNum) && pinNum >= 450000 && pinNum <= 489999) {
      return {
        status: 'success',
        pincode,
        district: 'Jabalpur', // Default MP district if unresolved
        state: 'Madhya Pradesh',
        source: 'heuristic_fallback'
      };
    }

    return {
      status: 'error',
      message: 'Pincode not found or invalid format.'
    };
  }

  /**
   * @description Get all pincodes in local database.
   * @returns {Promise<any[]>} List of pincodes.
   */
  async getPincodes(): Promise<any[]> {
    const res = await this.db.query('SELECT pincode, district, state FROM pincodes ORDER BY pincode ASC');
    return res.rows;
  }

  /**
   * @description Creates a new pincode entry in local database.
   */
  async createPincode(pincode: string, district: string, state: string): Promise<any> {
    const check = await this.db.query('SELECT 1 FROM pincodes WHERE pincode = $1', [pincode]);
    if ((check.rowCount ?? 0) > 0) {
      throw new Error('Pincode already exists.');
    }
    await this.db.query(
      'INSERT INTO pincodes (pincode, district, state) VALUES ($1, $2, $3)',
      [pincode, district, state]
    );
    return { status: 'success', message: 'Pincode created successfully.' };
  }

  /**
   * @description Updates an existing pincode entry in local database.
   */
  async updatePincode(pincode: string, district: string, state: string): Promise<any> {
    await this.db.query(
      'UPDATE pincodes SET district = $1, state = $2 WHERE pincode = $3',
      [district, state, pincode]
    );
    return { status: 'success', message: 'Pincode updated successfully.' };
  }

  /**
   * @description Deletes a pincode entry from local database.
   */
  async deletePincode(pincode: string): Promise<any> {
    await this.db.query('DELETE FROM pincodes WHERE pincode = $1', [pincode]);
    return { status: 'success', message: 'Pincode deleted successfully.' };
  }

  /**
   * @description Registers a new stakeholder facility (hospital, clinic, pharmacy, etc.).
   */
  async registerFacility(data: any): Promise<any> {
    const { email, password, role, name } = data;

    // Check if email already exists
    const emailCheck = await this.db.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (emailCheck.rowCount && emailCheck.rowCount > 0) {
      return { status: 'error', message: 'Email address already registered.' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Resolve role_id
    const roleRes = await this.db.query('SELECT id FROM roles WHERE name = $1', [role]);
    if (!roleRes.rowCount || roleRes.rowCount === 0) {
      return { status: 'error', message: `Invalid stakeholder role: ${role}` };
    }
    const roleId = roleRes.rows[0].id;
    const userStatus = data.status || 'pending';

    // Insert user
    const userRes = await this.db.query(
      'INSERT INTO users (email, password, role, name, role_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [email, hashedPassword, role, name, roleId, userStatus]
    );
    const userId = userRes.rows[0].id;

    // Insert role-specific details
    try {
      if (role === 'hospital') {
        await this.db.query(
          'INSERT INTO facility_hospitals (user_id, address, contact, bed_count, specialties, photos, abdm_doc) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [userId, data.address || '', data.contact || '', parseInt(data.bedCount) || 0, data.specialties || '', data.photos || '', data.abdmDoc || '']
        );
      } else if (role === 'clinic') {
        await this.db.query(
          'INSERT INTO facility_clinics (user_id, address, contact, specialties, consultation_fee, abdm_doc) VALUES ($1, $2, $3, $4, $5, $6)',
          [userId, data.address || '', data.contact || '', data.specialties || '', parseFloat(data.consultationFee) || 0.0, data.abdmDoc || '']
        );
      } else if (role === 'lab') {
        await this.db.query(
          'INSERT INTO facility_labs (user_id, address, contact, tests_covered, accreditation, abdm_doc) VALUES ($1, $2, $3, $4, $5, $6)',
          [userId, data.address || '', data.contact || '', data.testsCovered || '', data.accreditation || '', data.abdmDoc || '']
        );
      } else if (role === 'diagnostic_centre') {
        await this.db.query(
          'INSERT INTO facility_diagnostic_centres (user_id, address, contact, tests_covered, imaging_equip, abdm_doc) VALUES ($1, $2, $3, $4, $5, $6)',
          [userId, data.address || '', data.contact || '', data.testsCovered || '', data.imagingEquip || '', data.abdmDoc || '']
        );
      } else if (role === 'pharmacy') {
        await this.db.query(
          'INSERT INTO facility_pharmacies (user_id, address, contact, license_number, home_delivery, abdm_doc) VALUES ($1, $2, $3, $4, $5, $6)',
          [userId, data.address || '', data.contact || '', data.licenseNumber || '', data.homeDelivery === true || data.homeDelivery === 'true', data.abdmDoc || '']
        );
      } else if (role === 'iqra_alumni') {
        await this.db.query(
          'INSERT INTO facility_iqra_alumni (user_id, license_number, registration_id, expertise, experience_years, degree_doc) VALUES ($1, $2, $3, $4, $5, $6)',
          [userId, data.licenseNumber || '', data.registrationId || '', data.expertise || '', parseInt(data.experienceYears) || 0, data.degreeDoc || '']
        );
      } else if (role === 'insurance_org') {
        await this.db.query(
          'INSERT INTO facility_insurance_orgs (user_id, license_number, coverage_details, policies_count, abdm_doc) VALUES ($1, $2, $3, $4, $5)',
          [userId, data.licenseNumber || '', data.coverageDetails || '', parseInt(data.policiesCount) || 0, data.abdmDoc || '']
        );
      } else if (role === 'individual_doctor') {
        await this.db.query(
          'INSERT INTO facility_individual_doctors (user_id, license_number, registration_id, expertise, consultation_fee, degree_doc) VALUES ($1, $2, $3, $4, $5, $6)',
          [userId, data.licenseNumber || '', data.registrationId || '', data.expertise || '', parseFloat(data.consultationFee) || 0.0, data.degreeDoc || '']
        );
      }
    } catch (e: any) {
      await this.db.query('DELETE FROM users WHERE id = $1', [userId]);
      return { status: 'error', message: `Failed to save facility details: ${e.message}` };
    }

    return {
      status: 'success',
      message: 'Facility registered successfully. Pending approval.',
      userId
    };
  }

  /**
   * @description Get list of stakeholder facilities based on filters.
   */
  async getFacilities(filters: any): Promise<any> {
    const { search, status, role, marked, sortBy, sortOrder } = filters;

    let queryText = `
      SELECT 
        u.id, u.email, u.name, u.status, u.is_marked, u.created_at,
        r.name as role_name,
        fh.address as hosp_address, fh.contact as hosp_contact, fh.bed_count as hosp_bed_count, fh.specialties as hosp_specialties, fh.photos as hosp_photos, fh.abdm_doc as hosp_abdm_doc,
        fc.address as clin_address, fc.contact as clin_contact, fc.specialties as clin_specialties, fc.consultation_fee as clin_consultation_fee, fc.abdm_doc as clin_abdm_doc,
        fl.address as lab_address, fl.contact as lab_contact, fl.tests_covered as lab_tests_covered, fl.accreditation as lab_accreditation, fl.abdm_doc as lab_abdm_doc,
        fd.address as diag_address, fd.contact as diag_contact, fd.tests_covered as diag_tests_covered, fd.imaging_equip as diag_imaging_equip, fd.abdm_doc as diag_abdm_doc,
        fp.address as phar_address, fp.contact as phar_contact, fp.license_number as phar_license_number, fp.home_delivery as phar_home_delivery, fp.abdm_doc as phar_abdm_doc,
        fq.license_number as alum_license_number, fq.registration_id as alum_registration_id, fq.expertise as alum_expertise, fq.experience_years as alum_experience_years, fq.degree_doc as alum_degree_doc,
        fi.license_number as ins_license_number, fi.coverage_details as ins_coverage_details, fi.policies_count as ins_policies_count, fi.abdm_doc as ins_abdm_doc,
        fdct.license_number as doc_license_number, fdct.registration_id as doc_registration_id, fdct.expertise as doc_expertise, fdct.consultation_fee as doc_consultation_fee, fdct.degree_doc as doc_degree_doc
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN facility_hospitals fh ON u.id = fh.user_id
      LEFT JOIN facility_clinics fc ON u.id = fc.user_id
      LEFT JOIN facility_labs fl ON u.id = fl.user_id
      LEFT JOIN facility_diagnostic_centres fd ON u.id = fd.user_id
      LEFT JOIN facility_pharmacies fp ON u.id = fp.user_id
      LEFT JOIN facility_iqra_alumni fq ON u.id = fq.user_id
      LEFT JOIN facility_insurance_orgs fi ON u.id = fi.user_id
      LEFT JOIN facility_individual_doctors fdct ON u.id = fdct.user_id
      WHERE r.name NOT IN ('admin', 'master_admin', 'patient')
    `;

    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }

    if (status) {
      params.push(status);
      queryText += ` AND u.status = $${params.length}`;
    }

    if (role) {
      params.push(role);
      queryText += ` AND r.name = $${params.length}`;
    }

    if (marked !== undefined && marked !== null && marked !== '') {
      params.push(marked === 'true' || marked === true);
      queryText += ` AND u.is_marked = $${params.length}`;
    }

    const validSortColumns: Record<string, string> = {
      name: 'u.name',
      email: 'u.email',
      created_at: 'u.created_at',
      status: 'u.status',
    };
    const sortCol = validSortColumns[sortBy] || 'u.created_at';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    queryText += ` ORDER BY ${sortCol} ${order}`;

    const res = await this.db.query(queryText, params);
    
    return res.rows.map((row: any) => {
      const mappedRole = row.role_name;
      let details: any = {};

      if (mappedRole === 'hospital') {
        details = {
          address: row.hosp_address,
          contact: row.hosp_contact,
          bedCount: row.hosp_bed_count,
          specialties: row.hosp_specialties,
          photos: row.hosp_photos,
          abdmDoc: row.hosp_abdm_doc,
        };
      } else if (mappedRole === 'clinic') {
        details = {
          address: row.clin_address,
          contact: row.clin_contact,
          specialties: row.clin_specialties,
          consultationFee: row.clin_consultation_fee,
          abdmDoc: row.clin_abdm_doc,
        };
      } else if (mappedRole === 'lab') {
        details = {
          address: row.lab_address,
          contact: row.lab_contact,
          testsCovered: row.lab_tests_covered,
          accreditation: row.lab_accreditation,
          abdmDoc: row.lab_abdm_doc,
        };
      } else if (mappedRole === 'diagnostic_centre') {
        details = {
          address: row.diag_address,
          contact: row.diag_contact,
          testsCovered: row.diag_tests_covered,
          imagingEquip: row.diag_imaging_equip,
          abdmDoc: row.diag_abdm_doc,
        };
      } else if (mappedRole === 'pharmacy') {
        details = {
          address: row.phar_address,
          contact: row.phar_contact,
          licenseNumber: row.phar_license_number,
          homeDelivery: row.phar_home_delivery,
          abdmDoc: row.phar_abdm_doc,
        };
      } else if (mappedRole === 'iqra_alumni') {
        details = {
          licenseNumber: row.alum_license_number,
          registrationId: row.alum_registration_id,
          expertise: row.alum_expertise,
          experienceYears: row.alum_experience_years,
          degreeDoc: row.alum_degree_doc,
        };
      } else if (mappedRole === 'insurance_org') {
        details = {
          licenseNumber: row.ins_license_number,
          coverageDetails: row.ins_coverage_details,
          policiesCount: row.ins_policies_count,
          abdmDoc: row.ins_abdm_doc,
        };
      } else if (mappedRole === 'individual_doctor') {
        details = {
          licenseNumber: row.doc_license_number,
          registrationId: row.doc_registration_id,
          expertise: row.doc_expertise,
          consultationFee: row.doc_consultation_fee,
          degreeDoc: row.doc_degree_doc,
        };
      }

      return {
        id: row.id,
        email: row.email,
        name: row.name,
        role: mappedRole,
        status: row.status,
        isMarked: row.is_marked,
        createdAt: row.created_at,
        details
      };
    });
  }

  /**
   * @description Updates facility approval status.
   */
  async updateFacilityStatus(id: number, status: string): Promise<any> {
    await this.db.query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);
    return { status: 'success', message: `Facility status updated to ${status}.` };
  }

  /**
   * @description Toggles facility bookmark flag.
   */
  async toggleFacilityMark(id: number, isMarked: boolean): Promise<any> {
    await this.db.query('UPDATE users SET is_marked = $1 WHERE id = $2', [isMarked, id]);
    return { status: 'success', message: isMarked ? 'Facility bookmarked.' : 'Bookmark removed.' };
  }

  /**
   * @description Removes stakeholder facility from database.
   */
  async deleteFacility(id: number): Promise<any> {
    await this.db.query('DELETE FROM users WHERE id = $1', [id]);
    return { status: 'success', message: 'Facility removed successfully.' };
  }
}
