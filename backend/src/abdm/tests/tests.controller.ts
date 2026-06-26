/**
 * @file        tests.controller.ts
 * @description Controller for triggering and managing the automated ABDM compliance tests.
 * @module      abdm/tests
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-22
 * @modified    2026-06-22
 */

import { Controller, Get, Res, Req, HttpStatus } from '@nestjs/common';
import { TestsService } from './tests.service';
import { PhrComplianceService } from './phr-compliance.service';
import * as express from 'express';

@Controller()
export class TestsController {
  constructor(
    private readonly testsService: TestsService,
    private readonly phrComplianceService: PhrComplianceService,
  ) {}

  /**
   * @description Triggers the compliance test suite and returns the execution report.
   * @param {express.Response} res - Express response object.
   * @param {express.Request} req - Express request object.
   * @returns {Promise<express.Response>} The test suite results payload.
   */
  @Get('tests')
  async tests(@Res() res: express.Response, @Req() req: express.Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const context = { ip, userAgent };
    const result = await this.testsService.runTests(context);
    if (result.status === 'error') {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json(result);
  }

  /**
   * @description Runs PHR-specific ABDM compliance test suite (enrollment, login, PIN, locker, consent)
   */
  @Get('tests/phr')
  async phrTests(@Res() res: express.Response, @Req() req: express.Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const result = await this.phrComplianceService.runPhrComplianceTests({ ip, userAgent });
    return res.status(HttpStatus.OK).json(result);
  }
}
