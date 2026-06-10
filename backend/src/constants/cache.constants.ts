/**
 * @file        cache.constants.ts
 * @description Redis keys and TTL configurations
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-10
 */

export const CACHE_KEYS = {
  ABDM_SESSION_TOKEN: 'abdm:session:token',
  ABDM_RSA_CERT: 'abdm:rsa:cert',
  PATIENT_PROFILE: 'patient:profile:',
} as const;

export const CACHE_TTL = {
  SESSION_TOKEN: 1740, // 29 minutes in seconds
  RSA_CERT: 86400, // 24 hours in seconds
} as const;
