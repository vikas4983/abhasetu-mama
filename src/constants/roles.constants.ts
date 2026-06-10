/**
 * @file        roles.constants.ts
 * @description User roles constants
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-10
 */

export const ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  HIP_STAFF: 'HIP_STAFF',
  HIU_STAFF: 'HIU_STAFF',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];
