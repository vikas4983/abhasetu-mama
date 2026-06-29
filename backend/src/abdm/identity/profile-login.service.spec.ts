/**
 * @file        profile-login.service.spec.ts
 * @description Unit tests for M1 profile login scope resolution
 * @module      abdm/identity/profile-login
 * @layer       test
 * @author      Platform Team
 * @created     2026-06-29
 */

import {
  resolveProfileLoginOtpScope,
  ProfileLoginService,
} from './profile-login.service';
import {
  LOGIN_SCOPE_ABHA_AADHAAR,
  LOGIN_SCOPE_ABHA_MOBILE,
  LOGIN_SCOPE_ADDRESS_AADHAAR,
  LOGIN_SCOPE_ADDRESS_MOBILE,
  LOGIN_SCOPE_MOBILE,
} from './profile-login.constants';

describe('resolveProfileLoginOtpScope', () => {
  it('returns mobile-verify scope for mobile login', () => {
    expect(resolveProfileLoginOtpScope('mobile', 'abdm')).toEqual(LOGIN_SCOPE_MOBILE);
  });

  it('returns aadhaar-verify for abha-number + aadhaar', () => {
    expect(resolveProfileLoginOtpScope('abha-number', 'aadhaar')).toEqual(LOGIN_SCOPE_ABHA_AADHAAR);
  });

  it('returns mobile-verify for abha-number + abdm', () => {
    expect(resolveProfileLoginOtpScope('abha-number', 'abdm')).toEqual(LOGIN_SCOPE_ABHA_MOBILE);
  });

  it('returns abha-address-login scopes', () => {
    expect(resolveProfileLoginOtpScope('abha-address', 'aadhaar')).toEqual(LOGIN_SCOPE_ADDRESS_AADHAAR);
    expect(resolveProfileLoginOtpScope('abha-address', 'abdm')).toEqual(LOGIN_SCOPE_ADDRESS_MOBILE);
  });
});

describe('ProfileLoginService.requestLoginOtp', () => {
  const cryptoService = { encryptWithPublicKey: jest.fn(() => 'enc') };
  const sessionService = {
    getGatewaySession: jest.fn(),
    syncPublicKeyFromGateway: jest.fn(),
    getConfig: jest.fn(),
    getAbhaBaseUrl: jest.fn(),
    addDetailedLog: jest.fn(),
  };

  let service: ProfileLoginService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProfileLoginService(cryptoService as any, sessionService as any);
  });

  it('rejects wrong scope for abha-number aadhaar flow', async () => {
    const result = await service.requestLoginOtp({
      scope: ['abha-login', 'mobile-verify'],
      loginHint: 'abha-number',
      loginId: '9175614088857',
      otpSystem: 'aadhaar',
    });
    expect(result.status).toBe('error');
    expect(result.message).toMatch(/Invalid scope/i);
  });
});
