/**
 * @file        abdm.controller.spec.ts
 * @description Unit tests for AbdmController validation checks, transaction ledger, and all proxy endpoints.
 * @module      abdm
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-11
 * @modified    2026-06-11
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AbdmController } from './abdm.controller';
import { AbdmService } from './abdm.service';
import { AuthService } from '../auth/auth.service';
import { CryptoService } from './crypto.service';
import { HttpStatus } from '@nestjs/common';
import * as express from 'express';

describe('AbdmController', () => {
  let controller: AbdmController;
  let abdmService: AbdmService;
  let authService: AuthService;

  const mockAbdmService = {
    getGatewaySession: jest.fn(),
    generateSessionToken: jest.fn(),
    syncPublicKeyFromGateway: jest.fn(),
    getConfig: jest.fn(),
    saveConfig: jest.fn(),
    getLogs: jest.fn(),
    addLog: jest.fn(),
    requestAadhaarOtp: jest.fn(),
    verifyAadhaarOtp: jest.fn(),
    requestMobileOtp: jest.fn(),
    verifyMobileOtp: jest.fn(),
    enrolByDocument: jest.fn(),
    requestEmailVerificationLink: jest.fn(),
    downloadAbhaCard: jest.fn(),
    addTransaction: jest.fn(),
    getTransactions: jest.fn(),
    getProducts: jest.fn(),
    saveProduct: jest.fn(),
    deleteProduct: jest.fn(),
    getPolicies: jest.fn(),
    savePolicy: jest.fn(),
    deletePolicy: jest.fn(),
    getLabPackages: jest.fn(),
    saveLabPackage: jest.fn(),
    deleteLabPackage: jest.fn(),
    handleHip: jest.fn(),
    handleConsent: jest.fn(),
    handleScanShare: jest.fn(),
    handleUhi: jest.fn(),
    handleNhcx: jest.fn(),
    handleHpr: jest.fn(),
    runTests: jest.fn(),
    getSpecialtiesMatrix: jest.fn(),
    getDoctors: jest.fn(),
    saveDoctor: jest.fn(),
    deleteDoctor: jest.fn(),
    requestProfileLoginOtp: jest.fn(),
    verifyProfileLoginOtp: jest.fn(),
    requestReKycOtp: jest.fn(),
    verifyReKycOtp: jest.fn(),
  };

  const mockAuthService = {
    validateAndLogin: jest.fn(),
  };

  const mockCryptoService = {
    encryptWithPublicKey: jest.fn(),
    decryptWithPrivateKey: jest.fn(),
    generateEphemeralKeys: jest.fn(),
    deriveFideliusSymmetricKey: jest.fn(),
    decryptFhirPayload: jest.fn(),
  };

  const createMockResponse = () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as unknown as express.Response;
    return res;
  };

  const createMockRequest = (headers = {}, ip = '127.0.0.1') => {
    return {
      headers,
      socket: { remoteAddress: ip },
      ip,
    } as unknown as express.Request;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AbdmController],
      providers: [
        { provide: AbdmService, useValue: mockAbdmService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CryptoService, useValue: mockCryptoService },
      ],
    }).compile();

    controller = module.get<AbdmController>(AbdmController);
    abdmService = module.get<AbdmService>(AbdmService);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('adminLogin', () => {
    it('should call validateAndLogin with credentials', async () => {
      mockAuthService.validateAndLogin.mockResolvedValue({ status: 'success', token: 'jwt' });
      const result = await controller.adminLogin({ email: 'admin@test.com', password: 'password' });
      expect(authService.validateAndLogin).toHaveBeenCalledWith('admin@test.com', 'password');
      expect(result).toEqual({ status: 'success', token: 'jwt' });
    });
  });

  describe('getSessions', () => {
    it('should set cookies and return session details on success', async () => {
      const res = createMockResponse();
      mockAbdmService.getGatewaySession.mockResolvedValue({
        status: 'success',
        tokenPreview: 'sess-preview',
        publicKey: 'pub-key-data',
      });

      await controller.getSessions(res);

      expect(res.cookie).toHaveBeenCalledWith('session_id', 'sess-preview', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('public_key', 'pub-key-data', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should return 400 error response on service failure', async () => {
      const res = createMockResponse();
      mockAbdmService.getGatewaySession.mockRejectedValue(new Error('Gateway Offline'));

      await controller.getSessions(res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Gateway Offline',
      });
    });
  });

  describe('generateSession', () => {
    it('should generate new session tokens and set cookies', async () => {
      const res = createMockResponse();
      mockAbdmService.generateSessionToken.mockResolvedValue({
        status: 'success',
        tokenPreview: 'new-sess-preview',
      });
      mockAbdmService.getConfig.mockResolvedValue({
        ABDM_PUBLIC_KEY: 'config-pub-key',
      });

      await controller.generateSession(res);

      expect(res.cookie).toHaveBeenCalledWith('session_id', 'new-sess-preview', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should handle error if session generation fails', async () => {
      const res = createMockResponse();
      mockAbdmService.generateSessionToken.mockRejectedValue(new Error('Auth Fail'));

      await controller.generateSession(res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Auth Fail',
      });
    });
  });

  describe('fetchPublicKey', () => {
    it('should sync and set cookie for public key', async () => {
      const res = createMockResponse();
      mockAbdmService.syncPublicKeyFromGateway.mockResolvedValue({
        status: 'success',
        publicKey: 'synced-pub-key',
      });

      await controller.fetchPublicKey(res);

      expect(res.cookie).toHaveBeenCalledWith('public_key', 'synced-pub-key', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should fail gracefully if public key sync errors out', async () => {
      const res = createMockResponse();
      mockAbdmService.syncPublicKeyFromGateway.mockRejectedValue(new Error('Net Error'));

      await controller.fetchPublicKey(res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('enroll', () => {
    it('should handle request-otp action success', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.requestAadhaarOtp.mockResolvedValue({ status: 'success', txnId: 'txn-123' });

      await controller.enroll({ action: 'request-otp', aadhaar: '123456789012' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', txnId: 'txn-123' });
    });

    it('should handle request-otp action error', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.requestAadhaarOtp.mockResolvedValue({ status: 'error', message: 'Fail' });

      await controller.enroll({ action: 'request-otp', aadhaar: '123456789012' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should handle verify-otp action success', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.verifyAadhaarOtp.mockResolvedValue({ status: 'success', preferredAddress: 'test@sbx' });

      await controller.enroll({ action: 'verify-otp', otp: '123456', txnId: 'txn-123', mobile: '9988998899' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should handle verify-otp action error', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.verifyAadhaarOtp.mockResolvedValue({ status: 'error', message: 'Invalid OTP' });

      await controller.enroll({ action: 'verify-otp', otp: '111111', txnId: 'txn-123' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should handle request-mobile-otp action success', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.requestMobileOtp.mockResolvedValue({ status: 'success', txnId: 'mobile-txn' });

      await controller.enroll({ action: 'request-mobile-otp', mobile: '9988998899' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should handle request-mobile-otp action error', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.requestMobileOtp.mockResolvedValue({ status: 'error', message: 'Blocked' });

      await controller.enroll({ action: 'request-mobile-otp', mobile: '9988998899' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should handle verify-mobile-otp action success', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.verifyMobileOtp.mockResolvedValue({ status: 'success' });

      await controller.enroll({ action: 'verify-mobile-otp', otp: '123456', txnId: 'txn-123', mobile: '9988998899' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should handle verify-mobile-otp action error', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.verifyMobileOtp.mockResolvedValue({ status: 'error', message: 'Fail' });

      await controller.enroll({ action: 'verify-mobile-otp', otp: '123456', txnId: 'txn-123' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should handle enrol-by-document action success', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.enrolByDocument.mockResolvedValue({ status: 'success' });

      await controller.enroll({ action: 'enrol-by-document', firstName: 'Aarav' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should handle enrol-by-document action error', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.enrolByDocument.mockResolvedValue({ status: 'error', message: 'Invalid doc' });

      await controller.enroll({ action: 'enrol-by-document', firstName: 'Aarav' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should return error response for unknown action', async () => {
      const res = createMockResponse();
      const req = createMockRequest();

      await controller.enroll({ action: 'invalid-action' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('v3RequestOtp', () => {
    it('should handle v3 aadhaar otp requests success', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.requestAadhaarOtp.mockResolvedValue({ status: 'success', txnId: 'v3-aadhaar-txn' });

      await controller.v3RequestOtp({ loginHint: 'aadhaar', loginId: '123456789012' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ txnId: 'v3-aadhaar-txn' }));
    });

    it('should handle v3 aadhaar otp requests error', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.requestAadhaarOtp.mockResolvedValue({ status: 'error', message: 'Invalid Aadhaar' });

      await controller.v3RequestOtp({ loginHint: 'aadhaar', loginId: '123456789012' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should reject same mobile update request', async () => {
      const res = createMockResponse();
      const req = createMockRequest();

      await controller.v3RequestOtp({ loginHint: 'mobile', loginId: '9876543210', currentMobile: '9876543210' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should accept different mobile request success', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.requestMobileOtp.mockResolvedValue({ status: 'success', txnId: 'v3-mobile-txn' });

      await controller.v3RequestOtp({ loginHint: 'mobile', loginId: '9876543210', currentMobile: '8888888888' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should accept different mobile request error', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.requestMobileOtp.mockResolvedValue({ status: 'error', message: 'Service fail' });

      await controller.v3RequestOtp({ loginHint: 'mobile', loginId: '9876543210', currentMobile: '8888888888' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should extract txnId from cookies if available', async () => {
      const res = createMockResponse();
      const req = createMockRequest({ cookie: 'txn_id=cookie-txn-123' });
      mockAbdmService.requestMobileOtp.mockResolvedValue({ status: 'success', txnId: 'v3-mobile-txn' });

      await controller.v3RequestOtp({ loginHint: 'mobile', loginId: '9876543210', currentMobile: '8888888888' }, res, req);

      expect(mockAbdmService.requestMobileOtp).toHaveBeenCalledWith('9876543210', 'cookie-txn-123', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should return empty string if getCookie finds nothing', async () => {
      const res = createMockResponse();
      const req = createMockRequest({ cookie: 'something_else=123' });
      mockAbdmService.requestMobileOtp.mockResolvedValue({ status: 'success', txnId: 'v3-mobile-txn' });

      await controller.v3RequestOtp({ loginHint: 'mobile', loginId: '9876543210', currentMobile: '8888888888' }, res, req);

      expect(mockAbdmService.requestMobileOtp).toHaveBeenCalledWith('9876543210', '', expect.any(Object));
    });

    it('should fail for invalid loginHint', async () => {
      const res = createMockResponse();
      const req = createMockRequest();

      await controller.v3RequestOtp({ loginHint: 'invalid-hint' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('v3EnrolByAadhaar', () => {
    it('should verify OTP and establish session/txn cookies', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.verifyAadhaarOtp.mockResolvedValue({
        status: 'success',
        tokens: { token: 'sessionToken', refreshToken: 'refresh', expiresIn: 3600, refreshExpiresIn: 7200 },
        txnId: 'txn-12345',
      });
      mockAbdmService.getConfig.mockResolvedValue({ ABDM_PUBLIC_KEY: 'key-data' });

      await controller.v3EnrolByAadhaar({ txnId: 'txn-123', authData: { otp: { otpValue: '123456', mobile: '9988998899' } } }, res, req);

      expect(res.cookie).toHaveBeenCalledWith('session_id', 'sessionToken', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('x_token', 'sessionToken', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refresh', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('txn_id', 'txn-12345', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should return BAD_REQUEST on OTP verification failure', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.verifyAadhaarOtp.mockResolvedValue({ status: 'error', message: 'Wrong OTP' });

      await controller.v3EnrolByAadhaar({ txnId: 'txn-123', authData: { otp: { otpValue: '111111' } } }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('v3AuthByAbdm', () => {
    it('should authorize mobile and establish session cookies', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.verifyMobileOtp.mockResolvedValue({
        status: 'success',
        tokens: { token: 'sessionToken', refreshToken: 'refresh', expiresIn: 3600, refreshExpiresIn: 7200 },
      });

      await controller.v3AuthByAbdm({ txnId: 'txn-123', authData: { otp: { otpValue: '123456' } } }, res, req);

      expect(res.cookie).toHaveBeenCalledWith('session_id', 'sessionToken', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refresh', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should return BAD_REQUEST on mobile auth error', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.verifyMobileOtp.mockResolvedValue({ status: 'error', message: 'Fail' });

      await controller.v3AuthByAbdm({ txnId: 'txn-123', authData: { otp: { otpValue: '123456' } } }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('downloadAbhaCard', () => {
    it('should reject download request if x_token is missing from cookies', async () => {
      const res = createMockResponse();
      const req = createMockRequest(); // no cookies

      await controller.downloadAbhaCard(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('X-token') }));
    });

    it('should download and return card image buffer on success', async () => {
      const res = createMockResponse();
      const req = createMockRequest({ cookie: 'x_token=test-x-token' });
      mockAbdmService.getGatewaySession.mockResolvedValue({ tokenPreview: 'gateway-jwt' });
      mockAbdmService.downloadAbhaCard.mockResolvedValue({
        status: 'success',
        contentType: 'image/png',
        data: Buffer.from('mock-png-bytes'),
      });

      await controller.downloadAbhaCard(req, res);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
      expect(res.send).toHaveBeenCalled();
    });

    it('should handle failure if getting gateway session throws error', async () => {
      const res = createMockResponse();
      const req = createMockRequest({ cookie: 'x_token=test-x-token' });
      mockAbdmService.getGatewaySession.mockRejectedValue(new Error('Gateway Offline'));

      await controller.downloadAbhaCard(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to retrieve gateway session token: Gateway Offline'
      });
    });

    it('should handle failure if gateway returns an error response', async () => {
      const res = createMockResponse();
      const req = createMockRequest({ cookie: 'x_token=test-x-token' });
      mockAbdmService.getGatewaySession.mockResolvedValue({ tokenPreview: 'gateway-jwt' });
      mockAbdmService.downloadAbhaCard.mockResolvedValue({
        status: 'error',
        message: 'Invalid signature',
        details: { code: '900901', description: 'Invalid signature description' },
      });

      await controller.downloadAbhaCard(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: '900901' }));
    });
  });

  describe('requestEmailVerificationLink', () => {
    it('should reject email verification link request if new email matches current', async () => {
      const res = createMockResponse();
      const req = createMockRequest();

      await controller.requestEmailVerificationLink({ email: 'user@test.com', currentEmail: 'user@test.com' }, req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should reject email verification link request if x_token is missing', async () => {
      const res = createMockResponse();
      const req = createMockRequest(); // no cookies

      await controller.requestEmailVerificationLink({ email: 'user@test.com', currentEmail: 'old@test.com' }, req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should handle session failure during email request', async () => {
      const res = createMockResponse();
      const req = createMockRequest({ cookie: 'x_token=test-token' });
      mockAbdmService.getGatewaySession.mockRejectedValue(new Error('Auth Service Down'));

      await controller.requestEmailVerificationLink({ email: 'user@test.com', currentEmail: 'old@test.com' }, req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should handle gateway request errors gracefully', async () => {
      const res = createMockResponse();
      const req = createMockRequest({ cookie: 'x_token=test-token' });
      mockAbdmService.getGatewaySession.mockResolvedValue({ tokenPreview: 'jwt' });
      mockAbdmService.requestEmailVerificationLink.mockResolvedValue({ status: 'error', message: 'Invalid payload' });

      await controller.requestEmailVerificationLink({ email: 'user@test.com', currentEmail: 'old@test.com' }, req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('v3EnrolByDocument', () => {
    it('should call enrolByDocument and return success', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.enrolByDocument.mockResolvedValue({ status: 'success', txnId: 'doc-txn' });

      await controller.v3EnrolByDocument({ txnId: 'txn-123', authData: { document: { firstName: 'Aarav' } } }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should call enrolByDocument and return error', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.enrolByDocument.mockResolvedValue({ status: 'error', message: 'Fail' });

      await controller.v3EnrolByDocument({ txnId: 'txn-123', authData: { document: { firstName: 'Aarav' } } }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Admin Configuration Config & Logs', () => {
    it('should get config data', async () => {
      mockAbdmService.getConfig.mockResolvedValue({ env: 'sandbox' });
      const result = await controller.getConfig();
      expect(result).toEqual({ status: 'success', config: { env: 'sandbox' } });
    });

    it('should save config data', async () => {
      mockAbdmService.saveConfig.mockResolvedValue({ status: 'success' });
      const result = await controller.saveConfig({ env: 'prod' });
      expect(result).toEqual({ status: 'success' });
    });

    it('should get log files', async () => {
      mockAbdmService.getLogs.mockResolvedValue([{ event: 'login' }]);
      const result = await controller.getLogs();
      expect(result).toEqual({ status: 'success', logs: [{ event: 'login' }] });
    });

    it('should add a log entry', async () => {
      mockAbdmService.addLog.mockResolvedValue(undefined);
      const result = await controller.addLog({ event: 'test', status: 'ok', details: {} });
      expect(result).toEqual({ status: 'success' });
    });
  });

  describe('Pharmacy, Insurance, and Lab Catalogs', () => {
    it('should manage pharmacy products catalog', async () => {
      mockAbdmService.getProducts.mockResolvedValue([]);
      mockAbdmService.saveProduct.mockResolvedValue({ status: 'success' });
      mockAbdmService.deleteProduct.mockResolvedValue({ status: 'success' });

      expect(await controller.getProducts()).toEqual({ status: 'success', products: [] });
      expect(await controller.addProduct({ name: 'aspirin' })).toEqual({ status: 'success' });
      expect(await controller.updateProduct({ name: 'aspirin' })).toEqual({ status: 'success' });
      expect(await controller.deleteProduct('1')).toEqual({ status: 'success' });
    });

    it('should manage insurance policies catalog', async () => {
      mockAbdmService.getPolicies.mockResolvedValue([]);
      mockAbdmService.savePolicy.mockResolvedValue({ status: 'success' });
      mockAbdmService.deletePolicy.mockResolvedValue({ status: 'success' });

      expect(await controller.getPolicies()).toEqual({ status: 'success', policies: [] });
      expect(await controller.addPolicy({ title: 'basic' })).toEqual({ status: 'success' });
      expect(await controller.updatePolicy({ title: 'basic' })).toEqual({ status: 'success' });
      expect(await controller.deletePolicy('1')).toEqual({ status: 'success' });
    });

    it('should manage lab packages catalog', async () => {
      mockAbdmService.getLabPackages.mockResolvedValue([]);
      mockAbdmService.saveLabPackage.mockResolvedValue({ status: 'success' });
      mockAbdmService.deleteLabPackage.mockResolvedValue({ status: 'success' });

      expect(await controller.getLabPackages()).toEqual({ status: 'success', labPackages: [] });
      expect(await controller.addLabPackage({ title: 'cbc' })).toEqual({ status: 'success' });
      expect(await controller.updateLabPackage({ title: 'cbc' })).toEqual({ status: 'success' });
      expect(await controller.deleteLabPackage('1')).toEqual({ status: 'success' });
    });
  });

  describe('ABDM Module Proxies and Helpers', () => {
    it('should delegate handleHip, handleConsent, and scanShare calls success', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.handleHip.mockResolvedValue({ status: 'success' });
      mockAbdmService.handleConsent.mockResolvedValue({ status: 'success' });
      mockAbdmService.handleScanShare.mockResolvedValue({ status: 'success' });

      await controller.hip({ action: 'discover' }, res, req);
      await controller.consent({ action: 'approve' }, res, req);
      await controller.scanShare({ action: 'share' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should delegate handleHip, handleConsent, and scanShare calls error', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.handleHip.mockResolvedValue({ status: 'error', message: 'Fail' });
      mockAbdmService.handleConsent.mockResolvedValue({ status: 'error', message: 'Fail' });
      mockAbdmService.handleScanShare.mockResolvedValue({ status: 'error', message: 'Fail' });

      await controller.hip({ action: 'discover' }, res, req);
      await controller.consent({ action: 'approve' }, res, req);
      await controller.scanShare({ action: 'share' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should delegate handleUhi, handleNhcx, and handleHpr calls success', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.handleUhi.mockResolvedValue({ status: 'success' });
      mockAbdmService.handleNhcx.mockResolvedValue({ status: 'success' });
      mockAbdmService.handleHpr.mockResolvedValue({ status: 'success' });

      await controller.uhi({ action: 'search' }, res, req);
      await controller.nhcx({ action: 'check' }, res, req);
      await controller.hpr({ action: 'verify' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should delegate handleUhi, handleNhcx, and handleHpr calls error', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.handleUhi.mockResolvedValue({ status: 'error', message: 'Fail' });
      mockAbdmService.handleNhcx.mockResolvedValue({ status: 'error', message: 'Fail' });
      mockAbdmService.handleHpr.mockResolvedValue({ status: 'error', message: 'Fail' });

      await controller.uhi({ action: 'search' }, res, req);
      await controller.nhcx({ action: 'check' }, res, req);
      await controller.hpr({ action: 'verify' }, res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should delegate tests endpoint success', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.runTests.mockResolvedValue({ status: 'success' });

      await controller.tests(res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should delegate tests endpoint error', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.runTests.mockResolvedValue({ status: 'error', message: 'Fail' });

      await controller.tests(res, req);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Doctor Consultation Directory', () => {
    it('should get specialties matrix success', async () => {
      const res = createMockResponse();
      mockAbdmService.getSpecialtiesMatrix.mockResolvedValue([]);

      await controller.getSpecialtiesMatrix(res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', specialties: [] });
    });

    it('should get specialties matrix error', async () => {
      const res = createMockResponse();
      mockAbdmService.getSpecialtiesMatrix.mockRejectedValue(new Error('Fail'));

      await controller.getSpecialtiesMatrix(res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should query doctors list success', async () => {
      const res = createMockResponse();
      mockAbdmService.getDoctors.mockResolvedValue([]);

      await controller.getDoctors('Allopathy', 'Cardiology', 'Cardiologist', 'Ali', res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should query doctors list error', async () => {
      const res = createMockResponse();
      mockAbdmService.getDoctors.mockRejectedValue(new Error('Fail'));

      await controller.getDoctors('Allopathy', 'Cardiology', 'Cardiologist', 'Ali', res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should save doctor success', async () => {
      const res = createMockResponse();
      mockAbdmService.saveDoctor.mockResolvedValue({ status: 'success' });

      await controller.saveDoctor({ name: 'Ayesha' }, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should save doctor error', async () => {
      const res = createMockResponse();
      mockAbdmService.saveDoctor.mockRejectedValue(new Error('Fail'));

      await controller.saveDoctor({ name: 'Ayesha' }, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should delete doctor success', async () => {
      const res = createMockResponse();
      mockAbdmService.deleteDoctor.mockResolvedValue({ status: 'success' });

      await controller.deleteDoctor('1', res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should delete doctor error', async () => {
      const res = createMockResponse();
      mockAbdmService.deleteDoctor.mockRejectedValue(new Error('Fail'));

      await controller.deleteDoctor('1', res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('v3ProfileLoginRequestOtp', () => {
    it('should request profile login OTP successfully', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.requestProfileLoginOtp.mockResolvedValue({
        txnId: 'd4196ae3-f302-45bc-9460-a798a17b4c3a',
        message: 'OTP sent successfully'
      });

      await controller.v3ProfileLoginRequestOtp(
        { loginId: '9876543210', scope: ['abha-login', 'mobile-verify'], loginHint: 'mobile', otpSystem: 'abdm' },
        res,
        req
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        txnId: 'd4196ae3-f302-45bc-9460-a798a17b4c3a',
        message: 'OTP sent successfully'
      });
    });

    it('should return bad request for scope negative validation', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.requestProfileLoginOtp.mockResolvedValue({
        scope: 'Invalid Scope',
        timestamp: '2024-05-10 11:13:04'
      });

      await controller.v3ProfileLoginRequestOtp(
        { loginId: '9876543210', scope: ['invalid'], loginHint: 'mobile', otpSystem: 'abdm' },
        res,
        req
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('v3ProfileLoginVerify', () => {
    it('should verify profile login OTP and set cookies on success', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.verifyProfileLoginOtp.mockResolvedValue({
        txnId: '588453aa-4bb0-44c0-bbdd-62ebd53c37c6',
        authResult: 'success',
        message: 'OTP verified successfully',
        token: 'mock-session-token',
        expiresIn: 300,
        refreshToken: 'mock-refresh-token',
        refreshExpiresIn: 1296000,
        accounts: []
      });

      await controller.v3ProfileLoginVerify(
        { scope: ['abha-login', 'mobile-verify'], authData: { authMethods: ['otp'], otp: { txnId: 'txn-id', otpValue: 'encrypted-otp' } } },
        res,
        req
      );

      expect(res.cookie).toHaveBeenCalledWith('verify_via_abha_number_token', 'mock-session-token', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('verify_via_abha_number_session_id', 'mock-session-token', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('verify_via_abha_number_refresh_token', 'mock-refresh-token', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('verify_via_abha_number_txn_id', '588453aa-4bb0-44c0-bbdd-62ebd53c37c6', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return bad request for invalid OTP negative validation', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.verifyProfileLoginOtp.mockResolvedValue({
        otpValue: 'Invalid OTP Value',
        timestamp: '2024-05-10 12:51:40'
      });

      await controller.v3ProfileLoginVerify(
        { scope: ['abha-login', 'mobile-verify'], authData: { authMethods: ['otp'], otp: { txnId: 'txn-id', otpValue: 'invalid-otp' } } },
        res,
        req
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('verifyReKycOtp', () => {
    it('should verify Re-KYC OTP successfully', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.verifyReKycOtp.mockResolvedValue({
        status: 'success',
        data: {
          txnId: 'bb548986-e96d-4b48-be1b-1e36741e867d',
          authResult: 'success',
          message: 'Re-kyc done successfully',
          accounts: [{ ABHANumber: '91-4173-3253-XXXX' }]
        }
      });

      await controller.verifyReKycOtp(
        { otp: '123456', txnId: 'bb548986-e96d-4b48-be1b-1e36741e867d' },
        req,
        res
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        txnId: 'bb548986-e96d-4b48-be1b-1e36741e867d',
        authResult: 'success'
      }));
    });

    it('should return BAD_REQUEST on invalid OTP error', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.verifyReKycOtp.mockResolvedValue({
        status: 'error',
        message: 'UIDAI Error code : 400 : Invalid Aadhaar OTP value.',
        details: {
          Message: 'UIDAI Error code : 400 : Invalid Aadhaar OTP value.',
          timestamp: '2023-01-11 00:14:02'
        }
      });

      await controller.verifyReKycOtp(
        { otp: '000000', txnId: 'bb548986-e96d-4b48-be1b-1e36741e867d' },
        req,
        res
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        Message: 'UIDAI Error code : 400 : Invalid Aadhaar OTP value.'
      }));
    });
  });

  describe('requestReKycOtp', () => {
    it('should request Re-KYC OTP successfully', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.requestReKycOtp.mockResolvedValue({
        status: 'success',
        txnId: 'bb548986-e96d-4b48-be1b-1e36741e867d',
        data: { txnId: 'bb548986-e96d-4b48-be1b-1e36741e867d' }
      });

      await controller.requestReKycOtp(
        { abhaNumber: '91-4173-3253-XXXX' },
        req,
        res
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        txnId: 'bb548986-e96d-4b48-be1b-1e36741e867d'
      }));
    });

    it('should return BAD_REQUEST on invalid abhaNumber/loginId error', async () => {
      const res = createMockResponse();
      const req = createMockRequest();
      mockAbdmService.requestReKycOtp.mockResolvedValue({
        status: 'error',
        message: 'Invalid LoginId',
        details: {
          loginId: 'Invalid LoginId',
          timestamp: '2024-05-10 11:15:14'
        }
      });

      await controller.requestReKycOtp(
        { abhaNumber: '' },
        req,
        res
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        loginId: 'Invalid LoginId'
      }));
    });
  });
});

