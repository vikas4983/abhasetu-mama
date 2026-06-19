/**
 * @file        scan-share.service.ts
 * @description Service handling Milestone 4 Scan & Share, demographic metadata sharing, OPD token generation, and payment processing.
 * @module      scan-share
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Injectable } from '@nestjs/common';
import { TenantService } from '../tenant/tenant.service';
import { AuditService } from '../audit/audit.service';
import * as crypto from 'crypto';

@Injectable()
export class ScanShareService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * @description Handles Milestone 4 Scan & Share and Scan & Pay flows.
   */
  async handleScanShare(body: any, context?: { ip?: string; userAgent?: string }): Promise<any> {
    const { action, abhaAddress, patientProfile, facilityCode, billId, paymentAmount } = body;
    const config = await this.tenantService.getConfig();

    if (action === 'share-profile') {
      if (!abhaAddress || !patientProfile) {
        return { status: 'error', message: 'ABHA Address and Patient Profile are required.' };
      }

      const transactionId = crypto.randomUUID();
      const tokenNum = `SETU-OPD-${Math.floor(100 + Math.random() * 900)}`;

      const result = {
        status: 'success',
        message: 'Demographic metadata shared and verified successfully.',
        transactionId,
        opdToken: {
          tokenNumber: tokenNum,
          facilityName: facilityCode === 'IN-HFR-100456' ? 'Dr. Ayesha Homeo Health Mall' : 'Janki Raman Hospital',
          timestamp: new Date().toISOString(),
          estimatedWaitMinutes: 14,
          counterName: 'OPD Counter A (Fast-Track)'
        },
        gatewayCallback: {
          endpoint: '/v1.0/patients/profile/on-share',
          status: 'SUCCESS',
          digitalSignature: 'JWS-SIG-Gateway-ProfileShared-2026'
        },
        simulated: true
      };

      await this.auditService.addDetailedLog('Scan & Share Profile Shared', 'SUCCESS', `Demographics shared for ABHA: ${abhaAddress} -> Kiosk Token: ${tokenNum}`, {
        abhaId: abhaAddress,
        request: body,
        response: result,
        clientId: config.ABDM_CLIENT_ID,
        clientIp: context?.ip,
        userAgent: context?.userAgent,
      });

      return result;

    } else if (action === 'get-pending-bills') {
      if (!abhaAddress) {
        return { status: 'error', message: 'ABHA Address is required.' };
      }

      const result = {
        status: 'success',
        abhaAddress,
        pendingBills: [
          {
            billId: 'BILL-4091',
            serviceName: 'Homeopathy Chronic Medicine Kit (3 Month supply)',
            amount: 899,
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            insuranceEligible: true,
            status: 'UNPAID'
          },
          {
            billId: 'BILL-2045',
            serviceName: 'Lipid Profile & HbA1c Lab Screening',
            amount: 699,
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            insuranceEligible: false,
            status: 'UNPAID'
          }
        ],
        simulated: true
      };

      await this.auditService.addDetailedLog('Scan & Pay Bills Fetched', 'SUCCESS', `Fetched billing records for ABHA: ${abhaAddress}`, {
        abhaId: abhaAddress,
        request: body,
        response: result,
        clientId: config.ABDM_CLIENT_ID,
        clientIp: context?.ip,
        userAgent: context?.userAgent,
      });

      return result;

    } else if (action === 'process-payment') {
      if (!billId || !paymentAmount) {
        return { status: 'error', message: 'Bill ID and payment amount are required.' };
      }

      const utrNumber = `SETU-PAY-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      const result = {
        status: 'success',
        message: 'Payment processed successfully via Health UPI Network!',
        transactionId: crypto.randomUUID(),
        utr: utrNumber,
        billId,
        amountPaid: paymentAmount,
        timestamp: new Date().toISOString(),
        paymentStatus: 'SUCCESS',
        claimStatus: paymentAmount > 800 ? 'AUTO_COPAY_NHCX_ELIGIBLE' : 'DIRECT_WALLET_OUTFLOW',
        simulated: true
      };

      await this.auditService.addDetailedLog('UPI Health Payment Completed', 'SUCCESS', `Settled bill ${billId} of Amount Rs.${paymentAmount} UTR: ${utrNumber}`, {
        request: body,
        response: result,
        clientId: config.ABDM_CLIENT_ID,
        clientIp: context?.ip,
        userAgent: context?.userAgent,
      });

      return result;
    }

    return { status: 'error', message: 'Invalid Scan & Share Action.' };
  }
}
