/**
 * @file        abdm-transaction.service.ts
 * @description Persists ABDM request/txn correlation in PostgreSQL and Redis
 * @module      abdm/common
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Injectable } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { RedisService } from '../../redis/redis.service';
import { CACHE_KEYS } from '../../constants/cache.constants';
import * as crypto from 'crypto';

@Injectable()
export class AbdmTransactionService {
  constructor(
    private readonly db: DbService,
    private readonly redis: RedisService,
  ) {}

  /**
   * @description Store a new ABDM transaction correlation record
   */
  async createTransaction(
    flowType: string,
    requestId: string,
    txnId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO abdm.abdm_transactions (request_id, txn_id, flow_type, status, metadata)
       VALUES ($1, $2, $3, 'PENDING', $4)`,
      [requestId, txnId || null, flowType, JSON.stringify(metadata || {})],
    );
    await this.redis.setJson(
      `${CACHE_KEYS.CALLBACK_REQUEST_PREFIX}${requestId}`,
      { flowType, txnId, metadata },
      3600,
    );
  }

  /**
   * @description Update transaction status by requestId
   */
  async updateStatus(requestId: string, status: string, txnId?: string): Promise<void> {
    await this.db.query(
      `UPDATE abdm.abdm_transactions SET status = $1, txn_id = COALESCE($2, txn_id), updated_at = NOW()
       WHERE request_id = $3`,
      [status, txnId || null, requestId],
    );
  }

  /**
   * @description Log an async callback event
   */
  async logCallback(endpoint: string, requestId: string, payload: unknown): Promise<void> {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex');
    await this.db.query(
      `INSERT INTO abdm.callback_events (request_id, endpoint, payload_hash, status)
       VALUES ($1, $2, $3, 'RECEIVED')`,
      [requestId, endpoint, hash],
    );
    await this.redis.setJson(
      `${CACHE_KEYS.CALLBACK_PREFIX}${requestId}`,
      payload,
      3600,
    );
  }

  /**
   * @description Retrieve pending callback payload from Redis
   */
  async getCallbackPayload<T>(requestId: string): Promise<T | null> {
    return this.redis.getJson<T>(`${CACHE_KEYS.CALLBACK_PREFIX}${requestId}`);
  }
}
