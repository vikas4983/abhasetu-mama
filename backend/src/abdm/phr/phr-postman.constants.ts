/**
 * @file        phr-postman.constants.ts
 * @description Gateway path constants mapped to official ABDM PHR Postman collections
 * @module      abdm/phr
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

/** Postman collection filenames stored under docs/abdm/postman/ */
export const PHR_POSTMAN_COLLECTIONS = {
  REGISTRATION_ENROLLMENT: 'PHR-Registration-Enrollment.postman_collection.json',
  LOGIN: 'PHR-Login.postman_collection.json',
  PROFILE: 'PHR-Profile.postman_collection.json',
  LOCKER_HIECM: 'PHR-Locker-HIECM.postman_collection.json',
  CONSENT_PIN: 'Consent-PIN.postman_collection.json',
} as const;

/**
 * Legacy Health ID sandbox base — Postman {{BaseURI}}/{{BasePath}}
 * Default: https://healthidsbx.abdm.gov.in/api
 */
export const PHR_HID_BASE_PATH = '/api' as const;

/** PHR Registration-Enrollment collection — RegistrationWithAadhaar / RegistrationWithMobile / Search */
export const PHR_HID_REGISTRATION = {
  AADHAAR_GENERATE_OTP: '/v1/registration/aadhaar/generateOtp',
  AADHAAR_VERIFY_OTP: '/v1/registration/aadhaar/verifyOTP',
  AADHAAR_CHECK_AND_GENERATE_MOBILE_OTP: '/v2/registration/aadhaar/checkAndGenerateMobileOTP',
  AADHAAR_RESEND_OTP: '/v1/registration/aadhaar/resendAadhaarOtp',
  AADHAAR_VERIFY_MOBILE_OTP: '/v1/registration/aadhaar/verifyMobileOTP',
  AADHAAR_GENERATE_MOBILE_OTP: '/v1/registration/aadhaar/generateMobileOTP',
  AADHAAR_CREATE_WITH_PRE_VERIFIED: '/v1/registration/aadhaar/createHealthIdWithPreVerified',
  AADHAAR_CREATE_WITH_AADHAAR_OTP: '/v1/registration/aadhaar/createHealthIdWithAadhaarOtp',
  AADHAAR_VERIFY_BIO: '/v1/registration/aadhaar/verifyBio',
  MOBILE_GENERATE_OTP: '/v1/registration/mobile/generateOtp',
  MOBILE_RESEND_OTP: '/v1/registration/mobile/resendOtp',
  MOBILE_VERIFY_OTP: '/v1/registration/mobile/verifyOtp',
  MOBILE_CREATE_HEALTH_ID: '/v1/registration/mobile/createHealthId',
  SEARCH_EXISTS_BY_HEALTH_ID: '/v1/search/existsByHealthId',
  SEARCH_BY_HEALTH_ID: '/v1/search/searchByHealthId',
  SEARCH_BY_MOBILE: '/v1/search/searchByMobile',
  AUTH_CERT_V2: '/v2/auth/cert',
} as const;

/** PHR Login collection — Authentication / LoginWithMobileNumber */
export const PHR_HID_LOGIN = {
  AUTH_INIT: '/v1/auth/init',
  AUTH_CONFIRM_AADHAAR_OTP: '/v1/auth/confirmWithAadhaarOtp',
  AUTH_CONFIRM_MOBILE_OTP: '/v1/auth/confirmWithMobileOTP',
  AUTH_PASSWORD: '/v1/auth/authPassword',
  AUTH_CONFIRM_DEMOGRAPHICS: '/v1/auth/confirmWithDemographics',
  AUTH_RESEND_OTP: '/v1/auth/resendAuthOTP',
  AUTH_GENERATE_ACCESS_TOKEN: '/v1/auth/generate/access-token',
  MOBILE_LOGIN_GENERATE_OTP: '/v2/registration/mobile/login/generateOtp',
  MOBILE_LOGIN_RESEND_OTP: '/v2/registration/mobile/login/resendOtp',
  MOBILE_LOGIN_VERIFY_OTP: '/v2/registration/mobile/login/verifyOtp',
  MOBILE_LOGIN_USER_TOKEN: '/v2/registration/mobile/login/userAuthorizedToken',
} as const;

/** PHR Profile collection — Profile folder */
export const PHR_HID_PROFILE = {
  ACCOUNT_LOGOUT: '/v1/account/logout',
  ACCOUNT_GET_PROFILE: '/v1/account/profile',
  ACCOUNT_UPDATE_PROFILE: '/v1/account/profile',
  ACCOUNT_QR_CODE: '/v1/account/qrCode',
  ACCOUNT_UPDATE_PHR_ADDRESS: '/v1/account/update/phr-address',
  ACCOUNT_AADHAAR_GENERATE_OTP: '/v1/account/aadhaar/generateOTP',
  ACCOUNT_AADHAAR_VERIFY_OTP: '/v1/account/aadhaar/verifyOTP',
  ACCOUNT_CHANGE_PASSWORD: '/v1/account/change/password',
} as const;

/** PHR & Locker (HIECM) — Consent Manager {{CM_HOST}} paths */
export const PHR_HIECM_CM = {
  SESSIONS: '/sessions',
  OTP_SESSION_VERIFY: '/otpsession/verify',
  OTP_SESSION_PERMIT: '/otpsession/permit',
  PATIENTS_ME: '/patients/me',
  PATIENTS_PIN: '/patients/pin',
  PATIENTS_VERIFY_PIN: '/patients/verify-pin',
  PATIENTS_CHANGE_PIN: '/patients/change-pin',
  PATIENTS_FORGOT_PIN_GENERATE_OTP: '/patients/forgot-pin/generate-otp',
  PATIENTS_FORGOT_PIN_VALIDATE_OTP: '/patients/forgot-pin/validate-otp',
  PATIENTS_RESET_PIN: '/patients/reset-pin',
  PATIENTS_LOCKERS: '/patients/lockers',
  PATIENTS_REQUESTS: '/patients/requests',
  PATIENTS_LINKS: '/patients/links',
  CONSENT_REQUESTS: '/consent-requests',
  CONSENTS_REVOKE: '/consents/revoke',
  CONSENT_ARTEFACTS: '/consentArtefacts',
  CONSENTS_AUTO_APPROVE: '/consents/auto-approve',
  CARE_CONTEXTS_DISCOVER: '/v1/care-contexts/discover',
  LINKS_INIT: '/v1/links/link/init',
  LINKS_CONFIRM: '/v1/links/link/confirm',
  HEALTH_INFORMATION_REQUEST: '/health-information/request',
  SUBSCRIPTION_REQUESTS: '/subscription-requests',
  LOGOUT: '/logout',
} as const;

/** Consent PIN dedicated collection — same CM paths, explicit for certification */
export const PHR_CONSENT_PIN = {
  CREATE: '/patients/pin',
  VERIFY: '/patients/verify-pin',
  CHANGE: '/patients/change-pin',
  FORGOT_GENERATE_OTP: '/patients/forgot-pin/generate-otp',
  FORGOT_VALIDATE_OTP: '/patients/forgot-pin/validate-otp',
  RESET: '/patients/reset-pin',
} as const;
