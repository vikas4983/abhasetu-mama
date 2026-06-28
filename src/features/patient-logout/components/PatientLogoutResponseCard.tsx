/**
 * @file        PatientLogoutResponseCard.tsx
 * @description Displays ABDM logout API message and raw response for patients
 * @module      patient-logout
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

'use client';

import React from 'react';
import type { PatientLogoutResponse } from '../types/patient-logout.types';
import { PATIENT_LOGOUT_INVALID_CREDENTIALS_CODE } from '../constants/patient-logout.constants';

export interface PatientLogoutResponseCardProps {
  response: PatientLogoutResponse;
}

/**
 * @description Renders user-facing message and expandable API payload
 */
export default function PatientLogoutResponseCard({ response }: PatientLogoutResponseCardProps) {
  const isSuccess = response.status === 'success';
  const isInvalidCreds =
    response.status === 'error' && response.code === PATIENT_LOGOUT_INVALID_CREDENTIALS_CODE;

  const displayMessage =
    response.status === 'success'
      ? response.message || 'You have been logged out'
      : response.message;

  const timestamp =
    response.status === 'success' && response.timestamp ? response.timestamp : undefined;

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
        {isSuccess ? 'Logout successful' : isInvalidCreds ? 'Invalid credentials' : 'Logout failed'}
      </p>
      <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-primary)' }}>
        {displayMessage}
      </p>
      {response.status === 'error' && response.description && (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
          {response.description}
        </p>
      )}
      {timestamp && (
        <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
          Gateway time: {timestamp}
        </p>
      )}
      {response.status === 'error' && response.code && (
        <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
          Code: {response.code}
        </p>
      )}
      <details style={{ marginTop: '10px' }}>
        <summary style={{ fontSize: '11px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          View API response
        </summary>
        <pre
          style={{
            marginTop: '8px',
            fontSize: '10px',
            overflow: 'auto',
            maxHeight: '140px',
            padding: '8px',
            borderRadius: '6px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
          }}
        >
          {JSON.stringify(response.gatewayResponse ?? response, null, 2)}
        </pre>
      </details>
    </div>
  );
}
