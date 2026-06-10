/**
 * @file        fhir.constants.ts
 * @description FHIR coding and resource types specifications
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-10
 */

export const FHIR_RESOURCE_TYPES = {
  BUNDLE: 'Bundle',
  COMPOSITION: 'Composition',
  PATIENT: 'Patient',
  PRACTITIONER: 'Practitioner',
  PRESCRIPTION: 'MedicationRequest',
  DIAGNOSTIC_REPORT: 'DiagnosticReport',
} as const;

export const CODING_SYSTEMS = {
  LOINC: 'http://loinc.org',
  SNOMED: 'http://snomed.info/sct',
} as const;
