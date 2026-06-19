/**
 * @file        enrollment.controller.ts
 * @description Controller handling citizen/patient onboarding, OTP validation, and demographic document-based (Aadhaar/DL) enrollment.
 * @module      abdm
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Controller, Post, Body, Res, Req, HttpStatus } from '@nestjs/common';
import { AbdmService } from '../abdm.service';
import * as express from 'express';
import * as crypto from 'crypto';

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
export class AbdmEnrollmentController {
  constructor(private readonly abdmService: AbdmService) {}

  /**
   * @description Handles legacy or V1/V2 enroll OTP actions.
   * @param {any} body - Payloads.
   * @param {express.Response} res - Express response.
   * @param {express.Request} req - Express request.
   * @returns {Promise<express.Response>} Enrollment status output.
   */
  @Post('enroll')
  async enroll(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    try {
      const { action, aadhaar, mobile, otp, txnId } = body;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
      const userAgent = req.headers['user-agent'] || '';
      const context = { ip, userAgent };

      // Aadhaar Onboarding
      if (action === 'request-otp') {
        const result = await this.abdmService.requestAadhaarOtp(aadhaar, context);
        if (result.status === 'error') {
          return res.status(HttpStatus.BAD_REQUEST).json(result);
        }
        return res.status(HttpStatus.OK).json(result);
      }

      if (action === 'verify-otp') {
        const result = await this.abdmService.verifyAadhaarOtp(otp, txnId, mobile, aadhaar, context);
        if (result.status === 'error') {
          return res.status(HttpStatus.BAD_REQUEST).json(result);
        }
        return res.status(HttpStatus.OK).json(result);
      }

      // Mobile Onboarding
      if (action === 'request-mobile-otp') {
        const result = await this.abdmService.requestMobileOtp(mobile, undefined, context);
        if (result.status === 'error') {
          return res.status(HttpStatus.BAD_REQUEST).json(result);
        }
        return res.status(HttpStatus.OK).json(result);
      }

      if (action === 'verify-mobile-otp') {
        const result = await this.abdmService.verifyMobileOtp(otp, txnId, mobile, context);
        if (result.status === 'error') {
          return res.status(HttpStatus.BAD_REQUEST).json(result);
        }
        return res.status(HttpStatus.OK).json(result);
      }

      if (action === 'enrol-by-document') {
        const result = await this.abdmService.enrolByDocument(body, context);
        if (result.status === 'error') {
          return res.status(HttpStatus.BAD_REQUEST).json(result);
        }
        return res.status(HttpStatus.OK).json(result);
      }

      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: 'Invalid onboarding action.' });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message || 'Onboarding action failed.' });
    }
  }

  /**
   * @description Requests OTP for V3 enrollment.
   * @param {any} body - Payloads.
   * @param {express.Response} res - Express response.
   * @param {express.Request} req - Express request.
   * @returns {Promise<express.Response>} OTP transaction ID status.
   */
  @Post('v3/enrollment/request/otp')
  async v3RequestOtp(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    try {
      const { loginHint, loginId } = body;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
      const userAgent = req.headers['user-agent'] || '';
      const context = { ip, userAgent };

      if (loginHint === 'aadhaar') {
        const result = await this.abdmService.requestAadhaarOtp(loginId, context);
        if (result.status === 'error') {
          return res.status(HttpStatus.BAD_REQUEST).json(result);
        }
        return res.status(HttpStatus.OK).json({
          status: 'success',
          txnId: result.txnId,
          message: result.message || 'OTP sent to Aadhaar-linked mobile.'
        });
      } else if (loginHint === 'mobile') {
        if (body.currentMobile && loginId === body.currentMobile) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'error',
            message: 'New mobile number cannot be the same as your current mobile number.'
          });
        }
        const txnId = getCookie(req.headers.cookie, 'txn_id') || body.txnId || '';
        const result = await this.abdmService.requestMobileOtp(loginId, txnId, context);
        if (result.status === 'error') {
          return res.status(HttpStatus.BAD_REQUEST).json(result);
        }
        return res.status(HttpStatus.OK).json({
          status: 'success',
          txnId: result.txnId,
          message: result.message || 'OTP sent to mobile number.'
        });
      }

      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: 'Invalid loginHint.' });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message || 'Failed to request OTP.' });
    }
  }

  /**
   * @description Completes V3 demographic enrollment by Aadhaar.
   * @param {any} body - Payloads.
   * @param {express.Response} res - Express response.
   * @param {express.Request} req - Express request.
   * @returns {Promise<express.Response>} Issue result profile with tokens.
   */
  @Post('v3/enrollment/enrol/byAadhaar')
  async v3EnrolByAadhaar(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    try {
      const { txnId, authData } = body;
      const otp = authData?.otp?.otpValue;
      const mobile = authData?.otp?.mobile;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
      const userAgent = req.headers['user-agent'] || '';
      const context = { ip, userAgent };

      const result = await this.abdmService.verifyAadhaarOtp(otp, txnId, mobile, undefined, context);
      if (result.status === 'error') {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }

      // Securely store user session id (token), refresh token, and public key in httpOnly cookies
      if (result.tokens?.token) {
        res.cookie('session_id', result.tokens.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: result.tokens.expiresIn * 1000
        });
        res.cookie('x_token', result.tokens.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: result.tokens.expiresIn * 1000
        });
      }
      if (result.tokens?.refreshToken) {
        res.cookie('refresh_token', result.tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: result.tokens.refreshExpiresIn * 1000
        });
      }
      try {
        const config = await this.abdmService.getConfig();
        if (config.ABDM_PUBLIC_KEY) {
          res.cookie('public_key', config.ABDM_PUBLIC_KEY, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600 * 1000
          });
        }
      } catch (e) {}

      if (result.txnId) {
        res.cookie('txn_id', result.txnId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600 * 1000 // 1 hour
        });
      }

      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message || 'Aadhaar verification failed.' });
    }
  }

  /**
   * @description Verifies mobile OTP for V3 flow.
   * @param {any} body - Payloads.
   * @param {express.Response} res - Express response.
   * @param {express.Request} req - Express request.
   * @returns {Promise<express.Response>} Enrollment linking result.
   */
  @Post('v3/enrollment/auth/byAbdm')
  async v3AuthByAbdm(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    try {
      const { authData } = body;
      const txnId = body.txnId || authData?.otp?.txnId || body.otp?.txnId || '';
      const otp = authData?.otp?.otpValue || body.otp?.otpValue;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
      const userAgent = req.headers['user-agent'] || '';
      const context = { ip, userAgent };

      const result = await this.abdmService.verifyMobileOtp(otp, txnId, undefined, context);
      if (result.status === 'error') {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }

      // Securely store user session id (token) and refresh token in httpOnly cookies
      if (result.tokens?.token) {
        res.cookie('session_id', result.tokens.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: result.tokens.expiresIn * 1000
        });
        res.cookie('x_token', result.tokens.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: result.tokens.expiresIn * 1000
        });
      }
      if (result.tokens?.refreshToken) {
        res.cookie('refresh_token', result.tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: result.tokens.refreshExpiresIn * 1000
        });
      }

      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message || 'Mobile verification failed.' });
    }
  }

  /**
   * @description Enrolls a citizen using document details.
   * @param {any} body - Payloads.
   * @param {express.Response} res - Express response.
   * @param {express.Request} req - Express request.
   * @returns {Promise<express.Response>} Onboarding result profile.
   */
  @Post('v3/enrollment/enrol/byDocument')
  async v3EnrolByDocument(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
      const userAgent = req.headers['user-agent'] || '';
      const context = { ip, userAgent };

      // Support both root-level flat properties and legacy nested authData.document structure
      const txnId = body.txnId || '';
      const doc = body.authData?.document;
      
      const documentType = body.documentType || doc?.documentType || 'DRIVING_LICENCE';
      const documentId = body.documentId || doc?.documentId || '';
      const firstName = body.firstName || doc?.firstName || '';
      const middleName = body.middleName || doc?.middleName || '';
      const lastName = body.lastName || doc?.lastName || '';
      const dob = body.dob || doc?.dob || '';
      const gender = body.gender || doc?.gender || '';
      const frontSidePhoto = body.frontSidePhoto || doc?.frontSidePhoto || '';
      const backSidePhoto = body.backSidePhoto || doc?.backSidePhoto || '';
      const address = body.address || doc?.address || '';
      const state = body.state || doc?.state || '';
      const district = body.district || doc?.district || '';
      const pinCode = body.pinCode || doc?.pinCode || '';
      const mobile = body.mobile || doc?.mobile || '';

      const demographics = {
        txnId,
        documentType,
        documentId,
        firstName,
        middleName,
        lastName,
        dob,
        gender,
        frontSidePhoto,
        backSidePhoto,
        address,
        state,
        district,
        pinCode,
        mobile
      };

      const result = await this.abdmService.enrolByDocument(demographics, context);
      if (result.status === 'error') {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message || 'Document onboarding failed.' });
    }
  }

  /**
   * @description Requests verification OTP for DL enrollment.
   * @param {any} body - Payloads.
   * @param {express.Request} req - Express request.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Issue OTP status.
   */
  @Post('v3/enrollment/dl/request/otp')
  async requestDlOtp(@Body() body: any, @Req() req: express.Request, @Res() res: express.Response) {
    try {
      const { mobileNumber, dlNumber } = body;
      let dlToken = getCookie(req.headers.cookie, 'dl_access_token') || req.headers.authorization?.replace('Bearer ', '') || body.token;
      if (!dlToken) {
        dlToken = 'mock-dl-access-token-jwt-style-abc123xyz';
      }
      const result = await this.abdmService.requestDlOtp(mobileNumber, dlToken, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      if (result.txnId) {
        res.cookie('dl_txn_id', result.txnId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600 * 1000
        });
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Verifies DL OTP.
   * @param {any} body - Payloads.
   * @param {express.Request} req - Express request.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} DL OTP verification state status.
   */
  @Post('v3/enrollment/dl/verify/otp')
  async verifyDlOtp(@Body() body: any, @Req() req: express.Request, @Res() res: express.Response) {
    try {
      const { otp } = body;
      let txnId = getCookie(req.headers.cookie, 'dl_txn_id') || body.txnId || body.dlTxnId || req.headers['x-txn-id'];
      let dlToken = getCookie(req.headers.cookie, 'dl_access_token') || req.headers.authorization?.replace('Bearer ', '') || body.token;
      if (!dlToken) {
        dlToken = 'mock-dl-access-token-jwt-style-abc123xyz';
      }
      if (!txnId) {
        txnId = crypto.randomUUID();
      }
      const result = await this.abdmService.verifyDlOtp(otp, txnId, dlToken);
      if (result.status === 'error') {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Completes DL enrollment and registers the profile.
   * @param {any} body - Payloads.
   * @param {express.Request} req - Express request.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Issue result profile details.
   */
  @Post('v3/enrollment/enrol/byDl')
  async enrolByDl(@Body() body: any, @Req() req: express.Request, @Res() res: express.Response) {
    try {
      let dlToken = getCookie(req.headers.cookie, 'dl_access_token') || req.headers.authorization?.replace('Bearer ', '') || body.token;
      let dlTxnId = getCookie(req.headers.cookie, 'dl_txn_id') || body.txnId || body.dlTxnId || req.headers['x-txn-id'];
      if (!dlToken) {
        dlToken = 'mock-dl-access-token-jwt-style-abc123xyz';
      }
      if (!dlTxnId) {
        dlTxnId = crypto.randomUUID();
      }
      const result = await this.abdmService.enrolByDl(body, dlToken, dlTxnId);
      if (result.status === 'error') {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }
}
