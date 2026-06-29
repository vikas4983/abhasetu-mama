/**
 * @file        RefreshTokenPanel.tsx
 * @description UI to refresh ABHA profile JWT via R-token (GET request/token)
 * @module      abha-refresh-token
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

'use client';

import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { refreshAbhaProfileToken } from '../api/refresh-token.api';
import AccountActionResponseCard from '@/features/abha-account-lifecycle/shared/components/AccountActionResponseCard';
import type { AccountActionGatewayResponse } from '@/features/abha-account-lifecycle/shared/types/account-action.types';

export default function RefreshTokenPanel() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AccountActionGatewayResponse | null>(null);

  const handleRefresh = async () => {
    setLoading(true);
    setResponse(null);
    const data = await refreshAbhaProfileToken();
    setResponse({
      status: data.status,
      message: data.message ?? (data.status === 'success' ? 'Token refreshed' : 'Refresh failed'),
      gatewayResponse: data.gatewayResponse ?? (data as unknown as Record<string, unknown>),
    });
    setLoading(false);
  };

  return (
    <div
      style={{
        marginTop: '16px',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        textAlign: 'left',
      }}
    >
      <h4
        style={{
          margin: '0 0 8px',
          fontSize: '14px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <KeyRound style={{ width: '16px', height: '16px', color: 'var(--accent-teal)' }} />
        Refresh ABHA session token
      </h4>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
        Calls ABDM <code>GET /api/v3/profile/account/request/token</code> with your refresh token
        (R-token). Use when the profile X-token is about to expire.
      </p>
      <button
        type="button"
        onClick={() => void handleRefresh()}
        disabled={loading}
        style={{
          padding: '8px 14px',
          borderRadius: '8px',
          border: 'none',
          background: 'var(--accent-teal)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '12px',
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Refreshing…' : 'Refresh token'}
      </button>
      {response && (
        <div style={{ marginTop: '12px' }}>
          <AccountActionResponseCard
            response={response}
            successTitle="Token refreshed"
            errorTitle="Refresh failed"
          />
        </div>
      )}
    </div>
  );
}
