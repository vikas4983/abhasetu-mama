/**
 * @file        profile-account.util.spec.ts
 * @description Tests for ABHA extraction from profile account API payload
 * @module      abdm/identity/utils
 * @layer       test
 * @author      Platform Team
 * @created     2026-06-26
 */

import { extractAbhaNumberFromProfilePayload } from './profile-account.util';

describe('extractAbhaNumberFromProfilePayload', () => {
  it('reads ABHANumber from profile account response', () => {
    const result = extractAbhaNumberFromProfilePayload({
      ABHANumber: '91-7561-4088-8857',
      preferredAbhaAddress: 'user@sbx',
    });
    expect(result?.digits).toBe('91756140888857');
    expect(result?.ABHANumber).toBe('91-7561-4088-8857');
  });

  it('reads nested data.ABHANumber', () => {
    const result = extractAbhaNumberFromProfilePayload({
      data: { ABHANumber: '91756140888857' },
    });
    expect(result?.digits).toBe('91756140888857');
  });

  it('reads ABHAProfile.ABHANumber', () => {
    const result = extractAbhaNumberFromProfilePayload({
      ABHAProfile: { ABHANumber: '91-7561-4088-8857' },
    });
    expect(result?.digits).toBe('91756140888857');
  });

  it('rejects masked ABHA numbers', () => {
    const result = extractAbhaNumberFromProfilePayload({
      ABHANumber: '91-7561-XXXX-8857',
    });
    expect(result).toBeNull();
  });
});
