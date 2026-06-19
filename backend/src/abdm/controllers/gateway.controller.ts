/**
 * @file        gateway.controller.ts
 * @description Controller handling core compliance endpoints and incoming triggers/callbacks from the ABDM Gateway.
 * @module      abdm
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Controller, Get, Post, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { AbdmService } from '../abdm.service';
import * as express from 'express';

@Controller()
export class AbdmGatewayController {
  constructor(private readonly abdmService: AbdmService) {}

  /**
   * @description Handles HIP callbacks and discovery requests.
   * @param {any} body - Callback payload from NHA bridge/gateway.
   * @param {express.Response} res - Express response.
   * @param {express.Request} req - Express request.
   * @returns {Promise<express.Response>} Immediate ACK response.
   */
  @Post('hip')
  async hip(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
      const userAgent = req.headers['user-agent'] || '';
      const context = { ip, userAgent };
      const result = await this.abdmService.handleHip(body, context);
      if (result.status === 'error') {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Handles consent request initialization, status checks, and approvals.
   * @param {any} body - Callback payload from HIE-CM.
   * @param {express.Response} res - Express response.
   * @param {express.Request} req - Express request.
   * @returns {Promise<express.Response>} Immediate ACK response.
   */
  @Post('consent')
  async consent(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
      const userAgent = req.headers['user-agent'] || '';
      const context = { ip, userAgent };
      const result = await this.abdmService.handleConsent(body, context);
      if (result.status === 'error') {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Handles M1/M2 scan and share token processing.
   * @param {any} body - Scan/share token details.
   * @param {express.Response} res - Express response.
   * @param {express.Request} req - Express request.
   * @returns {Promise<express.Response>} Verification and link result.
   */
  @Post('scan-share')
  async scanShare(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
      const userAgent = req.headers['user-agent'] || '';
      const context = { ip, userAgent };
      const result = await this.abdmService.handleScanShare(body, context);
      if (result.status === 'error') {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Handles Unified Health Interface (UHI) consultation booking callbacks.
   * @param {any} body - UHI callback payload.
   * @param {express.Response} res - Express response.
   * @param {express.Request} req - Express request.
   * @returns {Promise<express.Response>} Immediate ACK.
   */
  @Post('uhi')
  async uhi(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
      const userAgent = req.headers['user-agent'] || '';
      const context = { ip, userAgent };
      const result = await this.abdmService.handleUhi(body, context);
      if (result.status === 'error') {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Handles National Health Claims Exchange (NHCX) claim processing callbacks.
   * @param {any} body - NHCX policy/claim callback payload.
   * @param {express.Response} res - Express response.
   * @param {express.Request} req - Express request.
   * @returns {Promise<express.Response>} Claims submission status.
   */
  @Post('nhcx')
  async nhcx(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
      const userAgent = req.headers['user-agent'] || '';
      const context = { ip, userAgent };
      const result = await this.abdmService.handleNhcx(body, context);
      if (result.status === 'error') {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Handles Healthcare Professionals Registry (HPR) verification.
   * @param {any} body - HPR payload.
   * @param {express.Response} res - Express response.
   * @param {express.Request} req - Express request.
   * @returns {Promise<express.Response>} Registration status.
   */
  @Post('hpr')
  async hpr(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
      const userAgent = req.headers['user-agent'] || '';
      const context = { ip, userAgent };
      const result = await this.abdmService.handleHpr(body, context);
      if (result.status === 'error') {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Triggers automated compliance test scripts for the bridge.
   * @param {express.Response} res - Express response.
   * @param {express.Request} req - Express request.
   * @returns {Promise<express.Response>} Test run results list.
   */
  @Get('tests')
  async tests(@Res() res: express.Response, @Req() req: express.Request) {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
      const userAgent = req.headers['user-agent'] || '';
      const context = { ip, userAgent };
      const result = await this.abdmService.runTests(context);
      if (result.status === 'error') {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }
}
