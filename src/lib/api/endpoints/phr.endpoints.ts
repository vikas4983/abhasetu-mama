/**
 * @file        phr.endpoints.ts
 * @description PHR internal BFF API route constants
 * @module      lib/api/endpoints
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

export const PHR_ENDPOINTS = {
  PHR_ACTION: "/phr",
  PHR_COMPLIANCE: "/phr/compliance",
  PHR_POSTMAN: "/phr/postman",
  PHR_PROFILE: "/phr/v3/web/login/profile",
} as const;

export const PHR_ACTIONS = {
  ENROLLMENT_REQUEST_OTP: "enrollment-request-otp",
  ENROLLMENT_VERIFY: "enrollment-verify",
  ENROLLMENT_SUGGESTION: "enrollment-suggestion",
  ENROLLMENT_IS_EXISTS: "enrollment-is-exists",
  ENROLLMENT_ENROL: "enrollment-enrol",
  LOGIN_ABHA_SEARCH: "login-abha-search",
  LOGIN_ABHA_REQUEST_OTP: "login-abha-request-otp",
  LOGIN_ABHA_VERIFY: "login-abha-verify",
  GET_PROFILE: "get-profile",
  GET_PHR_CARD: "get-phr-card",
  GET_QR_CODE: "get-qr-code",
  UPDATE_PROFILE: "update-profile",
  CREATE_PIN: "create-pin",
  VERIFY_PIN: "verify-pin",
  CHANGE_PIN: "change-pin",
  FORGOT_PIN_GENERATE_OTP: "forgot-pin-generate-otp",
  FORGOT_PIN_VALIDATE_OTP: "forgot-pin-validate-otp",
  RESET_PIN: "reset-pin",
  LIST_LOCKERS: "list-lockers",
  SETUP_LOCKER: "setup-locker",
  LIST_CONSENTS: "list-consents",
  APPROVE_CONSENT: "approve-consent",
  DENY_CONSENT: "deny-consent",
  REVOKE_CONSENT: "revoke-consent",
  LIST_PATIENT_REQUESTS: "list-patient-requests",
  /** Legacy HID — Registration collection */
  HID_AADHAAR_GENERATE_OTP: "hid-aadhaar-generate-otp",
  HID_AADHAAR_VERIFY_OTP: "hid-aadhaar-verify-otp",
  HID_MOBILE_GENERATE_OTP: "hid-mobile-generate-otp",
  HID_MOBILE_VERIFY_OTP: "hid-mobile-verify-otp",
  HID_MOBILE_CREATE_HEALTH_ID: "hid-mobile-create-health-id",
  HID_SEARCH_EXISTS: "hid-search-exists",
  /** Legacy HID — Login collection */
  HID_AUTH_INIT: "hid-auth-init",
  HID_AUTH_CONFIRM_AADHAAR_OTP: "hid-auth-confirm-aadhaar-otp",
  HID_MOBILE_LOGIN_GENERATE_OTP: "hid-mobile-login-generate-otp",
  HID_MOBILE_LOGIN_VERIFY_OTP: "hid-mobile-login-verify-otp",
  /** Legacy HID — Profile collection */
  HID_ACCOUNT_PROFILE: "hid-account-profile",
  HID_ACCOUNT_QRCODE: "hid-account-qrcode",
  /** HIECM CM — Locker collection */
  CM_CREATE_SESSION: "cm-create-session",
  CM_PATIENTS_ME: "cm-patients-me",
  CM_LIST_CONSENT_REQUESTS: "cm-list-consent-requests",
  CM_GRANT_CONSENT: "cm-grant-consent",
  CM_GET_PATIENT_LOCKERS: "cm-get-patient-lockers",
} as const;
