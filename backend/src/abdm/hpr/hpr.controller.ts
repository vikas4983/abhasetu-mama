/**
 * @file        hpr.controller.ts
 * @description Controller mapping Healthcare Professionals Registry (HPR) routing and callbacks.
 * @module      abdm/hpr
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Controller, Post, Body, Res, Req, HttpStatus } from '@nestjs/common';
import { HprService } from './hpr.service';
import * as express from 'express';

@Controller()
export class HprController {
  constructor(private readonly hprService: HprService) {}

  @Post('hpr')
  async handleHpr(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const context = { ip, userAgent };

    const result = await this.hprService.handleHpr(body, context);
    if (result.status === 'error') {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json(result);
  }
}
