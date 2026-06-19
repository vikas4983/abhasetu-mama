/**
 * @file        abdm.module.ts
 * @description Module declaration for the core ABDM engine.
 * @module      abdm
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-19
 */

import { Module } from '@nestjs/common';
import { AbdmService } from './abdm.service';
import { CryptoService } from './crypto.service';
import { AuthModule } from '../modules/auth/auth.module';
import { TenantModule } from '../modules/tenant/tenant.module';
import { AuditModule } from '../modules/audit/audit.module';
import { AbhaModule } from '../modules/abha/abha.module';
import { ConsentModule } from '../modules/consent/consent.module';
import { RecordsModule } from '../modules/records/records.module';
import { ScanShareModule } from '../modules/scan-share/scan-share.module';

import { AbdmAdminController } from './controllers/admin.controller';
import { AbdmSessionController } from './controllers/sessions.controller';
import { AbdmEnrollmentController } from './controllers/enrollment.controller';
import { AbdmProfileController } from './controllers/profile.controller';
import { AbdmCatalogController } from './controllers/catalog.controller';
import { AbdmDoctorController } from './controllers/doctor.controller';
import { AbdmGatewayController } from './controllers/gateway.controller';
import { AbdmCryptoController } from './controllers/crypto.controller';
import { AbdmUtilityController } from './controllers/utility.controller';

@Module({
  imports: [
    AuthModule,
    TenantModule,
    AuditModule,
    AbhaModule,
    ConsentModule,
    RecordsModule,
    ScanShareModule,
  ],
  controllers: [
    AbdmAdminController,
    AbdmSessionController,
    AbdmEnrollmentController,
    AbdmProfileController,
    AbdmCatalogController,
    AbdmDoctorController,
    AbdmGatewayController,
    AbdmCryptoController,
    AbdmUtilityController,
  ],
  providers: [AbdmService, CryptoService],
  exports: [AbdmService],
})
export class AbdmModule {}
