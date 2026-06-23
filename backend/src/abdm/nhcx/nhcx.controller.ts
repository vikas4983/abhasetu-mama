/**
 * @file        nhcx.controller.ts
 * @description Controller mapping National Health Claims Exchange (NHCX) claim adjudications and eligibility workflows.
 * @module      abdm/nhcx
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Controller, Post, Body, Res, Req, HttpStatus } from '@nestjs/common';
import { NhcxService } from './nhcx.service';
import * as express from 'express';

@Controller()
export class NhcxController {
  constructor(private readonly nhcxService: NhcxService) {}

  @Post('nhcx')
  async handleNhcx(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const context = { ip, userAgent };

    const result = await this.nhcxService.handleNhcx(body, context);
    if (result.status === 'error') {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json(result);
  }
}
