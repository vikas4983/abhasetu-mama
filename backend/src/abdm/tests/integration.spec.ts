/**
 * @file        integration.spec.ts
 * @description Integration tests for ABDM modules (gated by ABDM_SIMULATION_MODE)
 * @module      abdm/tests
 * @layer       test
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Test, TestingModule } from '@nestjs/testing';
import { CallbacksService } from '../callbacks/callbacks.service';
import { AbdmTransactionService } from '../common/abdm-transaction.service';
import { SessionService } from '../session/session.service';
import { DbService } from '../../db/db.service';
import { RedisService } from '../../redis/redis.service';

describe('ABDM Integration', () => {
  let callbacksService: CallbacksService;

  const mockDb = {
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  };

  const mockRedis = {
    setJson: jest.fn(),
    getJson: jest.fn(),
    isAvailable: jest.fn().mockReturnValue(false),
  };

  const mockSession = {
    addLog: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallbacksService,
        AbdmTransactionService,
        { provide: DbService, useValue: mockDb },
        { provide: RedisService, useValue: mockRedis },
        { provide: SessionService, useValue: mockSession },
      ],
    }).compile();

    callbacksService = module.get(CallbacksService);
  });

  it('should ACK callback immediately', () => {
    const result = callbacksService.handle('on-init', { requestId: 'test-req-1' });
    expect(result.status).toBe('ACK');
  });

  it('should process on-fetch consent callback async', async () => {
    callbacksService.handle('on-fetch', {
      requestId: 'test-req-2',
      consent: { consentId: 'consent-123' },
    });
    await new Promise((r) => setTimeout(r, 50));
    expect(mockDb.query).toHaveBeenCalled();
  });
});
