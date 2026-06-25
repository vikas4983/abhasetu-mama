/**
 * @file        DeactivateDeleteTab.tsx
 * @description Renders the 'Deactivate/Delete ABHA' tab.
 * @module      profile/components/deactivate_delete
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-24
 * @modified    2026-06-24
 */

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { DeactivateDeleteTabProps } from './DeactivateDeleteTab.types';
import * as S from './DeactivateDeleteTab.styles';

/**
 * @description Component listing security caveats and option tabs for deletion or deactivation workflows.
 * @param {DeactivateDeleteTabProps} props - Component properties
 * @returns {React.ReactElement} The rendered component
 */
export const DeactivateDeleteTab: React.FC<DeactivateDeleteTabProps> = ({
  deactivateOption,
  setDeactivateOption,
  deactivateAuthMethod,
  setDeactivateAuthMethod,
  deactivateError,
  deactivateLoading,
  handleDeactivateRequest,
}) => {
  return (
    <S.Container>
      <S.Title>
        <ShieldAlert style={{ color: 'var(--danger)', width: '16px', height: '16px' }} />
        <span>Deactivate or Delete ABHA</span>
      </S.Title>

      <S.FormContainer>
        {/* Option tabs */}
        <S.OptionTabContainer>
          <S.OptionTabButton 
            type="button" 
            onClick={() => setDeactivateOption('deactivate')} 
            $active={deactivateOption === 'deactivate'}
          >
            Deactivate Card
          </S.OptionTabButton>
          <S.OptionTabButton 
            type="button" 
            onClick={() => setDeactivateOption('delete')} 
            $active={deactivateOption === 'delete'}
          >
            Delete Permanently
          </S.OptionTabButton>
        </S.OptionTabContainer>

        {/* Warnings List */}
        {deactivateOption === 'deactivate' ? (
          <S.WarningBox>
            <S.WarningTitle>⚠️ Temporary Deactivation Warnings:</S.WarningTitle>
            <S.WarningList>
              <li>You will lose all access to the ABDM application temporarily.</li>
              <li>You will no longer be able to share your health records over ABDM.</li>
              <li>You will no longer be able to share health records with any Health Facility.</li>
            </S.WarningList>
          </S.WarningBox>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Suggestion notice */}
            <S.SuggestionBox>
              💡 <strong>Suggestion:</strong> Rather than deleting permanently, you can temporarily <strong>deactivate your card</strong> instead, which preserves your data while locking active shares.
            </S.SuggestionBox>
            
            <S.WarningBox>
              <S.WarningTitle>🚨 Permanent Deletion Warnings:</S.WarningTitle>
              <S.WarningList>
                <li>Your ABHA number will be permanently deleted, along with all your demographic details.</li>
                <li>You will not be able to retrieve any information tagged to your ABHA number in the future.</li>
                <li>You will never be able to access ABDM applications or any health records over ABDM network with this deleted number.</li>
              </S.WarningList>
            </S.WarningBox>
          </div>
        )}

        {/* OTP Method Selector */}
        <S.ChannelGroup>
          <S.ChannelLabel>Send OTP Channel</S.ChannelLabel>
          <S.ChannelContainer>
            <S.ChannelRadioButton $selected={deactivateAuthMethod === 'aadhaar'}>
              <input 
                type="radio" 
                checked={deactivateAuthMethod === 'aadhaar'} 
                onChange={() => setDeactivateAuthMethod('aadhaar')} 
                style={{ display: 'none' }} 
              />
              Aadhaar Mobile
            </S.ChannelRadioButton>
            <S.ChannelRadioButton $selected={deactivateAuthMethod === 'abha'}>
              <input 
                type="radio" 
                checked={deactivateAuthMethod === 'abha'} 
                onChange={() => setDeactivateAuthMethod('abha')} 
                style={{ display: 'none' }} 
              />
              ABHA Mobile
            </S.ChannelRadioButton>
          </S.ChannelContainer>
        </S.ChannelGroup>

        {deactivateError && <S.ErrorText>{deactivateError}</S.ErrorText>}
        
        <S.SubmitButton onClick={handleDeactivateRequest} disabled={deactivateLoading}>
          {deactivateLoading ? 'Requesting OTP...' : deactivateOption === 'deactivate' ? 'Deactivate ABHA Card' : 'Delete Permanent'}
        </S.SubmitButton>
      </S.FormContainer>
    </S.Container>
  );
};
