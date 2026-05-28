import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AbdmModule } from './abdm/abdm.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    // Rate limiter configuration (60 requests per min max)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    AbdmModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

