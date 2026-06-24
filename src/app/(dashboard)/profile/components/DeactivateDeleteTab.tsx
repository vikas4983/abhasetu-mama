/**
 * @file        DeactivateDeleteTab.tsx
 * @description Renders the 'Deactivate/Delete ABHA' tab.
 * @module      profile/components
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-24
 */

import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface DeactivateDeleteTabProps {
  deactivateOption: 'deactivate' | 'delete';
  setDeactivateOption: (opt: 'deactivate' | 'delete') => void;
  deactivateAuthMethod: 'aadhaar' | 'abha';
  setDeactivateAuthMethod: (method: 'aadhaar' | 'abha') => void;
  deactivateError: string;
  deactivateLoading: boolean;
  handleDeactivateRequest: () => Promise<void>;
}

/**
 * Component listing security caveats and option tabs for deletion or deactivation workflows.
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
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', textAlign: 'left' }}>
      <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldAlert style={{ color: 'var(--danger)', width: '16px', height: '16px' }} />
        <span>Deactivate or Delete ABHA</span>
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Option tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-color)' }}>
          <button type="button" onClick={() => setDeactivateOption('deactivate')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', background: deactivateOption === 'deactivate' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: deactivateOption === 'deactivate' ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
            Deactivate Card
          </button>
          <button type="button" onClick={() => setDeactivateOption('delete')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', background: deactivateOption === 'delete' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: deactivateOption === 'delete' ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
            Delete Permanently
          </button>
        </div>

        {/* Warnings List */}
        {deactivateOption === 'deactivate' ? (
          <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '11.5px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
            <strong style={{ display: 'block', color: 'var(--danger)', marginBottom: '6px' }}>⚠️ Temporary Deactivation Warnings:</strong>
            <ul style={{ margin: 0, paddingLeft: '14px' }}>
              <li>You will lose all access to the ABDM application temporarily.</li>
              <li>You will no longer be able to share your health records over ABDM.</li>
              <li>You will no longer be able to share health records with any Health Facility.</li>
            </ul>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Suggestion notice */}
            <div style={{ background: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.25)', padding: '10px 14px', borderRadius: '10px', fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
              💡 <strong>Suggestion:</strong> Rather than deleting permanently, you can temporarily <strong>deactivate your card</strong> instead, which preserves your data while locking active shares.
            </div>
            
            <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '11.5px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
              <strong style={{ display: 'block', color: 'var(--danger)', marginBottom: '6px' }}>🚨 Permanent Deletion Warnings:</strong>
              <ul style={{ margin: 0, paddingLeft: '14px' }}>
                <li>Your ABHA number will be permanently deleted, along with all your demographic details.</li>
                <li>You will not be able to retrieve any information tagged to your ABHA number in the future.</li>
                <li>You will never be able to access ABDM applications or any health records over ABDM network with this deleted number.</li>
              </ul>
            </div>
          </div>
        )}

        {/* OTP Method Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Send OTP Channel</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ flex: 1, padding: '8px', borderRadius: '8px', border: deactivateAuthMethod === 'aadhaar' ? '2px solid var(--danger)' : '1px solid var(--border-color)', background: deactivateAuthMethod === 'aadhaar' ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-primary)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>
              <input type="radio" checked={deactivateAuthMethod === 'aadhaar'} onChange={() => setDeactivateAuthMethod('aadhaar')} style={{ display: 'none' }} />
              Aadhaar Mobile
            </label>
            <label style={{ flex: 1, padding: '8px', borderRadius: '8px', border: deactivateAuthMethod === 'abha' ? '2px solid var(--danger)' : '1px solid var(--border-color)', background: deactivateAuthMethod === 'abha' ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-primary)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>
              <input type="radio" checked={deactivateAuthMethod === 'abha'} onChange={() => setDeactivateAuthMethod('abha')} style={{ display: 'none' }} />
              ABHA Mobile
            </label>
          </div>
        </div>

        {deactivateError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{deactivateError}</div>}
        
        <button onClick={handleDeactivateRequest} disabled={deactivateLoading} style={{ padding: '12px', border: 'none', borderRadius: '8px', background: 'var(--danger)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', width: 'fit-content' }}>
          {deactivateLoading ? 'Requesting OTP...' : deactivateOption === 'deactivate' ? 'Deactivate ABHA Card' : 'Delete Permanent'}
        </button>
      </div>
    </div>
  );
};
