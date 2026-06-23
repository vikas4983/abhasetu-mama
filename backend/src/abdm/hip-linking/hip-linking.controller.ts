/**
 * @file        hip-linking.controller.ts
 * @description Controller mapping care context discovery, confirmation linking, and scan & share kiosk workflows.
 * @module      abdm/hip-linking
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Controller, Post, Body, Res, Req, HttpStatus } from '@nestjs/common';
import { HipLinkingService } from './hip-linking.service';
import * as express from 'express';

@Controller()
export class HipLinkingController {
  constructor(private readonly hipLinkingService: HipLinkingService) {}

  @Post('hip')
  async handleHip(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const context = { ip, userAgent };

    const result = await this.hipLinkingService.handleHip(body, context);
    if (result.status === 'error') {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json(result);
  }

  @Post('scan-share')
  async handleScanShare(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const context = { ip, userAgent };

    const result = await this.hipLinkingService.handleScanShare(body, context);
    if (result.status === 'error') {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json(result);
  }
}
