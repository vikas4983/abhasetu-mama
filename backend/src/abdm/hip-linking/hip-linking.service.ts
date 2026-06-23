/**
 * @file        hip-linking.service.ts
 * @description Dedicated service for Milestone 2 Care Context discovery, confirmation, linking, and scan & share kiosks.
 * @module      abdm/hip-linking
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Injectable } from '@nestjs/common';
import { SessionService } from '../session/session.service';
import * as crypto from 'crypto';

@Injectable()
export class HipLinkingService {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * @description Handles patient care context discovery and confirm linking requests.
   */
  async handleHip(body: any, context?: { ip?: string; userAgent?: string }): Promise<any> {
    const { action, abhaAddress, patientName, contextType, detail, otp, txnId } = body;
    const config = await this.sessionService.getConfig();

    if (action === 'discover-link') {
      if (!abhaAddress || !patientName) {
        return { status: 'error', message: 'ABHA Address and Patient Name are required.' };
      }

      const matchedPatient = {
        referenceNumber: `PAT-${Math.floor(100000 + Math.random() * 900000)}`,
        display: patientName,
        careContexts: [
          {
            referenceNumber: `EMR-CTX-${Math.floor(1000 + Math.random() * 9000)}`,
            display: `${contextType || 'OPD Consultation'} - ${detail || 'Chronic Care visit'}`,
            hiType: contextType === 'Prescription' ? 'Prescription' : contextType === 'Lab Report' ? 'DiagnosticReport' : 'OPConsultation'
          }
        ]
      };

      const result = {
        status: 'success',
        message: 'Patient matched successfully in EMR database.',
        transactionId: crypto.randomUUID(),
        txnId: crypto.randomUUID(),
        matchedPatient,
        simulated: true,
      };

      await this.sessionService.addDetailedLog('HIP Patient Discovery', 'SUCCESS', `Discovered care contexts for ABHA Address: ${abhaAddress}`, {
        abhaId: abhaAddress,
        request: body,
        response: result,
        clientId: config.ABDM_CLIENT_ID,
        clientIp: context?.ip,
        userAgent: context?.userAgent,
      });

      return result;

    } else if (action === 'confirm-link') {
      if (!otp || !txnId) {
        return { status: 'error', message: 'OTP and transaction context ID are required.' };
      }

      if (otp === '123456') {
        const result = {
          status: 'success',
          message: 'Care context linked successfully under ABDM Gateway!',
          linkingStatus: 'SUCCESS',
          linkedAt: new Date().toISOString(),
          referenceNumber: `LINK-${Math.floor(100000 + Math.random() * 900000)}`,
          simulated: true,
        };

        await this.sessionService.addDetailedLog('HIP Care Context Link Confirmed', 'SUCCESS', `Successfully linked care contexts for txn: ${txnId}`, {
          request: body,
          response: result,
          clientId: config.ABDM_CLIENT_ID,
          clientIp: context?.ip,
          userAgent: context?.userAgent,
        });

        return result;
      } else {
        const result = { status: 'error', message: 'Invalid OTP code. Please enter 123456.' };
        await this.sessionService.addDetailedLog('HIP Care Context Link Failed', 'ERROR', 'Failed to link care context: Invalid OTP', {
          request: body,
          response: result,
          clientId: config.ABDM_CLIENT_ID,
          clientIp: context?.ip,
          userAgent: context?.userAgent,
        });
        return result;
      }
    }

    return { status: 'error', message: 'Invalid Action.' };
  }

  /**
   * @description Handles scan-and-share profile sharing, bill retrieval, and health UPI payment processing.
   */
  async handleScanShare(body: any, context?: { ip?: string; userAgent?: string }): Promise<any> {
    const { action, abhaAddress, patientProfile, facilityCode, billId, paymentAmount } = body;
    const config = await this.sessionService.getConfig();

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

      await this.sessionService.addDetailedLog('Scan & Share Profile Shared', 'SUCCESS', `Demographics shared for ABHA: ${abhaAddress} -> Kiosk Token: ${tokenNum}`, {
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

      await this.sessionService.addDetailedLog('Scan & Pay Bills Fetched', 'SUCCESS', `Fetched billing records for ABHA: ${abhaAddress}`, {
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

      await this.sessionService.addDetailedLog('UPI Health Payment Completed', 'SUCCESS', `Settled bill ${billId} of Amount Rs.${paymentAmount} UTR: ${utrNumber}`, {
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
