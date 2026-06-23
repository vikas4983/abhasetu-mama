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
import { IdentityModule } from './identity/identity.module';
import { HipLinkingModule } from './hip-linking/hip-linking.module';
import { ConsentHiuModule } from './consent-hiu/consent-hiu.module';
import { UhiModule } from './uhi/uhi.module';
import { NhcxModule } from './nhcx/nhcx.module';
import { HprModule } from './hpr/hpr.module';
import { ClinicalModule } from './clinical/clinical.module';
import { AdminModule } from './admin/admin.module';
import { TestsModule } from './tests/tests.module';

@Module({
  imports: [
    CryptoModule,
    SessionModule,
    IdentityModule,
    HipLinkingModule,
    ConsentHiuModule,
    UhiModule,
    NhcxModule,
    HprModule,
    ClinicalModule,
    AdminModule,
    TestsModule,
  ],
  exports: [
    CryptoModule,
    SessionModule,
    IdentityModule,
    HipLinkingModule,
    ConsentHiuModule,
    UhiModule,
    NhcxModule,
    HprModule,
    ClinicalModule,
    AdminModule,
    TestsModule,
  ],
})
export class AbdmModule {}
