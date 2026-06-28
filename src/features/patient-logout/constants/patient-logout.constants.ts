/**
 * @file        patient-logout.constants.ts
 * @description Constants for patient ABHA profile logout (ABDM M1)
 * @module      patient-logout
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-26
 */

/** Internal BFF route — proxied to NestJS identity controller */
export const PATIENT_LOGOUT_BFF_PATH = '/v3/profile/account/request/logout' as const;

/**
 * ABDM gateway path (sandbox/production base + this path)
 * @see https://abhasbx.abdm.gov.in/abha/api/v3/profile/account/request/logout
 */
export const ABDM_PROFILE_LOGOUT_GATEWAY_PATH =
  '/api/v3/profile/account/request/logout' as const;

export const PATIENT_LOGOUT_SUCCESS_MESSAGE = 'You have been logged out' as const;

export const PATIENT_LOGOUT_INVALID_CREDENTIALS_CODE = '900901' as const;
