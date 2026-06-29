/**
 * @file        account-action.types.ts
 * @description Types for ABHA account lifecycle wizards
 * @module      abha-account-lifecycle/shared
 * @layer       types
 * @author      Platform Team
 * @created     2026-06-26
 */

import type { AbhaAuthChannel } from '../constants/account-action.constants';

export type AccountActionKind = 'delete' | 'deactivate' | 'reactivate';

export type AccountActionWizardStep =
  | 'warnings'
  | 'survey'
  | 'auth-method'
  | 'send-otp'
  | 'otp'
  | 'password'
  | 'loading'
  | 'result';

export interface AccountActionGatewayResponse {
  status: 'success' | 'error';
  message?: string;
  code?: string;
  description?: string;
  txnId?: string;
  authResult?: string;
  accounts?: unknown[];
  timestamp?: string;
  gatewayResponse?: Record<string, unknown>;
  /** @description Body sent to ABDM gateway (loginId RSA-encrypted server-side) */
  abdmRequest?: Record<string, unknown>;
  abdmResponse?: Record<string, unknown>;
}

export interface AccountActionWizardConfig {
  kind: AccountActionKind;
  title: string;
  warnings: readonly string[];
  surveyTitle: string;
  /** @deprecated BFF resolves ABHA from session JWT — not sent from client */
  abhaNumber?: string;
  requestOtp: (params: {
    abhaNumber?: string;
    otpSystem: 'aadhaar' | 'abdm';
  }) => Promise<AccountActionGatewayResponse>;
  verifyOtp: (params: {
    txnId: string;
    otp: string;
    reasons: string[];
  }) => Promise<AccountActionGatewayResponse>;
  verifyPassword: (params: {
    password: string;
    reasons: string[];
  }) => Promise<AccountActionGatewayResponse>;
  /** Called after successful verify + ABDM logout API */
  onComplete?: (message: string) => void;
}

export interface AccountActionWizardState {
  step: AccountActionWizardStep;
  surveyOptionId: string;
  otherReason: string;
  authChannel: AbhaAuthChannel | null;
  txnId: string;
  otp: string;
  password: string;
  otpMessage: string;
  response: AccountActionGatewayResponse | null;
  error: string;
  loading: boolean;
}
