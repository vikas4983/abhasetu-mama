/**
 * @file        x-token.util.ts
 * @description Extract ABHA number from ABDM profile JWT (X-token)
 * @module      abdm/identity/utils
 * @layer       util
 * @author      Platform Team
 * @created     2026-06-29
 * @modified    2026-06-26
 */

import { normalizeAbhaNumberDigits } from './abha-number.util';

interface AbdmProfileJwtPayload {
  sub?: string;
  abhaNumber?: string;
  healthIdNumber?: string;
}

/**
 * @description True when token looks like a JWT (not a gateway access token)
 */
export function looksLikeProfileJwt(token: string): boolean {
  const clean = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  const parts = clean.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

/**
 * @description Resolve profile X-token from cookies — excludes gateway session_id
 */
export function extractProfileXToken(
  cookieHeader: string | undefined,
  authorizationHeader?: string,
): string {
  const candidates: string[] = [];
  if (cookieHeader) {
    for (const cookie of cookieHeader.split(';')) {
      const [key, val] = cookie.trim().split('=');
      if (key === 'x_token' || key === 'verify_via_abha_number_token') {
        const decoded = decodeURIComponent(val || '');
        if (decoded) candidates.push(decoded);
      }
    }
  }
  if (authorizationHeader) {
    const fromAuth = authorizationHeader.replace(/^Bearer\s+/i, '').trim();
    if (fromAuth) candidates.push(fromAuth);
  }
  for (const c of candidates) {
    if (looksLikeProfileJwt(c)) return c;
  }
  return '';
}

/**
 * @description Decode ABDM X-token JWT payload without signature verification (BFF-only)
 */
export function decodeAbdmProfileJwtPayload(xToken: string): AbdmProfileJwtPayload | null {
  const clean = xToken.startsWith('Bearer ') ? xToken.slice(7).trim() : xToken.trim();
  const parts = clean.split('.');
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(json) as AbdmProfileJwtPayload;
  } catch {
    return null;
  }
}

/**
 * @description Resolve 14-digit ABHA from X-token JWT claims (sub / abhaNumber)
 */
export function extractAbhaNumberFromXToken(xToken: string): string | null {
  const payload = decodeAbdmProfileJwtPayload(xToken);
  if (!payload) return null;

  const candidates = [payload.abhaNumber, payload.sub, payload.healthIdNumber];
  for (const raw of candidates) {
    if (typeof raw !== 'string') continue;
    const digits = normalizeAbhaNumberDigits(raw);
    if (digits) return digits;
  }
  return null;
}
