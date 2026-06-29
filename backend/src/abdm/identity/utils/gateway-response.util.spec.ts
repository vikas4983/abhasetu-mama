/**
 * @file        gateway-response.util.spec.ts
 * @description Unit tests for ABDM gateway response parsing (no simulation)
 * @module      abdm/identity/utils
 * @layer       test
 * @author      Platform Team
 * @created     2026-06-26
 */

import {
  extractGatewayMessage,
  parseOtpRequestResponse,
  parseVerifyResponse,
} from './gateway-response.util';

describe('gateway-response.util', () => {
  describe('extractGatewayMessage', () => {
    it('returns message field when present', () => {
      expect(extractGatewayMessage({ message: 'X-token expired' })).toBe('X-token expired');
    });

    it('prefers loginId over scope when both present', () => {
      expect(
        extractGatewayMessage({
          scope: 'Invalid Scope',
          loginId: 'LoginId is invalid',
        }),
      ).toBe('LoginId is invalid');
    });

    it('returns field-level scope error when alone', () => {
      expect(extractGatewayMessage({ scope: 'Invalid Scope' })).toBe('Invalid Scope');
    });

    it('returns otpValue error', () => {
      expect(extractGatewayMessage({ otpValue: 'Invalid OTP Value' })).toBe('Invalid OTP Value');
    });
  });

  describe('parseOtpRequestResponse', () => {
    it('parses valid OTP send response with txnId', () => {
      const result = parseOtpRequestResponse({
        txnId: 'd41a143c-4751-46d4-aee5-94bf6d9c1bd6',
        message: 'OTP sent to Aadhaar registered mobile number ending with ******0903',
      });
      expect(result.status).toBe('success');
      expect(result.txnId).toBe('d41a143c-4751-46d4-aee5-94bf6d9c1bd6');
      expect(result.message).toContain('OTP sent');
    });

    it('rejects invalid scope without txnId', () => {
      const result = parseOtpRequestResponse({
        scope: 'Invalid Scope',
        timestamp: '2024-05-10 11:13:04',
      });
      expect(result.status).toBe('error');
      expect(result.message).toBe('Invalid Scope');
    });

    it('rejects invalid txnId string', () => {
      const result = parseOtpRequestResponse({
        txnId: 'Invalid Transaction Id',
        timestamp: '2024-05-10 12:45:25',
      });
      expect(result.status).toBe('error');
    });
  });

  describe('parseVerifyResponse', () => {
    it('parses successful deactivate response', () => {
      const result = parseVerifyResponse({
        authResult: 'success',
        message: 'Your account has been deactivated.',
        accounts: [{ ABHANumber: '91-7561-4088-XXXX' }],
      });
      expect(result.status).toBe('success');
      expect(result.message).toBe('Your account has been deactivated.');
    });

    it('parses failed OTP verification', () => {
      const result = parseVerifyResponse({
        txnId: '9c5d453e-756f-45e1-9766-43b9cc1190de',
        authResult: 'failed',
        message: 'OTP expired, please try again',
        accounts: [],
      });
      expect(result.status).toBe('error');
      expect(result.message).toBe('OTP expired, please try again');
    });

    it('parses invalid credentials', () => {
      const result = parseVerifyResponse({
        code: '900901',
        message: 'Invalid Credentials',
        description: 'Invalid Credentials. Make sure you have provided the correct security credentials',
      });
      expect(result.status).toBe('error');
    });
  });
});
