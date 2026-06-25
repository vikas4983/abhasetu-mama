/**
 * @file        SetPasswordTab.tsx
 * @description Renders the 'Set Password' tab which allows users to set a transaction password.
 * @module      profile/components/set_password
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-24
 * @modified    2026-06-24
 */

import React from 'react';
import { Key, Eye, EyeOff, X } from 'lucide-react';
import { SetPasswordTabProps } from './SetPasswordTab.types';
import * as S from './SetPasswordTab.styles';

/**
 * @description Component providing validation logic and otp/password forms to configure transaction security pins.
 * @param {SetPasswordTabProps} props - Component properties
 * @returns {React.ReactElement} The rendered component
 */
export const SetPasswordTab: React.FC<SetPasswordTabProps> = ({
  t,
  setActiveTab,
  passSuccess,
  passAuthMethod,
  setPassAuthMethod,
  passwordForm,
  handleSetPasswordSubmit,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passError,
  passLoading,
}) => {
  return (
    <S.Container>
      <S.Card>
        {/* Mobile close header */}
        <S.MobileHeader>
          <S.MobileHeaderTitle>
            {t('Set Password')}
          </S.MobileHeaderTitle>
          <S.CloseButton onClick={() => setActiveTab('my_profile')}>
            <X style={{ width: '20px', height: '20px' }} />
          </S.CloseButton>
        </S.MobileHeader>

        <S.DesktopTitle>
          <Key style={{ color: 'var(--accent-teal)', width: '16px', height: '16px' }} />
          <span>Set Security Password</span>
        </S.DesktopTitle>

        {passSuccess ? (
          <S.SuccessContainer>
            <S.SuccessIcon src="/assets/check_icon.png" alt="Verified" />
            <S.SuccessTitle>Password Set Successfully</S.SuccessTitle>
            <S.SuccessDesc>
              You can now use this password alongside your ABHA address to access clinical dashboards directly.
            </S.SuccessDesc>
          </S.SuccessContainer>
        ) : (
          <S.Form onSubmit={passwordForm.handleSubmit(handleSetPasswordSubmit)}>
            <S.FormGroup>
              <S.Label>Verification Channel</S.Label>
              <S.ChannelContainer>
                <S.ChannelLabel $selected={passAuthMethod === 'aadhaar'}>
                  <input 
                    type="radio" 
                    checked={passAuthMethod === 'aadhaar'} 
                    onChange={() => setPassAuthMethod('aadhaar')} 
                    style={{ display: 'none' }} 
                  />
                  Aadhaar Linked Mobile
                </S.ChannelLabel>
                <S.ChannelLabel $selected={passAuthMethod === 'abha'}>
                  <input 
                    type="radio" 
                    checked={passAuthMethod === 'abha'} 
                    onChange={() => setPassAuthMethod('abha')} 
                    style={{ display: 'none' }} 
                  />
                  ABHA Linked Mobile
                </S.ChannelLabel>
              </S.ChannelContainer>
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>New Password</S.Label>
              <S.InputWrapper>
                <S.Input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Minimum 8 characters" 
                  $error={!!passwordForm.formState.errors.newPassword}
                  $valid={(passwordForm.watch('newPassword') || '').length >= 8 && !passwordForm.formState.errors.newPassword}
                  {...passwordForm.register('newPassword', {
                    required: t('Password is required.'),
                    minLength: { value: 8, message: t('Password must be at least 8 characters long.') }
                  })}
                />
                <S.InputControlsWrapper>
                  {(passwordForm.watch('newPassword') || '').length >= 8 && !passwordForm.formState.errors.newPassword && (
                    <img 
                      src="/assets/check_icon.png" 
                      style={{ width: '18px', height: '18px' }} 
                      alt="Verified" 
                    />
                  )}
                  <S.VisibilityButton type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                  </S.VisibilityButton>
                </S.InputControlsWrapper>
              </S.InputWrapper>
              {passwordForm.formState.errors.newPassword && (
                <S.ErrorText>{passwordForm.formState.errors.newPassword.message as string}</S.ErrorText>
              )}
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>Confirm Password</S.Label>
              <S.InputWrapper>
                <S.Input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  placeholder="Confirm your password" 
                  $error={!!passwordForm.formState.errors.confirmPassword}
                  $valid={(passwordForm.watch('confirmPassword') || '').length >= 8 && passwordForm.watch('confirmPassword') === passwordForm.watch('newPassword') && !passwordForm.formState.errors.confirmPassword}
                  {...passwordForm.register('confirmPassword', {
                    required: t('Please confirm your password.'),
                    validate: (val: string) => val === passwordForm.watch('newPassword') || t('Passwords do not match.')
                  })}
                />
                <S.InputControlsWrapper>
                  {(passwordForm.watch('confirmPassword') || '').length >= 8 && passwordForm.watch('confirmPassword') === passwordForm.watch('newPassword') && !passwordForm.formState.errors.confirmPassword && (
                    <img 
                      src="/assets/check_icon.png" 
                      style={{ width: '18px', height: '18px' }} 
                      alt="Verified" 
                    />
                  )}
                  <S.VisibilityButton type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                  </S.VisibilityButton>
                </S.InputControlsWrapper>
              </S.InputWrapper>
              {passwordForm.formState.errors.confirmPassword && (
                <S.ErrorText>{passwordForm.formState.errors.confirmPassword.message as string}</S.ErrorText>
              )}
            </S.FormGroup>

            {passError && <S.ErrorText>{passError}</S.ErrorText>}
            
            <S.SubmitButton type="submit" disabled={passLoading}>
              {passLoading ? 'Requesting OTP...' : 'Send Verification OTP'}
            </S.SubmitButton>
          </S.Form>
        )}
      </S.Card>
    </S.Container>
  );
};
