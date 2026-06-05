import { Injectable } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

@Injectable()
export class AbdmService {
  private dbPath = path.join(process.cwd(), '../src/data/db.json');

  constructor(private readonly cryptoService: CryptoService) {}

  private readDb() {
    try {
      if (!fs.existsSync(this.dbPath)) {
        return { config: {}, auditLogs: [], products: [], policies: [], labPackages: [] };
      }
      const raw = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      return { config: {}, auditLogs: [], products: [], policies: [], labPackages: [] };
    }
  }

  private writeDb(data: any) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to write to static DB:', e);
    }
  }

  // --- CONFIG ENDPOINTS ---
  getConfig() {
    const db = this.readDb();
    return db.config || {};
  }

  saveConfig(newConfig: any) {
    const db = this.readDb();
    db.config = { ...db.config, ...newConfig };
    this.writeDb(db);
    return { status: 'success', message: 'Config updated successfully' };
  }

  // --- AUDIT LOGS ENDPOINTS ---
  getLogs() {
    const db = this.readDb();
    return db.auditLogs || [];
  }

  addLog(event: string, status: string, details: string) {
    const db = this.readDb();
    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift({
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      event,
      status,
      details,
    });
    // Cap at 100 logs
    if (db.auditLogs.length > 100) {
      db.auditLogs = db.auditLogs.slice(0, 100);
    }
    this.writeDb(db);
  }

  // --- CATALOG ENDPOINTS ---
  getProducts() {
    return this.readDb().products || [];
  }

  saveProduct(product: any) {
    const db = this.readDb();
    if (!db.products) db.products = [];
    
    if (product.id) {
      // Edit
      const idx = db.products.findIndex((p: any) => p.id === product.id);
      if (idx !== -1) {
        db.products[idx] = { ...db.products[idx], ...product };
      } else {
        return { status: 'error', message: 'Product not found' };
      }
    } else {
      // Add
      const newProduct = {
        ...product,
        id: `MED-${Date.now()}`,
      };
      db.products.push(newProduct);
    }
    this.writeDb(db);
    return { status: 'success', data: product };
  }

  deleteProduct(id: string) {
    const db = this.readDb();
    if (!db.products) db.products = [];
    db.products = db.products.filter((p: any) => p.id !== id);
    this.writeDb(db);
    return { status: 'success' };
  }

  getPolicies() {
    return this.readDb().policies || [];
  }

  getLabPackages() {
    return this.readDb().labPackages || [];
  }

  // --- GATEWAY SESSION HANDSHAKE ---
  async getGatewaySession() {
    const config = this.getConfig();
    const clientId = config.ABDM_CLIENT_ID || '';
    const clientSecret = config.ABDM_CLIENT_SECRET || '';

    // If client credentials are empty, simulate successful handshake
    if (!clientId || !clientSecret) {
      return {
        status: 'success',
        sandboxMode: true,
        tokenPreview: 'sbx-jwt-simulated-access-token-placeholder',
      };
    }

    try {
      const response = await axios.post(
        'https://dev.abdm.gov.in/api/hiecm/gateway/v3/sessions',
        {
          clientId,
          clientSecret,
          grantType: 'client_credentials',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'REQUEST-ID': crypto.randomUUID(),
            TIMESTAMP: new Date().toISOString(),
          },
        },
      );
      return {
        status: 'success',
        sandboxMode: true,
        tokenPreview: response.data.accessToken,
      };
    } catch (err: any) {
      console.warn('ABDM Sandbox Gateway offline or rejected credentials. Falling back to simulation.', err.message);
      return {
        status: 'success',
        sandboxMode: true,
        tokenPreview: `sbx-jwt-simulated-fallback-${clientId.slice(0, 5)}`,
      };
    }
  }

  // --- MILESTONE 1 (ENROLLMENT & RSA ENCRYPTION) ---
  async requestAadhaarOtp(aadhaar: string) {
    // 1. Validate Aadhaar length
    if (!aadhaar || aadhaar.length !== 12 || !/^\d+$/.test(aadhaar)) {
      return { status: 'error', message: 'Invalid 12-digit Aadhaar number.' };
    }

    // 2. Fetch public key certificate
    let publicKey = '';
    const config = this.getConfig();
    const gatewayUrl = config.ABDM_GATEWAY_URL || 'https://dev.abdm.gov.in';

    try {
      const certRes = await axios.get(`${gatewayUrl}/v3/profile/public/certificate`);
      publicKey = certRes.data.publicKey || '';
    } catch (e: any) {
      // Mock certificate for sandbox if server offline
      publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA09d1yZc6F30v/T2e...';
    }

    // 3. Encrypt Aadhaar using RSA OAEP SHA-1
    const encryptedAadhaar = this.cryptoService.encryptWithPublicKey(publicKey, aadhaar);
    const txnId = crypto.randomUUID();

    // 4. Send request to ABDM Gateway
    try {
      await axios.post(
        `${gatewayUrl}/v3/enrollment/request/otp`,
        {
          txnId: '',
          scope: ['abha-enrol'],
          loginHint: 'aadhaar',
          loginId: encryptedAadhaar,
          otpSystem: 'aadhaar',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'REQUEST-ID': crypto.randomUUID(),
            TIMESTAMP: new Date().toISOString(),
            'X-CM-ID': 'sbx',
          },
        },
      );
      
      this.addLog('Aadhaar OTP Requested', 'SUCCESS', `Aadhaar encrypted successfully and OTP request dispatched to Gateway (Txn ID: ${txnId})`);
      return { status: 'success', txnId, message: 'OTP sent to Aadhaar-linked mobile.' };
    } catch (e: any) {
      // Sandbox fallback
      this.addLog('Aadhaar OTP Requested (Simulated)', 'SUCCESS', `Gateway simulated OTP sent to Aadhaar-linked mobile (Txn ID: ${txnId})`);
      return { status: 'success', txnId, message: 'OTP sent to Aadhaar-linked mobile (Simulated Sandbox).' };
    }
  }

  async verifyAadhaarOtp(otp: string, txnId: string) {
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      return { status: 'error', message: 'Invalid 6-digit OTP.' };
    }

    // Fetch public certificate
    let publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA09d1yZc6F30v/T2e...';
    const config = this.getConfig();
    const gatewayUrl = config.ABDM_GATEWAY_URL || 'https://dev.abdm.gov.in';

    try {
      const certRes = await axios.get(`${gatewayUrl}/v3/profile/public/certificate`);
      publicKey = certRes.data.publicKey || '';
    } catch (e) {}

    // Encrypt OTP using RSA OAEP SHA-1
    const encryptedOtp = this.cryptoService.encryptWithPublicKey(publicKey, otp);

    try {
      const response = await axios.post(
        `${gatewayUrl}/v3/enrollment/enrol/byAadhaar`,
        {
          txnId,
          otp: encryptedOtp,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'REQUEST-ID': crypto.randomUUID(),
            TIMESTAMP: new Date().toISOString(),
            'X-CM-ID': 'sbx',
          },
        },
      );
      this.addLog('Aadhaar OTP Verified', 'SUCCESS', `ABHA Number successfully issued: ${response.data.abhaNumber}`);
      return { status: 'success', ...response.data };
    } catch (e: any) {
      // Sandbox fallback mock response
      const mockAbhaNumber = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const mockAbhaAddress = `aarav.sharma.${Date.now().toString().slice(-4)}@sbx`;
      
      const payload = {
        status: 'success',
        abhaNumber: mockAbhaNumber,
        abhaAddress: mockAbhaAddress,
        profile: {
          name: 'Aarav Sharma',
          gender: 'Male',
          dob: '12-04-1994',
          mobile: '9876543210',
          photo: '',
          address: 'H-402, Green Valley Apartments, Sector 56, Gurgaon, Haryana - 122011',
        },
      };

      this.addLog('Aadhaar OTP Verified (Simulated)', 'SUCCESS', `ABHA Number successfully generated: ${mockAbhaNumber} (Address: ${mockAbhaAddress})`);
      return payload;
    }
  }
}
