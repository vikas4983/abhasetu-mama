/**
 * @file        audit.constants.ts
 * @description Audit event classifications
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-10
 */

export const AUDIT_EVENT_TYPES = {
  PHI_ACCESS: 'PHI_ACCESS',
  USER_LOGIN: 'USER_LOGIN',
  ABHA_LINK: 'ABHA_LINK',
  CONSENT_EVENT: 'CONSENT_EVENT',
  SECURITY_BREACH: 'SECURITY_BREACH',
} as const;
