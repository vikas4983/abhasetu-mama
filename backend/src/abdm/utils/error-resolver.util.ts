/**
 * @file        error-resolver.util.ts
 * @description Utility that converts raw ABDM / UIDAI gateway error payloads
 *              into user-readable messages sourced from the centralized
 *              error-messages.constants.ts file.
 *              Import and call `resolveAbdmError()` at every catch block
 *              in abdm.service.ts to get a consistent, friendly message.
 * @module      abdm/utils
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-14
 * @modified    2026-06-14
 */

import { ABDM_ERROR_MESSAGES, HTTP_ERROR_MESSAGES, UIDAI_ERROR_MESSAGES } from "src/constants";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AbdmErrorPayload {
  /** HTTP status code of the gateway response (e.g. 422) */
  httpStatus?: number;
  /** Raw gateway error details object from e.response?.data */
  gatewayData?: {
    error?: {
      /** ABDM error code string, e.g. "ABDM-1204" */
      code?: string;
      /** Raw ABDM/UIDAI message string, e.g. "UIDAI Error code : 400 : OTP validation failed" */
      message?: string;
    };
    message?: string;
    code?: string;
  };
  /** Axios / native error message fallback */
  rawMessage?: string;
}

export interface ResolvedError {
  /** User-friendly message safe to display in the UI */
  userMessage: string;
  /** Original technical error message for internal logs (never expose to UI) */
  technicalMessage: string;
  /** The resolved ABDM error code if found, e.g. "ABDM-1204" */
  errorCode?: string;
}

// ─── Resolver ──────────────────────────────────────────────────────────────────

/**
 * @description Parses a raw ABDM gateway error payload and resolves it to a
 *              user-friendly message from the centralized constants map.
 *
 * Priority chain:
 *   1. ABDM error code (e.g. "ABDM-1204") → ABDM_ERROR_MESSAGES
 *   2. Embedded UIDAI sub-error code (e.g. "UIDAI Error code : 400") → UIDAI_ERROR_MESSAGES
 *   3. HTTP status code (e.g. 422) → HTTP_ERROR_MESSAGES
 *   4. DEFAULT fallback message
 *
 * @param {AbdmErrorPayload} payload - Structured error payload from the catch block
 * @returns {ResolvedError} Resolved error with userMessage and technicalMessage
 *
 * @example
 * // In abdm.service.ts catch block:
 * const resolved = resolveAbdmError({
 *   httpStatus: e.response?.status,
 *   gatewayData: e.response?.data,
 *   rawMessage: e.message,
 * });
 * return { status: 'error', message: resolved.userMessage, errorCode: resolved.errorCode };
 */
export function resolveAbdmError(payload: AbdmErrorPayload): ResolvedError {
  const { httpStatus, gatewayData, rawMessage } = payload;

  // Extract the nested error object from the gateway response
  const errObj = gatewayData?.error;
  const abdmCode = errObj?.code || gatewayData?.code;
  const rawGatewayMsg = errObj?.message || gatewayData?.message || rawMessage || 'Unknown error';

  // Build the technical log message (NEVER send this to the UI)
  const technicalMessage = abdmCode
    ? `[${abdmCode}] ${rawGatewayMsg}`
    : rawGatewayMsg;

  // --- Priority 1: ABDM error code lookup ---
  if (abdmCode && ABDM_ERROR_MESSAGES[abdmCode]) {
    return {
      userMessage: ABDM_ERROR_MESSAGES[abdmCode],
      technicalMessage,
      errorCode: abdmCode,
    };
  }

  // --- Priority 2: UIDAI embedded sub-error code lookup ---
  // UIDAI messages appear as: "UIDAI Error code : 400 : OTP validation failed"
  if (rawGatewayMsg) {
    const uidaiMatch = rawGatewayMsg.match(/UIDAI\s+Error\s+code\s*:\s*(\d+)/i);
    if (uidaiMatch) {
      const uidaiCode = uidaiMatch[1];
      if (UIDAI_ERROR_MESSAGES[uidaiCode]) {
        return {
          userMessage: UIDAI_ERROR_MESSAGES[uidaiCode],
          technicalMessage,
          errorCode: abdmCode || `UIDAI-${uidaiCode}`,
        };
      }
    }
  }

  // --- Priority 3: HTTP status code lookup ---
  if (httpStatus && HTTP_ERROR_MESSAGES[httpStatus]) {
    return {
      userMessage: HTTP_ERROR_MESSAGES[httpStatus],
      technicalMessage,
      errorCode: abdmCode,
    };
  }

  // --- Priority 4: DEFAULT fallback ---
  return {
    userMessage: ABDM_ERROR_MESSAGES['DEFAULT'],
    technicalMessage,
    errorCode: abdmCode,
  };
}

/**
 * @description Convenience wrapper: given a raw Axios error `e`, builds the
 *              AbdmErrorPayload and returns a ResolvedError directly.
 *
 * @param {any} axiosError - The caught Axios error object
 * @returns {ResolvedError} Resolved error
 *
 * @example
 * } catch (e: any) {
 *   const resolved = resolveAxiosError(e);
 *   this.logger.error(resolved.technicalMessage);
 *   return { status: 'error', message: resolved.userMessage };
 * }
 */
export function resolveAxiosError(axiosError: any): ResolvedError {
  return resolveAbdmError({
    httpStatus: axiosError?.response?.status,
    gatewayData: axiosError?.response?.data,
    rawMessage: axiosError?.message,
  });
}
