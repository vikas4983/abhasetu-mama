/**
 * @file        profile-account.util.ts
 * @description Extract full ABHA number from GET /api/v3/profile/account payload
 * @module      abdm/identity/utils
 * @layer       util
 * @author      Platform Team
 * @created     2026-06-26
 */

import { normalizeAbhaNumberDigits } from './abha-number.util';

/**
 * @description Resolve ABHANumber + 14-digit form from profile/account payload
 */
export function extractAbhaNumberFromProfilePayload(
  payload: Record<string, unknown> | null | undefined,
): { digits: string; ABHANumber: string } | null {
  if (!payload) return null;

  const nested =
    payload.data && typeof payload.data === 'object'
      ? (payload.data as Record<string, unknown>)
      : null;

  const abhaProfile =
    payload.ABHAProfile && typeof payload.ABHAProfile === 'object'
      ? (payload.ABHAProfile as Record<string, unknown>)
      : null;

  const sources = [payload, nested, abhaProfile].filter(Boolean) as Record<string, unknown>[];

  for (const source of sources) {
    const rawAbha =
      (typeof source.ABHANumber === 'string' && source.ABHANumber) ||
      (typeof source.abhaNumber === 'string' && source.abhaNumber) ||
      (typeof source.healthIdNumber === 'string' && source.healthIdNumber) ||
      (typeof source.healthId === 'string' && source.healthId) ||
      '';

    if (!rawAbha) continue;

    const digits = normalizeAbhaNumberDigits(rawAbha);
    if (digits) {
      return { digits, ABHANumber: rawAbha };
    }
  }

  return null;
}
