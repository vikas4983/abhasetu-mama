/**
 * @file        consent-hiu.controller.ts
 * @description Controller mapping consent request initiation and clinical record fetching.
 * @module      abdm/consent-hiu
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Controller, Post, Body, Res, Req, HttpStatus } from '@nestjs/common';
import { ConsentHiuService } from './consent-hiu.service';
import * as express from 'express';

@Controller()
export class ConsentHiuController {
  constructor(private readonly consentHiuService: ConsentHiuService) {}

  @Post('consent')
  async handleConsent(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const context = { ip, userAgent };

    const result = await this.consentHiuService.handleConsent(body, context);
    if (result.status === 'error') {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json(result);
  }
}
