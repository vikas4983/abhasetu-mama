/**
 * @file        account-management.service.ts
 * @description M1 account ops: forgot ABHA, set password, deactivate, delete, delink, search
 * @module      abdm/identity
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Injectable } from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';
import { SessionService } from '../session/session.service';
import { AbdmGatewayService } from '../common/abdm-gateway.service';
import { ABDM_ENDPOINTS } from '../../constants/abdm.constants';
import { resolveAxiosError } from '../utils/error-resolver.util';
import { isSimulationEnabled, SIMULATED_OTP } from '../utils/simulation.util';
import * as crypto from 'crypto';

@Injectable()
export class AccountManagementService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly sessionService: SessionService,
    private readonly gateway: AbdmGatewayService,
  ) {}

  private async encryptField(value: string, gatewayToken: string): Promise<string> {
    try {
      const publicKey = await this.sessionService.getOrFetchPublicKey(gatewayToken);
      return this.cryptoService.encryptWithPublicKey(publicKey, value);
    } catch (e: unknown) {
      if (isSimulationEnabled()) {
        return value;
      }
      throw e;
    }
  }

  /**
   * @description Search ABHA accounts by mobile number
   */
  async searchAbhaByMobile(mobile: string): Promise<unknown> {
    const session = await this.sessionService.getGatewaySession();
    const encrypted = await this.encryptField(mobile, session.tokenPreview);
    return this.gateway.request({
      path: ABDM_ENDPOINTS.ABHA_SEARCH,
      body: {
        scope: ['abha-login'],
        loginHint: 'mobile',
        loginId: encrypted,
      },
    });
  }

  /**
   * @description Request OTP to find ABHA via mobile
   */
  async forgotAbhaRequestOtp(mobile: string): Promise<{ status: string; txnId?: string; message?: string }> {
    if (!mobile || mobile.length !== 10) {
      return { status: 'error', message: 'Invalid mobile number' };
    }
    try {
      const session = await this.sessionService.getGatewaySession();
      const encrypted = await this.encryptField(mobile, session.tokenPreview);
      const data = await this.gateway.request<{ txnId?: string; message?: string }>({
        path: ABDM_ENDPOINTS.ABHA_LOGIN_REQUEST_OTP,
        body: {
          scope: ['abha-login', 'mobile-verify'],
          loginHint: 'mobile',
          loginId: encrypted,
          otpSystem: 'abdm',
        },
      });
      return {
        status: 'success',
        txnId: data.txnId,
        message: data.message || `OTP sent to mobile ending ******${mobile.slice(-4)}`,
      };
    } catch (e: unknown) {
      if (isSimulationEnabled()) {
        return {
          status: 'success',
          txnId: `sim-forgot-${crypto.randomUUID()}`,
          message: `OTP sent to mobile ending ******${mobile.slice(-4)} (simulated)`,
        };
      }
      const resolved = resolveAxiosError(e);
      return { status: 'error', message: resolved.userMessage };
    }
  }

  /**
   * @description Verify OTP and return linked ABHA accounts
   */
  async forgotAbhaVerify(
    txnId: string,
    otp: string,
    mobile: string,
  ): Promise<{ status: string; accounts?: unknown[]; message?: string }> {
    try {
      const session = await this.sessionService.getGatewaySession();
      const encryptedOtp = await this.encryptField(otp, session.tokenPreview);
      const data = await this.gateway.request<{
        ABHAProfile?: unknown;
        accounts?: unknown[];
        mappedABHAList?: unknown[];
      }>({
        path: ABDM_ENDPOINTS.ABHA_LOGIN_VERIFY,
        body: {
          txnId,
          scope: ['abha-login', 'mobile-verify'],
          authData: {
            authMethods: ['otp'],
            otp: { txnId, otpValue: encryptedOtp },
          },
        },
      });
      const accounts = data.mappedABHAList || data.accounts || (data.ABHAProfile ? [data.ABHAProfile] : []);
      return { status: 'success', accounts };
    } catch (e: unknown) {
      if (isSimulationEnabled() && otp === SIMULATED_OTP) {
        return {
          status: 'success',
          accounts: [
            {
              ABHANumber: '91-7561-4088-8857',
              preferredAbhaAddress: 'username1997@sbx',
              name: 'Username Kailas Shelke',
              mobile,
            },
          ],
        };
      }
      const resolved = resolveAxiosError(e);
      return { status: 'error', message: resolved.userMessage };
    }
  }

  /**
   * @description Request OTP for profile account action (password, deactivate, delete, mobile delink)
   */
  async requestAccountOtp(
    params: {
      scope: string[];
      loginHint: 'aadhaar' | 'mobile' | 'abha-number';
      loginId: string;
      otpSystem?: 'aadhaar' | 'abdm';
      xToken: string;
    },
  ): Promise<{ status: string; txnId?: string; message?: string }> {
    const otpSystem = params.otpSystem ?? (params.loginHint === 'aadhaar' ? 'aadhaar' : 'abdm');
    try {
      const session = await this.sessionService.getGatewaySession();
      const encrypted = await this.encryptField(params.loginId, session.tokenPreview);
      const data = await this.gateway.request<{ txnId?: string; message?: string }>({
        path: ABDM_ENDPOINTS.ABHA_REKYC_REQUEST_OTP,
        body: {
          scope: params.scope,
          loginHint: params.loginHint,
          loginId: encrypted,
          otpSystem,
        },
        xToken: params.xToken,
      });
      return { status: 'success', txnId: data.txnId, message: data.message };
    } catch (e: unknown) {
      if (isSimulationEnabled()) {
        return { status: 'success', txnId: crypto.randomUUID(), message: 'OTP sent (simulated)' };
      }
      const resolved = resolveAxiosError(e);
      return { status: 'error', message: resolved.userMessage };
    }
  }

  /**
   * @description Verify OTP for account action (deactivate, delete, password, mobile-verify)
   */
  async verifyAccountAction(
    params: {
      txnId: string;
      otp: string;
      scope: string[];
      xToken: string;
      password?: string;
    },
  ): Promise<{ status: string; data?: unknown; message?: string }> {
    try {
      const session = await this.sessionService.getGatewaySession();
      const encryptedOtp = await this.encryptField(params.otp, session.tokenPreview);
      const authData: Record<string, unknown> = {
        authMethods: params.password ? ['password'] : ['otp'],
        otp: { txnId: params.txnId, otpValue: encryptedOtp },
      };
      if (params.password) {
        authData.password = await this.encryptField(params.password, session.tokenPreview);
      }
      const data = await this.gateway.request({
        path: ABDM_ENDPOINTS.ABHA_REKYC_VERIFY,
        body: { txnId: params.txnId, scope: params.scope, authData },
        xToken: params.xToken,
      });
      return { status: 'success', data };
    } catch (e: unknown) {
      if (isSimulationEnabled() && params.otp === SIMULATED_OTP) {
        return { status: 'success', data: { authResult: 'success' }, message: 'Verified (simulated)' };
      }
      const resolved = resolveAxiosError(e);
      return { status: 'error', message: resolved.userMessage };
    }
  }

  /**
   * @description Set ABHA password after OTP verification
   */
  async setPassword(
    txnId: string,
    otp: string,
    newPassword: string,
    xToken: string,
  ): Promise<{ status: string; message?: string }> {
    const result = await this.verifyAccountAction({
      txnId,
      otp,
      scope: ['abha-profile', 'password'],
      xToken,
      password: newPassword,
    });
    if (result.status === 'error') return result;
    return { status: 'success', message: 'Password set successfully' };
  }

  /**
   * @description Deactivate ABHA account
   */
  async deactivateAbha(
    txnId: string,
    otp: string,
    xToken: string,
  ): Promise<{ status: string; message?: string }> {
    const result = await this.verifyAccountAction({
      txnId,
      otp,
      scope: ['abha-address-login', 'deactivate'],
      xToken,
    });
    if (result.status === 'error') return result;
    return { status: 'success', message: 'ABHA account deactivated' };
  }

  /**
   * @description Permanently delete ABHA account
   */
  async deleteAbha(
    txnId: string,
    otp: string,
    xToken: string,
  ): Promise<{ status: string; message?: string }> {
    const result = await this.verifyAccountAction({
      txnId,
      otp,
      scope: ['abha-address-login', 'delete'],
      xToken,
    });
    if (result.status === 'error') return result;
    return { status: 'success', message: 'ABHA account deleted' };
  }

  /**
   * @description Delink mobile from ABHA via benefit linkAndDelink API
   */
  async delinkMobile(abhaNumber: string, xToken: string): Promise<{ status: string; message?: string }> {
    try {
      const session = await this.sessionService.getGatewaySession();
      const encrypted = await this.encryptField(abhaNumber.replace(/-/g, ''), session.tokenPreview);
      await this.gateway.request({
        path: ABDM_ENDPOINTS.ABHA_BENEFIT_LINK_DELINK,
        body: {
          scope: ['de-link'],
          loginHint: 'abha-number',
          loginId: encrypted,
        },
        xToken,
      });
      return { status: 'success', message: 'Mobile delinked successfully' };
    } catch (e: unknown) {
      if (isSimulationEnabled()) {
        return { status: 'success', message: 'Mobile delinked (simulated)' };
      }
      const resolved = resolveAxiosError(e);
      return { status: 'error', message: resolved.userMessage };
    }
  }

  /**
   * @description Get ABHA address suggestions during enrollment
   */
  async getAbhaAddressSuggestions(txnId: string, xToken: string): Promise<unknown> {
    return this.gateway.request({
      path: `${ABDM_ENDPOINTS.ABHA_ADDRESS_SUGGESTION}?txnId=${txnId}`,
      method: 'GET',
      xToken,
    });
  }

  /**
   * @description Create preferred ABHA address
   */
  async createAbhaAddress(
    txnId: string,
    abhaAddress: string,
    xToken: string,
  ): Promise<unknown> {
    return this.gateway.request({
      path: ABDM_ENDPOINTS.ABHA_ADDRESS_CREATE,
      body: { txnId, abhaAddress },
      xToken,
    });
  }
}
