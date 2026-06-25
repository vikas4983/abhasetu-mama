/**
 * @file        ReKycTab.tsx
 * @description Renders the 'Re-KYC Verification' tab.
 * @module      profile/components/re_kyc
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-24
 * @modified    2026-06-24
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { ReKycTabProps } from './ReKycTab.types';
import * as S from './ReKycTab.styles';

/**
 * @description Component providing actions to start standard Aadhaar Re-KYC verification.
 * @param {ReKycTabProps} props - Component properties
 * @returns {React.ReactElement} The rendered component
 */
export const ReKycTab: React.FC<ReKycTabProps> = ({
  reKycSuccess,
  abhaProfile,
  reKycError,
  handleRequestReKycOtp,
  reKycLoading,
}) => {
  return (
    <S.Container>
      <S.Title>
        <RefreshCw style={{ color: 'var(--accent-teal)', width: '16px', height: '16px' }} />
        <span>Re-KYC Verification</span>
      </S.Title>

      {reKycSuccess ? (
        <S.SuccessContainer>
          <S.SuccessIcon src="/assets/check_icon.png" alt="Verified" />
          <S.SuccessTitle>Re-KYC Complete</S.SuccessTitle>
          <S.SuccessDesc>
            UIDAI verification resolved. Your demographic verification status is now updated to fully compliant.
          </S.SuccessDesc>
        </S.SuccessContainer>
      ) : (
        <S.ActionContainer>
          <S.Description>
            Re-KYC verifies your demographic identity against the central UIDAI registry. We will send an OTP confirmation to your registered mobile ending with <strong>******{abhaProfile.mobile?.slice(-4)}</strong>.
          </S.Description>
          {reKycError && <S.ErrorText>{reKycError}</S.ErrorText>}
          <S.SubmitButton onClick={handleRequestReKycOtp} disabled={reKycLoading}>
            {reKycLoading ? 'Requesting OTP...' : 'Send Re-KYC verification OTP'}
          </S.SubmitButton>
        </S.ActionContainer>
      )}
    </S.Container>
  );
};
