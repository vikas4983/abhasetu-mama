/**
 * @file        SetPasswordTab.styles.ts
 * @description Styled components for the Set Password Tab Component.
 * @module      profile/components/set_password
 * @layer       styles
 * @author      Platform Team
 * @created     2026-06-24
 */

import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;

  @media (max-width: 600px) {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    top: 0 !important;
    background: rgba(15, 23, 42, 0.6) !important;
    backdrop-filter: blur(8px) !important;
    z-index: 9995 !important;
    display: flex !important;
    align-items: flex-end !important;
    justify-content: center !important;
  }
`;

export const Card = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  width: 100%;
  padding: 24px;
  text-align: left;

  @media (max-width: 600px) {
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
    border-top-left-radius: 24px !important;
    border-top-right-radius: 24px !important;
    max-width: 100% !important;
    background: var(--bg-card) !important;
    animation: modal-slide-up 0.3s ease-out !important;
    box-shadow: 0 -10px 25px rgba(0,0,0,0.15) !important;
  }
`;

export const MobileHeader = styled.div`
  display: none;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
  margin-bottom: 16px;

  @media (max-width: 600px) {
    display: flex !important;
  }
`;

export const MobileHeaderTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: var(--text-primary);
`;

export const CloseButton = styled.button`
  background: transparent;
  border: 0;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const DesktopTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SuccessContainer = styled.div`
  text-align: center;
  padding: 20px 10px;
`;

export const SuccessIcon = styled.img`
  width: 48px;
  height: 48px;
  display: block;
  margin: 0 auto 12px;
`;

export const SuccessTitle = styled.h4`
  margin: 0 0 6px;
  font-weight: 800;
  color: var(--text-primary);
`;

export const SuccessDesc = styled.p`
  font-size: 11px;
  color: var(--text-muted);
  margin: 0;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.span`
  font-size: 11px;
  font-weight: bold;
  color: var(--text-primary);
`;

export const ChannelContainer = styled.div`
  display: flex;
  gap: 10px;
`;

export const ChannelLabel = styled.label<{ $selected: boolean }>`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: ${props => props.$selected ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)'};
  background: ${props => props.$selected ? 'rgba(20, 184, 166, 0.06)' : 'var(--bg-primary)'};
  cursor: pointer;
  font-size: 11.5px;
  font-weight: bold;
  text-align: center;
  color: var(--text-primary);
  transition: all 0.15s ease;
`;

export const InputWrapper = styled.div`
  position: relative;
`;

export const Input = styled.input<{ $error?: boolean; $valid?: boolean }>`
  width: 100%;
  padding: 10px 64px 10px 10px;
  border-radius: 8px;
  border: ${props => props.$error ? '2px solid var(--danger)' : props.$valid ? '2px solid var(--success)' : '1px solid var(--border-color)'};
  background: var(--bg-primary);
  color: var(--text-primary);
  box-shadow: ${props => props.$error ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none'};
  animation: ${props => props.$error ? 'otp-shake 0.4s ease' : 'none'};
  transition: all 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.$error ? 'var(--danger)' : 'var(--accent-teal)'};
  }
`;

export const InputControlsWrapper = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const VisibilityButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: flex;
  padding: 4px;
  cursor: pointer;
`;

export const ErrorText = styled.div`
  color: var(--danger);
  font-size: 11px;
  font-weight: 600;
  text-align: left;
`;

export const SubmitButton = styled.button`
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: var(--accent-teal);
  color: #ffffff !important;
  font-weight: 800;
  cursor: pointer;
  margin-top: 6px;
  transition: opacity 0.15s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;
