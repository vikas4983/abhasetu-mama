/**
 * @file        profile-login.service.ts
 * @description Isolated ABDM M1 profile login — request/otp + verify (no biometrics)
 * @module      abdm/identity/profile-login
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-29
 */

import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { CryptoService } from '../crypto/crypto.service';
import { SessionService } from '../session/session.service';
import { ABDM_ENDPOINTS, ABDM_HEADERS } from '../../constants/abdm.constants';
import { normalizeAbhaNumberDigits } from './utils/abha-number.util';
import { mapGatewayErrorToResult, extractGatewayMessage } from './utils/gateway-response.util';
import { wrapBffAbdmResponse } from './utils/client-response.util';
import {
  LOGIN_BIOMETRIC_SCOPES,
  LOGIN_SCOPE_ABHA_AADHAAR,
  LOGIN_SCOPE_ABHA_MOBILE,
  LOGIN_SCOPE_ADDRESS_AADHAAR,
  LOGIN_SCOPE_ADDRESS_MOBILE,
  LOGIN_SCOPE_MOBILE,
  type ProfileLoginHint,
  type ProfileLoginOtpSystem,
} from './profile-login.constants';

export interface ProfileLoginOtpParams {
  scope?: string[];
  loginHint: string;
  loginId: string;
  otpSystem?: ProfileLoginOtpSystem;
}

export interface ProfileLoginVerifyParams {
  scope?: string[];
  authData: {
    authMethods?: string[];
    otp?: { txnId: string; otpValue: string };
    password?: { ABHANumber?: string; password?: string };
  };
}

/**
 * @description Resolve M1-compliant scope for profile login OTP from hint + otpSystem
 */
export function resolveProfileLoginOtpScope(
  loginHint: ProfileLoginHint,
  otpSystem: ProfileLoginOtpSystem,
): readonly string[] {
  if (loginHint === 'mobile') {
    return LOGIN_SCOPE_MOBILE;
  }
  if (loginHint === 'abha-number') {
    return otpSystem === 'aadhaar' ? LOGIN_SCOPE_ABHA_AADHAAR : LOGIN_SCOPE_ABHA_MOBILE;
  }
  return otpSystem === 'aadhaar' ? LOGIN_SCOPE_ADDRESS_AADHAAR : LOGIN_SCOPE_ADDRESS_MOBILE;
}

function scopesEqual(a: readonly string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

@Injectable()
export class ProfileLoginService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * @description Request profile login OTP — encrypts loginId server-side, returns full abdmResponse
   */
  async requestLoginOtp(
    params: ProfileLoginOtpParams,
    context?: { ip?: string; userAgent?: string },
  ) {
    const loginHint = params.loginHint as ProfileLoginHint;
    if (!['mobile', 'abha-number', 'abha-address'].includes(loginHint)) {
      return wrapBffAbdmResponse(
        { loginHint: 'Invalid Login Hint', timestamp: new Date().toISOString() },
        { status: 'error', message: 'Invalid Login Hint' },
      );
    }

    const otpSystem: ProfileLoginOtpSystem =
      params.otpSystem ?? (loginHint === 'mobile' ? 'abdm' : 'aadhaar');

    const expectedScope = resolveProfileLoginOtpScope(loginHint, otpSystem);
    const clientScope = params.scope;
    if (clientScope?.length) {
      if (clientScope.some((s) => (LOGIN_BIOMETRIC_SCOPES as readonly string[]).includes(s))) {
        return wrapBffAbdmResponse(
          { scope: 'Invalid Scope', message: 'Biometric login is not enabled.' },
          { status: 'error', message: 'Biometric login is not enabled for this application.' },
        );
      }
      if (!scopesEqual(expectedScope, clientScope)) {
        return wrapBffAbdmResponse(
          {
            scope: 'Invalid Scope',
            message: `Expected scope [${expectedScope.join(', ')}] for loginHint=${loginHint} otpSystem=${otpSystem}`,
          },
          {
            status: 'error',
            message: `Invalid scope for ${loginHint}. Use ${expectedScope.join(' + ')}.`,
          },
        );
      }
    }

    const scope = [...expectedScope];
    const plainLoginId = this.normalizeLoginIdPlain(loginHint, params.loginId);
    if ('error' in plainLoginId) {
      return wrapBffAbdmResponse(
        { loginId: 'LoginId is invalid', timestamp: new Date().toISOString() },
        { status: 'error', message: plainLoginId.error },
      );
    }

    try {
      const session = await this.sessionService.getGatewaySession();
      if (!session.tokenPreview || session.tokenPreview === 'simulated-session-token') {
        return wrapBffAbdmResponse(
          { message: 'Gateway not configured' },
          { status: 'error', message: 'ABDM gateway credentials are not configured on the server.' },
        );
      }

      const sync = await this.sessionService.syncPublicKeyFromGateway(session.tokenPreview);
      const encryptedLoginId = this.cryptoService.encryptWithPublicKey(
        sync.publicKey,
        plainLoginId.value,
      );

      const config = await this.sessionService.getConfig();
      const baseUrl = await this.sessionService.getAbhaBaseUrl();
      const response = await axios.post(
        `${baseUrl}${ABDM_ENDPOINTS.ABHA_LOGIN_REQUEST_OTP}`,
        {
          scope,
          loginHint,
          loginId: encryptedLoginId,
          otpSystem,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            [ABDM_HEADERS.REQUEST_ID]: crypto.randomUUID(),
            [ABDM_HEADERS.TIMESTAMP]: new Date().toISOString(),
            [ABDM_HEADERS.CM_ID]: config.ABDM_CM_ID || process.env.ABDM_CM_ID || 'sbx',
            [ABDM_HEADERS.AUTHORIZATION]: `Bearer Token ${session.tokenPreview}`,
          },
          timeout: 15000,
        },
      );

      await this.sessionService.addDetailedLog(
        'Profile Login OTP Requested',
        'SUCCESS',
        'OTP sent for profile login.',
        {
          request: { loginHint, otpSystem, scope },
          clientIp: context?.ip,
          userAgent: context?.userAgent,
        },
      );

      const data = response.data as Record<string, unknown>;
      return wrapBffAbdmResponse(data, {
        status: data.txnId ? 'success' : 'error',
        message: typeof data.message === 'string' ? data.message : undefined,
        txnId: typeof data.txnId === 'string' ? data.txnId : undefined,
      });
    } catch (e: unknown) {
      const mapped = mapGatewayErrorToResult(e);
      const abdm = mapped.gatewayResponse ?? { message: mapped.message };
      return wrapBffAbdmResponse(abdm, mapped);
    }
  }

  /**
   * @description Verify profile login OTP — returns tokens + ABHAProfile in abdmResponse
   */
  async verifyLoginOtp(
    params: ProfileLoginVerifyParams,
    context?: { ip?: string; userAgent?: string },
  ) {
    const scope = params.scope;
    if (!scope?.length || !scope.includes('abha-login') && !scope.includes('abha-address-login')) {
      return wrapBffAbdmResponse(
        { scope: 'Invalid Scope' },
        { status: 'error', message: 'Invalid scope for profile login verify.' },
      );
    }

    if (scope.some((s) => (LOGIN_BIOMETRIC_SCOPES as readonly string[]).includes(s))) {
      return wrapBffAbdmResponse(
        { scope: 'Invalid Scope' },
        { status: 'error', message: 'Biometric login is not enabled for this application.' },
      );
    }

    const otp = params.authData?.otp?.otpValue;
    const txnId = params.authData?.otp?.txnId;
    if (!otp || !txnId) {
      return wrapBffAbdmResponse(
        { otpValue: 'Invalid OTP Value' },
        { status: 'error', message: 'txnId and otp are required.' },
      );
    }

    try {
      const session = await this.sessionService.getGatewaySession();
      const sync = await this.sessionService.syncPublicKeyFromGateway(session.tokenPreview);
      const encryptedOtp = this.cryptoService.encryptWithPublicKey(sync.publicKey, otp);

      const config = await this.sessionService.getConfig();
      const baseUrl = await this.sessionService.getAbhaBaseUrl();
      const response = await axios.post(
        `${baseUrl}${ABDM_ENDPOINTS.ABHA_LOGIN_VERIFY}`,
        {
          scope,
          authData: {
            authMethods: params.authData.authMethods ?? ['otp'],
            otp: { txnId, otpValue: encryptedOtp },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            [ABDM_HEADERS.REQUEST_ID]: crypto.randomUUID(),
            [ABDM_HEADERS.TIMESTAMP]: new Date().toISOString(),
            [ABDM_HEADERS.CM_ID]: config.ABDM_CM_ID || 'sbx',
            [ABDM_HEADERS.AUTHORIZATION]: `Bearer Token ${session.tokenPreview}`,
          },
          timeout: 15000,
        },
      );

      await this.sessionService.addDetailedLog(
        'Profile Login OTP Verified',
        'SUCCESS',
        'Profile login OTP verified.',
        { clientIp: context?.ip, userAgent: context?.userAgent },
      );

      const data = response.data as Record<string, unknown>;
      return wrapBffAbdmResponse(data, {
        status: data.authResult === 'success' ? 'success' : 'error',
        message: typeof data.message === 'string' ? data.message : undefined,
        authResult: typeof data.authResult === 'string' ? data.authResult : undefined,
      });
    } catch (e: unknown) {
      const mapped = mapGatewayErrorToResult(e);
      return wrapBffAbdmResponse(mapped.gatewayResponse ?? { message: mapped.message }, mapped);
    }
  }

  private normalizeLoginIdPlain(
    loginHint: ProfileLoginHint,
    raw: string,
  ): { value: string } | { error: string } {
    const trimmed = String(raw ?? '').trim();
    if (!trimmed) {
      return { error: 'LoginId is required.' };
    }

    if (loginHint === 'mobile') {
      const digits = trimmed.replace(/\D/g, '');
      if (!/^\d{10}$/.test(digits)) {
        return { error: 'Enter a valid 10-digit mobile number.' };
      }
      return { value: digits };
    }

    if (loginHint === 'abha-number') {
      const digits = normalizeAbhaNumberDigits(trimmed);
      if (!digits) {
        return { error: 'Enter a valid 14-digit ABHA number.' };
      }
      return { value: digits };
    }

    if (!/^[a-zA-Z0-9._-]+@(sbx|abdm)$/.test(trimmed)) {
      return { error: 'Enter a valid ABHA address (e.g. username@sbx).' };
    }
    return { value: trimmed };
  }
}
