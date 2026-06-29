/**
 * @file        x-token.util.spec.ts
 * @description Unit tests for X-token JWT ABHA extraction
 * @module      abdm/identity/utils
 * @layer       test
 * @author      Platform Team
 * @created     2026-06-29
 */

import { extractAbhaNumberFromXToken } from './x-token.util';

/** Minimal JWT with abhaNumber claim (no crypto — decode only) */
function jwtWithPayload(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.sig`;
}

describe('x-token.util', () => {
  it('extracts ABHA from abhaNumber claim', () => {
    const token = jwtWithPayload({ abhaNumber: '91-7561-4088-8857' });
    expect(extractAbhaNumberFromXToken(token)).toBe('91756140888857');
  });

  it('extracts ABHA from sub claim', () => {
    const token = jwtWithPayload({ sub: '91-7561-4088-8857' });
    expect(extractAbhaNumberFromXToken(token)).toBe('91756140888857');
  });

  it('returns null for masked JWT claims', () => {
    const token = jwtWithPayload({ abhaNumber: '91-7561-4088-XXXX' });
    expect(extractAbhaNumberFromXToken(token)).toBeNull();
  });
});
