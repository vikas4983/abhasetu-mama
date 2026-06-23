/**
 * @file        uhi.controller.ts
 * @description Controller mapping Unified Health Interface (UHI) consult routing and callbacks.
 * @module      abdm/uhi
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Controller, Post, Body, Res, Req, HttpStatus } from '@nestjs/common';
import { UhiService } from './uhi.service';
import * as express from 'express';

@Controller()
export class UhiController {
  constructor(private readonly uhiService: UhiService) {}

  @Post('uhi')
  async handleUhi(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const context = { ip, userAgent };

    const result = await this.uhiService.handleUhi(body, context);
    if (result.status === 'error') {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json(result);
  }
}
