/**
 * @file        deactivate-abha.api.ts
 * @description Isolated API client for ABHA deactivate (real BFF responses only)
 * @module      abha-deactivate
 * @layer       api
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import axios from 'axios';
import { axiosInstance } from '@/lib/api/config/axiosInstance';
import type { AccountActionGatewayResponse } from '@/features/abha-account-lifecycle/shared/types/account-action.types';
import {
  ABHA_DEACTIVATE_SCOPE,
  DEACTIVATE_ABHA_REQUEST_OTP_PATH,
  DEACTIVATE_ABHA_VERIFY_PATH,
  PROFILE_ACCOUNT_PATH,
} from '../constants/deactivate-abha.constants';

function fromAxiosError(err: unknown): AccountActionGatewayResponse {
  if (axios.isAxiosError(err) && err.response?.data) {
    const data = err.response.data as AccountActionGatewayResponse;
    return { ...data, status: data.status ?? 'error' };
  }
  return {
    status: 'error',
    message: err instanceof Error ? err.message : 'Network error',
  };
}

/**
 * @description Load ABHANumber from GET /v3/profile/account (same as profile page)
 */
export async function fetchAbhaNumberFromProfileAccount(): Promise<
  { ABHANumber: string } | { status: 'error'; message: string }
> {
  try {
    const res = await axiosInstance.get<Record<string, unknown>>(PROFILE_ACCOUNT_PATH);
    const payload = (res.data?.data ?? res.data) as Record<string, unknown> | undefined;
    const ABHANumber =
      (typeof payload?.ABHANumber === 'string' && payload.ABHANumber) ||
      (typeof payload?.abhaNumber === 'string' && payload.abhaNumber) ||
      '';

    if (!ABHANumber.trim()) {
      return {
        status: 'error',
        message: 'ABHANumber not found in profile account API response.',
      };
    }

    return { ABHANumber };
  } catch (err) {
    return fromAxiosError(err);
  }
}

export async function requestDeactivateAbhaOtp(params: {
  abhaNumber?: string;
  otpSystem: 'aadhaar' | 'abdm';
}): Promise<AccountActionGatewayResponse> {
  const profileAbha = await fetchAbhaNumberFromProfileAccount();
  if ('status' in profileAbha) {
    return profileAbha;
  }

  try {
    const res = await axiosInstance.post<AccountActionGatewayResponse>(
      DEACTIVATE_ABHA_REQUEST_OTP_PATH,
      {
        scope: [...ABHA_DEACTIVATE_SCOPE],
        loginHint: 'abha-number',
        ABHANumber: profileAbha.ABHANumber,
        otpSystem: params.otpSystem,
      },
    );
    return res.data;
  } catch (err) {
    return fromAxiosError(err);
  }
}

export async function verifyDeactivateAbhaOtp(params: {
  txnId: string;
  otp: string;
  reasons: string[];
}): Promise<AccountActionGatewayResponse> {
  try {
    const res = await axiosInstance.post<AccountActionGatewayResponse>(
      DEACTIVATE_ABHA_VERIFY_PATH,
      {
        scope: [...ABHA_DEACTIVATE_SCOPE],
        txnId: params.txnId,
        otp: params.otp,
        reasons: params.reasons,
      },
    );
    return res.data;
  } catch (err) {
    return fromAxiosError(err);
  }
}

export async function verifyDeactivateAbhaPassword(params: {
  password: string;
  reasons: string[];
}): Promise<AccountActionGatewayResponse> {
  try {
    const res = await axiosInstance.post<AccountActionGatewayResponse>(
      DEACTIVATE_ABHA_VERIFY_PATH,
      {
        scope: [...ABHA_DEACTIVATE_SCOPE],
        password: params.password,
        reasons: params.reasons,
      },
    );
    return res.data;
  } catch (err) {
    return fromAxiosError(err);
  }
}
