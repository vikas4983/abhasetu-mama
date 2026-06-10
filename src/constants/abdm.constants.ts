/**
 * @file        abdm.constants.ts
 * @description ABDM-specific constants, headers, and paths
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-10
 */

/** ABDM Sandbox CM identifier */
export const ABDM_CM_ID_SANDBOX = 'sbx' as const;

/** ABDM Production CM identifier */
export const ABDM_CM_ID_PROD = 'abdm' as const;

/** ABDM required HTTP header key for HIE-CM identification */
export const ABDM_HEADER_CM_ID = 'X-CM-ID' as const;

/** ABDM required HTTP header key for HIP identification */
export const ABDM_HEADER_HIP_ID = 'X-HIP-ID' as const;

/** ABDM required HTTP header key for HIU identification */
export const ABDM_HEADER_HIU_ID = 'X-HIU-ID' as const;

/** ABDM correlation header key */
export const ABDM_HEADER_CORRELATION_ID = 'X-Correlation-ID' as const;
