/**
 * @file        MyProfileTab.styles.ts
 * @description Styled components for the My Profile Tab Component.
 * @module      profile/components/my_profile
 * @layer       styles
 * @author      Platform Team
 * @created     2026-06-24
 */

import styled from 'styled-components';

export const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  width: 100%;
`;

export const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
  max-width: 680px;
  margin-bottom: 8px;
`;

export const WelcomeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 580px;
  margin-bottom: 4px;
  padding: 0 4px;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 480px) {
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    justify-content: space-between !important;
    align-items: center !important;
    gap: 8px !important;
  }
`;

export const WelcomeTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 14px !important;
  }
`;

export const WelcomeLinksContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 480px) {
    gap: 8px !important;
    flex-wrap: nowrap !important;
  }
`;

export const ActionLinkButton = styled.button`
  background: none;
  border: none;
  padding: 4px 0;
  color: #c2410c;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;

  @media (max-width: 480px) {
    padding: 8px !important;
    background: rgba(194, 65, 12, 0.08) !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;

    span {
      display: none !important;
    }
  }
`;

export const CardCaptureWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
`;

export const CollapsibleCard = styled.div`
  width: 100%;
  max-width: 680px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
`;

export const ToggleButton = styled.button`
  width: 100%;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  color: var(--text-primary);
`;

export const ToggleLabelText = styled.span`
  font-weight: 700;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const DemographicsContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 16px 16px 16px;
  font-size: 11px;
  text-align: left;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
`;

export const FieldLabel = styled.span`
  color: var(--text-muted);
  display: block;
  font-size: 9px;
  text-transform: uppercase;
  font-weight: 700;
`;

export const FieldValue = styled.span`
  font-weight: 600;
  color: var(--text-primary);
`;

import { RefreshCw } from 'lucide-react';
import { keyframes } from 'styled-components';

export const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 8px 16px;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 12px;
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  width: 100%;
`;

export const ErrorContainer = styled.div`
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid #ef4444;
  border-radius: 16px;
  padding: 20px;
  color: #ef4444;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  text-align: left;
`;

export const ErrorTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ErrorButton = styled.button`
  align-self: flex-start;
  padding: 8px 16px;
  background: #ef4444;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
`;

export const InfoSection = styled.div`
  width: 100%;
  max-width: 680px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  text-align: left;
  margin-top: 8px;
`;

export const InfoSectionTitle = styled.h3`
  font-size: 13px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 10px 0;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 6px;
`;

export const GridLabel = styled.span`
  color: var(--text-muted);
  display: block;
  font-size: 9px;
  text-transform: uppercase;
  font-weight: 700;
`;

export const GridValueFlex = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 11.5px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
`;

export const GridValueBlock = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 11.5px;
  display: block;
  margin-top: 2px;
`;

export const GridValueLineHeight = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 11.5px;
  display: block;
  line-height: 1.4;
  margin-top: 2px;
`;

export const GridValueItalic = styled.span`
  display: block;
  color: var(--text-muted);
  font-size: 10.5px;
  font-style: italic;
  margin-top: 1px;
  font-weight: 500;
`;

export const GridValueSubText = styled.span`
  display: block;
  color: var(--text-muted);
  font-size: 10.5px;
  margin-top: 1px;
`;

export const GridStatusValue = styled.span<{ $isActive: boolean }>`
  font-weight: 700;
  color: ${props => props.$isActive ? 'var(--accent-teal)' : 'var(--text-primary)'};
  font-size: 11.5px;
  display: block;
  margin-top: 2px;
`;

export const PhotosSection = styled.div`
  margin-top: 10px;
  border-top: 1px solid var(--border-color);
  padding-top: 8px;
`;

export const PhotosFlex = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

export const PhotoItemCard = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 4px 8px 4px 4px;
`;

export const PhotoThumbnail = styled.div`
  width: 40px;
  height: 50px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  flex-shrink: 0;
`;

export const PhotoItemTextContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const PhotoItemLabel = styled.span`
  font-size: 8.5px;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 700;
`;

export const PhotoItemName = styled.span`
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-primary);
`;

export const AuthMethodsSection = styled.div`
  margin-top: 10px;
  border-top: 1px solid var(--border-color);
  padding-top: 8px;
`;

export const AuthMethodsFlex = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const AuthMethodBadge = styled.span`
  padding: 2.5px 6px;
  background: rgba(20, 184, 166, 0.06);
  border: 1px solid rgba(20, 184, 166, 0.3);
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--accent-teal);
`;

export const Spinner = styled(RefreshCw)<{ $animate: boolean }>`
  width: 14px;
  height: 14px;
  animation: ${props => props.$animate ? spin : 'none'} 1s linear infinite;
`;

export const SpinnerLarge = styled(RefreshCw)`
  width: 32px;
  height: 32px;
  color: var(--accent-teal);
  animation: ${spin} 1s linear infinite;
`;

