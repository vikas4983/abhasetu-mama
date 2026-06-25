/**
 * @file        DelinkTab.tsx
 * @description Renders the 'Delink Mobile Number' tab.
 * @module      profile/components/delink
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-24
 * @modified    2026-06-24
 */

import React from 'react';
import { UserMinus } from 'lucide-react';
import { DelinkTabProps } from './DelinkTab.types';
import * as S from './DelinkTab.styles';

/**
 * @description Component providing mobile number delinking warnings and triggers.
 * @param {DelinkTabProps} props - Component properties
 * @returns {React.ReactElement} The rendered component
 */
export const DelinkTab: React.FC<DelinkTabProps> = ({
  delinkError,
  handleRequestDelinkOtp,
  delinkLoading,
}) => {
  return (
    <S.Container>
      <S.Title>
        <UserMinus style={{ color: 'var(--danger)', width: '16px', height: '16px' }} />
        <span>Delink Mobile Number</span>
      </S.Title>

      <S.ContentContainer>
        <S.WarningBox>
          <strong>⚠️ Delink Warning:</strong> If this ABHA number does not belong to you or your family members, you can opt to delink your mobile number, which will remove it from the ABHA record.
        </S.WarningBox>
        {delinkError && <S.ErrorText>{delinkError}</S.ErrorText>}
        <S.SubmitButton onClick={handleRequestDelinkOtp} disabled={delinkLoading}>
          {delinkLoading ? 'Requesting OTP...' : 'Delink Mobile Number'}
        </S.SubmitButton>
      </S.ContentContainer>
    </S.Container>
  );
};
