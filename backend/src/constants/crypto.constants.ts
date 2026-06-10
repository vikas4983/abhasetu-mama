/**
 * @file        crypto.constants.ts
 * @description Crypto algorithms mapping
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-10
 */

export const CRYPTO_ALGORITHMS = {
  RSA_OAEP_V3: 'RSA/ECB/OAEPWithSHA-1AndMGF1Padding',
  RSA_PKCS1_V1_V2: 'RSA/ECB/PKCS1Padding',
  AES_256_GCM: 'AES-256-GCM',
} as const;
