/**
 * @file        refresh-token.api.ts
 * @description Isolated API for ABHA profile access token refresh (R-token)
 * @module      abha-refresh-token
 * @layer       api
 * @author      Platform Team
 * @created     2026-06-26
 */

import axios from 'axios';
import { axiosInstance } from '@/lib/api/config/axiosInstance';
import { ABHA_REFRESH_TOKEN_BFF_PATH } from '../constants/refresh-token.constants';

export interface RefreshAbhaTokenResponse {
  status: 'success' | 'error';
  message?: string;
  token?: string;
  refreshToken?: string;
  gatewayResponse?: Record<string, unknown>;
}

export async function refreshAbhaProfileToken(): Promise<RefreshAbhaTokenResponse> {
  try {
    const res = await axiosInstance.get<RefreshAbhaTokenResponse>(ABHA_REFRESH_TOKEN_BFF_PATH);
    return {
      ...res.data,
      status: res.data.status ?? 'success',
      gatewayResponse: res.data as unknown as Record<string, unknown>,
    };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data) {
      const data = err.response.data as Record<string, unknown>;
      return {
        status: 'error',
        message: typeof data.message === 'string' ? data.message : 'Token refresh failed',
        gatewayResponse: data,
      };
    }
    return { status: 'error', message: 'Network error during token refresh' };
  }
}
