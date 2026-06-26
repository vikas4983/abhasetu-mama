/**
 * @file        common.module.ts
 * @description Shared ABDM gateway and transaction services
 * @module      abdm/common
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Module, Global } from '@nestjs/common';
import { AbdmGatewayService } from './abdm-gateway.service';
import { AbdmTransactionService } from './abdm-transaction.service';

@Global()
@Module({
  providers: [AbdmGatewayService, AbdmTransactionService],
  exports: [AbdmGatewayService, AbdmTransactionService],
})
export class AbdmCommonModule {}
