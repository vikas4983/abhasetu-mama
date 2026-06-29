/**
 * @file        DeleteAbhaPanel.tsx
 * @description Profile tab — opens delete ABHA modal wizard (real API only)
 * @module      abha-delete
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import AccountActionWizardModal from '@/features/abha-account-lifecycle/shared/components/AccountActionWizardModal';
import { ABHA_DELETE_WARNINGS } from '@/features/abha-account-lifecycle/shared/constants/account-action.constants';
import type { AccountActionWizardConfig } from '@/features/abha-account-lifecycle/shared/types/account-action.types';
import { useAuth } from '@/providers/AuthProvider';
import { showToast } from '@/utils/toast';
import {
  requestDeleteAbhaOtp,
  verifyDeleteAbhaOtp,
  verifyDeleteAbhaPassword,
} from '../api/delete-abha.api';

export interface DeleteAbhaPanelProps {
  abhaNumber: string;
}

export default function DeleteAbhaPanel({ abhaNumber }: DeleteAbhaPanelProps) {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setOpen(true);
  }, []);

  const config = useMemo<AccountActionWizardConfig>(
    () => ({
      kind: 'delete',
      title: 'Delete ABHA (Permanently)',
      warnings: ABHA_DELETE_WARNINGS,
      surveyTitle:
        "Please let us know why you're deleting your ABHA number and help us improve the ABDM experience.",
      abhaNumber,
      requestOtp: requestDeleteAbhaOtp,
      verifyOtp: verifyDeleteAbhaOtp,
      verifyPassword: verifyDeleteAbhaPassword,
      onComplete: (message) => {
        showToast(message);
        logout();
        router.push('/login');
      },
    }),
    [abhaNumber, logout, router],
  );

  return (
    <>
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: 'clamp(16px, 4vw, 20px)',
          textAlign: 'left',
        }}
      >
        <h3
          style={{
            margin: '0 0 8px',
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Trash2 style={{ width: '18px', height: '18px', color: 'var(--danger)' }} aria-hidden />
          Delete ABHA permanently
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
          This action cannot be undone. You will complete a guided verification flow with OTP or
          password using live ABDM gateway responses.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            width: '100%',
            minHeight: '44px',
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--danger)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Start delete process
        </button>
      </div>
      <AccountActionWizardModal open={open} onClose={() => setOpen(false)} config={config} />
    </>
  );
}
