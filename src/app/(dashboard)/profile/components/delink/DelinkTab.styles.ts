/**
 * @file        DelinkTab.styles.ts
 * @description Styled components for the Delink Tab Component.
 * @module      profile/components/delink
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

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const WarningBox = styled.div`
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.06);
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.15);
  font-size: 11.5px;
  color: var(--text-primary);
  line-height: 1.4;
`;

export const WarningText = styled.span`
  display: inline;
`;

export const ErrorText = styled.div`
  color: var(--danger);
  font-size: 11.5px;
  font-weight: 600;
  text-align: left;
`;

export const SubmitButton = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background: var(--danger);
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
