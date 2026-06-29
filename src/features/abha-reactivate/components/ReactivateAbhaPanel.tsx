/**
 * @file        ReactivateAbhaPanel.tsx
 * @description Placeholder for ABHA reactivation (when account is deactivated)
 * @module      abha-reactivate
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function ReactivateAbhaPanel() {
  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'left',
      }}
    >
      <h3
        style={{
          margin: '0 0 12px',
          fontSize: '16px',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <RefreshCw style={{ width: '18px', height: '18px', color: 'var(--accent-teal)' }} />
        Reactivate ABHA
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        This option is shown when your ABHA is temporarily deactivated or deleted. Reactivation uses
        the same phased flow (Aadhaar OTP, ABHA OTP, or password) against ABDM{' '}
        <code style={{ fontSize: '11px' }}>/api/v3/profile/account/request/otp</code> with scope{' '}
        <code style={{ fontSize: '11px' }}>reactivate</code>.
      </p>
      <p
        style={{
          marginTop: '16px',
          padding: '12px',
          borderRadius: '8px',
          background: 'rgba(20,184,166,0.08)',
          border: '1px solid rgba(20,184,166,0.2)',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}
      >
        Backend route and wizard will be added in the next slice — isolated under{' '}
        <code>src/features/abha-reactivate/</code>.
      </p>
    </div>
  );
}
