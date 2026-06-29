/**
 * @file        AccountActionResponseCard.tsx
 * @description Displays ABDM account action API response (delete/deactivate/reactivate)
 * @module      abha-account-lifecycle/shared
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

'use client';

import React from 'react';
import type { AccountActionGatewayResponse } from '../types/account-action.types';
import { ABHA_INVALID_CREDENTIALS_CODE } from '../constants/account-action.constants';

export interface AccountActionResponseCardProps {
  response: AccountActionGatewayResponse;
  successTitle?: string;
  errorTitle?: string;
}

export default function AccountActionResponseCard({
  response,
  successTitle = 'Request successful',
  errorTitle = 'Request failed',
}: AccountActionResponseCardProps) {
  const isSuccess = response.status === 'success';
  const isInvalidCreds =
    response.status === 'error' && response.code === ABHA_INVALID_CREDENTIALS_CODE;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        textAlign: 'left',
        borderRadius: '10px',
        border: `1px solid ${isSuccess ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
        background: isSuccess ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
        padding: '12px 14px',
        marginBottom: '16px',
      }}
    >
      <p
        style={{
          margin: 0,
          fontWeight: 700,
          fontSize: '14px',
          color: isSuccess ? '#16a34a' : '#dc2626',
        }}
      >
        {isSuccess ? successTitle : isInvalidCreds ? 'Invalid credentials' : errorTitle}
      </p>
      {response.message && (
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-primary)' }}>
          {response.message}
        </p>
      )}
    </div>
  );
}
