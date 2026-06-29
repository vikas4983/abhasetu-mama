/**
 * @file        gateway-response.util.ts
 * @description Parse ABDM gateway payloads into structured success/error (no simulation)
 * @module      abdm/identity/utils
 * @layer       util
 * @author      Platform Team
 * @created     2026-06-26
 */

import axios from 'axios';
import { resolveAxiosError } from '../../utils/error-resolver.util';

export interface ParsedGatewayResult {
  status: 'success' | 'error';
  message?: string;
  code?: string;
  description?: string;
  txnId?: string;
  authResult?: string;
  accounts?: unknown[];
  timestamp?: string;
  gatewayResponse?: Record<string, unknown>;
  /** @description Exact body sent to ABDM (loginId already RSA-encrypted) */
  abdmRequest?: Record<string, unknown>;
}

const FIELD_ERROR_KEYS = [
  'loginId',
  'password',
  'otpValue',
  'message',
  'scope',
  'loginHint',
  'authMethods',
] as const;

/**
 * @description Extract user-visible message from gateway body (field-level or message)
 */
export function extractGatewayMessage(data: Record<string, unknown>): string | undefined {
  for (const key of FIELD_ERROR_KEYS) {
    const val = data[key];
    if (typeof val === 'string' && val.trim()) {
      return val;
    }
  }
  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }
  if (typeof data.description === 'string') {
    return data.description;
  }
  return undefined;
}

/**
 * @description Map axios/gateway error to structured result — never simulates success
 */
export function mapGatewayErrorToResult(e: unknown): ParsedGatewayResult {
  if (axios.isAxiosError(e) && e.response?.data) {
    const data = e.response.data as Record<string, unknown>;
    return {
      status: 'error',
      message: extractGatewayMessage(data),
      code: typeof data.code === 'string' ? data.code : undefined,
      description: typeof data.description === 'string' ? data.description : undefined,
      gatewayResponse: data,
    };
  }
  const resolved = resolveAxiosError(e);
  return { status: 'error', message: resolved.userMessage };
}

/**
 * @description Validate OTP request response — requires txnId from gateway
 */
export function parseOtpRequestResponse(data: Record<string, unknown>): ParsedGatewayResult {
  const txnId =
    typeof data.txnId === 'string'
      ? data.txnId
      : typeof data.transactionId === 'string'
        ? data.transactionId
        : undefined;
  if (!txnId || txnId.toLowerCase().includes('invalid')) {
    return {
      status: 'error',
      message: extractGatewayMessage(data) ?? 'Failed to send OTP',
    };
  }
  return {
    status: 'success',
    txnId,
    message: typeof data.message === 'string' ? data.message : undefined,
  };
}

/**
 * @description Validate verify response — requires authResult success from gateway
 */
export function parseVerifyResponse(data: Record<string, unknown>): ParsedGatewayResult {
  const authResult = typeof data.authResult === 'string' ? data.authResult : undefined;
  if (authResult !== 'success') {
    return {
      status: 'error',
      authResult,
      message: extractGatewayMessage(data) ?? 'Verification failed',
      code: typeof data.code === 'string' ? data.code : undefined,
    };
  }
  return {
    status: 'success',
    authResult,
    message: typeof data.message === 'string' ? data.message : undefined,
    accounts: Array.isArray(data.accounts) ? data.accounts : undefined,
  };
}
