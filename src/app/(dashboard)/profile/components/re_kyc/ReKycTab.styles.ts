/**
 * @file        ReKycTab.styles.ts
 * @description Styled components for the Re-KYC Tab Component.
 * @module      profile/components/re_kyc
 * @layer       styles
 * @author      Platform Team
 * @created     2026-06-24
 */

import styled from 'styled-components';

export const Container = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  text-align: left;
`;

export const Title = styled.h4`
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

export const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const Description = styled.p`
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
`;

export const ErrorText = styled.div`
  color: var(--danger);
  font-size: 11.5px;
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
  width: fit-content;
  transition: opacity 0.15s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;
