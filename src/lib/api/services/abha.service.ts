/**
 * @file        abha.service.ts
 * @description ABHA/ABDM API service layer
 * @module      lib/api/services
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { axiosInstance } from '../config/axiosInstance';
import { ABHA_ENDPOINTS } from '../endpoints/abha.endpoints';

export interface AbhaApiResponse<T = unknown> {
  status: string;
  message?: string;
  txnId?: string;
  data?: T;
  accounts?: unknown[];
}

export const abhaService = {
  requestEnrollmentOtp(body: { loginHint: string; loginId: string; currentMobile?: string; txnId?: string }) {
    return axiosInstance.post<AbhaApiResponse>(ABHA_ENDPOINTS.ENROLL_REQUEST_OTP, body);
  },

  requestProfileLoginOtp(body: Record<string, unknown>) {
    return axiosInstance.post<AbhaApiResponse>(ABHA_ENDPOINTS.PROFILE_LOGIN_REQUEST_OTP, body);
  },

  verifyProfileLogin(body: Record<string, unknown>) {
    return axiosInstance.post<AbhaApiResponse>(ABHA_ENDPOINTS.PROFILE_LOGIN_VERIFY, body);
  },

  getProfile() {
    return axiosInstance.get(ABHA_ENDPOINTS.PROFILE_ACCOUNT);
  },

  requestAccountActionOtp(body: {
    scope: string[];
    loginHint: 'aadhaar' | 'mobile' | 'abha-number';
    loginId: string;
    otpSystem?: 'aadhaar' | 'abdm';
  }) {
    return axiosInstance.post<AbhaApiResponse>(ABHA_ENDPOINTS.PROFILE_ACCOUNT_ACTION_OTP, body);
  },

  setPassword(body: { txnId: string; otp: string; password: string }) {
    return axiosInstance.post<AbhaApiResponse>(ABHA_ENDPOINTS.PROFILE_SET_PASSWORD, body);
  },

  deactivateAbha(body: { txnId: string; otp: string }) {
    return axiosInstance.post<AbhaApiResponse>(ABHA_ENDPOINTS.PROFILE_DEACTIVATE, body);
  },

  deleteAbha(body: { txnId: string; otp: string }) {
    return axiosInstance.post<AbhaApiResponse>(ABHA_ENDPOINTS.PROFILE_DELETE, body);
  },

  delinkMobile(body: { abhaNumber: string; txnId?: string; otp?: string }) {
    return axiosInstance.post<AbhaApiResponse>(ABHA_ENDPOINTS.PROFILE_DELINK, body);
  },

  requestReKycOtp(abhaNumber: string) {
    return axiosInstance.post<AbhaApiResponse>(ABHA_ENDPOINTS.PROFILE_ACCOUNT_REQUEST_OTP, { abhaNumber });
  },

  verifyReKycOtp(body: { otp: string; txnId: string }) {
    return axiosInstance.post<AbhaApiResponse>(ABHA_ENDPOINTS.PROFILE_ACCOUNT_VERIFY, body);
  },

  forgotAbhaRequestOtp(mobile: string) {
    return axiosInstance.post<AbhaApiResponse>(ABHA_ENDPOINTS.FORGOT_ABHA_REQUEST_OTP, { mobile });
  },

  forgotAbhaVerify(body: { txnId: string; otp: string; mobile: string }) {
    return axiosInstance.post<AbhaApiResponse>(ABHA_ENDPOINTS.FORGOT_ABHA_VERIFY, body);
  },

  downloadAbhaCard() {
    return axiosInstance.get(ABHA_ENDPOINTS.PROFILE_ABHA_CARD, { responseType: 'blob' });
  },

  requestConsent(body: Record<string, unknown>) {
    return axiosInstance.post(ABHA_ENDPOINTS.CONSENT, body);
  },

  fetchHealthRecords() {
    return axiosInstance.get(ABHA_ENDPOINTS.HEALTH_RECORDS);
  },

  profileLoginSearch(abhaNumber: string) {
    return axiosInstance.post<AbhaApiResponse>(ABHA_ENDPOINTS.PROFILE_LOGIN_SEARCH, { ABHANumber: abhaNumber });
  },

  profileLoginVerifyUser(abhaNumber: string, txnId: string) {
    return axiosInstance.post<AbhaApiResponse>(ABHA_ENDPOINTS.PROFILE_LOGIN_VERIFY_USER, { ABHANumber: abhaNumber, txnId });
  },

  getProfileQrCode() {
    return axiosInstance.get<AbhaApiResponse>(ABHA_ENDPOINTS.PROFILE_QR_CODE);
  },

  profileLogout() {
    return axiosInstance.get<AbhaApiResponse>(ABHA_ENDPOINTS.PROFILE_LOGOUT);
  },

  searchAbhaByMobile(mobile: string) {
    return axiosInstance.post<AbhaApiResponse>(ABHA_ENDPOINTS.PROFILE_ABHA_SEARCH, { scope: ['search-abha'], mobile });
  },

  scanShare(body: Record<string, unknown>) {
    return axiosInstance.post<AbhaApiResponse>(ABHA_ENDPOINTS.SCAN_SHARE, body);
  },
};
