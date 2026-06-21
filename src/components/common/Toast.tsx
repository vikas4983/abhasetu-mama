/**
 * @file        Toast.tsx
 * @description Reusable React wrapper/controller for the DOM-based toast system.
 * @module      components/common
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-21
 * @modified    2026-06-21
 */

'use client';

import React from 'react';
import { showToast } from '../../utils/toast';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ToastProps {
  /** Static preview mode (displays the notification block statically on screen) */
  isPreview?: boolean;
  /** If in preview mode, specifies the message text */
  message?: string;
  /** If in preview mode, specifies if it is an error type toast */
  isError?: boolean;
}

/**
 * @description Toast component triggers showToast dynamically, or renders a static inline notification card for UI documentation.
 */
export default function Toast({ isPreview = false, message = 'Success action completed!', isError = false }: ToastProps) {
  if (isPreview) {
    // Static visual mockup for Storybook documentation
    const borderVal = isError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(20, 184, 166, 0.35)';
    return (
      <div
        className="setu-toast-preview"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'var(--bg-card, #090f17)',
          border: `1px solid ${borderVal}`,
          boxShadow: 'var(--surface-shadow, 0 10px 30px rgba(0,0,0,0.5))',
          color: 'var(--text-primary, #ffffff)',
          fontSize: '12px',
          fontWeight: 600,
          maxWidth: '350px',
        }}
      >
        {isError ? (
          <XCircle style={{ width: '16px', height: '16px', color: '#ef4444', flexShrink: 0 }} />
        ) : (
          <CheckCircle2 style={{ width: '16px', height: '16px', color: 'var(--accent-teal, #14b8a6)', flexShrink: 0 }} />
        )}
        <span>{message}</span>
      </div>
    );
  }

  // Interactive controls to trigger real DOM toasts in Storybook or App
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '16px', border: '1px dashed var(--border-color)', borderRadius: '12px', background: 'var(--bg-secondary)', maxWidth: '400px' }}>
      <button
        onClick={() => showToast('Action completed successfully!', false)}
        style={{
          flex: 1,
          padding: '10px 16px',
          background: 'rgba(20, 184, 166, 0.1)',
          border: '1px solid var(--accent-teal)',
          color: 'var(--accent-teal)',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        Trigger Success Toast
      </button>
      <button
        onClick={() => showToast('Verification failed. Please try again.', true)}
        style={{
          flex: 1,
          padding: '10px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          color: '#ef4444',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        Trigger Error Toast
      </button>
    </div>
  );
}
