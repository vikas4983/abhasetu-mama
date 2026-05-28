import { Module } from '@nestjs/common';
import { AbhaController } from './controllers/abha.controller';
import { WebhookController } from './controllers/webhook.controller';
import { ConsentController } from './controllers/consent.controller';
import { HieController } from './controllers/hie.controller';
import { CryptoService } from './services/crypto.service';
import { GatewayClientService } from './services/gateway-client.service';
import { RsaService } from './services/rsa.service';

@Module({
  controllers: [AbhaController, WebhookController, ConsentController, HieController],
  providers: [CryptoService, GatewayClientService, RsaService],
  exports: [CryptoService, RsaService],
})
export class AbdmModule {}

