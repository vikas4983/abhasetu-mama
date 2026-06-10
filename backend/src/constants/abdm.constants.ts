/**
 * @file        abdm.constants.ts
 * @description ABDM gateway path and configuration constants
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-10
 */

export const ABDM_HEADERS = {
  CM_ID: 'X-CM-ID',
  HIP_ID: 'X-HIP-ID',
  HIU_ID: 'X-HIU-ID',
  CORRELATION_ID: 'X-Correlation-ID',
} as const;

export const ABDM_ENDPOINTS = {
  SESSIONS: '/gateway/v0.5/sessions',
  CERT_V3: '/api/v1/auth/cert',
  ABHA_SEND_AADHAAR_OTP: '/api/v3/enrollment/enrolment/byAadhaar',
  ABHA_VERIFY_OTP: '/api/v3/enrollment/enrolment/byAadhaar',
  ABHA_PROFILE_GET: '/api/v3/profile/account',
  AUTH_FETCH_MODES: '/v0.5/users/auth/fetch-modes',
  AUTH_ON_FETCH_MODES: '/v0.5/users/auth/on-fetch-modes',
  HIP_ADD_CARE_CONTEXT: '/v0.5/links/link/add-contexts',
  PATIENT_DISCOVER: '/v0.5/care-contexts/discover',
  PATIENT_ON_DISCOVER: '/v0.5/care-contexts/on-discover',
  CONSENT_REQUEST_INIT: '/v0.5/consent-requests/init',
  CONSENT_ON_INIT: '/v0.5/consent-requests/on-init',
  CONSENT_FETCH: '/v0.5/consents/fetch',
  CONSENT_ON_FETCH: '/v0.5/consents/on-fetch',
  HEALTH_INFO_REQUEST: '/v0.5/health-information/cm/request',
  HEALTH_INFO_ON_REQUEST: '/v0.5/health-information/cm/on-request',
  HEALTH_INFO_TRANSFER: '/v0.5/health-information/transfer',
} as const;
