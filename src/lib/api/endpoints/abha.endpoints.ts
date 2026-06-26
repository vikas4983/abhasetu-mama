/**
 * @file        abha.endpoints.ts
 * @description ABHA/ABDM internal API route constants
 * @module      lib/api/endpoints
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

export const ABHA_ENDPOINTS = {
  SESSIONS: '/sessions',
  ENROLL_REQUEST_OTP: '/v3/enrollment/request/otp',
  ENROLL_BY_AADHAAR: '/v3/enrollment/enrol/byAadhaar',
  ENROLL_AUTH_BY_ABDM: '/v3/enrollment/auth/byAbdm',
  PROFILE_LOGIN_REQUEST_OTP: '/v3/profile/login/request/otp',
  PROFILE_LOGIN_VERIFY: '/v3/profile/login/verify',
  PROFILE_ACCOUNT: '/v3/profile/account',
  PROFILE_ABHA_CARD: '/v3/profile/account/abha-card',
  PROFILE_ACCOUNT_REQUEST_OTP: '/v3/profile/account/request/otp',
  PROFILE_ACCOUNT_VERIFY: '/v3/profile/account/verify',
  PROFILE_ACCOUNT_ACTION_OTP: '/v3/profile/account/action/request-otp',
  PROFILE_LOGIN_SEARCH: '/v3/profile/login/search',
  PROFILE_LOGIN_VERIFY_USER: '/v3/profile/login/verify/user',
  PROFILE_QR_CODE: '/v3/profile/account/qrCode',
  PROFILE_LOGOUT: '/v3/profile/account/request/logout',
  PROFILE_TOKEN_REFRESH: '/v3/profile/account/request/token',
  PROFILE_ABHA_SEARCH: '/v3/profile/account/abha/search',
  SCAN_SHARE: '/scan-share',
  HIP_PATIENT_SHARE: '/v3/hip/patient/share',
  PROFILE_SET_PASSWORD: '/v3/profile/account/set-password',
  PROFILE_DEACTIVATE: '/v3/profile/account/deactivate',
  PROFILE_DELETE: '/v3/profile/account/delete',
  PROFILE_DELINK: '/v3/profile/account/delink',
  FORGOT_ABHA_REQUEST_OTP: '/v3/forgot/abha/request/otp',
  FORGOT_ABHA_VERIFY: '/v3/forgot/abha/verify',
  ABHA_ADDRESS_SUGGESTION: '/v3/enrollment/enrol/suggestion',
  ABHA_ADDRESS_CREATE: '/v3/enrollment/enrol/abha-address',
  CONSENT: '/consent',
  HIP: '/hip',
  HEALTH_RECORDS: '/health-records',
} as const;
