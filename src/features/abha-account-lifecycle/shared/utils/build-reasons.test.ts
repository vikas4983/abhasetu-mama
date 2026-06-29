/**
 * @file        build-reasons.test.ts
 * @description Unit tests for survey reasons builder
 * @module      abha-account-lifecycle/shared
 * @layer       test
 * @author      Platform Team
 * @created     2026-06-26
 */

import { buildSurveyReasons } from './build-reasons';

describe('buildSurveyReasons', () => {
  it('returns selected option label', () => {
    const reasons = buildSurveyReasons('moving_abroad', '');
    expect(reasons).toEqual(['I am moving out of the country']);
  });

  it('returns custom text for other reason', () => {
    const reasons = buildSurveyReasons('other', '  Personal choice  ');
    expect(reasons).toEqual(['Personal choice']);
  });

  it('returns fallback when nothing selected', () => {
    expect(buildSurveyReasons('', '')).toEqual(['Not specified']);
  });
});
