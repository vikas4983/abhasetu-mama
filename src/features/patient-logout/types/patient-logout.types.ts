/**
 * @file        patient-logout.types.ts
 * @description TypeScript types for patient ABHA logout API responses
 * @module      patient-logout
 * @layer       types
 * @author      Platform Team
 * @created     2026-06-26
 */

/** @description Successful ABDM profile logout */
export interface PatientLogoutSuccessResponse {
  status: 'success';
  message: string;
  timestamp?: string;
  gatewayResponse?: Record<string, unknown>;
}

/** @description Failed ABDM profile logout (e.g. code 900901) */
export interface PatientLogoutErrorResponse {
  status: 'error';
  code?: string;
  message: string;
  description?: string;
  gatewayResponse?: Record<string, unknown>;
}

export type PatientLogoutResponse =
  | PatientLogoutSuccessResponse
  | PatientLogoutErrorResponse;

export type PatientLogoutDialogStep = 'confirm' | 'loading' | 'result';
