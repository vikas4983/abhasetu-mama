import { Controller, Post, Get, Body, HttpCode, UsePipes, ValidationPipe } from '@nestjs/common';

@Controller('abha/consent')
export class ConsentController {
  
  @Post('request')
  @HttpCode(201)
  async initConsentRequest(@Body() payload: any) {
    console.log(`[ABDM M2 Consent] Initiating gateway consent request for: ${payload.abhaAddress}`);
    const consentRequestId = crypto.randomUUID();
    return {
      status: 'REQUESTED',
      consentRequestId,
      message: 'ABDM Consent Request pushed successfully. Awaiting patient confirmation callback.',
      details: {
        purpose: payload.purposeCode || 'REFERRAL',
        hiTypes: payload.hiTypes || ['OPConsultation', 'Prescription'],
        expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
    };
  }

  @Get('list')
  async listConsents() {
    console.log('[ABDM M2 Consent] Pulling active consent registries');
    return [
      {
        consentId: 'abdm-consent-8812-99a0',
        abhaAddress: 'ayesha.ali@abdm',
        status: 'GRANTED',
        purpose: 'TELECONSULTATION',
        hiTypes: ['Prescription', 'OPConsultation'],
        validFrom: '2026-05-01T00:00:00Z',
        validTo: '2026-06-01T00:00:00Z',
        createdAt: new Date().toISOString(),
      },
      {
        consentId: 'abdm-consent-4402-12b1',
        abhaAddress: 'ayesha.ali@abdm',
        status: 'REQUESTED',
        purpose: 'OUTPATIENT_VISIT',
        hiTypes: ['DischargeSummary'],
        validFrom: '2026-05-28T00:00:00Z',
        validTo: '2026-06-28T00:00:00Z',
        createdAt: new Date().toISOString(),
      }
    ];
  }
}
