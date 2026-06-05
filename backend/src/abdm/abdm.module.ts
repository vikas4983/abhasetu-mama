import { Module } from '@nestjs/common';
import { AbdmController } from './abdm.controller';
import { AbdmService } from './abdm.service';
import { CryptoService } from './crypto.service';

@Module({
  controllers: [AbdmController],
  providers: [AbdmService, CryptoService],
  exports: [AbdmService],
})
export class AbdmModule {}
