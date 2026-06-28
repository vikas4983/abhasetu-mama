/**
 * @file        PatientLogoutDialog.tsx
 * @description Patient-only logout dialog with ABDM API call and response display
 * @module      patient-logout
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

'use client';

import React, { useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { usePatientLogout } from '../hooks/usePatientLogout';
import PatientLogoutResponseCard from './PatientLogoutResponseCard';

export interface PatientLogoutDialogProps {
  open: boolean;
  onClose: () => void;
  /** When false, skips ABDM API and only clears local session (non-patient fallback) */
  useAbdmLogout?: boolean;
  title?: string;
  confirmLabel?: string;
}

/**
 * @description Modal: confirm → ABDM logout → show gateway message → local sign out
 */
export default function PatientLogoutDialog({
  open,
  onClose,
  useAbdmLogout = true,
  title = 'Confirm Sign Out',
  confirmLabel = 'Sign Out',
}: PatientLogoutDialogProps) {
  const { step, response, reset, executeAbdmLogout, finishLocalLogout } = usePatientLogout();

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  if (!open) return null;

  const handleConfirm = async () => {
    if (useAbdmLogout) {
      await executeAbdmLogout();
    } else {
      finishLocalLogout();
      onClose();
    }
  };

  const handleDone = () => {
    finishLocalLogout();
    onClose();
  };

  return (
    <div
      className="logout-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-logout-title"
    >
      <div className="logout-modal-content">
        <div
          style={{
            position: 'relative',
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px dashed var(--accent-teal)',
              animation: step === 'loading' ? 'spin 1s linear infinite' : 'spin 12s linear infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              right: '8px',
              bottom: '8px',
              borderRadius: '50%',
              border: '2px solid rgba(239, 68, 68, 0.2)',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut style={{ width: '32px', height: '32px', color: '#ef4444' }} aria-hidden />
          </div>
        </div>

        <h3
          id="patient-logout-title"
          style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}
        >
          {step === 'loading' ? 'Signing out…' : step === 'result' ? 'Logout response' : title}
        </h3>

        {step === 'confirm' && (
          <p
            style={{
              fontSize: '12.5px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              marginBottom: '24px',
            }}
          >
            Your ABHA session will be ended on the national health exchange (ABDM). You will need to
            verify again to access health records.
          </p>
        )}

        {step === 'loading' && (
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Calling ABDM profile logout…
          </p>
        )}

        {step === 'result' && response && <PatientLogoutResponseCard response={response} />}

        <div style={{ display: 'flex', gap: '12px' }}>
          {step === 'confirm' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="prefill-btn"
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="prefill-btn active"
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'var(--danger)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 'bold',
                }}
              >
                {confirmLabel}
              </button>
            </>
          )}
          {step === 'loading' && (
            <button type="button" disabled className="prefill-btn" style={{ flex: 1, padding: '10px' }}>
              Please wait…
            </button>
          )}
          {step === 'result' && (
            <button
              type="button"
              onClick={handleDone}
              className="prefill-btn active"
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                background: 'var(--accent-teal)',
                border: 'none',
                color: '#fff',
                fontWeight: 'bold',
              }}
            >
              Close and return to login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
