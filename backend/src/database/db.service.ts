/**
 * @file        db.service.ts
 * @description PostgreSQL database initialize, connection pool management, and schema seeder.
 * @module      database
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client, Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private dbName = process.env.DB_NAME || 'abhasetu';

  async onModuleInit() {
    await this.initializeDatabase();
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  private async initializeDatabase() {
    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || '5432');
    const user = process.env.DB_USER || 'postgres';
    const password = process.env.DB_PASSWORD || 'postgres';

    // 1. Connect to default 'postgres' database to ensure our DB exists
    const defaultClient = new Client({
      host,
      port,
      user,
      password,
      database: 'postgres',
    });

    try {
      await defaultClient.connect();
      const res = await defaultClient.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [this.dbName]
      );
      if (res.rowCount === 0) {
        console.log(`Database '${this.dbName}' does not exist. Creating...`);
        await defaultClient.query(`CREATE DATABASE ${this.dbName}`);
      }
      await defaultClient.end();
    } catch (err) {
      console.warn('Failed checking/creating database via default connection. Attempting direct pool connection.', err.message);
      try {
        await defaultClient.end();
      } catch {}
    }

    // 2. Initialize connection pool to the actual database
    this.pool = new Pool({
      host,
      port,
      user,
      password,
      database: this.dbName,
    });

    // 3. Create tables & run seeders
    try {
      await this.createTables();
      await this.seedData();
      console.log('PostgreSQL database initialized and seeded successfully.');
    } catch (err) {
      console.error('Error during database initialization/seeding:', err);
    }
  }

  private async createTables() {
    const queryText = `
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Add status and is_marked columns to users if they do not exist
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES roles(id);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_marked BOOLEAN DEFAULT FALSE;

      CREATE TABLE IF NOT EXISTS config (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pincodes (
        pincode VARCHAR(10) PRIMARY KEY,
        district VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        brand VARCHAR(255) NOT NULL,
        form VARCHAR(50) NOT NULL,
        price NUMERIC NOT NULL,
        original_price NUMERIC NOT NULL,
        discount INTEGER NOT NULL,
        rating NUMERIC NOT NULL,
        image TEXT,
        description TEXT,
        salt TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS policies (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        monthly_premium NUMERIC NOT NULL,
        csr VARCHAR(50) NOT NULL,
        network_hospitals INTEGER NOT NULL,
        coverage_amount VARCHAR(50) NOT NULL,
        copay VARCHAR(50) NOT NULL,
        features TEXT[] NOT NULL
      );

      CREATE TABLE IF NOT EXISTS lab_packages (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        parameters INTEGER NOT NULL,
        provider VARCHAR(255) NOT NULL,
        price NUMERIC NOT NULL,
        original_price NUMERIC NOT NULL,
        discount INTEGER NOT NULL,
        report_hours INTEGER NOT NULL,
        sample_type VARCHAR(255) NOT NULL,
        description TEXT,
        image TEXT
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(100) PRIMARY KEY,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        event VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        details TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS specialties_matrix (
        id SERIAL PRIMARY KEY,
        medical_system VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        specialist_role VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        medical_system VARCHAR(100) NOT NULL,
        speciality VARCHAR(100) NOT NULL,
        specialist_role VARCHAR(100) NOT NULL,
        degree VARCHAR(255) NOT NULL,
        experience VARCHAR(50) NOT NULL,
        fee NUMERIC NOT NULL,
        rating NUMERIC NOT NULL DEFAULT 4.8,
        description TEXT,
        photo TEXT,
        hospital_name VARCHAR(255) NOT NULL,
        hfr_id VARCHAR(50) NOT NULL,
        certificate_id VARCHAR(50) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(100) PRIMARY KEY,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        user_mobile_masked VARCHAR(50),
        user_aadhaar_masked VARCHAR(50),
        user_abha_masked VARCHAR(100),
        appointment_type VARCHAR(100) NOT NULL,
        doctor_name VARCHAR(255) NOT NULL,
        hospital_name VARCHAR(255),
        fee NUMERIC NOT NULL,
        platform_fee NUMERIC NOT NULL,
        total_fee NUMERIC NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL
      );

      -- Specific facility detail tables
      CREATE TABLE IF NOT EXISTS facility_hospitals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        address TEXT NOT NULL,
        contact VARCHAR(50) NOT NULL,
        bed_count INTEGER NOT NULL,
        specialties TEXT NOT NULL,
        photos TEXT,
        abdm_doc TEXT
      );

      CREATE TABLE IF NOT EXISTS facility_clinics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        address TEXT NOT NULL,
        contact VARCHAR(50) NOT NULL,
        specialties TEXT NOT NULL,
        consultation_fee NUMERIC NOT NULL,
        abdm_doc TEXT
      );

      CREATE TABLE IF NOT EXISTS facility_labs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        address TEXT NOT NULL,
        contact VARCHAR(50) NOT NULL,
        tests_covered TEXT NOT NULL,
        accreditation VARCHAR(100) NOT NULL,
        abdm_doc TEXT
      );

      CREATE TABLE IF NOT EXISTS facility_diagnostic_centres (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        address TEXT NOT NULL,
        contact VARCHAR(50) NOT NULL,
        tests_covered TEXT NOT NULL,
        imaging_equip TEXT NOT NULL,
        abdm_doc TEXT
      );

      CREATE TABLE IF NOT EXISTS facility_pharmacies (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        address TEXT NOT NULL,
        contact VARCHAR(50) NOT NULL,
        license_number VARCHAR(100) NOT NULL,
        home_delivery BOOLEAN DEFAULT FALSE,
        abdm_doc TEXT
      );

      CREATE TABLE IF NOT EXISTS facility_iqra_alumni (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        license_number VARCHAR(100) NOT NULL,
        registration_id VARCHAR(100) NOT NULL,
        expertise TEXT NOT NULL,
        experience_years INTEGER NOT NULL,
        degree_doc TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS facility_insurance_orgs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        license_number VARCHAR(100) NOT NULL,
        coverage_details TEXT NOT NULL,
        policies_count INTEGER DEFAULT 0,
        abdm_doc TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS facility_individual_doctors (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        license_number VARCHAR(100) NOT NULL,
        registration_id VARCHAR(100) NOT NULL,
        expertise TEXT NOT NULL,
        consultation_fee NUMERIC NOT NULL,
        degree_doc TEXT NOT NULL
      );
    `;
    await this.pool.query(queryText);
  }

  private async seedData() {
    // 1. Seed default roles
    await this.pool.query(`
      INSERT INTO roles (name) VALUES 
        ('admin'), ('master_admin'), ('doctor'), ('operator'), ('patient'),
        ('hospital'), ('clinic'), ('lab'), ('diagnostic_centre'), ('pharmacy'),
        ('iqra_alumni'), ('insurance_org'), ('individual_doctor')
      ON CONFLICT (name) DO NOTHING
    `);

    // 2. Seed users (admins)
    const userCountRes = await this.pool.query('SELECT COUNT(*) FROM users');
    const hashedPassword = await bcrypt.hash('DreamProject@2026', 10);

    const adminRoleRes = await this.pool.query("SELECT id FROM roles WHERE name = 'admin'");
    const adminRoleId = adminRoleRes.rows[0].id;

    const masterRoleRes = await this.pool.query("SELECT id FROM roles WHERE name = 'master_admin'");
    const masterRoleId = masterRoleRes.rows[0].id;

    const hospitalRoleRes = await this.pool.query("SELECT id FROM roles WHERE name = 'hospital'");
    const hospitalRoleId = hospitalRoleRes.rows[0].id;

    const labRoleRes = await this.pool.query("SELECT id FROM roles WHERE name = 'lab'");
    const labRoleId = labRoleRes.rows[0].id;

    const pharmacyRoleRes = await this.pool.query("SELECT id FROM roles WHERE name = 'pharmacy'");
    const pharmacyRoleId = pharmacyRoleRes.rows[0].id;

    const alumniRoleRes = await this.pool.query("SELECT id FROM roles WHERE name = 'iqra_alumni'");
    const alumniRoleId = alumniRoleRes.rows[0].id;

    const clinicRoleRes = await this.pool.query("SELECT id FROM roles WHERE name = 'clinic'");
    const clinicRoleId = clinicRoleRes.rows[0].id;

    const diagRoleRes = await this.pool.query("SELECT id FROM roles WHERE name = 'diagnostic_centre'");
    const diagRoleId = diagRoleRes.rows[0].id;

    const insuranceRoleRes = await this.pool.query("SELECT id FROM roles WHERE name = 'insurance_org'");
    const insuranceRoleId = insuranceRoleRes.rows[0].id;

    const doctorRoleRes = await this.pool.query("SELECT id FROM roles WHERE name = 'individual_doctor'");
    const doctorRoleId = doctorRoleRes.rows[0].id;

    if (parseInt(userCountRes.rows[0].count) === 0) {
      console.log('Seeding default admins...');
      await this.pool.query(
        'INSERT INTO users (email, password, role, name, role_id, status) VALUES ($1, $2, $3, $4, $5, $6)',
        ['admin@abhasetu.com', hashedPassword, 'admin', 'System Administrator', adminRoleId, 'approved']
      );
      
      await this.pool.query(
        'INSERT INTO users (email, password, role, name, role_id, status) VALUES ($1, $2, $3, $4, $5, $6)',
        ['master@abhasetu.com', hashedPassword, 'master_admin', 'Master Administrator', masterRoleId, 'approved']
      );
    } else {
      // Backfill role_ids and status for existing users
      await this.pool.query("UPDATE users SET role_id = $1, status = 'approved' WHERE role = 'admin' AND role_id IS NULL", [adminRoleId]);
      await this.pool.query("UPDATE users SET role_id = $1, status = 'approved' WHERE role = 'master_admin' AND role_id IS NULL", [masterRoleId]);
    }

    // 3. Seed default mock facilities
    const mockHospEmail = 'hospital@abhasetu.com';
    const hospCheck = await this.pool.query('SELECT 1 FROM users WHERE email = $1', [mockHospEmail]);
    if (hospCheck.rowCount === 0) {
      console.log('Seeding default mock hospital facility...');
      const facilityPass = await bcrypt.hash('Password@123', 10);
      const res = await this.pool.query(
        'INSERT INTO users (email, password, role, name, role_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [mockHospEmail, facilityPass, 'hospital', 'Apollo Hospital', hospitalRoleId, 'approved']
      );
      const userId = res.rows[0].id;
      await this.pool.query(
        'INSERT INTO facility_hospitals (user_id, address, contact, bed_count, specialties, photos, abdm_doc) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [userId, 'Apollo Health City, Jubilee Hills, Hyderabad', '040-23607777', 120, 'Cardiology, Oncology, Orthopedics', '/assets/hospitals/apollo.jpeg', '/uploads/docs/hfr_apollo_cert.pdf']
      );
    }

    const mockLabEmail = 'lab@abhasetu.com';
    const labCheck = await this.pool.query('SELECT 1 FROM users WHERE email = $1', [mockLabEmail]);
    if (labCheck.rowCount === 0) {
      console.log('Seeding default mock lab facility...');
      const facilityPass = await bcrypt.hash('Password@123', 10);
      const res = await this.pool.query(
        'INSERT INTO users (email, password, role, name, role_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [mockLabEmail, facilityPass, 'lab', 'Citycare Diagnostics Lab', labRoleId, 'pending']
      );
      const userId = res.rows[0].id;
      await this.pool.query(
        'INSERT INTO facility_labs (user_id, address, contact, tests_covered, accreditation, abdm_doc) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, '12-2-823/A, Mehdipatnam, Hyderabad', '040-23512222', 'CBC, Thyroid, Lipid Profile, HbA1c', 'NABL Accredited', '/uploads/docs/lab_cert.pdf']
      );
    }

    const mockPharmEmail = 'pharmacy@abhasetu.com';
    const pharmCheck = await this.pool.query('SELECT 1 FROM users WHERE email = $1', [mockPharmEmail]);
    if (pharmCheck.rowCount === 0) {
      console.log('Seeding default mock pharmacy facility...');
      const facilityPass = await bcrypt.hash('Password@123', 10);
      const res = await this.pool.query(
        'INSERT INTO users (email, password, role, name, role_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [mockPharmEmail, facilityPass, 'pharmacy', 'LifeCare Pharmacy', pharmacyRoleId, 'approved']
      );
      const userId = res.rows[0].id;
      await this.pool.query(
        'INSERT INTO facility_pharmacies (user_id, address, contact, license_number, home_delivery, abdm_doc) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, 'Shop 3, Gachibowli Road, Hyderabad', '040-23001111', 'TS-DRUG-40292', true, '/uploads/docs/pharmacy_lic.pdf']
      );
    }

    const mockAlumniEmail = 'alumni@abhasetu.com';
    const alumniCheck = await this.pool.query('SELECT 1 FROM users WHERE email = $1', [mockAlumniEmail]);
    if (alumniCheck.rowCount === 0) {
      console.log('Seeding default mock alumni helper...');
      const facilityPass = await bcrypt.hash('Password@123', 10);
      const res = await this.pool.query(
        'INSERT INTO users (email, password, role, name, role_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [mockAlumniEmail, facilityPass, 'iqra_alumni', 'Zeeshan Khan', alumniRoleId, 'pending']
      );
      const userId = res.rows[0].id;
      await this.pool.query(
        'INSERT INTO facility_iqra_alumni (user_id, license_number, registration_id, expertise, experience_years, degree_doc) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, 'IQRA-AL-9201', 'REG-8829-IQRA', 'Patient Care & ABDM Navigation', 3, '/uploads/docs/iqra_degree.pdf']
      );
    }

    const mockClinicEmail = 'clinic@abhasetu.com';
    const clinicCheck = await this.pool.query('SELECT 1 FROM users WHERE email = $1', [mockClinicEmail]);
    if (clinicCheck.rowCount === 0) {
      console.log('Seeding default mock clinic facility...');
      const facilityPass = await bcrypt.hash('Password@123', 10);
      const res = await this.pool.query(
        'INSERT INTO users (email, password, role, name, role_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [mockClinicEmail, facilityPass, 'clinic', 'Care & Cure Clinic', clinicRoleId, 'approved']
      );
      const userId = res.rows[0].id;
      await this.pool.query(
        'INSERT INTO facility_clinics (user_id, address, contact, specialties, consultation_fee, abdm_doc) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, 'Plot 45, Jubilee Hills, Hyderabad', '040-23548888', 'Pediatrics, General Medicine', 450, '/uploads/docs/clinic_cert.pdf']
      );
    }

    const mockDiagEmail = 'diagnostic@abhasetu.com';
    const diagCheck = await this.pool.query('SELECT 1 FROM users WHERE email = $1', [mockDiagEmail]);
    if (diagCheck.rowCount === 0) {
      console.log('Seeding default mock diagnostic center...');
      const facilityPass = await bcrypt.hash('Password@123', 10);
      const res = await this.pool.query(
        'INSERT INTO users (email, password, role, name, role_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [mockDiagEmail, facilityPass, 'diagnostic_centre', 'Metro Imaging Center', diagRoleId, 'pending']
      );
      const userId = res.rows[0].id;
      await this.pool.query(
        'INSERT INTO facility_diagnostic_centres (user_id, address, contact, tests_covered, imaging_equip, abdm_doc) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, 'A-5, Madhapur, Hyderabad', '040-23119999', 'MRI, CT Scan, X-Ray, Ultrasound', '1.5T Siemens MRI, GE CT Scanner', '/uploads/docs/diag_cert.pdf']
      );
    }

    const mockInsuranceEmail = 'insurance@abhasetu.com';
    const insuranceCheck = await this.pool.query('SELECT 1 FROM users WHERE email = $1', [mockInsuranceEmail]);
    if (insuranceCheck.rowCount === 0) {
      console.log('Seeding default mock insurance organization...');
      const facilityPass = await bcrypt.hash('Password@123', 10);
      const res = await this.pool.query(
        'INSERT INTO users (email, password, role, name, role_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [mockInsuranceEmail, facilityPass, 'insurance_org', 'Universal Health Insurance', insuranceRoleId, 'approved']
      );
      const userId = res.rows[0].id;
      await this.pool.query(
        'INSERT INTO facility_insurance_orgs (user_id, license_number, coverage_details, policies_count, abdm_doc) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, 'IRDAI-HL-88231', 'Provides 100% cashless medical coverage under PM-JAY and corporate policies.', 15, '/uploads/docs/insurance_lic.pdf']
      );
    }

    const mockDoctorEmail = 'doctor@abhasetu.com';
    const doctorCheck = await this.pool.query('SELECT 1 FROM users WHERE email = $1', [mockDoctorEmail]);
    if (doctorCheck.rowCount === 0) {
      console.log('Seeding default mock individual doctor...');
      const facilityPass = await bcrypt.hash('Password@123', 10);
      const res = await this.pool.query(
        'INSERT INTO users (email, password, role, name, role_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [mockDoctorEmail, facilityPass, 'individual_doctor', 'Dr. Vikram Aditya', doctorRoleId, 'pending']
      );
      const userId = res.rows[0].id;
      await this.pool.query(
        'INSERT INTO facility_individual_doctors (user_id, license_number, registration_id, expertise, consultation_fee, degree_doc) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, 'MCI-55291', 'REG-DOCTOR-9912', 'Cardiology, Telehealth', 800, '/uploads/docs/doctor_degree.pdf']
      );
    }

    // Load initial data from static db.json if database catalogs are empty
    let dbJson: any = null;
    try {
      const dbPath = path.join(process.cwd(), '../src/data/db.json');
      if (fs.existsSync(dbPath)) {
        const raw = fs.readFileSync(dbPath, 'utf8');
        dbJson = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load local db.json for seeding:', e.message);
    }

    if (!dbJson) return;

    // 2. Seed configs
    const configCountRes = await this.pool.query('SELECT COUNT(*) FROM config');
    if (parseInt(configCountRes.rows[0].count) === 0 && dbJson.config) {
      console.log('Seeding configuration from db.json...');
      for (const [key, value] of Object.entries(dbJson.config)) {
        await this.pool.query(
          'INSERT INTO config (key, value) VALUES ($1, $2)',
          [key, String(value)]
        );
      }
    }

    // 3. Seed products
    const productCountRes = await this.pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCountRes.rows[0].count) === 0 && dbJson.products) {
      console.log('Seeding products from db.json...');
      for (const p of dbJson.products) {
        await this.pool.query(
          'INSERT INTO products (id, name, category, brand, form, price, original_price, discount, rating, image, description, salt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
          [
            p.id,
            p.name,
            p.category,
            p.brand,
            p.form,
            p.price,
            p.originalPrice || p.price,
            p.discount || 0,
            p.rating || 4.5,
            p.image || '',
            p.description || '',
            p.salt || '',
          ]
        );
      }
    }

    // 4. Seed policies
    const policyCountRes = await this.pool.query('SELECT COUNT(*) FROM policies');
    if (parseInt(policyCountRes.rows[0].count) === 0 && dbJson.policies) {
      console.log('Seeding policies from db.json...');
      for (const p of dbJson.policies) {
        await this.pool.query(
          'INSERT INTO policies (id, name, provider, monthly_premium, csr, network_hospitals, coverage_amount, copay, features) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [
            p.id,
            p.name,
            p.provider,
            p.monthlyPremium || 0,
            p.csr || '',
            p.networkHospitals || 0,
            p.coverageAmount || '',
            p.copay || '',
            p.features || [],
          ]
        );
      }
    }

    // 5. Seed lab packages
    const labCountRes = await this.pool.query('SELECT COUNT(*) FROM lab_packages');
    if (parseInt(labCountRes.rows[0].count) === 0 && dbJson.labPackages) {
      console.log('Seeding lab packages from db.json...');
      for (const l of dbJson.labPackages) {
        await this.pool.query(
          'INSERT INTO lab_packages (id, name, parameters, provider, price, original_price, discount, report_hours, sample_type, description, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
          [
            l.id,
            l.name,
            l.parameters || 0,
            l.provider || '',
            l.price || 0,
            l.originalPrice || l.price,
            l.discount || 0,
            l.reportHours || 24,
            l.sampleType || '',
            l.description || '',
            l.image || '',
          ]
        );
      }
    }

    // 6. Seed audit logs
    const logCountRes = await this.pool.query('SELECT COUNT(*) FROM audit_logs');
    if (parseInt(logCountRes.rows[0].count) === 0 && dbJson.auditLogs) {
      console.log('Seeding audit logs from db.json...');
      for (const log of dbJson.auditLogs) {
        const id = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
        await this.pool.query(
          'INSERT INTO audit_logs (id, timestamp, event, status, details) VALUES ($1, $2, $3, $4, $5)',
          [
            id,
            log.timestamp || new Date().toISOString(),
            log.event,
            log.status,
            log.details,
          ]
        );
      }
    }

    // 7. Seed specialties matrix (always clear and re-seed to stay in sync)
    console.log('Refreshing specialties matrix reference catalog...');
    await this.pool.query('TRUNCATE TABLE specialties_matrix RESTART IDENTITY CASCADE');
    
    const specs = [
      // Allopathy
      ['Allopathy', 'General Medicine', 'General Physician'],
      ['Allopathy', 'General Medicine', 'Family Medicine Specialist'],
      ['Allopathy', 'General Medicine', 'Internal Medicine Specialist'],
      ['Allopathy', 'Heart & Blood Vessels', 'Cardiologist'],
      ['Allopathy', 'Heart & Blood Vessels', 'Cardiac Surgeon'],
      ['Allopathy', 'Heart & Blood Vessels', 'Vascular Surgeon'],
      ['Allopathy', 'Brain & Nervous System', 'Neurologist'],
      ['Allopathy', 'Brain & Nervous System', 'Neurosurgeon'],
      ['Allopathy', 'Bone & Joint Care', 'Orthopedic Surgeon'],
      ['Allopathy', 'Bone & Joint Care', 'Spine Specialist'],
      ['Allopathy', 'Bone & Joint Care', 'Sports Injury Specialist'],
      ['Allopathy', 'Women Care', 'Gynecologist'],
      ['Allopathy', 'Women Care', 'Obstetrician'],
      ['Allopathy', 'Women Care', 'Fertility Specialist'],
      ['Allopathy', 'Women Care', 'IVF Specialist'],
      ['Allopathy', 'Child Care', 'Pediatrician'],
      ['Allopathy', 'Child Care', 'Neonatologist'],
      ['Allopathy', 'Child Care', 'Pediatric Surgeon'],
      ['Allopathy', 'Skin & Hair', 'Dermatologist'],
      ['Allopathy', 'Skin & Hair', 'Cosmetologist'],
      ['Allopathy', 'Eye Care', 'Ophthalmologist'],
      ['Allopathy', 'Eye Care', 'Retina Specialist'],
      ['Allopathy', 'Ear Nose Throat', 'ENT Specialist'],
      ['Allopathy', 'Kidney & Urinary', 'Nephrologist'],
      ['Allopathy', 'Kidney & Urinary', 'Urologist'],
      ['Allopathy', 'Digestive System', 'Gastroenterologist'],
      ['Allopathy', 'Digestive System', 'Hepatologist'],
      ['Allopathy', 'Lung & Respiratory', 'Pulmonologist'],
      ['Allopathy', 'Hormone & Diabetes', 'Endocrinologist'],
      ['Allopathy', 'Hormone & Diabetes', 'Diabetologist'],
      ['Allopathy', 'Cancer Care', 'Oncologist'],
      ['Allopathy', 'Cancer Care', 'Surgical Oncologist'],
      ['Allopathy', 'Surgery', 'General Surgeon'],
      ['Allopathy', 'Surgery', 'Plastic Surgeon'],
      ['Allopathy', 'Surgery', 'Laparoscopic Surgeon'],
      ['Allopathy', 'Mental Health', 'Psychiatrist'],
      ['Allopathy', 'Mental Health', 'Clinical Psychologist'],

      // Dental Care
      ['Dental Care', 'General Dentistry', 'General Dentist'],
      ['Dental Care', 'Specialist Dentistry', 'Orthodontist'],
      ['Dental Care', 'Specialist Dentistry', 'Prosthodontist'],
      ['Dental Care', 'Specialist Dentistry', 'Endodontist'],
      ['Dental Care', 'Specialist Dentistry', 'Periodontist'],
      ['Dental Care', 'Specialist Dentistry', 'Oral Surgeon'],
      ['Dental Care', 'Specialist Dentistry', 'Pediatric Dentist'],
      ['Dental Care', 'Specialist Dentistry', 'Cosmetic Dentist'],
      ['Dental Care', 'Specialist Dentistry', 'Implant Specialist'],

      // Dentist
      ['Dentist', 'General Dentistry', 'General Dentist'],
      ['Dentist', 'Specialist Dentistry', 'Orthodontist'],
      ['Dentist', 'Specialist Dentistry', 'Prosthodontist'],
      ['Dentist', 'Specialist Dentistry', 'Endodontist'],
      ['Dentist', 'Specialist Dentistry', 'Periodontist'],
      ['Dentist', 'Specialist Dentistry', 'Oral Surgeon'],
      ['Dentist', 'Specialist Dentistry', 'Pediatric Dentist'],
      ['Dentist', 'Specialist Dentistry', 'Cosmetic Dentist'],
      ['Dentist', 'Specialist Dentistry', 'Implant Specialist'],

      // Homeopathy
      ['Homeopathy', 'General Homeopathy', 'Homeopathic Physician'],
      ['Homeopathy', 'Homeopathy Specialists', 'Skin Disease Specialist'],
      ['Homeopathy', 'Homeopathy Specialists', 'Child Care Specialist'],
      ['Homeopathy', 'Homeopathy Specialists', 'Women Health Specialist'],
      ['Homeopathy', 'Homeopathy Specialists', 'Respiratory Disease Specialist'],
      ['Homeopathy', 'Homeopathy Specialists', 'Digestive Disease Specialist'],
      ['Homeopathy', 'Homeopathy Specialists', 'Allergy Specialist'],
      ['Homeopathy', 'Homeopathy Specialists', 'Mental Health Specialist'],
      ['Homeopathy', 'Homeopathy Specialists', 'Chronic Disease Specialist'],

      // Ayurveda
      ['Ayurveda', 'General Ayurveda', 'Ayurvedic Physician'],
      ['Ayurveda', 'Ayurveda Specialists', 'Kaya Chikitsa'],
      ['Ayurveda', 'Ayurveda Specialists', 'Panchakarma Specialist'],
      ['Ayurveda', 'Ayurveda Specialists', 'Shalya Tantra'],
      ['Ayurveda', 'Ayurveda Specialists', 'Shalakya Tantra'],
      ['Ayurveda', 'Ayurveda Specialists', 'Prasuti Tantra & Stri Roga'],
      ['Ayurveda', 'Ayurveda Specialists', 'Kaumarbhritya'],
      ['Ayurveda', 'Ayurveda Specialists', 'Rasayana Specialist'],
      ['Ayurveda', 'Ayurveda Specialists', 'Agad Tantra'],
      ['Ayurveda', 'Ayurveda Specialists', 'Swasthavritta Specialist'],

      // Unani
      ['Unani', 'General Unani', 'Unani Physician (Hakim)'],
      ['Unani', 'Unani Specialists', 'Ilaj-bit-Tadbeer'],
      ['Unani', 'Unani Specialists', 'Amraz-e-Niswan'],
      ['Unani', 'Unani Specialists', 'Amraz-e-Atfal'],
      ['Unani', 'Unani Specialists', 'Jarahat Specialist'],
      ['Unani', 'Unani Specialists', 'Amraz-e-Jild Specialist'],
      ['Unani', 'Unani Specialists', 'Amraz-e-Asab Specialist'],
      ['Unani', 'Unani Specialists', 'Tibb-e-Ruhani Specialist'],

      // Physiotherapy
      ['Physiotherapy', 'Physiotherapy Specialists', 'General Physiotherapist'],
      ['Physiotherapy', 'Physiotherapy Specialists', 'Orthopedic Physiotherapist'],
      ['Physiotherapy', 'Physiotherapy Specialists', 'Neurological Physiotherapist'],
      ['Physiotherapy', 'Physiotherapy Specialists', 'Sports Physiotherapist'],
      ['Physiotherapy', 'Physiotherapy Specialists', 'Pediatric Physiotherapist'],
      ['Physiotherapy', 'Physiotherapy Specialists', 'Geriatric Physiotherapist'],
      ['Physiotherapy', 'Physiotherapy Specialists', 'Rehabilitation Specialist'],

      // Mental Health & Psychology
      ['Mental Health & Psychology', 'Mental Health Specialists', 'Psychiatrist'],
      ['Mental Health & Psychology', 'Mental Health Specialists', 'Clinical Psychologist'],
      ['Mental Health & Psychology', 'Mental Health Specialists', 'Counseling Psychologist'],
      ['Mental Health & Psychology', 'Mental Health Specialists', 'Child Psychologist'],
      ['Mental Health & Psychology', 'Mental Health Specialists', 'Marriage Counselor'],
      ['Mental Health & Psychology', 'Mental Health Specialists', 'Addiction Counselor']
    ];

    for (const [sys, cat, role] of specs) {
      await this.pool.query(
        'INSERT INTO specialties_matrix (medical_system, category, specialist_role) VALUES ($1, $2, $3)',
        [sys, cat, role]
      );
    }

    // 8. Seed Doctors (always clear and re-seed to stay in sync)
    console.log('Refreshing doctors catalog...');
    await this.pool.query('TRUNCATE TABLE doctors RESTART IDENTITY CASCADE');
    
    const docs = [
      [
        'Dr. Ayesha Ali', 'Homeopathy', 'General Homeopathy', 'Homeopathic Physician',
        'DHMS, B.Sc, LLB, M.D. Homeopathy', '35 Years experience', 899, 4.9,
        'Former Registrar, Madhya Pradesh. Specialized in chronic care, women-led family health, and second opinions.',
        '/assets/doctors/dr-ayesha-ali.jpeg', 'Dr. Ayesha Homeo Health Mall', 'IN-HFR-100456', 'MCI-4207198'
      ],
      [
        'Dr. Yogyata Mukhraiya', 'Homeopathy', 'Homeopathy Specialists', 'Skin Disease Specialist',
        'BHMS', '12 Years experience', 699, 4.8,
        'Focused on female health, skin disease treatments, infertility concerns, and chronic follow-ups.',
        '/assets/doctors/dr-yogyata-mukhraiya.jpeg', 'Dr. Ayesha Homeo Health Mall', 'IN-HFR-100789', 'ABDM-REG-8827341'
      ],
      [
        'Dr. Rajesh Sharma', 'Allopathy', 'General Medicine', 'General Physician',
        'MBBS, MD (Medicine)', '15 Years experience', 500, 4.7,
        'Experienced family physician providing comprehensive primary healthcare, preventive medicine, and disease management.',
        '', 'Janki Raman Hospital', 'IN-HFR-100789', 'HPR-REG-102938'
      ],
      [
        'Dr. Sunita Patel', 'Allopathy', 'Heart & Blood Vessels', 'Cardiologist',
        'MD, DM (Cardiology)', '20 Years experience', 1000, 4.9,
        'Expert cardiologist specialized in interventional cardiology, heart failure management, and vascular care.',
        '', 'Janki Raman Hospital', 'IN-HFR-100789', 'HPR-REG-543210'
      ],
      [
        'Dr. Shalini Sen', 'Allopathy', 'Mental Health', 'Psychiatrist',
        'MD (Psychiatry)', '14 Years experience', 900, 4.9,
        'Consultant psychiatrist treating anxiety, mood disorders, depression, and adolescent behavioral concerns.',
        '', 'Janki Raman Hospital', 'IN-HFR-100789', 'HPR-REG-777777'
      ],
      [
        'Dr. Rohan Das', 'Dental Care', 'General Dentistry', 'General Dentist',
        'BDS, MDS', '8 Years experience', 400, 4.8,
        'Dedicated dentist providing routine cleanings, fillings, crown placements, and general preventive dental care.',
        '', 'Smile Dental Clinic', 'IN-HFR-100111', 'HPR-REG-111111'
      ],
      [
        'Dr. Preeti Verma', 'Dental Care', 'Specialist Dentistry', 'Orthodontist',
        'BDS, MDS (Orthodontics)', '10 Years experience', 600, 4.8,
        'Specializes in alignment of teeth, braces, aligners, and dental facial orthopedics.',
        '', 'Smile Dental Clinic', 'IN-HFR-100111', 'HPR-REG-222222'
      ],
      [
        'Dr. Rohan Das', 'Dentist', 'General Dentistry', 'General Dentist',
        'BDS, MDS', '8 Years experience', 400, 4.8,
        'Dedicated dentist providing routine cleanings, fillings, crown placements, and general preventive dental care.',
        '', 'Smile Dental Clinic', 'IN-HFR-100111', 'HPR-REG-111111'
      ],
      [
        'Dr. Preeti Verma', 'Dentist', 'Specialist Dentistry', 'Orthodontist',
        'BDS, MDS (Orthodontics)', '10 Years experience', 600, 4.8,
        'Specializes in alignment of teeth, braces, aligners, and dental facial orthopedics.',
        '', 'Smile Dental Clinic', 'IN-HFR-100111', 'HPR-REG-222222'
      ],
      [
        'Dr. Madhavan Pillai', 'Ayurveda', 'General Ayurveda', 'Ayurvedic Physician',
        'BAMS, MD (Ayurveda)', '18 Years experience', 500, 4.7,
        'Practitioner of holistic wellness using traditional Kaya Chikitsa, pulse diagnosis, and herbal medicines.',
        '', 'Kerala Ayurveda Kendra', 'IN-HFR-100222', 'HPR-REG-333333'
      ],
      [
        'Dr. Anjali Nair', 'Ayurveda', 'Ayurveda Specialists', 'Panchakarma Specialist',
        'BAMS', '10 Years experience', 600, 4.8,
        'Specialist in Panchakarma detoxification treatments, stress management therapies, and holistic healing.',
        '', 'Kerala Ayurveda Kendra', 'IN-HFR-100222', 'HPR-REG-444444'
      ],
      [
        'Dr. Hakim Faisal Khan', 'Unani', 'General Unani', 'Unani Physician (Hakim)',
        'BUMS', '22 Years experience', 400, 4.6,
        'Experienced Hakim prescribing herbal and mineral formulations along with traditional regiminal therapies.',
        '', 'Shifa Unani Clinic', 'IN-HFR-100555', 'HPR-REG-555555'
      ],
      [
        'Dr. Karan Malhotra', 'Physiotherapy', 'Physiotherapy Specialists', 'General Physiotherapist',
        'BPT, MPT', '9 Years experience', 500, 4.8,
        'Helps patients restore mobility, recover from sports injuries, and manage chronic orthopedic pain.',
        '', 'ActiveLife Physiotherapy', 'IN-HFR-100666', 'HPR-REG-666666'
      ],
      [
        'Dr. Shalini Sen', 'Mental Health & Psychology', 'Mental Health Specialists', 'Psychiatrist',
        'MD (Psychiatry)', '14 Years experience', 900, 4.9,
        'Consultant psychiatrist treating anxiety, mood disorders, depression, and adolescent behavioral concerns.',
        '', 'MindCare Wellness', 'IN-HFR-100999', 'HPR-REG-777777'
      ],
      [
        'Dr. Sameer Joshi', 'Mental Health & Psychology', 'Mental Health Specialists', 'Clinical Psychologist',
        'M.Phil, Ph.D (Psychology)', '11 Years experience', 800, 4.8,
        'Provides cognitive behavioral therapy (CBT), stress counseling, and personal development therapy.',
        '', 'MindCare Wellness', 'IN-HFR-100999', 'HPR-REG-888888'
      ]
    ];

    for (const d of docs) {
      await this.pool.query(
        `INSERT INTO doctors (name, medical_system, speciality, specialist_role, degree, experience, fee, rating, description, photo, hospital_name, hfr_id, certificate_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        d
      );
    }

    await this.seedPincodes();
  }

  private async seedPincodes() {
    const pinCountRes = await this.pool.query('SELECT COUNT(*) FROM pincodes');
    if (parseInt(pinCountRes.rows[0].count) === 0) {
      console.log('Seeding pincodes database (Madhya Pradesh & major Indian cities)...');
      const pincodesData = [
        // Madhya Pradesh
        // Jabalpur
        ['482001', 'Jabalpur', 'Madhya Pradesh'],
        ['482002', 'Jabalpur', 'Madhya Pradesh'],
        ['482003', 'Jabalpur', 'Madhya Pradesh'],
        ['482004', 'Jabalpur', 'Madhya Pradesh'],
        ['482005', 'Jabalpur', 'Madhya Pradesh'],
        ['482008', 'Jabalpur', 'Madhya Pradesh'],
        ['482011', 'Jabalpur', 'Madhya Pradesh'],
        ['482020', 'Jabalpur', 'Madhya Pradesh'],
        // Bhopal
        ['462001', 'Bhopal', 'Madhya Pradesh'],
        ['462002', 'Bhopal', 'Madhya Pradesh'],
        ['462003', 'Bhopal', 'Madhya Pradesh'],
        ['462011', 'Bhopal', 'Madhya Pradesh'],
        ['462016', 'Bhopal', 'Madhya Pradesh'],
        ['462021', 'Bhopal', 'Madhya Pradesh'],
        ['462022', 'Bhopal', 'Madhya Pradesh'],
        ['462023', 'Bhopal', 'Madhya Pradesh'],
        ['462030', 'Bhopal', 'Madhya Pradesh'],
        ['462042', 'Bhopal', 'Madhya Pradesh'],
        // Indore
        ['452001', 'Indore', 'Madhya Pradesh'],
        ['452002', 'Indore', 'Madhya Pradesh'],
        ['452003', 'Indore', 'Madhya Pradesh'],
        ['452005', 'Indore', 'Madhya Pradesh'],
        ['452007', 'Indore', 'Madhya Pradesh'],
        ['452009', 'Indore', 'Madhya Pradesh'],
        ['452010', 'Indore', 'Madhya Pradesh'],
        ['452011', 'Indore', 'Madhya Pradesh'],
        ['452012', 'Indore', 'Madhya Pradesh'],
        ['452016', 'Indore', 'Madhya Pradesh'],
        ['452020', 'Indore', 'Madhya Pradesh'],
        // Gwalior
        ['474001', 'Gwalior', 'Madhya Pradesh'],
        ['474002', 'Gwalior', 'Madhya Pradesh'],
        ['474003', 'Gwalior', 'Madhya Pradesh'],
        ['474004', 'Gwalior', 'Madhya Pradesh'],
        ['474005', 'Gwalior', 'Madhya Pradesh'],
        ['474009', 'Gwalior', 'Madhya Pradesh'],
        ['474011', 'Gwalior', 'Madhya Pradesh'],
        ['474020', 'Gwalior', 'Madhya Pradesh'],
        // Other MP Districts
        ['456001', 'Ujjain', 'Madhya Pradesh'],
        ['456006', 'Ujjain', 'Madhya Pradesh'],
        ['456010', 'Ujjain', 'Madhya Pradesh'],
        ['470001', 'Sagar', 'Madhya Pradesh'],
        ['470002', 'Sagar', 'Madhya Pradesh'],
        ['470003', 'Sagar', 'Madhya Pradesh'],
        ['470004', 'Sagar', 'Madhya Pradesh'],
        ['485001', 'Satna', 'Madhya Pradesh'],
        ['485005', 'Satna', 'Madhya Pradesh'],
        ['485111', 'Satna', 'Madhya Pradesh'],
        ['486001', 'Rewa', 'Madhya Pradesh'],
        ['486005', 'Rewa', 'Madhya Pradesh'],
        ['486006', 'Rewa', 'Madhya Pradesh'],
        ['457001', 'Ratlam', 'Madhya Pradesh'],
        ['455001', 'Dewas', 'Madhya Pradesh'],
        ['480001', 'Chhindwara', 'Madhya Pradesh'],
        ['450001', 'Khandwa', 'Madhya Pradesh'],
        ['451001', 'Khargone', 'Madhya Pradesh'],
        ['464001', 'Vidisha', 'Madhya Pradesh'],
        ['461001', 'Hoshangabad', 'Madhya Pradesh'],
        ['461111', 'Itarsi', 'Madhya Pradesh'],
        ['460001', 'Betul', 'Madhya Pradesh'],
        ['466001', 'Sehore', 'Madhya Pradesh'],
        ['483501', 'Katni', 'Madhya Pradesh'],
        ['486886', 'Singrauli', 'Madhya Pradesh'],
        ['486661', 'Sidhi', 'Madhya Pradesh'],
        ['484001', 'Shahdol', 'Madhya Pradesh'],
        ['481001', 'Balaghat', 'Madhya Pradesh'],
        ['470661', 'Damoh', 'Madhya Pradesh'],
        ['488001', 'Panna', 'Madhya Pradesh'],
        ['472001', 'Tikamgarh', 'Madhya Pradesh'],
        ['473551', 'Shivpuri', 'Madhya Pradesh'],
        ['473001', 'Guna', 'Madhya Pradesh'],
        ['477001', 'Bhind', 'Madhya Pradesh'],
        ['476001', 'Morena', 'Madhya Pradesh'],
        ['476337', 'Sheopur', 'Madhya Pradesh'],
        ['475661', 'Datia', 'Madhya Pradesh'],
        ['454001', 'Dhar', 'Madhya Pradesh'],
        ['457887', 'Alirajpur', 'Madhya Pradesh'],
        ['457661', 'Jhabua', 'Madhya Pradesh'],
        ['451551', 'Barwani', 'Madhya Pradesh'],
        ['450331', 'Burhanpur', 'Madhya Pradesh'],
        ['484224', 'Anuppur', 'Madhya Pradesh'],
        ['484661', 'Umaria', 'Madhya Pradesh'],
        ['481880', 'Dindori', 'Madhya Pradesh'],
        ['481661', 'Mandla', 'Madhya Pradesh'],
        ['480661', 'Seoni', 'Madhya Pradesh'],
        ['487001', 'Narsinghpur', 'Madhya Pradesh'],
        ['465001', 'Shajapur', 'Madhya Pradesh'],
        ['465441', 'Agar Malwa', 'Madhya Pradesh'],
        ['458441', 'Neemuch', 'Madhya Pradesh'],
        ['458001', 'Mandsaur', 'Madhya Pradesh'],
        ['461331', 'Harda', 'Madhya Pradesh'],
        ['464551', 'Raisen', 'Madhya Pradesh'],
        ['465661', 'Rajgarh', 'Madhya Pradesh'],
        ['473331', 'Ashoknagar', 'Madhya Pradesh'],
        ['472246', 'Niwari', 'Madhya Pradesh'],

        // Delhi
        ['110001', 'New Delhi', 'Delhi'],
        ['110002', 'Central Delhi', 'Delhi'],
        ['110011', 'New Delhi', 'Delhi'],
        ['110020', 'South Delhi', 'Delhi'],
        ['110045', 'South West Delhi', 'Delhi'],
        ['110085', 'North West Delhi', 'Delhi'],

        // Maharashtra
        ['400001', 'Mumbai', 'Maharashtra'],
        ['400002', 'Mumbai', 'Maharashtra'],
        ['400011', 'Mumbai', 'Maharashtra'],
        ['400050', 'Mumbai', 'Maharashtra'],
        ['400097', 'Mumbai', 'Maharashtra'],
        ['411001', 'Pune', 'Maharashtra'],
        ['411002', 'Pune', 'Maharashtra'],
        ['411014', 'Pune', 'Maharashtra'],
        ['411038', 'Pune', 'Maharashtra'],
        ['411045', 'Pune', 'Maharashtra'],

        // Karnataka
        ['560001', 'Bengaluru', 'Karnataka'],
        ['560002', 'Bengaluru', 'Karnataka'],
        ['560011', 'Bengaluru', 'Karnataka'],
        ['560034', 'Bengaluru', 'Karnataka'],
        ['560038', 'Bengaluru', 'Karnataka'],
        ['560068', 'Bengaluru', 'Karnataka'],

        // Tamil Nadu
        ['600001', 'Chennai', 'Tamil Nadu'],
        ['600002', 'Chennai', 'Tamil Nadu'],
        ['600004', 'Chennai', 'Tamil Nadu'],
        ['600018', 'Chennai', 'Tamil Nadu'],
        ['600040', 'Chennai', 'Tamil Nadu'],

        // West Bengal
        ['700001', 'Kolkata', 'West Bengal'],
        ['700002', 'Kolkata', 'West Bengal'],
        ['700009', 'Kolkata', 'West Bengal'],
        ['700020', 'Kolkata', 'West Bengal'],
        ['700091', 'Kolkata', 'West Bengal'],

        // Telangana
        ['500001', 'Hyderabad', 'Telangana'],
        ['500002', 'Hyderabad', 'Telangana'],
        ['500008', 'Hyderabad', 'Telangana'],
        ['500032', 'Hyderabad', 'Telangana'],
        ['500081', 'Hyderabad', 'Telangana'],

        // Gujarat
        ['380001', 'Ahmedabad', 'Gujarat'],
        ['380009', 'Ahmedabad', 'Gujarat'],
        ['380015', 'Ahmedabad', 'Gujarat'],

        // Rajasthan
        ['302001', 'Jaipur', 'Rajasthan'],
        ['302002', 'Jaipur', 'Rajasthan'],
        ['302015', 'Jaipur', 'Rajasthan'],

        // Uttar Pradesh
        ['226001', 'Lucknow', 'Uttar Pradesh'],
        ['226010', 'Lucknow', 'Uttar Pradesh'],
        ['226016', 'Lucknow', 'Uttar Pradesh'],

        // Bihar
        ['800001', 'Patna', 'Bihar'],
        ['800003', 'Patna', 'Bihar'],
        ['800020', 'Patna', 'Bihar']
      ];

      for (const row of pincodesData) {
        await this.pool.query(
          'INSERT INTO pincodes (pincode, district, state) VALUES ($1, $2, $3) ON CONFLICT (pincode) DO NOTHING',
          row
        );
      }
    }
  }

  // --- GENERIC QUERY HELPER ---
  async query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }
}
