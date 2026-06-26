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
  X_TOKEN: 'X-Token',
  AUTHORIZATION: 'Authorization',
  REQUEST_ID: 'REQUEST-ID',
  TIMESTAMP: 'TIMESTAMP',
} as const;

export const ABDM_ENDPOINTS = {
  SESSIONS: '/gateway/v0.5/sessions',
  SESSIONS_V3: '/api/hiecm/gateway/v3/sessions',
  CERT_V3: '/api/v1/auth/cert',
  ABHA_PUBLIC_CERTIFICATE: '/api/v3/profile/public/certificate',
  ABHA_ENROLL_REQUEST_OTP: '/api/v3/enrollment/request/otp',
  ABHA_ENROLL_BY_AADHAAR: '/api/v3/enrollment/enrol/byAadhaar',
  ABHA_ENROLL_BY_MOBILE: '/api/v3/enrollment/auth/byAbdm',
  ABHA_ENROLL_BY_DOCUMENT: '/api/v3/enrollment/enrol/byDocument',
  ABHA_CARD: '/api/v3/profile/account/abha-card',
  ABHA_EMAIL_VERIFY_LINK: '/api/v3/profile/account/request/emailVerificationLink',
  ABHA_SEND_AADHAAR_OTP: '/api/v3/enrollment/enrol/byAadhaar',
  ABHA_VERIFY_OTP: '/api/v3/enrollment/enrol/byAadhaar',
  ABHA_PROFILE_GET: '/api/v3/profile/account',
  ABHA_REKYC_REQUEST_OTP: '/api/v3/profile/account/request/otp',
  ABHA_REKYC_VERIFY: '/api/v3/profile/account/verify',
  ABHA_LOGIN_REQUEST_OTP: '/api/v3/profile/login/request/otp',
  ABHA_LOGIN_VERIFY: '/api/v3/profile/login/verify',
  ABHA_LOGIN_VERIFY_USER: '/api/v3/profile/login/verify/user',
  ABHA_PROFILE_TOKEN_REFRESH: '/api/v3/profile/account/request/token',
  ABHA_SEARCH: '/api/v3/profile/account/abha/search',
  ABHA_ADDRESS_SUGGESTION: '/api/v3/enrollment/enrol/suggestion',
  ABHA_ADDRESS_CREATE: '/api/v3/enrollment/enrol/abha-address',
  ABHA_QR_CODE: '/api/v3/profile/account/qrCode',
  ABHA_BENEFIT_LINK_DELINK: '/api/v3/profile/benefit/linkAndDelink',
  ABHA_BENEFIT_SEARCH: '/api/v3/profile/benefit/search',
  HIP_PATIENT_SHARE: '/api/v3/hip/patient/share',
  ABHA_PROFILE_LOGOUT: '/api/v3/profile/account/request/logout',
  ABHA_LOGIN_SEARCH: '/api/v3/profile/login/search',
  /** M2 HIP v3 HIE-CM */
  HIE_CM_LINK_CARECONTEXT: '/api/hiecm/hip/v3/link/carecontext',
  HIE_CM_LINK_CONTEXT_NOTIFY: '/api/hiecm/hip/v3/link/context/notify',
  HIE_CM_PATIENT_ON_DISCOVER: '/api/hiecm/user-initiated-linking/v3/patient/care-context/on-discover',
  HIE_CM_LINK_ON_INIT: '/api/hiecm/user-initiated-linking/v3/link/care-context/on-init',
  HIE_CM_LINK_ON_CONFIRM: '/api/hiecm/user-initiated-linking/v3/link/care-context/on-confirm',
  HIE_CM_HIP_ON_REQUEST: '/api/hiecm/data-flow/v3/health-information/hip/on-request',
  /** M3 HIU v3 HIE-CM */
  HIE_CM_CONSENT_INIT: '/api/hiecm/consent/v3/request/init',
  HIE_CM_CONSENT_STATUS: '/api/hiecm/consent/v3/request/status',
  HIE_CM_CONSENT_FETCH: '/api/hiecm/consent/v3/fetch',
  HIE_CM_HI_REQUEST: '/api/hiecm/data-flow/v3/health-information/request',
  HIE_CM_HI_NOTIFY: '/api/hiecm/data-flow/v3/health-information/notify',
  /** Scan & Pay v3 */
  SCAN_PAY_INITIATE: '/api/v3/scan-pay/payment/initiate',
  SCAN_PAY_STATUS: '/api/v3/scan-pay/payment/status',
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
  /** PHR Web V3 — enrollment */
  PHR_WEB_ENROLL_REQUEST_OTP: '/api/v3/phr/web/enrollment/request/otp',
  PHR_WEB_ENROLL_VERIFY: '/api/v3/phr/web/enrollment/verify',
  PHR_WEB_ENROLL_SUGGESTION: '/api/v3/phr/web/enrollment/suggestion',
  PHR_WEB_ENROLL_IS_EXISTS: '/api/v3/phr/web/enrollment/isExists',
  PHR_WEB_ENROLL_ENROL: '/api/v3/phr/web/enrollment/enrol',
  /** PHR Web V3 — ABHA login */
  PHR_WEB_LOGIN_ABHA_SEARCH: '/api/v3/phr/web/login/abha/search',
  PHR_WEB_LOGIN_ABHA_REQUEST_OTP: '/api/v3/phr/web/login/abha/request/otp',
  PHR_WEB_LOGIN_ABHA_VERIFY: '/api/v3/phr/web/login/abha/verify',
  /** PHR Web V3 — profile */
  PHR_WEB_LOGIN_PROFILE: '/api/v3/phr/web/login/profile',
  PHR_WEB_LOGIN_PROFILE_QR: '/api/v3/phr/web/login/profile/qrCode',
  PHR_WEB_LOGIN_PROFILE_PHR_CARD: '/api/v3/phr/web/login/profile/phrCard',
  PHR_WEB_LOGIN_PROFILE_ABHA: '/api/v3/phr/web/login/profile/abha-profile',
  PHR_WEB_LOGIN_PROFILE_ABHA_PHR_CARD: '/api/v3/phr/web/login/profile/abha/phr-card',
  PHR_WEB_LOGIN_PROFILE_UPDATE: '/api/v3/phr/web/login/profile/updateProfile',
  PHR_WEB_LOGIN_PROFILE_REQUEST_OTP: '/api/v3/phr/web/login/profile/request/otp',
  PHR_WEB_LOGIN_PROFILE_VERIFY: '/api/v3/phr/web/login/profile/verify',
  PHR_WEB_LOGIN_PUBLIC_CERT: '/api/v3/phr/web/login/public/certificate',
  /** PHR Consent Manager — consent PIN */
  PHR_CM_CREATE_PIN: '/patients/pin',
  PHR_CM_VERIFY_PIN: '/patients/verify-pin',
  PHR_CM_CHANGE_PIN: '/patients/change-pin',
  PHR_CM_FORGOT_PIN_GENERATE_OTP: '/patients/forgot-pin/generate-otp',
  PHR_CM_FORGOT_PIN_VALIDATE_OTP: '/patients/forgot-pin/validate-otp',
  PHR_CM_RESET_PIN: '/patients/reset-pin',
  PHR_CM_PATIENTS_ME: '/patients/me',
  /** HIECM V3 — locker & subscription */
  HIE_CM_HEALTH_LOCKERS: '/api/hiecm/gateway/v3/health-lockers',
  HIE_CM_PATIENT_LINKS: '/api/hiecm/hip/v3/link/patient/links',
  HIE_CM_CONSENT_LIST: '/api/hiecm/consent/v3/request',
  HIE_CM_CONSENT_APPROVE: '/api/hiecm/consent/v3/request',
  HIE_CM_CONSENT_DENY: '/api/hiecm/consent/v3/request',
  HIE_CM_CONSENT_REVOKE: '/api/hiecm/consent/v3/revoke',
  HIE_CM_CONSENT_ARTEFACTS: '/api/hiecm/consent/v3/artefact',
  HIE_CM_LOCKER_SETUP: '/api/hiecm/subscription-requests/v3/setup-locker',
  HIE_CM_PATIENT_LOCKERS: '/api/hiecm/subscription-requests/v3/patients/lockers',
  HIE_CM_PATIENT_REQUESTS: '/api/hiecm/subscription-requests/v3/patients/requests',
  LINKS_ON_CONFIRM: '/v0.5/links/on-confirm',
  LINKS_NOTIFY: '/v0.5/links/link/notify',
  CONSENT_ON_NOTIFY: '/v0.5/consents/on-notify',
  HEALTH_INFO_NOTIFY: '/v0.5/health-information/notify',
} as const;

/** Registered callback path suffixes (append to ABDM_CALLBACK_BASE_URL) */
export const ABDM_CALLBACK_PATHS = {
  AUTH_ON_FETCH_MODES: '/api/abdm/callbacks/v0.5/users/auth/on-fetch-modes',
  CARE_CONTEXTS_ON_DISCOVER: '/api/abdm/callbacks/v0.5/care-contexts/on-discover',
  LINKS_ON_CONFIRM: '/api/abdm/callbacks/v0.5/links/on-confirm',
  CONSENT_ON_INIT: '/api/abdm/callbacks/v0.5/consent-requests/on-init',
  CONSENTS_ON_FETCH: '/api/abdm/callbacks/v0.5/consents/on-fetch',
  HEALTH_INFO_ON_REQUEST: '/api/abdm/callbacks/v0.5/health-information/on-request',
  HEALTH_INFO_NOTIFY: '/api/abdm/callbacks/v0.5/health-information/notify',
  HIP_PATIENT_SHARE: '/api/abdm/v3/hip/patient/share',
} as const;
