/**
 * @file        health.constants.ts
 * @description Blood groups, appointment types, and FHIR HI types
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-10
 */

/** Health Information types supported per ABDM spec */
export const HI_TYPES = {
  PRESCRIPTION:        'Prescription',
  DIAGNOSTIC_REPORT:   'DiagnosticReport',
  OP_CONSULTATION:     'OPConsultation',
  DISCHARGE_SUMMARY:   'DischargeSummary',
  IMMUNIZATION_RECORD: 'ImmunizationRecord',
  HEALTH_DOCUMENT:     'HealthDocumentRecord',
  WELLNESS_RECORD:     'WellnessRecord',
} as const;

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const CONSULTATION_MODES = {
  VIDEO: 'Video Call',
  AUDIO: 'Audio Call',
  IN_CLINIC: 'In-Clinic',
} as const;
