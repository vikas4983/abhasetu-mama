/**
 * @file        account-action.constants.ts
 * @description Shared constants for ABHA account lifecycle wizards
 * @module      abha-account-lifecycle/shared
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-26
 */

/** ABDM invalid credentials error code */
export const ABHA_INVALID_CREDENTIALS_CODE = '900901' as const;

/** Seconds before resend OTP is enabled */
export const ABHA_OTP_RESEND_SECONDS = 60 as const;

/** OTP validity countdown (seconds) */
export const ABHA_OTP_EXPIRY_SECONDS = 600 as const;

export const ABHA_DEACTIVATION_SURVEY_OPTIONS = [
  {
    id: 'retain_future',
    label:
      'I do not find ABHA number useful presently but I want to retain my ABHA number for future use',
  },
  {
    id: 'not_accepted',
    label:
      'My ABHA number is not accepted in all the health facilities or by health professionals',
  },
  {
    id: 'limited_connectivity',
    label: 'I live in geographical area with limited connectivity',
  },
  {
    id: 'moving_abroad',
    label: 'I am moving out of the country',
  },
  { id: 'other', label: 'Any other reason' },
] as const;

export const ABHA_DEACTIVATE_WARNINGS = [
  'You will lose all access to ABDM application',
  'You will no longer able to share your health records over ABDM',
  'You will no longer able to share health records to any Health Facility',
] as const;

export const ABHA_DELETE_WARNINGS = [
  'Your ABHA number will be permanently deleted, along with all your demographic details',
  'You will not be able to retrieve any information tagged to your ABHA number in the future',
  'You will never be able to access ABDM applications or health records with this deleted number',
] as const;

export type AbhaAuthChannel = 'aadhaar-otp' | 'abha-otp' | 'password';

export const ABHA_AUTH_CHANNELS: { id: AbhaAuthChannel; label: string; description: string }[] = [
  {
    id: 'aadhaar-otp',
    label: 'OTP on mobile number linked with Aadhaar',
    description: 'Sends OTP to your Aadhaar registered mobile',
  },
  {
    id: 'abha-otp',
    label: 'OTP on mobile number linked with ABHA number',
    description: 'Sends OTP to your ABHA linked mobile',
  },
  {
    id: 'password',
    label: 'Verify using ABHA password',
    description: 'Use your ABHA profile password',
  },
];
