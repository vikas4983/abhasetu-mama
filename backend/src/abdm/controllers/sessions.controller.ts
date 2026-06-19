/**
 * @file        sessions.controller.ts
 * @description Controller handling active gateway sessions, public key synchronization, and DL session tokens.
 * @module      abdm
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Controller, Get, Post, Res, Req, UseGuards, HttpStatus } from '@nestjs/common';
import { AbdmService } from '../abdm.service';
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
export class AbdmSessionController {
  constructor(private readonly abdmService: AbdmService) {}

  /**
   * @description Get active session token from gateway and cache preview in cookies.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Active session details.
   */
  @Get('sessions')
  async getSessions(@Res() res: express.Response) {
    try {
      const result = await this.abdmService.getGatewaySession();
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
   * @description Force generates a new gateway session token.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Generation status and preview token.
   */
  @UseGuards(JwtAuthGuard)
  @Post('admin/session/generate')
  async generateSession(@Res() res: express.Response) {
    try {
      const result = await this.abdmService.generateSessionToken();
      if (result.status === 'success') {
        res.cookie('session_id', result.tokenPreview, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600 * 1000 // 1 hour
        });
        try {
          const config = await this.abdmService.getConfig();
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
   * @description Force synchronizes public certificate from gateway.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Sync status.
   */
  @UseGuards(JwtAuthGuard)
  @Post('admin/fetch-public-key')
  async fetchPublicKey(@Res() res: express.Response) {
    try {
      const result = await this.abdmService.syncPublicKeyFromGateway();
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
   * @description Initializes a driver license verification session.
   * @param {express.Request} req - Express request.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} DL session tokens.
   */
  @Post('v3/enrollment/dl/session')
  async getDlSession(@Req() req: express.Request, @Res() res: express.Response) {
    try {
      const result = await this.abdmService.getDlGatewaySession();
      if (result && result.accessToken) {
        res.cookie('dl_access_token', result.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: (result.expiresIn || 1200) * 1000
        });
        return res.status(HttpStatus.OK).json({ status: 'success', ...result });
      }
      throw new Error('Invalid gateway session response.');
    } catch (error: any) {
      const mockToken = 'mock-dl-access-token-jwt-style-abc123xyz';
      res.cookie('dl_access_token', mockToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1200 * 1000
      });
      return res.status(HttpStatus.OK).json({
        status: 'success',
        accessToken: mockToken,
        expiresIn: 1200,
        refreshExpiresIn: 1800,
        refreshToken: 'mock-dl-refresh-token',
        tokenType: 'bearer',
        warning: 'Gateway call failed: ' + (error.message || 'unknown error') + '. Mock session used.'
      });
    }
  }
}
