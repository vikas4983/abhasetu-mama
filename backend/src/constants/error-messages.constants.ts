/**
 * @file        error-messages.constants.ts
 * @description Centralized map of ABDM / UIDAI gateway error codes to
 *              user-readable, plain-language messages shown in the UI.
 *              Add or update entries here to control ALL error strings
 *              shown across the entire application.
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-14
 * @modified    2026-06-14
 */

// ─── ABDM Error Code → User-Friendly Message Map ─────────────────────────────

/**
 * Maps ABDM gateway error codes (e.g. "ABDM-1204") to a plain-language
 * message that is safe and meaningful to show a citizen/patient user.
 * Extend this map whenever a new error code is discovered in production logs.
 */
export const ABDM_ERROR_MESSAGES: Record<string, string> = {

  // ── Aadhaar OTP Errors (M1 – Enrolment by Aadhaar) ─────────────────────────

  /** OTP entered by the user does not match the one sent to the Aadhaar-linked mobile */
  'ABDM-1204': 'The OTP you entered is incorrect. Please check your Aadhaar-linked mobile and try again.',

  /** OTP has expired before the user submitted it */
  'ABDM-1205': 'Your OTP has expired. Please request a new OTP and try again within 10 minutes.',

  /** OTP request was rate-limited because too many OTPs were generated */
  'ABDM-1206': 'Too many OTP requests. Please wait a few minutes before requesting a new OTP.',

  /** The Aadhaar number provided is invalid or not found in UIDAI records */
  'ABDM-1010': 'The Aadhaar number you entered could not be verified. Please double-check and retry.',

  /** Aadhaar biometric lock is enabled; OTP-based auth is blocked */
  'ABDM-1012': 'Your Aadhaar is locked for OTP authentication. Please unlock it via the mAadhaar app or UIDAI portal and try again.',

  /** Aadhaar number does not have a linked mobile number registered */
  'ABDM-1100': 'No mobile number is linked to this Aadhaar. Please link a mobile number on the UIDAI portal first.',

  // ── ABHA Account / Profile Errors ────────────────────────────────────────────

  /** ABHA number already exists — duplicate registration attempt */
  'ABDM-1401': 'An ABHA account already exists for this Aadhaar. Please log in using your existing ABHA credentials.',

  /** ABHA address (username) is already taken */
  'ABDM-1402': 'This ABHA address is already taken. Please choose a different one.',

  /** ABHA profile not found for the given ABHA number */
  'ABDM-1404': 'ABHA account not found. Please check the details and try again.',

  /** ABHA account is deactivated or suspended */
  'ABDM-1406': 'Your ABHA account has been deactivated. Please contact ABDM support to restore it.',

  // ── Session / Authentication Errors ──────────────────────────────────────────

  /** Gateway session token has expired; needs to be refreshed */
  'ABDM-1001': 'Session expired. The page will refresh your connection automatically — please retry.',

  /** Invalid or missing Authorization header on the gateway call */
  'ABDM-1002': 'Authentication failed with the health gateway. Please refresh the page and try again.',

  /** Client credentials (client_id / client_secret) are invalid */
  'ABDM-1003': 'Gateway authentication failed. Please contact the system administrator.',

  // ── Consent Errors (M2 / M3) ─────────────────────────────────────────────────

  /** Consent artefact not found or already processed */
  'ABDM-2001': 'The consent request could not be found or has already been processed.',

  /** Consent has expired */
  'ABDM-2002': 'This consent has expired. Please initiate a new consent request.',

  /** Consent was revoked by the patient before the health record could be fetched */
  'ABDM-2003': 'The patient has revoked consent for this request. No records can be shared.',

  // ── Health Information Transfer Errors (M3) ───────────────────────────────────

  /** Health records transfer failed at HRP side */
  'ABDM-3001': 'Health records could not be retrieved at this time. Please try again shortly.',

  /** Decryption of health records failed */
  'ABDM-3002': 'There was an error processing the health records. Please contact support if this persists.',

  // ── Driving License / NHA Errors ─────────────────────────────────────────────

  /** DL number not found in Vahan / NHA registry */
  'ABDM-4001': 'The Driving License number you entered was not found. Please verify the number and try again.',

  /** DL demographic mismatch */
  'ABDM-4002': 'The details you entered do not match the Driving License records. Please check and retry.',

  // ── Generic / Catch-All ────────────────────────────────────────────────────────

  /** Unknown or unmapped ABDM error code */
  'DEFAULT': 'Something went wrong while communicating with the health gateway. Please try again, or contact support if the issue persists.',
} as const;

// ─── UIDAI Error Code → User-Friendly Message Map ────────────────────────────

/**
 * Maps raw UIDAI HTTP sub-error codes (embedded in ABDM gateway responses,
 * e.g. "UIDAI Error code : 400") to plain-language messages.
 */
export const UIDAI_ERROR_MESSAGES: Record<string, string> = {
  /** OTP validation failed — wrong OTP entered */
  '400': 'The OTP you entered is incorrect. Please enter the 6-digit OTP sent to your Aadhaar-linked mobile number.',

  /** OTP has expired */
  '401': 'Your OTP has expired. Please request a fresh OTP and submit it within 10 minutes.',

  /** Aadhaar number is invalid */
  '402': 'Invalid Aadhaar number. Please verify the 12-digit number and try again.',

  /** Too many failed OTP attempts; temporary lockout */
  '403': 'Too many incorrect OTP attempts. Your Aadhaar is temporarily locked. Please try after 30 minutes.',

  /** Aadhaar is permanently locked for electronic use */
  '404': 'Your Aadhaar is locked for electronic authentication. Please unlock it via the mAadhaar app.',

  /** Generic UIDAI server error */
  '500': 'The Aadhaar authentication service is temporarily unavailable. Please try again in a few minutes.',
} as const;

// ─── HTTP Status → User-Friendly Message Map ──────────────────────────────────

/**
 * Maps HTTP status codes returned by the ABDM gateway to plain-language messages.
 * Used as a secondary fallback when no ABDM/UIDAI code is present.
 */
export const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'The request could not be processed. Please check your inputs and try again.',
  401: 'You are not authorised. Please log in again.',
  403: 'Access denied. You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  408: 'The request timed out. Please check your internet connection and try again.',
  409: 'A conflict occurred — this resource may already exist.',
  422: 'The information provided could not be validated by the health gateway. Please check your inputs.',
  429: 'Too many requests. Please wait a moment before trying again.',
  500: 'An unexpected server error occurred. Our team has been notified. Please try again shortly.',
  502: 'The health gateway is temporarily unreachable. Please try again in a few minutes.',
  503: 'The health gateway service is currently unavailable. Please try again later.',
  504: 'The gateway request timed out. Please retry.',
} as const;
