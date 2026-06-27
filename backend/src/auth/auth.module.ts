import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { StakeholderJwtGuard } from './stakeholder-jwt.guard';

@Module({
  providers: [AuthService, JwtAuthGuard, StakeholderJwtGuard],
  exports: [AuthService, JwtAuthGuard, StakeholderJwtGuard],
})
export class AuthModule {}
