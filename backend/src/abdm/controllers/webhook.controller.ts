import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';

@Controller('v0.5')
export class WebhookController {
  
  @Post('consent-requests/on-init')
  @HttpCode(202)
  async onConsentInit(@Body() payload: any, @Headers('x-hip-signature') signature: string) {
    console.log(`[ABDM Webhook] Received /consent-requests/on-init callback`);
    // Immediately log callback and place in worker queue
    return { status: 'ACCEPTED' };
  }

  @Post('care-contexts/discover')
  @HttpCode(202)
  async discoverCareContexts(@Body() payload: any) {
    const transactionId = payload?.transactionId;
    const patientAddress = payload?.patient?.id;
    console.log(`[ABDM Webhook] Care Context Discovery request for patient: ${patientAddress}, txn: ${transactionId}`);
    
    // Simulate immediate asynchronous discovery response sequence
    return { status: 'ACCEPTED' };
  }

  @Post('links/link/init')
  @HttpCode(202)
  async initiateLinkage(@Body() payload: any) {
    const patientId = payload?.patient?.id;
    console.log(`[ABDM Webhook] Context Linkage initiation requested for patient: ${patientId}`);
    return { status: 'ACCEPTED' };
  }
}
