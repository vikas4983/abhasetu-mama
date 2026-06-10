/**
 * @file        regex.constants.ts
 * @description Regex patterns for input validation
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-10
 */

/** ABHA 14-digit number format (e.g. 12-3456-7890-1234) or 14 digits raw */
export const ABHA_NUMBER_REGEX = /^(?:\d{2}-\d{4}-\d{4}-\d{4}|\d{14})$/;

/** ABHA address format (e.g. username@sbx or username@abdm) */
export const ABHA_ADDRESS_REGEX = /^[a-zA-Z0-9._-]+@(sbx|abdm)$/;

/** 10-digit Indian mobile number format (starts with 6-9) */
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

/** 12-digit Aadhaar number format */
export const AADHAAR_REGEX = /^\d{12}$/;
