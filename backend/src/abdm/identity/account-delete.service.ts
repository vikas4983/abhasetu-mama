/**
 * @file        account-delete.service.ts
 * @description Isolated ABHA permanent delete — ABDM profile/account/request/otp + verify
 * @module      abdm/identity/account-delete
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-26
 */

import { Injectable } from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';
import { SessionService } from '../session/session.service';
import { AbdmGatewayService } from '../common/abdm-gateway.service';
import { ABDM_ENDPOINTS } from '../../constants/abdm.constants';
import {
  encryptAbhaNumberLoginId,
  encryptSensitiveField,
} from './utils/account-lifecycle-crypto.util';
import {
  mapGatewayErrorToResult,
  parseOtpRequestResponse,
  parseVerifyResponse,
  type ParsedGatewayResult,
} from './utils/gateway-response.util';

/** @description ABDM scope for permanent ABHA delete (Milestone 1 Postman) */
export const ABHA_DELETE_SCOPE = ['abha-profile', 'delete'] as const;

export type AbhaDeleteGatewayResult = ParsedGatewayResult;

@Injectable()
export class AccountDeleteService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly sessionService: SessionService,
    private readonly gateway: AbdmGatewayService,
  ) {}

  async requestDeleteOtp(params: {
    abhaNumber: string;
    otpSystem: 'aadhaar' | 'abdm';
    xToken: string;
  }): Promise<AbhaDeleteGatewayResult> {
    const enc = await encryptAbhaNumberLoginId(
      this.cryptoService,
      this.sessionService,
      params.abhaNumber,
    );
    if ('status' in enc) return enc;

    try {
      const body = {
        scope: [...ABHA_DELETE_SCOPE],
        loginHint: 'abha-number' as const,
        loginId: enc.encrypted,
        otpSystem: params.otpSystem,
      };
      const data = await this.gateway.requestAbhaProfileV3<Record<string, unknown>>({
        path: ABDM_ENDPOINTS.ABHA_REKYC_REQUEST_OTP,
        body,
        xToken: params.xToken,
      });
      return parseOtpRequestResponse(data);
    } catch (e: unknown) {
      return mapGatewayErrorToResult(e);
    }
  }

  async verifyDeleteOtp(params: {
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
        scope: [...ABHA_DELETE_SCOPE],
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
      return parseVerifyResponse(data);
    } catch (e: unknown) {
      return mapGatewayErrorToResult(e);
    }
  }

  async verifyDeletePassword(params: {
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
        scope: [...ABHA_DELETE_SCOPE],
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
