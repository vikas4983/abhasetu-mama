/**
 * @file        ReKycTab.tsx
 * @description Launcher for Re-KYC modal (flow runs in ProfileModals)
 * @module      profile/components/re_kyc
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-24
 * @modified    2026-06-29
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { ReKycTabProps } from './ReKycTab.types';
import * as S from './ReKycTab.styles';

export const ReKycTab: React.FC<ReKycTabProps> = ({
  abhaProfile,
  handleRequestReKycOtp,
}) => {
  return (
    <S.Container>
      <S.Title>
        <RefreshCw style={{ color: 'var(--accent-teal)', width: '16px', height: '16px' }} />
        <span>Re-KYC Verification</span>
      </S.Title>
      <S.ActionContainer>
        <S.Description>
          Verify your demographic details against UIDAI. OTP will be sent to mobile ending with{' '}
          <strong>******{abhaProfile.mobile?.slice(-4)}</strong>.
        </S.Description>
        <S.SubmitButton type="button" onClick={handleRequestReKycOtp}>
          Start Re-KYC verification
        </S.SubmitButton>
      </S.ActionContainer>
    </S.Container>
  );
};
