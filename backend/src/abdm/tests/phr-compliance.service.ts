/**
 * @file        phr-compliance.service.ts
 * @description ABDM PHR certification test cases (M1 PHR mobile, consent PIN, HIECM locker)
 * @module      abdm/tests
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Injectable } from '@nestjs/common';
import { PhrService } from '../phr/phr.service';

type TestContext = { ip?: string; userAgent?: string };

interface ComplianceCase {
  id: string;
  name: string;
  module: 'PHR_ENROLL' | 'PHR_LOGIN' | 'PHR_PROFILE' | 'PHR_PIN' | 'PHR_LOCKER' | 'PHR_CONSENT';
  abdmRef: string;
  run: (ctx?: TestContext) => Promise<{
    passed: boolean;
    assertions: Array<{ name: string; passed: boolean; got: unknown; expected: unknown }>;
    responsePayload?: unknown;
  }>;
}

@Injectable()
export class PhrComplianceService {
  constructor(private readonly phrService: PhrService) {}

  /**
   * @description Runs PHR-specific ABDM compliance test suite
   * @param {TestContext} context - Client metadata
   * @returns {Promise<Record<string, unknown>>} Test report
   */
  async runPhrComplianceTests(context?: TestContext): Promise<Record<string, unknown>> {
    const startTime = Date.now();
    const testResults: Array<Record<string, unknown>> = [];
    let passedCount = 0;
    let failedCount = 0;

    const simToken = 'sim-phr-x-token';
    const simTxn = 'sim-txn-phr-001';

    const suite: ComplianceCase[] = [
      {
        id: 'PHR-E01',
        name: 'PHR enrollment OTP request with valid mobile',
        module: 'PHR_ENROLL',
        abdmRef: 'V3_Update_Test_Cases — Enrolment via Mobile TC-01',
        run: async (ctx) => {
          const res = await this.phrService.handlePhr(
            { action: 'enrollment-request-otp', loginId: '9981057765' },
            ctx,
          );
          return {
            passed: res.status === 'success' && !!res.txnId,
            assertions: [
              { name: 'Status success', passed: res.status === 'success', got: res.status, expected: 'success' },
              { name: 'txnId returned', passed: !!res.txnId, got: !!res.txnId, expected: true },
            ],
            responsePayload: res,
          };
        },
      },
      {
        id: 'PHR-E02',
        name: 'PHR enrollment OTP request rejects empty mobile',
        module: 'PHR_ENROLL',
        abdmRef: 'V3_Update_Test_Cases — Enrolment via Mobile TC-02 (negative)',
        run: async (ctx) => {
          const res = await this.phrService.handlePhr({ action: 'enrollment-request-otp', loginId: '' }, ctx);
          return {
            passed: res.status === 'error',
            assertions: [
              { name: 'Status error', passed: res.status === 'error', got: res.status, expected: 'error' },
            ],
            responsePayload: res,
          };
        },
      },
      {
        id: 'PHR-E03',
        name: 'PHR enrollment OTP verify with valid OTP',
        module: 'PHR_ENROLL',
        abdmRef: 'V3_Update_Test_Cases — Enrolment verify TC-01',
        run: async (ctx) => {
          const res = await this.phrService.handlePhr(
            { action: 'enrollment-verify', txnId: simTxn, otp: '123456' },
            ctx,
          );
          return {
            passed: res.status === 'success',
            assertions: [
              { name: 'Mobile verified', passed: res.status === 'success', got: res.status, expected: 'success' },
            ],
            responsePayload: res,
          };
        },
      },
      {
        id: 'PHR-E04',
        name: 'PHR ABHA address suggestion after enrollment',
        module: 'PHR_ENROLL',
        abdmRef: 'V3_Update_Test_Cases — Suggestion TC-01',
        run: async (ctx) => {
          const res = await this.phrService.handlePhr(
            { action: 'enrollment-suggestion', txnId: simTxn, xToken: simToken },
            ctx,
          );
          const suggestions = res.suggestions as string[] | undefined;
          return {
            passed: res.status === 'success' && Array.isArray(suggestions) && suggestions.length > 0,
            assertions: [
              { name: 'Suggestions array', passed: Array.isArray(suggestions), got: suggestions?.length, expected: '> 0' },
            ],
            responsePayload: res,
          };
        },
      },
      {
        id: 'PHR-E05',
        name: 'PHR ABHA address availability check',
        module: 'PHR_ENROLL',
        abdmRef: 'V3_Update_Test_Cases — isExists TC-01',
        run: async (ctx) => {
          const res = await this.phrService.handlePhr(
            { action: 'enrollment-is-exists', abhaAddress: 'newpatient@sbx', xToken: simToken },
            ctx,
          );
          return {
            passed: res.status === 'success' && res.exists === false,
            assertions: [
              { name: 'Address available', passed: res.exists === false, got: res.exists, expected: false },
            ],
            responsePayload: res,
          };
        },
      },
      {
        id: 'PHR-L01',
        name: 'PHR login ABHA search by address',
        module: 'PHR_LOGIN',
        abdmRef: 'M1 ABHA — PHR Web login/abha/search',
        run: async (ctx) => {
          const res = await this.phrService.handlePhr(
            { action: 'login-abha-search', abhaAddress: 'patient.setu001@sbx' },
            ctx,
          );
          return {
            passed: res.status === 'success' && !!res.txnId,
            assertions: [
              { name: 'Search success', passed: res.status === 'success', got: res.status, expected: 'success' },
              { name: 'txnId for OTP', passed: !!res.txnId, got: !!res.txnId, expected: true },
            ],
            responsePayload: res,
          };
        },
      },
      {
        id: 'PHR-L02',
        name: 'PHR login ABHA OTP request',
        module: 'PHR_LOGIN',
        abdmRef: 'M1 ABHA — PHR Web login/abha/request/otp',
        run: async (ctx) => {
          const res = await this.phrService.handlePhr(
            { action: 'login-abha-request-otp', txnId: simTxn },
            ctx,
          );
          return {
            passed: res.status === 'success',
            assertions: [
              { name: 'OTP sent message', passed: !!res.message, got: res.message, expected: 'non-empty' },
            ],
            responsePayload: res,
          };
        },
      },
      {
        id: 'PHR-L03',
        name: 'PHR login ABHA OTP verify issues session token',
        module: 'PHR_LOGIN',
        abdmRef: 'M1 ABHA — PHR Web login/abha/verify',
        run: async (ctx) => {
          const res = await this.phrService.handlePhr(
            { action: 'login-abha-verify', txnId: simTxn, otp: '123456' },
            ctx,
          );
          return {
            passed: res.status === 'success' && !!res.token,
            assertions: [
              { name: 'Token issued', passed: !!res.token, got: !!res.token, expected: true },
            ],
            responsePayload: res,
          };
        },
      },
      {
        id: 'PHR-P01',
        name: 'PHR profile fetch with X-Token',
        module: 'PHR_PROFILE',
        abdmRef: 'PHR Profile — login/profile',
        run: async (ctx) => {
          const res = await this.phrService.handlePhr({ action: 'get-profile', xToken: simToken }, ctx);
          const data = res.data as { abhaAddress?: string } | undefined;
          return {
            passed: res.status === 'success' && !!data?.abhaAddress,
            assertions: [
              { name: 'Profile returned', passed: !!data?.abhaAddress, got: data?.abhaAddress, expected: 'non-empty' },
            ],
            responsePayload: res,
          };
        },
      },
      {
        id: 'PHR-P02',
        name: 'PHR card download',
        module: 'PHR_PROFILE',
        abdmRef: 'PHR Profile — login/profile/phrCard',
        run: async (ctx) => {
          const res = await this.phrService.handlePhr({ action: 'get-phr-card', xToken: simToken }, ctx);
          return {
            passed: res.status === 'success' && !!res.card,
            assertions: [
              { name: 'Card payload', passed: !!res.card, got: !!res.card, expected: true },
            ],
            responsePayload: res,
          };
        },
      },
      {
        id: 'PHR-PIN01',
        name: 'Consent PIN creation',
        module: 'PHR_PIN',
        abdmRef: 'Consent_Pin — POST /patients/pin',
        run: async (ctx) => {
          const res = await this.phrService.handlePhr(
            { action: 'create-pin', xToken: simToken, pin: '1234' },
            ctx,
          );
          return {
            passed: res.status === 'success',
            assertions: [
              { name: 'PIN created', passed: res.status === 'success', got: res.status, expected: 'success' },
            ],
            responsePayload: res,
          };
        },
      },
      {
        id: 'PHR-PIN02',
        name: 'Consent PIN verification',
        module: 'PHR_PIN',
        abdmRef: 'Consent_Pin — POST /patients/verify-pin',
        run: async (ctx) => {
          const res = await this.phrService.handlePhr(
            { action: 'verify-pin', xToken: simToken, pin: '1234' },
            ctx,
          );
          return {
            passed: res.status === 'success',
            assertions: [
              { name: 'PIN verified', passed: res.status === 'success', got: res.status, expected: 'success' },
            ],
            responsePayload: res,
          };
        },
      },
      {
        id: 'PHR-PIN03',
        name: 'Forgot PIN — generate OTP',
        module: 'PHR_PIN',
        abdmRef: 'Consent_Pin — POST /patients/forgot-pin/generate-otp',
        run: async (ctx) => {
          const res = await this.phrService.handlePhr(
            { action: 'forgot-pin-generate-otp', xToken: simToken },
            ctx,
          );
          return {
            passed: res.status === 'success' && !!res.txnId,
            assertions: [
              { name: 'Recovery txnId', passed: !!res.txnId, got: !!res.txnId, expected: true },
            ],
            responsePayload: res,
          };
        },
      },
      {
        id: 'PHR-PIN04',
        name: 'Forgot PIN — validate OTP and reset',
        module: 'PHR_PIN',
        abdmRef: 'Consent_Pin — validate-otp + PUT /patients/reset-pin',
        run: async (ctx) => {
          const validate = await this.phrService.handlePhr(
            { action: 'forgot-pin-validate-otp', xToken: simToken, txnId: simTxn, otp: '123456' },
            ctx,
          );
          const reset = await this.phrService.handlePhr(
            {
              action: 'reset-pin',
              xToken: simToken,
              pin: '5678',
              sessionId: String(validate.sessionId || 'sim-session'),
            },
            ctx,
          );
          return {
            passed: validate.status === 'success' && reset.status === 'success',
            assertions: [
              { name: 'OTP validated', passed: validate.status === 'success', got: validate.status, expected: 'success' },
              { name: 'PIN reset', passed: reset.status === 'success', got: reset.status, expected: 'success' },
            ],
            responsePayload: { validate, reset },
          };
        },
      },
      {
        id: 'PHR-LOCK01',
        name: 'List patient health lockers',
        module: 'PHR_LOCKER',
        abdmRef: 'PHR & Locker HIECM — patients/lockers',
        run: async (ctx) => {
          const res = await this.phrService.handlePhr({ action: 'list-lockers', xToken: simToken }, ctx);
          const lockers = res.lockers as unknown[] | undefined;
          return {
            passed: res.status === 'success' && Array.isArray(lockers),
            assertions: [
              { name: 'Lockers listed', passed: Array.isArray(lockers), got: lockers?.length, expected: '>= 0' },
            ],
            responsePayload: res,
          };
        },
      },
      {
        id: 'PHR-CON01',
        name: 'List consent requests for patient',
        module: 'PHR_CONSENT',
        abdmRef: 'PHR & Locker HIECM — consent/v3/request',
        run: async (ctx) => {
          const res = await this.phrService.handlePhr(
            { action: 'list-consents', xToken: simToken, status: 'ALL' },
            ctx,
          );
          return {
            passed: res.status === 'success' && !!res.consents,
            assertions: [
              { name: 'Consents payload', passed: !!res.consents, got: !!res.consents, expected: true },
            ],
            responsePayload: res,
          };
        },
      },
      {
        id: 'PHR-CON02',
        name: 'Approve consent request',
        module: 'PHR_CONSENT',
        abdmRef: 'PHR & Locker HIECM — consent request approve',
        run: async (ctx) => {
          const res = await this.phrService.handlePhr(
            {
              action: 'approve-consent',
              xToken: simToken,
              consentRequestId: 'd79409b1-0235-43fd-ac75-ee0cf6be1a44',
            },
            ctx,
          );
          return {
            passed: res.status === 'success',
            assertions: [
              { name: 'Consent approved', passed: res.status === 'success', got: res.status, expected: 'success' },
            ],
            responsePayload: res,
          };
        },
      },
    ];

    for (const testCase of suite) {
      const tStart = Date.now();
      try {
        const result = await testCase.run(context);
        const durationMs = Date.now() - tStart;
        if (result.passed) passedCount++;
        else failedCount++;
        testResults.push({
          id: testCase.id,
          name: testCase.name,
          module: testCase.module,
          abdmRef: testCase.abdmRef,
          endpoint: '/api/abdm/phr',
          method: 'POST',
          passed: result.passed,
          durationMs,
          assertions: result.assertions,
          responsePayload: result.responsePayload,
        });
      } catch (e: unknown) {
        failedCount++;
        const message = e instanceof Error ? e.message : String(e);
        testResults.push({
          id: testCase.id,
          name: testCase.name,
          module: testCase.module,
          abdmRef: testCase.abdmRef,
          endpoint: '/api/abdm/phr',
          method: 'POST',
          passed: false,
          durationMs: Date.now() - tStart,
          assertions: [{ name: 'No uncaught error', passed: false, got: message, expected: 'success' }],
        });
      }
    }

    return {
      status: 'success',
      suite: 'PHR_COMPLIANCE',
      summary: {
        total: suite.length,
        passed: passedCount,
        failed: failedCount,
        successRate: parseFloat(((passedCount / suite.length) * 100).toFixed(1)),
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      results: testResults,
      references: [
        'docs/abdm/certification-checklist.md',
        'docs/abdm/postman/PHR-HIECM.postman_collection.json',
        'docs/abdm/postman/Consent-PIN.postman_collection.json',
      ],
    };
  }
}
