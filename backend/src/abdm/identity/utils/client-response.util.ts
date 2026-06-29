/**
 * @file        client-response.util.ts
 * @description BFF response shaping — user message + full abdmResponse for Network tab debugging
 * @module      abdm/identity/utils
 * @layer       util
 * @author      Platform Team
 * @created     2026-06-29
 */

import type { ParsedGatewayResult } from './gateway-response.util';
import { extractGatewayMessage } from './gateway-response.util';

/** @description Client account action response with optional full ABDM gateway body */
export type ClientAccountActionResult = Omit<ParsedGatewayResult, 'gatewayResponse'> & {
  abdmResponse?: Record<string, unknown>;
  abdmRequest?: Record<string, unknown>;
};

/** @description Standard BFF envelope for ABDM-proxied routes */
export type BffAbdmEnvelope = {
  status: 'success' | 'error';
  message?: string;
  txnId?: string;
  authResult?: string;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  refreshExpiresIn?: number;
  accounts?: unknown[];
  ABHAProfile?: unknown;
  isNew?: boolean;
  abdmResponse: Record<string, unknown>;
  [key: string]: unknown;
};

/**
 * @description Wrap raw ABDM gateway JSON for browser Network inspection
 */
export function wrapBffAbdmResponse(
  abdmResponse: Record<string, unknown>,
  parsed: Partial<ParsedGatewayResult> = {},
): BffAbdmEnvelope {
  const { gatewayResponse: _gw, status: parsedStatus, message: parsedMessage, ...rest } = parsed;
  const tokens = abdmResponse.tokens as Record<string, unknown> | undefined;
  const txnId =
    typeof abdmResponse.txnId === 'string'
      ? abdmResponse.txnId
      : typeof rest.txnId === 'string'
        ? rest.txnId
        : undefined;

  return {
    status:
      parsedStatus ??
      (abdmResponse.authResult === 'failed' || abdmResponse.code ? 'error' : txnId || abdmResponse.authResult === 'success' ? 'success' : 'error'),
    message:
      parsedMessage ??
      (typeof abdmResponse.message === 'string' ? abdmResponse.message : extractGatewayMessage(abdmResponse)),
    txnId,
    authResult: typeof abdmResponse.authResult === 'string' ? abdmResponse.authResult : rest.authResult,
    token:
      (typeof abdmResponse.token === 'string' ? abdmResponse.token : undefined) ??
      (typeof tokens?.token === 'string' ? tokens.token : undefined),
    refreshToken:
      (typeof abdmResponse.refreshToken === 'string' ? abdmResponse.refreshToken : undefined) ??
      (typeof tokens?.refreshToken === 'string' ? tokens.refreshToken : undefined),
    expiresIn:
      (typeof abdmResponse.expiresIn === 'number' ? abdmResponse.expiresIn : undefined) ??
      (typeof tokens?.expiresIn === 'number' ? tokens.expiresIn : undefined),
    refreshExpiresIn:
      (typeof abdmResponse.refreshExpiresIn === 'number' ? abdmResponse.refreshExpiresIn : undefined) ??
      (typeof tokens?.refreshExpiresIn === 'number' ? tokens.refreshExpiresIn : undefined),
    accounts: Array.isArray(abdmResponse.accounts) ? abdmResponse.accounts : undefined,
    ABHAProfile: abdmResponse.ABHAProfile,
    isNew: typeof abdmResponse.isNew === 'boolean' ? abdmResponse.isNew : undefined,
    abdmResponse,
    ...rest,
  };
}

/**
 * @description Account lifecycle BFF — strip internal gatewayResponse key, expose as abdmResponse
 */
export function toClientAccountActionResult(result: ParsedGatewayResult): ClientAccountActionResult {
  const { gatewayResponse, abdmRequest, ...safe } = result;
  const client: ClientAccountActionResult = { ...safe };
  if (gatewayResponse && typeof gatewayResponse === 'object') {
    client.abdmResponse = gatewayResponse;
  }
  if (abdmRequest && typeof abdmRequest === 'object') {
    client.abdmRequest = abdmRequest;
  }
  return client;
}
