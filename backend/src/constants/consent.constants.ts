/**
 * @file        consent.constants.ts
 * @description Consent purpose coding and state values
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-10
 */

export const CONSENT_PURPOSES = {
  CARE_MANAGEMENT: 'CAREMGT',
  BREAK_THE_GLASS: 'BTG',
  PUBLIC_HEALTH: 'PUBHLTH',
  CLINICAL_TRIAL: 'HPAYMT',
} as const;

export const CONSENT_ARTEFACT_STATUS = {
  REQUESTED: 'REQUESTED',
  GRANTED: 'GRANTED',
  DENIED: 'DENIED',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
} as const;
