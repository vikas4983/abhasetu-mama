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
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS config (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL
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
    `;
    await this.pool.query(queryText);
  }

  private async seedData() {
    // 1. Seed users (admins)
    const userCountRes = await this.pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCountRes.rows[0].count) === 0) {
      console.log('Seeding default admins...');
      const hashedPassword = await bcrypt.hash('DreamProject@2026', 10);
      
      await this.pool.query(
        'INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4)',
        ['admin@abhasetu.com', hashedPassword, 'admin', 'System Administrator']
      );
      
      await this.pool.query(
        'INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4)',
        ['master@abhasetu.com', hashedPassword, 'master_admin', 'Master Administrator']
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
  }

  // --- GENERIC QUERY HELPER ---
  async query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }
}
