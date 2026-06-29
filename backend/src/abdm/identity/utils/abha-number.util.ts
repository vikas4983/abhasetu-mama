/**
 * @file        abha-number.util.ts
 * @description Normalize ABHA number for ABDM loginId encryption (14 digits)
 * @module      abdm/identity/utils
 * @layer       util
 * @author      Platform Team
 * @created     2026-06-29
 */

/** @description Masked digit placeholder in displayed ABHA numbers */
const ABHA_MASK_CHAR = 'X';

/**
 * @description Strip non-digits and validate 14-digit ABHA (no masked XXXX segments)
 * @param {string} raw - ABHA from profile or user input
 * @returns {string | null} 14-digit string or null if invalid/masked
 */
export function normalizeAbhaNumberDigits(raw: string): string | null {
  if (!raw?.trim()) return null;
  if (raw.toUpperCase().includes(ABHA_MASK_CHAR)) return null;
  const digits = raw.replace(/\D/g, '');
  if (!/^\d{14}$/.test(digits)) return null;
  return digits;
}

/**
 * @description Format 14 digits as XX-XXXX-XXXX-XXXX for display only
 */
export function formatAbhaNumberDisplay(digits: string): string {
  const d = digits.replace(/\D/g, '');
  if (d.length !== 14) return digits;
  return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}-${d.slice(10, 14)}`;
}
