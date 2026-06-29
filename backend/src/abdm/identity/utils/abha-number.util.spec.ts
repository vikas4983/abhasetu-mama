/**
 * @file        abha-number.util.spec.ts
 * @description Unit tests for ABHA number normalization
 * @module      abdm/identity/utils
 * @layer       test
 * @author      Platform Team
 * @created     2026-06-29
 */

import { formatAbhaNumberDisplay, normalizeAbhaNumberDigits } from './abha-number.util';

describe('abha-number.util', () => {
  describe('normalizeAbhaNumberDigits', () => {
    it('accepts 14-digit formatted ABHA', () => {
      expect(normalizeAbhaNumberDigits('91-7561-4088-0725')).toBe('91756140880725');
    });

    it('rejects masked ABHA with X', () => {
      expect(normalizeAbhaNumberDigits('91-7561-4088-XXXX')).toBeNull();
    });

    it('rejects short values', () => {
      expect(normalizeAbhaNumberDigits('9175614088')).toBeNull();
    });
  });

  describe('formatAbhaNumberDisplay', () => {
    it('formats 14 digits for display', () => {
      expect(formatAbhaNumberDisplay('91756140880725')).toBe('91-7561-4088-0725');
    });
  });
});
