/**
 * @file        webhooks.service.ts
 * @description Placeholder service for handling incoming asynchronous ABDM gateway callbacks.
 * @module      webhooks
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class WebhooksService {
  constructor(private readonly auditService: AuditService) {}

  /**
   * @description Handles incoming callback requests from the ABDM Gateway.
   * @param {string} endpoint - The callback endpoint hit by the gateway.
   * @param {any} payload - The callback body payload.
   * @returns {Promise<any>} ACK response for the gateway.
   */
  async handleCallback(endpoint: string, payload: any): Promise<any> {
    await this.auditService.addDetailedLog(
      'ABDM Gateway Callback Received',
      'SUCCESS',
      `Callback received on ${endpoint} with request ID: ${payload?.resp?.requestId || 'unknown'}`,
      { endpoint, response: payload }
    );
    return { status: 'success', ack: { status: 'ok' } };
  }
}
