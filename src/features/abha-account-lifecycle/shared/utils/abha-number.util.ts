/**
 * @file        abha-number.util.ts
 * @description Client-side ABHA number validation for account lifecycle actions
 * @module      abha-account-lifecycle/shared
 * @layer       util
 * @author      Platform Team
 * @created     2026-06-29
 */

const ABHA_MASK_CHAR = 'X';

/**
 * @description Returns ABHA digits for BFF when complete; empty string lets server resolve from profile API
 */
export function abhaNumberForLifecycleAction(raw: string | undefined): string {
  if (!raw?.trim()) return '';
  if (raw.toUpperCase().includes(ABHA_MASK_CHAR)) return '';
  const digits = raw.replace(/\D/g, '');
  return /^\d{14}$/.test(digits) ? digits : '';
}
