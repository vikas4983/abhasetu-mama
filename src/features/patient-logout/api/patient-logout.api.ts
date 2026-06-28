/**
 * @file        patient-logout.api.ts
 * @description Calls BFF logout endpoint → ABDM GET profile/account/request/logout
 * @module      patient-logout
 * @layer       api
 * @author      Platform Team
 * @created     2026-06-26
 */

import axios from 'axios';
import { axiosInstance } from '@/lib/api/config/axiosInstance';
import { PATIENT_LOGOUT_BFF_PATH } from '../constants/patient-logout.constants';
import type { PatientLogoutResponse } from '../types/patient-logout.types';

/**
 * @description End ABHA profile session on ABDM gateway (patient only)
 * @returns {Promise<PatientLogoutResponse>} gateway message or error payload (incl. code 900901)
 */
export async function requestPatientAbhaLogout(): Promise<PatientLogoutResponse> {
  try {
    const res = await axiosInstance.get<PatientLogoutResponse>(PATIENT_LOGOUT_BFF_PATH);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data) {
      const data = err.response.data as Record<string, unknown>;
      return {
        status: 'error',
        code: data.code != null ? String(data.code) : undefined,
        message: String(data.message ?? 'Logout failed'),
        description: data.description != null ? String(data.description) : undefined,
        gatewayResponse: data,
      };
    }
    const message = err instanceof Error ? err.message : 'Logout request failed';
    return {
      status: 'error',
      message,
      description: 'Could not reach the logout service.',
    };
  }
}
