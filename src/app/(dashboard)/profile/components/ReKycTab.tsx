/**
 * @file        ReKycTab.tsx
 * @description Renders the 'Re-KYC Verification' tab.
 * @module      profile/components
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-24
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';

interface ReKycTabProps {
  reKycSuccess: boolean;
  abhaProfile: any;
  reKycError: string;
  handleRequestReKycOtp: () => Promise<void>;
  reKycLoading: boolean;
}

/**
 * Component providing actions to start standard Aadhaar Re-KYC verification.
 */
export const ReKycTab: React.FC<ReKycTabProps> = ({
  reKycSuccess,
  abhaProfile,
  reKycError,
  handleRequestReKycOtp,
  reKycLoading,
}) => {
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', textAlign: 'left' }}>
      <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <RefreshCw style={{ color: 'var(--accent-teal)', width: '16px', height: '16px' }} />
        <span>Re-KYC Verification</span>
      </h4>

      {reKycSuccess ? (
        <div style={{ textAlign: 'center', padding: '20px 10px' }}>
          <img 
            src="/assets/check_icon.png" 
            style={{ width: '48px', height: '48px', display: 'block', margin: '0 auto 12px' }} 
            alt="Verified" 
          />
          <h4 style={{ margin: '0 0 6px', fontWeight: 800 }}>Re-KYC Complete</h4>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>UIDAI verification resolved. Your demographic verification status is now updated to fully compliant.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
            Re-KYC verifies your demographic identity against the central UIDAI registry. We will send an OTP confirmation to your registered mobile ending with <strong>******{abhaProfile.mobile?.slice(-4)}</strong>.
          </p>
          {reKycError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{reKycError}</div>}
          <button onClick={handleRequestReKycOtp} disabled={reKycLoading} style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', width: 'fit-content' }}>
            {reKycLoading ? 'Requesting OTP...' : 'Send Re-KYC verification OTP'}
          </button>
        </div>
      )}
    </div>
  );
};
