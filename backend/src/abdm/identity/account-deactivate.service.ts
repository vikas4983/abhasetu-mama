/**
 * @file        account-deactivate.service.ts
 * @description Isolated ABHA temporary deactivate — ABDM profile/account/request/otp + verify
 * @module      abdm/identity/account-deactivate
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-29
 */

import { Injectable } from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';
import { SessionService } from '../session/session.service';
import { AbdmGatewayService } from '../common/abdm-gateway.service';
import { ABDM_ENDPOINTS } from '../../constants/abdm.constants';
import type { AbhaDeleteGatewayResult } from './account-delete.service';
import {
  encryptAbhaNumberLoginId,
  encryptSensitiveField,
} from './utils/account-lifecycle-crypto.util';
import {
  mapGatewayErrorToResult,
  parseOtpRequestResponse,
  parseVerifyResponse,
} from './utils/gateway-response.util';

/** @description ABDM scope for temporary ABHA deactivate (Milestone 1 Postman) */
export const ABHA_DEACTIVATE_SCOPE = ['abha-profile', 'de-activate'] as const;

@Injectable()
export class AccountDeactivateService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly sessionService: SessionService,
    private readonly gateway: AbdmGatewayService,
  ) {}

  async requestDeactivateOtp(params: {
    abhaNumber: string;
    ABHANumber?: string;
    otpSystem: 'aadhaar' | 'abdm';
    xToken: string;
  }): Promise<AbhaDeleteGatewayResult> {
    const enc = await encryptAbhaNumberLoginId(
      this.cryptoService,
      this.sessionService,
      params.abhaNumber,
    );
    if ('status' in enc) return enc;

    if (!enc.encrypted?.trim()) {
      return {
        status: 'error',
        message: 'Failed to RSA-encrypt ABHA number for loginId. Sync ABDM public certificate and retry.',
      };
    }

    const abdmRequestBody = {
      scope: [...ABHA_DEACTIVATE_SCOPE],
      loginHint: 'abha-number' as const,
      loginId: enc.encrypted,
      otpSystem: params.otpSystem,
    };

    try {
      const data = await this.gateway.requestAbhaProfileV3<Record<string, unknown>>({
        path: ABDM_ENDPOINTS.ABHA_REKYC_REQUEST_OTP,
        body: abdmRequestBody,
        xToken: params.xToken,
      });
      const parsed = parseOtpRequestResponse(data);
      return {
        ...parsed,
        gatewayResponse: data,
        abdmRequest: {
          ...abdmRequestBody,
          ABHANumber: params.ABHANumber,
        },
      };
    } catch (e: unknown) {
      const mapped = mapGatewayErrorToResult(e);
      return {
        ...mapped,
        abdmRequest: {
          ...abdmRequestBody,
          ABHANumber: params.ABHANumber,
        },
      };
    }
  }

  async verifyDeactivateOtp(params: {
    txnId: string;
    otp: string;
    reasons: string[];
    xToken: string;
  }): Promise<AbhaDeleteGatewayResult> {
    try {
      const encryptedOtp = await encryptSensitiveField(
        this.cryptoService,
        this.sessionService,
        params.otp,
      );
      const body = {
        scope: [...ABHA_DEACTIVATE_SCOPE],
        authData: {
          authMethods: ['otp'],
          otp: { txnId: params.txnId, otpValue: encryptedOtp },
        },
        reasons: params.reasons,
      };
      const data = await this.gateway.requestAbhaProfileV3<Record<string, unknown>>({
        path: ABDM_ENDPOINTS.ABHA_REKYC_VERIFY,
        body,
        xToken: params.xToken,
      });
      const parsed = parseVerifyResponse(data);
      return { ...parsed, gatewayResponse: data };
    } catch (e: unknown) {
      return mapGatewayErrorToResult(e);
    }
  }

  async verifyDeactivatePassword(params: {
    password: string;
    reasons: string[];
    xToken: string;
  }): Promise<AbhaDeleteGatewayResult> {
    try {
      const encryptedPassword = await encryptSensitiveField(
        this.cryptoService,
        this.sessionService,
        params.password,
      );
      const body = {
        scope: [...ABHA_DEACTIVATE_SCOPE],
        authData: {
          authMethods: ['password'],
          password: { password: encryptedPassword },
        },
        reasons: params.reasons,
      };
      const data = await this.gateway.requestAbhaProfileV3<Record<string, unknown>>({
        path: ABDM_ENDPOINTS.ABHA_REKYC_VERIFY,
        body,
        xToken: params.xToken,
      });
      return parseVerifyResponse(data);
    } catch (e: unknown) {
      return mapGatewayErrorToResult(e);
    }
  }
}
