import { Module } from '@nestjs/common';
import { AbdmModule } from './abdm/abdm.module';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DbModule, AuthModule, AbdmModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
