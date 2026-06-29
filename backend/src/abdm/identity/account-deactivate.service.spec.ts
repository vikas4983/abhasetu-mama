/**
 * @file        account-deactivate.service.spec.ts
 * @description Unit tests for deactivate service — scope de-activate, real gateway parsing
 * @module      abdm/identity
 * @layer       test
 * @author      Platform Team
 * @created     2026-06-26
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AccountDeactivateService, ABHA_DEACTIVATE_SCOPE } from './account-deactivate.service';
import { CryptoService } from '../crypto/crypto.service';
import { SessionService } from '../session/session.service';
import { AbdmGatewayService } from '../common/abdm-gateway.service';

describe('AccountDeactivateService', () => {
  let service: AccountDeactivateService;
  const sessionService = {
    getGatewaySession: jest.fn().mockResolvedValue({ tokenPreview: 'gw-token' }),
    syncPublicKeyFromGateway: jest.fn().mockResolvedValue({ publicKey: 'PUBLIC_KEY' }),
  };
  const gateway = {
    requestAbhaProfileV3: jest.fn(),
    request: jest.fn(),
  };
  const cryptoService = {
    encryptWithPublicKey: jest.fn().mockImplementation((_key: string, val: string) => `enc:${val}`),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountDeactivateService,
        { provide: AbdmGatewayService, useValue: gateway },
        { provide: SessionService, useValue: sessionService },
        { provide: CryptoService, useValue: cryptoService },
      ],
    }).compile();
    service = module.get(AccountDeactivateService);
  });

  it('uses de-activate scope on OTP request', async () => {
    gateway.requestAbhaProfileV3.mockResolvedValue({
      txnId: 'txn-123',
      message: 'OTP sent to Aadhaar registered mobile number ending with ******0903',
    });

    const result = await service.requestDeactivateOtp({
      abhaNumber: '91-7561-4088-8857',
      ABHANumber: '91-7561-4088-8857',
      otpSystem: 'aadhaar',
      xToken: 'profile-jwt',
    });

    expect(result.status).toBe('success');
    expect(result.txnId).toBe('txn-123');
    expect(gateway.requestAbhaProfileV3).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          scope: [...ABHA_DEACTIVATE_SCOPE],
          loginHint: 'abha-number',
          loginId: 'enc:91756140888857',
          otpSystem: 'aadhaar',
        }),
        xToken: 'profile-jwt',
      }),
    );
    expect(ABHA_DEACTIVATE_SCOPE).toEqual(['abha-profile', 'de-activate']);
  });

  it('returns error when gateway returns invalid scope', async () => {
    gateway.requestAbhaProfileV3.mockResolvedValue({
      scope: 'Invalid Scope',
      timestamp: '2024-05-10 11:13:04',
    });

    const result = await service.requestDeactivateOtp({
      abhaNumber: '91-7561-4088-8857',
      otpSystem: 'abdm',
      xToken: 'jwt',
    });

    expect(result.status).toBe('error');
    expect(result.message).toBe('Invalid Scope');
  });

  it('verify OTP returns success only when authResult is success', async () => {
    gateway.requestAbhaProfileV3.mockResolvedValue({
      authResult: 'success',
      message: 'Your account has been deactivated.',
      accounts: [{ ABHANumber: '91-7561-4088-XXXX' }],
    });

    const result = await service.verifyDeactivateOtp({
      txnId: 'txn-123',
      otp: '123456',
      reasons: ['test reason'],
      xToken: 'jwt',
    });

    expect(result.status).toBe('success');
    expect(gateway.requestAbhaProfileV3).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          scope: ['abha-profile', 'de-activate'],
          reasons: ['test reason'],
        }),
      }),
    );
  });
});
