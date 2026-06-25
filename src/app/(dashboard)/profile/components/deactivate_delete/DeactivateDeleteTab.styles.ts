/**
 * @file        DeactivateDeleteTab.styles.ts
 * @description Styled components for the Deactivate/Delete Tab Component.
 * @module      profile/components/deactivate_delete
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

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const OptionTabContainer = styled.div`
  display: flex;
  background: var(--bg-primary);
  border-radius: 10px;
  padding: 4px;
  border: 1px solid var(--border-color);
`;

export const OptionTabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: ${props => props.$active ? 'rgba(239, 68, 68, 0.1)' : 'transparent'};
  color: ${props => props.$active ? 'var(--danger)' : 'var(--text-secondary)'};
  font-weight: bold;
  font-size: 11.5px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.$active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(15, 23, 42, 0.04)'};
  }
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

export const WarningTitle = styled.strong`
  display: block;
  color: var(--danger);
  margin-bottom: 6px;
`;

export const WarningList = styled.ul`
  margin: 0;
  padding-left: 14px;
`;

export const SuggestionBox = styled.div`
  background: rgba(20, 184, 166, 0.08);
  border: 1px solid rgba(20, 184, 166, 0.25);
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 11.5px;
  color: var(--text-secondary);
  line-height: 1.3;
`;

export const ChannelGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const ChannelLabel = styled.span`
  font-size: 11px;
  font-weight: bold;
  color: var(--text-primary);
`;

export const ChannelContainer = styled.div`
  display: flex;
  gap: 10px;
`;

export const ChannelRadioButton = styled.label<{ $selected: boolean }>`
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  border: ${props => props.$selected ? '2px solid var(--danger)' : '1px solid var(--border-color)'};
  background: ${props => props.$selected ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-primary)'};
  cursor: pointer;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  color: var(--text-primary);
  transition: all 0.15s ease;
`;

export const ErrorText = styled.div`
  color: var(--danger);
  font-size: 11.5px;
  font-weight: 600;
  text-align: left;
`;

export const SubmitButton = styled.button`
  padding: 12px;
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
