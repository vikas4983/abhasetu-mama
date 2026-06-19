/**
 * @file        app.module.ts
 * @description Root application module declaring imports for all feature modules and databases.
 * @module      app
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Module } from '@nestjs/common';
import { AbdmModule } from './abdm/abdm.module';
import { DbModule } from './database/db.module';
import { AuthModule } from './modules/auth/auth.module';
import { AbdmIntegrationModule } from './integrations/abdm/abdm-integration.module';
import { AbhaModule } from './modules/abha/abha.module';
import { ConsentModule } from './modules/consent/consent.module';
import { RecordsModule } from './modules/records/records.module';
import { ScanShareModule } from './modules/scan-share/scan-share.module';
import { FacilityModule } from './modules/facility/facility.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    DbModule,
    AuthModule,
    AbdmIntegrationModule,
    AbdmModule,
    AbhaModule,
    ConsentModule,
    RecordsModule,
    ScanShareModule,
    FacilityModule,
    TenantModule,
    WebhooksModule,
    AuditModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
