import { Module, Global } from '@nestjs/common';
import { AbdmGatewayClient } from './clients/abdm-gateway.client';
import { CryptoClient } from './clients/crypto.client';
import { SandboxAdapter } from './adapters/sandbox.adapter';
import { ProductionAdapter } from './adapters/production.adapter';
import { V3Adapter } from './adapters/v3.adapter';

@Global()
@Module({
  providers: [
    AbdmGatewayClient,
    CryptoClient,
    SandboxAdapter,
    ProductionAdapter,
    V3Adapter,
  ],
  exports: [
    AbdmGatewayClient,
    CryptoClient,
    SandboxAdapter,
    ProductionAdapter,
    V3Adapter,
  ],
})
export class AbdmIntegrationModule {}
