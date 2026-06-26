/**
 * @file        callbacks.controller.ts
 * @description Receives all ABDM v0.5 async gateway callbacks
 * @module      abdm/callbacks
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { CallbacksService } from './callbacks.service';

@SkipThrottle()
@Controller('callbacks/v0.5')
export class CallbacksController {
  constructor(private readonly callbacksService: CallbacksService) {}

  @Post('users/auth/on-fetch-modes')
  @HttpCode(HttpStatus.ACCEPTED)
  onFetchModes(@Body() body: Record<string, unknown>) {
    return this.callbacksService.handle('on-fetch-modes', body);
  }

  @Post('care-contexts/on-discover')
  @HttpCode(HttpStatus.ACCEPTED)
  onDiscover(@Body() body: Record<string, unknown>) {
    return this.callbacksService.handle('on-discover', body);
  }

  @Post('links/on-confirm')
  @HttpCode(HttpStatus.ACCEPTED)
  onLinkConfirm(@Body() body: Record<string, unknown>) {
    return this.callbacksService.handle('on-confirm', body);
  }

  @Post('consent-requests/on-init')
  @HttpCode(HttpStatus.ACCEPTED)
  onConsentInit(@Body() body: Record<string, unknown>) {
    return this.callbacksService.handle('on-init', body);
  }

  @Post('consents/on-fetch')
  @HttpCode(HttpStatus.ACCEPTED)
  onConsentFetch(@Body() body: Record<string, unknown>) {
    return this.callbacksService.handle('on-fetch', body);
  }

  @Post('health-information/on-request')
  @HttpCode(HttpStatus.ACCEPTED)
  onHealthInfoRequest(@Body() body: Record<string, unknown>) {
    return this.callbacksService.handle('on-request', body);
  }

  @Post('health-information/notify')
  @HttpCode(HttpStatus.ACCEPTED)
  onHealthInfoNotify(@Body() body: Record<string, unknown>) {
    return this.callbacksService.handle('on-notify', body);
  }
}
