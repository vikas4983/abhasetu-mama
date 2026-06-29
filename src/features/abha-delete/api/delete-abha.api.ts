/**
 * @file        delete-abha.api.ts
 * @description Isolated API client for ABHA permanent delete (real BFF responses only)
 * @module      abha-delete
 * @layer       api
 * @author      Platform Team
 * @created     2026-06-26
 */

import axios from 'axios';
import { axiosInstance } from '@/lib/api/config/axiosInstance';
import type { AccountActionGatewayResponse } from '@/features/abha-account-lifecycle/shared/types/account-action.types';
import {
  DELETE_ABHA_REQUEST_OTP_PATH,
  DELETE_ABHA_VERIFY_PATH,
} from '../constants/delete-abha.constants';

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

export async function requestDeleteAbhaOtp(params: {
  abhaNumber?: string;
  otpSystem: 'aadhaar' | 'abdm';
}): Promise<AccountActionGatewayResponse> {
  try {
    const res = await axiosInstance.post<AccountActionGatewayResponse>(
      DELETE_ABHA_REQUEST_OTP_PATH,
      { otpSystem: params.otpSystem },
    );
    return res.data;
  } catch (err) {
    return fromAxiosError(err);
  }
}

export async function verifyDeleteAbhaOtp(params: {
  txnId: string;
  otp: string;
  reasons: string[];
}): Promise<AccountActionGatewayResponse> {
  try {
    const res = await axiosInstance.post<AccountActionGatewayResponse>(
      DELETE_ABHA_VERIFY_PATH,
      params,
    );
    return res.data;
  } catch (err) {
    return fromAxiosError(err);
  }
}

export async function verifyDeleteAbhaPassword(params: {
  password: string;
  reasons: string[];
}): Promise<AccountActionGatewayResponse> {
  try {
    const res = await axiosInstance.post<AccountActionGatewayResponse>(
      DELETE_ABHA_VERIFY_PATH,
      params,
    );
    return res.data;
  } catch (err) {
    return fromAxiosError(err);
  }
}
