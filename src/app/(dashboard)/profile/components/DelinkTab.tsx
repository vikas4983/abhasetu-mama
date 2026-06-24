/**
 * @file        DelinkTab.tsx
 * @description Renders the 'Delink Mobile Number' tab.
 * @module      profile/components
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-24
 */

import React from 'react';
import { UserMinus } from 'lucide-react';

interface DelinkTabProps {
  delinkError: string;
  handleRequestDelinkOtp: () => Promise<void>;
  delinkLoading: boolean;
}

/**
 * Component providing mobile number delinking warnings and triggers.
 */
export const DelinkTab: React.FC<DelinkTabProps> = ({
  delinkError,
  handleRequestDelinkOtp,
  delinkLoading,
}) => {
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', textAlign: 'left' }}>
      <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <UserMinus style={{ color: 'var(--danger)', width: '16px', height: '16px' }} />
        <span>Delink Mobile Number</span>
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '11.5px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
          <strong>⚠️ Delink Warning:</strong> If this ABHA number does not belong to you or your family members, you can opt to delink your mobile number, which will remove it from the ABHA record.
        </div>
        {delinkError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{delinkError}</div>}
        <button onClick={handleRequestDelinkOtp} disabled={delinkLoading} style={{ padding: '12px 20px', border: 'none', borderRadius: '8px', background: 'var(--danger)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', width: 'fit-content' }}>
          {delinkLoading ? 'Requesting OTP...' : 'Delink Mobile Number'}
        </button>
      </div>
    </div>
  );
};
