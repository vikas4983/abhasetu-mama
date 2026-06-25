/**
 * @file        EditProfileTab.styles.ts
 * @description Styled components for the Edit Profile Tab Component.
 * @module      profile/components/edit_profile
 * @layer       styles
 * @author      Platform Team
 * @created     2026-06-24
 */

import styled, { keyframes } from 'styled-components';

export const EditProfileContainer = styled.div`
  width: 100%;

  @media (max-width: 900px) {
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

export const EditProfileCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
  width: 100%;

  @media (max-width: 900px) {
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
    border-top-left-radius: 24px !important;
    border-top-right-radius: 24px !important;
    max-width: 100% !important;
    background: var(--bg-card) !important;
    padding: 24px !important;
    animation: modal-slide-up 0.3s ease-out !important;
    box-shadow: 0 -10px 25px rgba(0,0,0,0.15) !important;
    max-height: 85vh !important;
    overflow-y: auto !important;
  }
`;

export const MobileHeader = styled.div`
  display: none;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
  margin-bottom: 8px;

  @media (max-width: 900px) {
    display: flex !important;
  }
`;

export const MobileHeaderTitle = styled.h3`
  margin: 0;
  fontSize: 15px;
  fontWeight: 800;
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

export const SubTabContainer = styled.div`
  display: flex;
  gap: 4px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 4px;
  width: 100%;
  max-width: 440px;
  overflow-x: auto;
`;

export const SubTabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: ${props => props.$active ? 'var(--accent-teal)' : 'transparent'};
  color: ${props => props.$active ? '#ffffff !important' : 'var(--text-secondary)'};
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.$active ? 'var(--accent-teal)' : 'rgba(20, 184, 166, 0.08)'};
  }
`;

export const SubTabSection = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  animation: fadeIn 0.25s ease;
`;

export const SectionTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const InputLabel = styled.span`
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
`;

export const ActiveInputLabel = styled(InputLabel)`
  color: var(--text-primary);
`;

export const CurrentInput = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-muted);
  cursor: not-allowed;
  font-size: 13px;
`;

export const MobileCurrentInput = styled(CurrentInput)`
  letter-spacing: 2px;
`;

export const InputWrapper = styled.div`
  position: relative;
`;

export const NewInput = styled.input<{ $error?: boolean; $valid?: boolean }>`
  width: 100%;
  padding: 10px 36px 10px 10px;
  border-radius: 8px;
  border: ${props => props.$error ? '2px solid var(--danger)' : props.$valid ? '2px solid var(--success)' : '1px solid var(--border-color)'};
  background: var(--bg-primary);
  color: var(--text-primary);
  box-shadow: ${props => props.$error ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none'};
  animation: ${props => props.$error ? 'otp-shake 0.4s ease' : 'none'};
  font-size: 13px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.$error ? 'var(--danger)' : 'var(--accent-teal)'};
    box-shadow: ${props => props.$error ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : '0 0 0 3px rgba(20, 184, 166, 0.15)'};
  }
`;

export const MobileNewInput = styled(NewInput)`
  letter-spacing: 2px;
`;

export const ErrorText = styled.div`
  color: var(--danger);
  font-size: 11.5px;
  font-weight: 600;
  text-align: left;
`;

export const SubmitButton = styled.button`
  width: fit-content;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: var(--accent-teal);
  color: #ffffff !important;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

export const EmailSentBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
  max-width: 400px;
  margin: 20px auto 0 auto;
  padding: 16px;
  background: rgba(20, 184, 166, 0.04);
  border-radius: 12px;
  border: 1px dashed var(--accent-teal);
`;

export const EmailSentIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(20, 184, 166, 0.1);
  color: var(--accent-teal);
  display: grid;
  place-items: center;
  margin: 0 auto;
`;

export const EmailSentTitle = styled.h5`
  margin: 4px 0 2px;
  font-weight: 800;
  color: var(--text-primary);
`;

export const EmailSentDesc = styled.p`
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0;
`;

export const PhotoForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
`;

export const PhotoPreviewCard = styled.div<{ $hasPreview: boolean }>`
  position: relative;
  width: 140px;
  height: 175px;
  border-radius: 12px;
  border: ${props => props.$hasPreview ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)'};
  overflow: visible;
  background: var(--bg-primary);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
`;

export const PhotoImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
`;

export const PhotoPreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const PhotoEditButton = styled.button`
  position: absolute;
  bottom: -8px;
  right: -8px;
  background: #2563eb;
  border: 2px solid #ffffff;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ffffff;
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.25);
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: #1d4ed8;
    transform: scale(1.05);
  }
`;

export const PhotoInstruction = styled.p`
  font-size: 11px;
  color: var(--text-secondary);
  text-align: center;
  max-width: 300px;
  line-height: 1.4;
  margin: 0;
`;

export const PhotoCroppedBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  animation: fadeIn 0.25s ease;
`;

export const PhotoCroppedText = styled.span`
  font-size: 11.5px;
  color: var(--accent-teal);
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const PhotoCroppedActions = styled.div`
  display: flex;
  gap: 12px;
`;

export const CancelButton = styled.button`
  padding: 10px 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-weight: 700;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s ease;

  &:hover {
    background: var(--bg-secondary);
  }
`;

export const SaveButton = styled.button`
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: var(--accent-teal);
  color: #ffffff !important;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.2);
  transition: all 0.15s ease;

  &:hover {
    background: #0f766e;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;
