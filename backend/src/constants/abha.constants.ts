/**
 * @file        abha.constants.ts
 * @description ABHA verification and account constraints
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-10
 */

export const ABHA_SUFFIXES = {
  SANDBOX: 'sbx',
  PRODUCTION: 'abdm',
} as const;

export const ABHA_LIMITS = {
  MAX_DAILY_OTP_ATTEMPTS: 5,
  OTP_TTL_SECONDS: 600,
} as const;
