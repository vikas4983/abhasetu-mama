/**
 * @file        phr.service.ts
 * @description PHR API service layer for enrollment, login, PIN, locker, and consent
 * @module      lib/api/services
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { axiosInstance } from "../config/axiosInstance";
import { PHR_ENDPOINTS, PHR_ACTIONS } from "../endpoints/phr.endpoints";

export interface PhrApiResponse<T = unknown> {
  status: string;
  message?: string;
  txnId?: string;
  token?: string;
  refreshToken?: string;
  data?: T;
  consents?: unknown;
  lockers?: unknown;
  simulated?: boolean;
}

const postPhr = <T = unknown>(body: Record<string, unknown>) =>
  axiosInstance.post<PhrApiResponse<T>>(PHR_ENDPOINTS.PHR_ACTION, body);

export const phrService = {
  enrollmentRequestOtp(loginId: string, scope?: string[]) {
    return postPhr({
      action: PHR_ACTIONS.ENROLLMENT_REQUEST_OTP,
      loginId,
      scope: scope || ["abha-address-enroll", "mobile-verify"],
    });
  },

  enrollmentVerify(txnId: string, otp: string) {
    return postPhr({ action: PHR_ACTIONS.ENROLLMENT_VERIFY, txnId, otp });
  },

  enrollmentSuggestion(txnId: string, xToken?: string) {
    return postPhr({
      action: PHR_ACTIONS.ENROLLMENT_SUGGESTION,
      txnId,
      xToken,
    });
  },

  enrollmentIsExists(abhaAddress: string, xToken?: string) {
    return postPhr({
      action: PHR_ACTIONS.ENROLLMENT_IS_EXISTS,
      abhaAddress,
      xToken,
    });
  },

  enrollmentEnrol(
    txnId: string,
    abhaAddress: string,
    xToken?: string,
    enrolPayload?: Record<string, unknown>,
  ) {
    return postPhr({
      action: PHR_ACTIONS.ENROLLMENT_ENROL,
      txnId,
      abhaAddress,
      xToken,
      enrolPayload,
    });
  },

  loginAbhaSearch(abhaAddress: string) {
    return postPhr({ action: PHR_ACTIONS.LOGIN_ABHA_SEARCH, abhaAddress });
  },

  loginAbhaRequestOtp(txnId: string) {
    return postPhr({ action: PHR_ACTIONS.LOGIN_ABHA_REQUEST_OTP, txnId });
  },

  loginAbhaVerify(txnId: string, otp: string, abhaAddress?: string) {
    return postPhr({
      action: PHR_ACTIONS.LOGIN_ABHA_VERIFY,
      txnId,
      otp,
      abhaAddress,
    });
  },

  getProfile(xToken: string) {
    return postPhr({ action: PHR_ACTIONS.GET_PROFILE, xToken });
  },

  getPhrCard(xToken: string, useAbhaProfile = false) {
    return postPhr({
      action: PHR_ACTIONS.GET_PHR_CARD,
      xToken,
      useAbhaProfile,
    });
  },

  getQrCode(xToken: string) {
    return postPhr({ action: PHR_ACTIONS.GET_QR_CODE, xToken });
  },

  createPin(xToken: string, pin: string) {
    return postPhr({ action: PHR_ACTIONS.CREATE_PIN, xToken, pin });
  },

  verifyPin(xToken: string, pin: string) {
    return postPhr({ action: PHR_ACTIONS.VERIFY_PIN, xToken, pin });
  },

  changePin(xToken: string, oldPin: string, newPin: string) {
    return postPhr({ action: PHR_ACTIONS.CHANGE_PIN, xToken, oldPin, newPin });
  },

  forgotPinGenerateOtp(xToken: string) {
    return postPhr({ action: PHR_ACTIONS.FORGOT_PIN_GENERATE_OTP, xToken });
  },

  forgotPinValidateOtp(xToken: string, txnId: string, otp: string) {
    return postPhr({
      action: PHR_ACTIONS.FORGOT_PIN_VALIDATE_OTP,
      xToken,
      txnId,
      otp,
    });
  },

  resetPin(xToken: string, pin: string, sessionId: string) {
    return postPhr({ action: PHR_ACTIONS.RESET_PIN, xToken, pin, sessionId });
  },

  listLockers(xToken: string) {
    return postPhr({ action: PHR_ACTIONS.LIST_LOCKERS, xToken });
  },

  setupLocker(xToken: string, lockerId: string) {
    return postPhr({ action: PHR_ACTIONS.SETUP_LOCKER, xToken, lockerId });
  },

  listConsents(xToken: string, status = "ALL") {
    return postPhr({ action: PHR_ACTIONS.LIST_CONSENTS, xToken, status });
  },

  approveConsent(xToken: string, consentRequestId: string) {
    return postPhr({
      action: PHR_ACTIONS.APPROVE_CONSENT,
      xToken,
      consentRequestId,
    });
  },

  denyConsent(xToken: string, consentRequestId: string) {
    return postPhr({
      action: PHR_ACTIONS.DENY_CONSENT,
      xToken,
      consentRequestId,
    });
  },

  getComplianceCatalog() {
    return axiosInstance.get(PHR_ENDPOINTS.PHR_COMPLIANCE);
  },
};
