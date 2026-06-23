/**
 * @file        nhcx.service.ts
 * @description Dedicated service for National Health Claims Exchange (NHCX) claim submissions, eligibility checks, and settlements.
 * @module      abdm/nhcx
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Injectable } from '@nestjs/common';
import { SessionService } from '../session/session.service';
import * as crypto from 'crypto';

@Injectable()
export class NhcxService {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * @description Handles NHCX coverage eligibility checks, pre-auth submissions, and final claim settlement.
   */
  async handleNhcx(body: any, context?: { ip?: string; userAgent?: string }): Promise<any> {
    const { action, abhaAddress, policyNumber, diagnosis, estimateCost, recordsLinked } = body;
    const config = await this.sessionService.getConfig();
    const transactionId = crypto.randomUUID();

    if (action === 'eligibility-check') {
      if (!abhaAddress || !policyNumber) {
        return { status: 'error', message: 'ABHA Address and Insurance Policy Number are required.' };
      }

      const result = {
        status: 'success',
        message: 'Coverage eligibility checked successfully.',
        transactionId,
        fhirBundle: {
          resourceType: 'Bundle',
          type: 'collection',
          timestamp: new Date().toISOString(),
          entry: [
            {
              resource: {
                resourceType: 'CoverageEligibilityResponse',
                status: 'active',
                outcome: 'complete',
                disposition: 'Policy is active and diagnostic services are covered.',
                insurer: { display: 'Star Health Insurance Co.' },
                insurance: [
                  {
                    coverage: { display: 'ABHA Suraksha Shield Plan' },
                    benefit: [
                      { type: { text: 'Cashless Pre-Auth Limit' }, allowedMoney: { value: 150000, currency: 'INR' } },
                      { type: { text: 'OPD Co-pay Ratio' }, allowedMoney: { value: 10, currency: 'PERCENT' } }
                    ]
                  }
                ]
              }
            }
          ]
        },
        simulated: true
      };

      await this.sessionService.addDetailedLog('NHCX Coverage Checked', 'SUCCESS', `Checked policy eligibility for: ${policyNumber}`, {
        abhaId: abhaAddress,
        request: body,
        response: result,
        clientId: config.ABDM_CLIENT_ID,
        clientIp: context?.ip,
        userAgent: context?.userAgent,
      });

      return result;

    } else if (action === 'preauth-submit') {
      if (!policyNumber || !estimateCost) {
        return { status: 'error', message: 'Policy Number and Estimated treatment costs are required.' };
      }

      const approvedAmount = Math.floor(Number(estimateCost) * 0.9);
      const copay = Number(estimateCost) - approvedAmount;
      const preAuthId = `NHCX-PREAUTH-${Math.floor(100000 + Math.random() * 900000)}`;

      const result = {
        status: 'success',
        message: 'Pre-authorization request adjudicated successfully.',
        transactionId,
        preAuthId,
        adjudication: {
          status: 'APPROVED',
          disposition: '90% of OPD/IPD costs approved under cashless agreement. Co-pay applies.',
          approvedAmount,
          patientCopay: copay,
          deductibles: 0,
          notes: 'Standard policy parameters apply. Verified clinical records attached: ' + (recordsLinked || 'None')
        },
        fhirBundle: {
          resourceType: 'Bundle',
          type: 'collection',
          entry: [
            {
              resource: {
                resourceType: 'ClaimResponse',
                status: 'active',
                outcome: 'complete',
                use: 'preauthorization',
                preAuthRef: preAuthId,
                insurer: { display: 'Star Health Insurance Co.' },
                requestor: { display: 'Abha Setu Hospital Hub' },
                total: {
                  value: approvedAmount,
                  currency: 'INR'
                }
              }
            }
          ]
        },
        simulated: true
      };

      await this.sessionService.addDetailedLog('NHCX Pre-Auth Submitted', 'SUCCESS', `Cashless Pre-Auth approved for policy: ${policyNumber} Approved: Rs.${approvedAmount}`, {
        request: body,
        response: result,
        clientId: config.ABDM_CLIENT_ID,
        clientIp: context?.ip,
        userAgent: context?.userAgent,
      });

      return result;

    } else if (action === 'claim-submit') {
      if (!abhaAddress || !estimateCost) {
        return { status: 'error', message: 'ABHA Address and Final bill estimate are required.' };
      }

      const claimReference = `NHCX-CLAIM-${Math.floor(1000000 + Math.random() * 9000000)}`;
      const reimbursementAmount = Math.floor(Number(estimateCost) * 0.85);
      const patientOutflow = Number(estimateCost) - reimbursementAmount;

      const result = {
        status: 'success',
        message: 'Final claim successfully settled via NHCX gateway direct clearing.',
        transactionId,
        claimRef: claimReference,
        use: 'claim',
        settlement: {
          status: 'PAID',
          reimbursementAmount,
          patientCoPay: patientOutflow,
          clearingUtr: `NHCX-EFT-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
          payerBankReceipt: 'NHA-Direct clearing JWS Valid',
          timestamp: new Date().toISOString()
        },
        simulated: true
      };

      await this.sessionService.addDetailedLog('NHCX Cashless Claim Settled', 'SUCCESS', `Settled final claim ${claimReference} for Amount Rs.${reimbursementAmount}`, {
        abhaId: abhaAddress,
        request: body,
        response: result,
        clientId: config.ABDM_CLIENT_ID,
        clientIp: context?.ip,
        userAgent: context?.userAgent,
      });

      return result;
    }

    return { status: 'error', message: 'Invalid NHCX Action.' };
  }
}
