/**
 * @file        PatientLogoutDialog.tsx
 * @description Patient logout confirmation — immediate local sign out with toast
 * @module      patient-logout
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { showToast } from '@/utils/toast';

export interface PatientLogoutDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

/**
 * @description Confirm → local logout + toast (no ABDM API on header logout)
 */
export default function PatientLogoutDialog({
  open,
  onClose,
  title = 'Confirm Sign Out',
  confirmLabel = 'Sign Out',
  cancelLabel = 'Cancel',
}: PatientLogoutDialogProps) {
  const { logout } = useAuth();

  if (!open) return null;

  const handleConfirm = () => {
    logout();
    showToast('You have been signed out');
    onClose();
  };

  return (
    <div
      className="logout-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-logout-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'grid',
        placeItems: 'end center',
        padding: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <style>{`
        @media (min-width: 640px) {
          .logout-modal-overlay { place-items: center !important; padding: 20px !important; }
        }
      `}</style>
      <div
        className="logout-modal-content"
        style={{
          width: '100%',
          maxWidth: '400px',
          borderRadius: '20px 20px 0 0',
          padding: 'clamp(16px, 4vw, 24px)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '72px',
            height: '72px',
            margin: '0 auto 16px',
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
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '8px',
              borderRadius: '50%',
              border: '2px solid rgba(239, 68, 68, 0.2)',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut style={{ width: '28px', height: '28px', color: '#ef4444' }} aria-hidden />
          </div>
        </div>

        <h3
          id="patient-logout-title"
          style={{
            fontSize: 'clamp(16px, 4vw, 18px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '8px',
            textAlign: 'center',
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          Are you sure you want to end your session on this device?
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            className="prefill-btn"
            style={{
              flex: 1,
              padding: '12px',
              minHeight: '44px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-primary)',
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="prefill-btn active"
            style={{
              flex: 1,
              padding: '12px',
              minHeight: '44px',
              borderRadius: '10px',
              background: 'var(--danger)',
              border: 'none',
              color: '#fff',
              fontWeight: 'bold',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
