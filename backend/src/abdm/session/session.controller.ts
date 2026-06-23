/**
 * @file        session.controller.ts
 * @description Controller handling session creation, refresh, public key certificate fetching, and token cache operations.
 * @module      abdm/session
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Controller, Get, Post, Res, Req, HttpStatus, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import * as express from 'express';

function getCookie(cookieHeader: string | undefined, name: string): string {
  if (!cookieHeader) return '';
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [key, val] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(val || '');
    }
  }
  return '';
}

@Controller()
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * @description Retrieves the active gateway session token.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Active session details.
   */
  @Get('sessions')
  async getSessions(@Res() res: express.Response) {
    try {
      const result = await this.sessionService.getGatewaySession();
      if (result.status === 'success') {
        res.cookie('session_id', result.tokenPreview, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600 * 1000 // 1 hour
        });
        res.cookie('public_key', result.publicKey || '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600 * 1000 // 1 hour
        });
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: error.message || 'Failed to retrieve gateway session.'
      });
    }
  }

  /**
   * @description Clears cached session token and generates a fresh one.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Fresh session token.
   */
  @UseGuards(JwtAuthGuard)
  @Post('admin/session/generate')
  async generateSession(@Res() res: express.Response) {
    try {
      const result = await this.sessionService.generateSessionToken();
      if (result.status === 'success') {
        res.cookie('session_id', result.tokenPreview, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600 * 1000 // 1 hour
        });
        try {
          const config = await this.sessionService.getConfig();
          res.cookie('public_key', config.ABDM_PUBLIC_KEY || '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600 * 1000
          });
        } catch (e) {}
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: error.message || 'Failed to generate session token.'
      });
    }
  }

  /**
   * @description Manually syncs the public key certificate from the ABDM/NHA gateway.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Succeeded or failed sync status.
   */
  @UseGuards(JwtAuthGuard)
  @Post('admin/fetch-public-key')
  async fetchPublicKey(@Res() res: express.Response) {
    try {
      const result = await this.sessionService.syncPublicKeyFromGateway();
      if (result.status === 'success') {
        res.cookie('public_key', result.publicKey, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600 * 1000
        });
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: error.message || 'Failed to sync public key.'
      });
    }
  }

  /**
   * @description Gets the cached ABDM gateway public key.
   * @param {express.Request} req - Express request.
   * @returns {Promise<{ status: string, publicKey: string }>} Public key certificate value.
   */
  @Get('crypto/public-key')
  async getCryptoPublicKey(@Req() req: express.Request) {
    let pubKey = getCookie(req.headers.cookie, 'public_key');
    if (!pubKey) {
      try {
        const config = await this.sessionService.getConfig();
        pubKey = config.ABDM_PUBLIC_KEY || '';
      } catch (e) {}
    }
    return { status: 'success', publicKey: pubKey };
  }
}
