/**
 * @file        hpr.service.ts
 * @description Dedicated service for Healthcare Professionals Registry (HPR) search and onboarding.
 * @module      abdm/hpr
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Injectable } from '@nestjs/common';
import { SessionService } from '../session/session.service';
import * as crypto from 'crypto';

@Injectable()
export class HprService {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * @description Handles HPR practitioner search, enrollment OTP trigger, and verification.
   */
  async handleHpr(body: any, context?: { ip?: string; userAgent?: string }): Promise<any> {
    const { action, hprId, registrationNo, council, system, aadhaar, otp, txnId } = body;
    const config = await this.sessionService.getConfig();

    if (action === 'search') {
      if (!hprId && !registrationNo) {
        return { status: 'error', message: 'HPR ID or Council Registration Number is required.' };
      }

      const result = {
        status: 'success',
        message: 'Practitioner found in National HPR Registry.',
        practitioner: {
          name: 'Dr. Ayesha Ali',
          hprId: hprId || 'ayesha.ali@hpr',
          registrationNo: registrationNo || 'MCI-4207198',
          council: council || 'Medical Council of India (MCI)',
          system: system || 'Homeopathy',
          degrees: ['DHMS', 'B.Sc', 'LLB', 'M.D. Homeopathy'],
          experience: '35 Years experience',
          activeFacilityId: 'IN-HFR-100456',
          status: 'VERIFIED',
          issuedAt: '15-08-2022',
          digitalSignatureSeal: 'NHA-GATEWAY-SIG-B64-VALID',
        },
        simulated: true,
      };

      await this.sessionService.addDetailedLog('HPR Practitioner Search', 'SUCCESS', `Practitioner found for ID: ${hprId || registrationNo}`, {
        request: body,
        response: result,
        clientId: config.ABDM_CLIENT_ID,
        clientIp: context?.ip,
        userAgent: context?.userAgent,
      });

      return result;

    } else if (action === 'enroll-otp') {
      if (!aadhaar || aadhaar.length !== 12) {
        return { status: 'error', message: 'Invalid 12-digit Aadhaar Number.' };
      }

      const result = {
        status: 'success',
        message: 'Aadhaar eKYC OTP successfully sent to linked mobile ended in *6582.',
        txnId: crypto.randomUUID(),
        simulated: true,
      };

      await this.sessionService.addDetailedLog('HPR Aadhaar KYC OTP Requested', 'SUCCESS', `HPR registration eKYC OTP triggered for Aadhaar: ${aadhaar}`, {
        aadhaar,
        request: body,
        response: result,
        clientId: config.ABDM_CLIENT_ID,
        clientIp: context?.ip,
        userAgent: context?.userAgent,
      });

      return result;

    } else if (action === 'enroll-verify') {
      if (!otp || !txnId) {
        return { status: 'error', message: 'OTP and transaction context ID are required.' };
      }

      if (otp === '123456') {
        const randomReg = Math.floor(1000000 + Math.random() * 9000000);
        const result = {
          status: 'success',
          message: 'Professional HPR ID issued successfully!',
          practitioner: {
            name: 'Dr. Aarav Sharma',
            hprId: `aarav.sharma@hpr`,
            registrationNo: `MCI-${randomReg}`,
            council: council || 'Delhi Medical Council',
            system: system || 'Modern Medicine (Allopathy)',
            degrees: ['MBBS', 'M.D. Cardiology'],
            experience: '12 Years experience',
            activeFacilityId: 'IN-HFR-100789',
            status: 'VERIFIED',
            issuedAt: new Date().toLocaleDateString(),
            digitalSignatureSeal: 'NHA-GATEWAY-SIG-B64-VALID',
          },
          simulated: true,
        };

        await this.sessionService.addDetailedLog('HPR Registration Completed', 'SUCCESS', `Practitioner registered HPR ID: aarav.sharma@hpr`, {
          request: body,
          response: result,
          clientId: config.ABDM_CLIENT_ID,
          clientIp: context?.ip,
          userAgent: context?.userAgent,
        });

        return result;
      } else {
        const result = { status: 'error', message: 'Invalid OTP code. Please enter 123456.' };
        await this.sessionService.addDetailedLog('HPR Registration Failed', 'ERROR', 'HPR registration failed: Invalid OTP', {
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
}
