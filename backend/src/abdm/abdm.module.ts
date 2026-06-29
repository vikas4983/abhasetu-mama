/**
 * @file        abdm.module.ts
 * @description Root ABDM monorepo module coordinating all independent sub-module domains.
 * @module      abdm
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-22
 * @modified    2026-06-22
 */

import { Module } from '@nestjs/common';
import { CryptoModule } from './crypto/crypto.module';
import { SessionModule } from './session/session.module';
import { AbdmCommonModule } from './common/common.module';
import { IdentityModule } from './identity/identity.module';
import { HipLinkingModule } from './hip-linking/hip-linking.module';
import { ConsentHiuModule } from './consent-hiu/consent-hiu.module';
import { HealthRecordsModule } from './health-records/health-records.module';
import { CallbacksModule } from './callbacks/callbacks.module';
import { UhiModule } from './uhi/uhi.module';
import { NhcxModule } from './nhcx/nhcx.module';
import { HprModule } from './hpr/hpr.module';
import { ClinicalModule } from './clinical/clinical.module';
import { AdminModule } from './admin/admin.module';
import { TestsModule } from './tests/tests.module';
import { PhrModule } from './phr/phr.module';
import { PublicAbdmModule } from './public/public.module';

@Module({
  imports: [
    CryptoModule,
    SessionModule,
    AbdmCommonModule,
    CallbacksModule,
    HealthRecordsModule,
    IdentityModule,
    HipLinkingModule,
    ConsentHiuModule,
    UhiModule,
    NhcxModule,
    HprModule,
    ClinicalModule,
    AdminModule,
    TestsModule,
    PhrModule,
    PublicAbdmModule,
  ],
  exports: [
    CryptoModule,
    SessionModule,
    AbdmCommonModule,
    CallbacksModule,
    HealthRecordsModule,
    IdentityModule,
    HipLinkingModule,
    ConsentHiuModule,
    UhiModule,
    NhcxModule,
    HprModule,
    ClinicalModule,
    AdminModule,
    TestsModule,
    PhrModule,
    PublicAbdmModule,
  ],
})
export class AbdmModule {}
