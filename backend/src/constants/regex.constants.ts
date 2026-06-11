/**
 * @file        regex.constants.ts
 * @description Standardized regex validation patterns for ABDM compliance.
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-11
 * @modified    2026-06-11
 */

// Exact regex pattern strings specified by NHA / user rules
export const MOBILE_VALIDATION_STR = '(\\+91|0)?[1-9][0-9]{9}';
export const DOB_VALIDATION_STR = '\\d{4}-(0[0-9]|1[012])-(0[0-9]|[12][0-9]|3[01])$';
export const ABHA_ADDRESS_VALIDATION_STR = '(^[a-zA-Z0-9]+[.]?[a-zA-Z0-9][]?[a-zA-Z0-9]+$)|(^[a-zA-Z0-9]+[]?[a-zA-Z0-9][.]?[a-zA-Z0-9]+$)';
export const ABHA_NUMBER_VALIDATION_STR = '\\d{2}-\\d{4}-\\d{4}-\\d{4}';
export const OTP_VALIDATION_STR = '[0-9]{6}';
export const PASSWORD_VALIDATION_STR = '^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$^-])[A-Za-z\\d!@#$%^&*-]{8,}$';
export const UUID_VALIDATION_STR = '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
export const EMAIL_VALIDATION_STR = '^[a-zA-Z0-9_-]+(?:\\.[a-zA-Z0-9_-]+)@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$';
export const DRIVING_LICENSE_VALIDATION_STR = '^[A-Z0-9\\s]+$';
export const TXN_ID_VALIDATION_STR = '^[a-zA-Z0-9_-]+(?:\\.[a-zA-Z0-9_-]+)@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$';

// Executable RegExp objects for validation logic
export const MOBILE_REGEX = /^(\+91|0)?[1-9][0-9]{9}$/;
export const DOB_REGEX = /^\d{4}-(0[0-9]|1[012])-(0[0-9]|[12][0-9]|3[01])$/;
export const ABHA_ADDRESS_REGEX = /^[a-zA-Z0-9._-]+@(sbx|abdm)$/;
export const ABHA_NUMBER_REGEX = /^\d{2}-\d{4}-\d{4}-\d{4}$/;
export const OTP_REGEX = /^[0-9]{6}$/;
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$^-])[A-Za-z\d!@#$%^&*-]{8,}$/;
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;
export const DRIVING_LICENSE_REGEX = /^[A-Z0-9\s]+$/;
export const TXN_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
