/**
 * @file        build-reasons.ts
 * @description Build ABDM reasons array from survey selection
 * @module      abha-account-lifecycle/shared
 * @layer       util
 * @author      Platform Team
 * @created     2026-06-26
 */

import { ABHA_DEACTIVATION_SURVEY_OPTIONS } from '../constants/account-action.constants';

/**
 * @description Map survey UI state to ABDM verify payload reasons
 */
export function buildSurveyReasons(surveyOptionId: string, otherReason: string): string[] {
  const option = ABHA_DEACTIVATION_SURVEY_OPTIONS.find((o) => o.id === surveyOptionId);
  if (surveyOptionId === 'other' && otherReason.trim()) {
    return [otherReason.trim()];
  }
  return option ? [option.label] : ['Not specified'];
}
