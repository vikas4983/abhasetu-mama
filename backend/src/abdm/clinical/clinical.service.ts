/**
 * @file        clinical.service.ts
 * @description Dedicated service handling CRUD operations for pharmacy products, insurance policies, lab packages, and doctors.
 * @module      abdm/clinical
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Injectable } from '@nestjs/common';
import { DbService } from '../../db/db.service';

@Injectable()
export class ClinicalService {
  constructor(private readonly db: DbService) {}

  // --- PHARMACY PRODUCTS ---
  async getProducts() {
    const res = await this.db.query('SELECT * FROM products ORDER BY created_at DESC');
    return res.rows.map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      brand: p.brand,
      form: p.form,
      price: Number(p.price),
      originalPrice: Number(p.original_price),
      discount: p.discount,
      rating: Number(p.rating),
      image: p.image,
      description: p.description,
      salt: p.salt
    }));
  }

  async saveProduct(product: any) {
    if (product.id) {
      // Edit
      const res = await this.db.query(
        `UPDATE products SET name = $1, category = $2, brand = $3, form = $4, price = $5, original_price = $6, discount = $7, rating = $8, image = $9, description = $10, salt = $11 WHERE id = $12 RETURNING *`,
        [
          product.name,
          product.category,
          product.brand,
          product.form,
          product.price,
          product.originalPrice || product.price,
          product.discount || 0,
          product.rating || 4.5,
          product.image || '',
          product.description || '',
          product.salt || '',
          product.id
        ]
      );
      if (res.rowCount === 0) {
        return { status: 'error', message: 'Product not found' };
      }
      return { status: 'success', data: product };
    } else {
      // Add
      const id = `MED-${Date.now()}`;
      await this.db.query(
        `INSERT INTO products (id, name, category, brand, form, price, original_price, discount, rating, image, description, salt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          id,
          product.name,
          product.category,
          product.brand,
          product.form,
          product.price,
          product.originalPrice || product.price,
          product.discount || 0,
          product.rating || 4.5,
          product.image || '',
          product.description || '',
          product.salt || ''
        ]
      );
      return { status: 'success', data: { ...product, id } };
    }
  }

  async deleteProduct(id: string) {
    await this.db.query('DELETE FROM products WHERE id = $1', [id]);
    return { status: 'success' };
  }

  // --- INSURANCE POLICIES ---
  async getPolicies() {
    const res = await this.db.query('SELECT * FROM policies ORDER BY id');
    return res.rows.map((p: any) => ({
      id: p.id,
      name: p.name,
      provider: p.provider,
      monthlyPremium: Number(p.monthly_premium),
      csr: p.csr,
      networkHospitals: p.network_hospitals,
      coverageAmount: p.coverage_amount,
      copay: p.copay,
      features: p.features
    }));
  }

  async savePolicy(policy: any) {
    if (policy.id) {
      const res = await this.db.query(
        `UPDATE policies SET name = $1, provider = $2, monthly_premium = $3, csr = $4, network_hospitals = $5, coverage_amount = $6, copay = $7, features = $8 WHERE id = $9 RETURNING *`,
        [
          policy.name,
          policy.provider,
          policy.monthlyPremium,
          policy.csr,
          policy.networkHospitals || 0,
          policy.coverageAmount,
          policy.copay,
          policy.features || [],
          policy.id
        ]
      );
      if (res.rowCount === 0) {
        return { status: 'error', message: 'Policy not found' };
      }
      return { status: 'success', data: policy };
    } else {
      const id = `POL-${Date.now()}`;
      await this.db.query(
        `INSERT INTO policies (id, name, provider, monthly_premium, csr, network_hospitals, coverage_amount, copay, features) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          id,
          policy.name,
          policy.provider,
          policy.monthlyPremium,
          policy.csr,
          policy.networkHospitals || 0,
          policy.coverageAmount,
          policy.copay,
          policy.features || []
        ]
      );
      return { status: 'success', data: { ...policy, id } };
    }
  }

  async deletePolicy(id: string) {
    await this.db.query('DELETE FROM policies WHERE id = $1', [id]);
    return { status: 'success' };
  }

  // --- LAB PACKAGES ---
  async getLabPackages() {
    const res = await this.db.query('SELECT * FROM lab_packages ORDER BY id');
    return res.rows.map((l: any) => ({
      id: l.id,
      name: l.name,
      parameters: l.parameters,
      provider: l.provider,
      price: Number(l.price),
      originalPrice: Number(l.original_price),
      discount: l.discount,
      reportHours: l.report_hours,
      sampleType: l.sample_type,
      description: l.description,
      image: l.image
    }));
  }

  async saveLabPackage(lab: any) {
    if (lab.id) {
      const res = await this.db.query(
        `UPDATE lab_packages SET name = $1, parameters = $2, provider = $3, price = $4, original_price = $5, discount = $6, report_hours = $7, sample_type = $8, description = $9, image = $10 WHERE id = $11 RETURNING *`,
        [
          lab.name,
          lab.parameters || 0,
          lab.provider,
          lab.price,
          lab.originalPrice || lab.price,
          lab.discount || 0,
          lab.reportHours || 24,
          lab.sampleType,
          lab.description || '',
          lab.image || '',
          lab.id
        ]
      );
      if (res.rowCount === 0) {
        return { status: 'error', message: 'Lab package not found' };
      }
      return { status: 'success', data: lab };
    } else {
      const id = `LAB-${Date.now()}`;
      await this.db.query(
        `INSERT INTO lab_packages (id, name, parameters, provider, price, original_price, discount, report_hours, sample_type, description, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          id,
          lab.name,
          lab.parameters || 0,
          lab.provider,
          lab.price,
          lab.originalPrice || lab.price,
          lab.discount || 0,
          lab.reportHours || 24,
          lab.sampleType,
          lab.description || '',
          lab.image || '',
        ]
      );
      return { status: 'success', data: { ...lab, id } };
    }
  }

  async deleteLabPackage(id: string) {
    await this.db.query('DELETE FROM lab_packages WHERE id = $1', [id]);
    return { status: 'success' };
  }

  // --- DOCTOR CONSULTATION SPECIALTIES AND DIRECTORY ---
  async getSpecialtiesMatrix(): Promise<any> {
    const res = await this.db.query('SELECT DISTINCT medical_system, category, specialist_role FROM specialties_matrix ORDER BY medical_system, category, specialist_role');
    return res.rows.map((row: any) => ({
      medicalSystem: row.medical_system,
      category: row.category,
      specialistRole: row.specialist_role
    }));
  }

  async getDoctors(medicalSystem?: string, speciality?: string, specialistRole?: string, search?: string): Promise<any> {
    let queryText = 'SELECT * FROM doctors';
    const params: any[] = [];
    const conditions: string[] = [];

    if (medicalSystem) {
      params.push(medicalSystem);
      conditions.push(`medical_system = $${params.length}`);
    }
    if (speciality) {
      params.push(speciality);
      conditions.push(`speciality = $${params.length}`);
    }
    if (specialistRole) {
      params.push(specialistRole);
      conditions.push(`specialist_role = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR specialist_role ILIKE $${params.length} OR speciality ILIKE $${params.length} OR medical_system ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ' ORDER BY id';

    const res = await this.db.query(queryText, params);
    return res.rows.map((d: any) => ({
      id: d.id,
      name: d.name,
      medicalSystem: d.medical_system,
      speciality: d.speciality,
      specialistRole: d.specialist_role,
      degree: d.degree,
      experience: d.experience,
      fee: `Rs ${d.fee}`,
      rating: String(d.rating),
      description: d.description || '',
      photo: d.photo || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
      badge: 'ABDM Verified',
      certificateId: d.certificate_id,
      hfrId: d.hfr_id,
      hospitalName: d.hospital_name
    }));
  }

  async saveDoctor(doctor: any) {
    let feeNum = doctor.fee;
    if (typeof feeNum === 'string') {
      feeNum = parseInt(feeNum.replace(/[^0-9]/g, '')) || 0;
    }
    
    if (doctor.id) {
      // Edit
      const res = await this.db.query(
        `UPDATE doctors SET name = $1, medical_system = $2, speciality = $3, specialist_role = $4, degree = $5, experience = $6, fee = $7, rating = $8, description = $9, photo = $10, hospital_name = $11, hfr_id = $12, certificate_id = $13 WHERE id = $14 RETURNING *`,
        [
          doctor.name,
          doctor.medicalSystem,
          doctor.speciality,
          doctor.specialistRole,
          doctor.degree,
          doctor.experience,
          feeNum,
          Number(doctor.rating) || 4.8,
          doctor.description || '',
          doctor.photo || '',
          doctor.hospitalName,
          doctor.hfrId,
          doctor.certificateId,
          Number(doctor.id)
        ]
      );
      if (res.rowCount === 0) {
        return { status: 'error', message: 'Doctor not found' };
      }
      return { status: 'success', data: doctor };
    } else {
      // Add
      const res = await this.db.query(
        `INSERT INTO doctors (name, medical_system, speciality, specialist_role, degree, experience, fee, rating, description, photo, hospital_name, hfr_id, certificate_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
        [
          doctor.name,
          doctor.medicalSystem,
          doctor.speciality,
          doctor.specialistRole,
          doctor.degree,
          doctor.experience,
          feeNum,
          Number(doctor.rating) || 4.8,
          doctor.description || '',
          doctor.photo || '',
          doctor.hospitalName,
          doctor.hfrId,
          doctor.certificateId
        ]
      );
      const newId = res.rows[0].id;
      return { status: 'success', data: { ...doctor, id: newId } };
    }
  }

  async deleteDoctor(id: number) {
    await this.db.query('DELETE FROM doctors WHERE id = $1', [id]);
    return { status: 'success' };
  }
}
