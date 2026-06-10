/**
 * @file        db.constants.ts
 * @description Database schemes and table definitions
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-10
 */

export const DB_SCHEMAS = {
  PUBLIC: 'public',
  ABDM: 'abdm',
} as const;

export const DB_TABLES = {
  USERS: 'users',
  CONFIG: 'config',
  PRODUCTS: 'products',
  POLICIES: 'policies',
  LAB_PACKAGES: 'lab_packages',
  AUDIT_LOGS: 'audit_logs',
  SPECIALTIES_MATRIX: 'specialties_matrix',
  DOCTORS: 'doctors',
} as const;
