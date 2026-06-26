/**
 * @file        callbacks.service.ts
 * @description Processes ABDM async callbacks and stores correlation in Redis + PostgreSQL
 * @module      abdm/callbacks
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Injectable, Logger } from '@nestjs/common';
import { AbdmTransactionService } from '../common/abdm-transaction.service';
import { SessionService } from '../session/session.service';
import { DbService } from '../../db/db.service';

@Injectable()
export class CallbacksService {
  private readonly logger = new Logger(CallbacksService.name);

  constructor(
    private readonly txnService: AbdmTransactionService,
    private readonly sessionService: SessionService,
    private readonly db: DbService,
  ) {}

  /**
   * @description Acknowledge callback immediately and process async
   * @param {string} endpoint - Callback type identifier
   * @param {Record<string, unknown>} body - Gateway callback payload
   */
  handle(endpoint: string, body: Record<string, unknown>): { status: string } {
    const requestId =
      (body.requestId as string) ||
      (body['request-id'] as string) ||
      (body.transactionId as string) ||
      'unknown';

    setImmediate(() => {
      this.processCallback(endpoint, requestId, body).catch((err: Error) => {
        this.logger.error(`Callback processing failed [${endpoint}]: ${err.message}`);
      });
    });

    return { status: 'ACK' };
  }

  private async processCallback(
    endpoint: string,
    requestId: string,
    body: Record<string, unknown>,
  ): Promise<void> {
    await this.txnService.logCallback(endpoint, requestId, body);
    await this.txnService.updateStatus(requestId, 'CALLBACK_RECEIVED');

    await this.sessionService.addLog(
      'abdm.callback.received',
      'SUCCESS',
      `Callback ${endpoint} requestId=${requestId}`,
    );

    if (endpoint === 'on-fetch' && body.consent) {
      const consent = body.consent as Record<string, unknown>;
      const consentId = consent.consentId as string;
      if (consentId) {
        await this.db.query(
          `INSERT INTO abdm.consent_artefacts (consent_id, artefact, expires_at, status)
           VALUES ($1, $2, NOW() + INTERVAL '30 days', 'ACTIVE')
           ON CONFLICT (consent_id) DO UPDATE SET artefact = EXCLUDED.artefact`,
          [consentId, JSON.stringify(consent)],
        );
      }
    }

    if (endpoint === 'on-discover' && body.patient) {
      await this.txnService.updateStatus(requestId, 'DISCOVERED');
    }

    if (endpoint === 'on-init' && body.consentRequest) {
      const cr = body.consentRequest as Record<string, unknown>;
      const crId = cr.id as string;
      if (crId) {
        await this.db.query(
          `INSERT INTO abdm.consent_requests (request_id, consent_request_id, status)
           VALUES ($1, $2, 'INITIATED')`,
          [requestId, crId],
        );
      }
    }
  }
}
