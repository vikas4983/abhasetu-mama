import { Module } from '@nestjs/common';
import { AbdmModule } from './abdm/abdm.module';

@Module({
  imports: [AbdmModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
