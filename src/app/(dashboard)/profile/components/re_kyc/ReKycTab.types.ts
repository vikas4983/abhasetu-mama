/**
 * @file        ReKycTab.types.ts
 * @description Types and interfaces for the Re-KYC Tab Component.
 * @module      profile/components/re_kyc
 * @layer       types
 * @author      Platform Team
 * @created     2026-06-24
 */

export interface ReKycTabProps {
  reKycSuccess: boolean;
  abhaProfile: any;
  reKycError: string;
  handleRequestReKycOtp: () => Promise<void>;
  reKycLoading: boolean;
}
