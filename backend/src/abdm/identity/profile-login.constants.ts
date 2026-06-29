/**
 * @file        profile-login.constants.ts
 * @description ABDM M1 profile login scope/loginHint/otpSystem combinations (Postman)
 * @module      abdm/identity/profile-login
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-29
 */

/** @description Profile login via 10-digit mobile + ABHA-linked OTP */
export const LOGIN_SCOPE_MOBILE = ['abha-login', 'mobile-verify'] as const;

/** @description Profile login via ABHA number + Aadhaar-linked OTP */
export const LOGIN_SCOPE_ABHA_AADHAAR = ['abha-login', 'aadhaar-verify'] as const;

/** @description Profile login via ABHA number + ABHA-linked mobile OTP */
export const LOGIN_SCOPE_ABHA_MOBILE = ['abha-login', 'mobile-verify'] as const;

/** @description Profile login via ABHA address + mobile OTP */
export const LOGIN_SCOPE_ADDRESS_MOBILE = ['abha-address-login', 'mobile-verify'] as const;

/** @description Profile login via ABHA address + Aadhaar OTP */
export const LOGIN_SCOPE_ADDRESS_AADHAAR = ['abha-address-login', 'aadhaar-verify'] as const;

/** @description Profile login password verify */
export const LOGIN_SCOPE_PASSWORD = ['abha-login', 'password-verify'] as const;

/** @description Biometric scopes — not enabled for private companies */
export const LOGIN_BIOMETRIC_SCOPES = [
  'aadhaar-bio-verify',
  'aadhaar-face-verify',
  'aadhaar-iris-verify',
] as const;

export type ProfileLoginHint = 'mobile' | 'abha-number' | 'abha-address';

export type ProfileLoginOtpSystem = 'aadhaar' | 'abdm';
