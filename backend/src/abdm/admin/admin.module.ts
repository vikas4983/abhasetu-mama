/**
 * @file        admin.module.ts
 * @description NestJS module configuring administrative panels, configs, and facility directories.
 * @module      abdm/admin
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../../auth/auth.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [AuthModule, SessionModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
