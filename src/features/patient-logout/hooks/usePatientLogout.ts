/**
 * @file        usePatientLogout.ts
 * @description Hook — ABDM profile logout then local session clear
 * @module      patient-logout
 * @layer       hook
 * @author      Platform Team
 * @created     2026-06-26
 */

'use client';

import { useCallback, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { requestPatientAbhaLogout } from '../api/patient-logout.api';
import type {
  PatientLogoutDialogStep,
  PatientLogoutResponse,
} from '../types/patient-logout.types';

/**
 * @description Orchestrates ABDM logout API + local AuthProvider logout
 */
export function usePatientLogout() {
  const { logout, currentUser } = useAuth();
  const [step, setStep] = useState<PatientLogoutDialogStep>('confirm');
  const [response, setResponse] = useState<PatientLogoutResponse | null>(null);

  const isPatient = currentUser?.role === 'patient';

  const reset = useCallback(() => {
    setStep('confirm');
    setResponse(null);
  }, []);

  /**
   * @description Call ABDM logout via BFF; always returns gateway-shaped payload
   */
  const executeAbdmLogout = useCallback(async (): Promise<PatientLogoutResponse> => {
    setStep('loading');
    try {
      const data = await requestPatientAbhaLogout();
      setResponse(data);
      setStep('result');
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Logout request failed';
      const fallback: PatientLogoutResponse = {
        status: 'error',
        message,
        description: 'Network or gateway error while calling profile logout.',
      };
      setResponse(fallback);
      setStep('result');
      return fallback;
    }
  }, []);

  /** @description Clear local session after user acknowledges API result */
  const finishLocalLogout = useCallback(() => {
    logout();
    reset();
  }, [logout, reset]);

  return {
    isPatient,
    step,
    response,
    reset,
    executeAbdmLogout,
    finishLocalLogout,
  };
}
