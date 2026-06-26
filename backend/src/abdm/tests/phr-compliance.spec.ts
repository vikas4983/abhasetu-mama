/**
 * @file        phr-compliance.spec.ts
 * @description Integration tests for PHR compliance suite endpoint
 * @module      abdm/tests
 * @layer       test
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PhrComplianceService } from './phr-compliance.service';
import { PhrService } from '../phr/phr.service';
import { AbdmGatewayService } from '../common/abdm-gateway.service';
import { CryptoService } from '../crypto/crypto.service';
import { SessionService } from '../session/session.service';

describe('PhrComplianceService', () => {
  let service: PhrComplianceService;

  const mockSession = {
    getConfig: jest.fn().mockResolvedValue({ ABDM_CLIENT_ID: 'test-client' }),
    addDetailedLog: jest.fn().mockResolvedValue(undefined),
    getGatewaySession: jest
      .fn()
      .mockResolvedValue({ tokenPreview: 'tok', status: 'success' }),
    getAbhaBaseUrl: jest
      .fn()
      .mockResolvedValue('https://abhasbx.abdm.gov.in/abha'),
    getGatewayBaseUrl: jest.fn().mockResolvedValue('https://dev.abdm.gov.in'),
    getPhrCmBaseUrl: jest.fn().mockResolvedValue('https://dev.abdm.gov.in/cm'),
  };

  const mockGateway = {
    request: jest.fn().mockRejectedValue(new Error('gateway unavailable')),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhrComplianceService,
        PhrService,
        { provide: AbdmGatewayService, useValue: mockGateway },
        {
          provide: CryptoService,
          useValue: {
            encryptWithPublicKey: (_k: string, v: string) => `enc-${v}`,
          },
        },
        { provide: SessionService, useValue: mockSession },
      ],
    }).compile();

    service = module.get(PhrComplianceService);
  });

  it('runs PHR compliance suite with all tests passing in simulation mode', async () => {
    const report = await service.runPhrComplianceTests();
    expect(report.status).toBe('success');
    expect(report.suite).toBe('PHR_COMPLIANCE');
    const summary = report.summary as { total: number; passed: number };
    expect(summary.total).toBeGreaterThanOrEqual(15);
    expect(summary.passed).toBe(summary.total);
  });
});
