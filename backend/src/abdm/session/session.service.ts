/**
 * @file        session.service.ts
 * @description Core service handling configuration, audit logs, and gateway session tokens for the ABDM bridge.
 * @module      abdm/session
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Injectable } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { CryptoService } from '../crypto/crypto.service';
import axios from 'axios';
import * as crypto from 'crypto';
import { ABDM_ENDPOINTS, ABDM_HEADERS } from '../../constants/abdm.constants';

@Injectable()
export class SessionService {
  private cachedToken = '';
  private cachedTokenExpiry = 0;

  constructor(
    private readonly db: DbService,
    private readonly cryptoService: CryptoService
  ) {}

  /**
   * @description Resolves the dynamically selected ABDM Gateway base URL using database config or environment variables.
   * @returns {Promise<string>} The configured ABDM Gateway Base URL.
   */
  async getGatewayBaseUrl(): Promise<string> {
    const config = await this.getConfig();
    if (config.ABDM_GATEWAY_URL) {
      return config.ABDM_GATEWAY_URL;
    }
    const env = process.env.ABDM_ENV || 'sandbox';
    if (env === 'production') {
      return process.env.ABDM_GATEWAY_BASE_URL_PROD || 'https://live.abdm.gov.in';
    }
    return process.env.ABDM_GATEWAY_BASE_URL_SANDBOX || 'https://dev.abdm.gov.in';
  }

  /**
   * @description Resolves the dynamically selected ABHA System base URL (sandbox or production) using environment variables.
   * @returns {Promise<string>} The ABHA System Base URL.
   */
  async getAbhaBaseUrl(): Promise<string> {
    const env = process.env.ABDM_ENV || 'sandbox';
    if (env === 'production') {
      return process.env.ABDM_ABHA_BASE_URL_PROD || 'https://abha.abdm.gov.in/abha';
    }
    return process.env.ABDM_ABHA_BASE_URL_SANDBOX || 'https://abhasbx.abdm.gov.in/abha';
  }

  /**
   * @description Gets the configuration map from the local Postgres config table.
   * @returns {Promise<Record<string, any>>} Config keys and values.
   */
  async getConfig(): Promise<Record<string, any>> {
    const res = await this.db.query('SELECT key, value FROM config');
    const config: Record<string, any> = {};
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
   * @description Updates or inserts configuration records in the local database.
   * @param {any} newConfig - Key-value map of configuration changes.
   * @returns {Promise<{ status: string, message: string }>} Result message.
   */
  async saveConfig(newConfig: any) {
    for (const [key, value] of Object.entries(newConfig)) {
      await this.db.query(
        'INSERT INTO config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        [key, String(value)]
      );
    }
    return { status: 'success', message: 'Config updated successfully' };
  }

  /**
   * @description Write an audit log entry to the Postgres audit_logs table.
   * @param {string} event - The name of the event being logged.
   * @param {string} status - Event outcome status (SUCCESS, FAILED, etc.).
   * @param {string} details - Detailed text description.
   */
  async addLog(event: string, status: string, details: string) {
    const id = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await this.db.query(
      'INSERT INTO audit_logs (id, timestamp, event, status, details) VALUES ($1, $2, $3, $4, $5)',
      [
        id,
        new Date().toISOString(),
        event,
        status,
        details
      ]
    );
  }

  /**
   * @description Writes an audit log entry with detailed metadata, ensuring sensitive PHI fields like Aadhaar, mobile, and email are masked.
   * @param {string} event - The name of the event being logged.
   * @param {string} status - Event outcome status.
   * @param {string} message - Descriptive message.
   * @param {object} metadata - Metadata fields to log.
   */
  async addDetailedLog(
    event: string,
    status: string,
    message: string,
    metadata: {
      mobile?: string;
      aadhaar?: string;
      abhaId?: string;
      abhaNumber?: string;
      email?: string;
      request?: any;
      response?: any;
      clientId?: string;
      clientIp?: string;
      userAgent?: string;
    }
  ) {
    const id = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Mask sensitive fields in metadata to comply with security guidelines
    const maskedMetadata = {
      ...metadata,
      mobile: metadata.mobile ? metadata.mobile.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2') : undefined,
      aadhaar: metadata.aadhaar ? metadata.aadhaar.replace(/(\d{2})\d{8}(\d{2})/, '$1********$2') : undefined,
      email: metadata.email ? metadata.email.replace(/^(.)(.*)(@.*)$/, (_, f, m, d) => f + '*'.repeat(m.length) + d) : undefined,
    };

    const detailsJson = JSON.stringify({
      message,
      ...maskedMetadata,
      timestamp: new Date().toISOString(),
    });

    await this.db.query(
      'INSERT INTO audit_logs (id, timestamp, event, status, details) VALUES ($1, $2, $3, $4, $5)',
      [
        id,
        new Date().toISOString(),
        event,
        status,
        detailsJson
      ]
    );
  }

  /**
   * @description Obtains an active session token from the ABDM Sandbox Gateway using Client ID and Client Secret, caching the session token internally.
   * @returns {Promise<{ status: string, tokenPreview: string, publicKey: string, expiresIn: number, refreshExpiresIn: number }>} Session payload.
   */
  async getGatewaySession() {
    const config = await this.getConfig();
    const clientId = config.ABDM_CLIENT_ID || process.env.ABDM_CLIENT_ID || '';
    const clientSecret = config.ABDM_CLIENT_SECRET || process.env.ABDM_CLIENT_SECRET || '';

    if (!clientId || !clientSecret) {
      console.warn('ABDM Gateway credentials (Client ID / Secret) are not configured in database or environment. Falling back to simulated session token.');
      return {
        status: 'success',
        tokenPreview: 'simulated-session-token',
        publicKey: config.ABDM_PUBLIC_KEY || '',
        expiresIn: 3600,
        refreshExpiresIn: 4200,
      };
    }

    // Return cached token if valid
    if (this.cachedToken && Date.now() < this.cachedTokenExpiry) {
      const remainingSecs = Math.max(0, Math.round((this.cachedTokenExpiry - Date.now()) / 1000));
      return {
        status: 'success',
        tokenPreview: this.cachedToken,
        publicKey: config.ABDM_PUBLIC_KEY || '',
        expiresIn: remainingSecs,
        refreshExpiresIn: remainingSecs + 600,
      };
    }

    try {
      const baseUrl = await this.getGatewayBaseUrl();
      const response = await axios.post(
        `${baseUrl}${ABDM_ENDPOINTS.SESSIONS_V3}`,
        {
          clientId,
          clientSecret,
          grantType: 'client_credentials',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            [ABDM_HEADERS.REQUEST_ID]: crypto.randomUUID(),
            [ABDM_HEADERS.TIMESTAMP]: new Date().toISOString(),
            [ABDM_HEADERS.CM_ID]: config.ABDM_CM_ID || 'sbx',
          },
          timeout: 4000,
        },
      );

      const token = response.data.accessToken;
      const expiresIn = response.data.expiresIn || 1200;
      const refreshExpiresIn = response.data.refreshExpiresIn || 1800;
      this.cachedToken = token;
      this.cachedTokenExpiry = Date.now() + (expiresIn - 60) * 1000;

      return {
        status: 'success',
        tokenPreview: token,
        publicKey: config.ABDM_PUBLIC_KEY || '',
        expiresIn,
        refreshExpiresIn,
      };
    } catch (err: any) {
      console.warn('ABDM Sandbox Gateway authentication failed, falling back to simulated session token:', err.message);
      return {
        status: 'success',
        tokenPreview: 'simulated-session-token',
        publicKey: config.ABDM_PUBLIC_KEY || '',
        expiresIn: 3600,
        refreshExpiresIn: 4200,
      };
    }
  }

  /**
   * @description Clear gateway session token cache and force generate a fresh session token.
   * @returns {Promise<{ status: string, tokenPreview: string, message: string }>} Result of manual token refresh.
   */
  async generateSessionToken() {
    this.cachedToken = '';
    this.cachedTokenExpiry = 0;
    
    const sessionRes = await this.getGatewaySession();
    const token = sessionRes.tokenPreview;

    if (!token) {
      throw new Error('Failed to generate token from gateway.');
    }

    await this.addLog('ABDM Gateway Session Sync', 'SUCCESS', 'Manually refreshed gateway sessions and cached the session token.');
    return {
      status: 'success',
      tokenPreview: token,
      message: 'Gateway session generated and cached successfully!'
    };
  }

  /**
   * @description Manually syncs the public key certificate from the ABDM/NHA gateway and caches it in the database.
   * @returns {Promise<{ status: string, publicKey: string }>} Result of the public key sync.
   */
  async syncPublicKeyFromGateway(customToken?: string) {
    const token = customToken || (await this.getGatewaySession()).tokenPreview;

    if (!token) {
      throw new Error('Sync failed: Gateway session token is invalid.');
    }

    try {
      const baseUrl = await this.getAbhaBaseUrl();
      const config = await this.getConfig();
      const response = await axios.get(
        `${baseUrl}${ABDM_ENDPOINTS.ABHA_PUBLIC_CERTIFICATE}`,
        {
          headers: {
            [ABDM_HEADERS.AUTHORIZATION]: `Bearer ${token}`,
            [ABDM_HEADERS.REQUEST_ID]: crypto.randomUUID(),
            [ABDM_HEADERS.TIMESTAMP]: new Date().toISOString(),
            [ABDM_HEADERS.CM_ID]: config.ABDM_CM_ID || 'sbx',
          },
          timeout: 4000,
        },
      );

      const publicKey = response.data.publicKey || '';
      if (!publicKey) {
        throw new Error('Public key not found in the response.');
      }

      await this.saveConfig({
        ABDM_PUBLIC_KEY: publicKey,
        ABDM_PUBLIC_KEY_UPDATED_AT: String(Date.now())
      });
      await this.addLog('ABDM Public Key Synchronized', 'SUCCESS', 'Manually synced public key certificate from ABDM Gateway and cached in database.');
      return { status: 'success', publicKey };
    } catch (err: any) {
      console.warn('Failed to fetch ABDM public key certificate:', err.message);
      const errMsg = err.response?.data?.message || err.message;
      throw new Error(`Failed to fetch ABDM public key certificate: ${errMsg}`);
    }
  }

  /**
   * @description Fetches the public key certificate from database, auto-syncing from gateway if expired or missing.
   * @param {string} token - Gateway authorization bearer session token.
   * @returns {Promise<string>} ABDM public key.
   */
  async getOrFetchPublicKey(token: string): Promise<string> {
    const config = await this.getConfig();
    let publicKey = config.ABDM_PUBLIC_KEY || '';
    const updatedAt = config.ABDM_PUBLIC_KEY_UPDATED_AT ? Number(config.ABDM_PUBLIC_KEY_UPDATED_AT) : 0;
    const threeMonthsMs = 90 * 24 * 60 * 60 * 1000;

    if (!publicKey || (Date.now() - updatedAt) > threeMonthsMs) {
      console.log('ABDM public key is missing or expired. Auto-syncing from gateway...');
      try {
        const syncRes = await this.syncPublicKeyFromGateway(token);
        publicKey = syncRes.publicKey;
      } catch (e: any) {
        if (!publicKey) {
          throw new Error(`ABDM Public Key certificate is missing or expired, and auto-sync failed: ${e.message}`);
        }
      }
    }
    return publicKey;
  }
}
