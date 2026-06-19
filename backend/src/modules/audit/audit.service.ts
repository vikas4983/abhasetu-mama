/**
 * @file        audit.service.ts
 * @description Service for managing audit logs and transaction logs in compliance with ABDM privacy policies.
 * @module      audit
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Injectable } from '@nestjs/common';
import { DbService } from '../../database/db.service';

@Injectable()
export class AuditService {
  constructor(private readonly db: DbService) {}

  /**
   * @description Fetches the recent audit logs (up to 100).
   * @returns {Promise<any[]>} List of audit logs.
   */
  async getLogs(): Promise<any[]> {
    const res = await this.db.query('SELECT id, timestamp, event, status, details FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
    return res.rows.map((row: any) => ({
      id: row.id,
      timestamp: row.timestamp,
      event: row.event,
      status: row.status,
      details: row.details
    }));
  }

  /**
   * @description Writes a standard audit log entry.
   * @param {string} event - The name of the event.
   * @param {string} status - Event status (SUCCESS, FAILED, etc.).
   * @param {string} details - Log details.
   */
  async addLog(event: string, status: string, details: string): Promise<void> {
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
   * @description Fetches all transaction records.
   * @returns {Promise<any[]>} List of transactions.
   */
  async getTransactions(): Promise<any[]> {
    const res = await this.db.query('SELECT id, timestamp, user_mobile_masked, user_aadhaar_masked, user_abha_masked, appointment_type, doctor_name, hospital_name, fee, platform_fee, total_fee, payment_method, status FROM transactions ORDER BY timestamp DESC');
    return res.rows;
  }

  /**
   * @description Adds a transaction and generates an associated audit log entry.
   * @param {any} txn - Transaction data object.
   * @returns {Promise<any>} Status and ID of the newly added transaction.
   */
  async addTransaction(txn: any): Promise<any> {
    const id = txn.id || `TXN-SETU-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await this.db.query(
      `INSERT INTO transactions (id, timestamp, user_mobile_masked, user_aadhaar_masked, user_abha_masked, appointment_type, doctor_name, hospital_name, fee, platform_fee, total_fee, payment_method, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        id,
        new Date().toISOString(),
        txn.userMobileMasked,
        txn.userAadhaarMasked || 'N/A',
        txn.userAbhaMasked || 'N/A',
        txn.appointmentType,
        txn.doctorName,
        txn.hospitalName || 'N/A',
        txn.fee,
        txn.platformFee || 99,
        txn.totalFee || (Number(txn.fee) + 99),
        txn.paymentMethod,
        txn.status || 'SUCCESS'
      ]
    );
    // Write an audit log as well
    await this.addLog(
      'Transaction Settled',
      txn.status || 'SUCCESS',
      `Revenue of Rs. ${txn.totalFee || (Number(txn.fee) + 99)} collected. Doctor: ${txn.doctorName}. Patient: ${txn.userAbhaMasked || txn.userMobileMasked}`
    );
    return { status: 'success', id };
  }

  /**
   * @description Writes a detailed audit log entry with metadata masking for privacy compliance.
   * @param {string} event - The name of the event.
   * @param {string} status - Event status (SUCCESS, FAILED, etc.).
   * @param {string} message - Descriptive message.
   * @param {object} metadata - Additional metadata to log.
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
      endpoint?: string;
    }
  ): Promise<void> {
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
}
