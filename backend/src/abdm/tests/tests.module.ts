/**
 * @file        tests.module.ts
 * @description NestJS module configuring automated ABDM compliance tests and importing dependency modules.
 * @module      abdm/tests
 * @layer       module
 * @author      Platform Team
 * @created     2026-06-22
 * @modified    2026-06-22
 */

import { Module } from '@nestjs/common';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';
import { IdentityModule } from '../identity/identity.module';
import { HipLinkingModule } from '../hip-linking/hip-linking.module';
import { ConsentHiuModule } from '../consent-hiu/consent-hiu.module';
import { HprModule } from '../hpr/hpr.module';
import { UhiModule } from '../uhi/uhi.module';
import { NhcxModule } from '../nhcx/nhcx.module';
import { SessionModule } from '../session/session.module';
import { PhrModule } from '../phr/phr.module';
import { PhrComplianceService } from './phr-compliance.service';

@Module({
  imports: [
    IdentityModule,
    HipLinkingModule,
    ConsentHiuModule,
    HprModule,
    UhiModule,
    NhcxModule,
    SessionModule,
    PhrModule,
  ],
  controllers: [TestsController],
  providers: [TestsService, PhrComplianceService],
  exports: [TestsService, PhrComplianceService],
})
export class TestsModule {}
