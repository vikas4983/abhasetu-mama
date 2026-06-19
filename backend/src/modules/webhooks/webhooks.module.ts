/**
 * @file        webhooks.module.ts
 * @description Module wrapping and exporting WebhooksService.
 * @module      webhooks
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
