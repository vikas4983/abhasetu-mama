/**
 * @file        abdm.controller.ts
 * @description Controller handling all ABDM-related REST API endpoints, including sessions, onboarding, and claims.
 * @module      abdm
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-10
 */

import { Controller, Get, Post, Put, Delete, Body, Query, Res, Req, HttpStatus, UseGuards } from '@nestjs/common';
import { AbdmService } from './abdm.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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
export class AbdmController {
  constructor(
    private readonly abdmService: AbdmService,
    private readonly authService: AuthService
  ) {}

  // --- AUTHENTICATION ENDPOINTS ---

  @Post('admin/login')
  async adminLogin(@Body() body: any) {
    const { email, password } = body;
    return this.authService.validateAndLogin(email, password);
  }

  // --- GATEWAY SESSION HANDSHAKES ---
  
  // Get active session token. We wrap it in a try-catch so that if the ABDM gateway is offline or credentials are not set, we return the actual error message instead of a generic 500 error.
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

  // Generate new gateway session token. We use try-catch here as well to capture and send any backend credential errors to the admin page.
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

  // --- ABDM PUBLIC KEY MANUAL SYNC ---
  
  // Fetch the public key from the gateway. If this fails due to a network issue or invalid session token, we report the actual gateway response to the frontend console log.
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

  // --- MILESTONE 1 Aadhaar & Mobile Onboarding ---
  @Post('enroll')
  async enroll(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
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
  }

  // --- PATH-CONSISTENT ABDM V3 ENROLLMENT ENDPOINTS ---

  @Post('v3/enrollment/request/otp')
  async v3RequestOtp(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
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
  }

  @Post('v3/enrollment/enrol/byAadhaar')
  async v3EnrolByAadhaar(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
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
  }

  @Post('v3/enrollment/auth/byAbdm')
  async v3AuthByAbdm(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    const { txnId, authData } = body;
    const otp = authData?.otp?.otpValue;
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
  }

  @Post('v3/enrollment/enrol/byDocument')
  async v3EnrolByDocument(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    const { txnId, authData } = body;
    const doc = authData?.document;
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const context = { ip, userAgent };

    const demographics = {
      txnId,
      firstName: doc?.firstName,
      lastName: doc?.lastName,
      dob: doc?.dob,
      gender: doc?.gender,
      mobile: doc?.mobile,
      address: doc?.address,
      state: doc?.state,
      district: doc?.district,
      pinCode: doc?.pinCode
    };

    const result = await this.abdmService.enrolByDocument(demographics, context);
    if (result.status === 'error') {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json(result);
  }

  // --- ADMIN CONFIGURATION ---
  @UseGuards(JwtAuthGuard)
  @Get('admin/config')
  async getConfig() {
    const config = await this.abdmService.getConfig();
    return { status: 'success', config };
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/config')
  async saveConfig(@Body() body: any) {
    return this.abdmService.saveConfig(body);
  }

  // --- AUDIT LOGS ---
  @UseGuards(JwtAuthGuard)
  @Get('admin/logs')
  async getLogs() {
    const logs = await this.abdmService.getLogs();
    return { status: 'success', logs };
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/logs')
  async addLog(@Body() body: any) {
    const { event, status, details } = body;
    await this.abdmService.addLog(event, status, details);
    return { status: 'success' };
  }

  // --- PHARMACY PRODUCTS CATALOG CRUD ---
  @Get('pharmacy/products')
  async getProducts() {
    const products = await this.abdmService.getProducts();
    return { status: 'success', products };
  }

  @UseGuards(JwtAuthGuard)
  @Post('pharmacy/products')
  async addProduct(@Body() body: any) {
    return this.abdmService.saveProduct(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('pharmacy/products')
  async updateProduct(@Body() body: any) {
    return this.abdmService.saveProduct(body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('pharmacy/products')
  async deleteProduct(@Query('id') id: string) {
    return this.abdmService.deleteProduct(id);
  }

  // --- INSURANCE POLICIES CATALOG CRUD ---
  @Get('insurance/policies')
  async getPolicies() {
    const policies = await this.abdmService.getPolicies();
    return { status: 'success', policies };
  }

  @UseGuards(JwtAuthGuard)
  @Post('insurance/policies')
  async addPolicy(@Body() body: any) {
    return this.abdmService.savePolicy(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('insurance/policies')
  async updatePolicy(@Body() body: any) {
    return this.abdmService.savePolicy(body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('insurance/policies')
  async deletePolicy(@Query('id') id: string) {
    return this.abdmService.deletePolicy(id);
  }

  // --- LAB TESTS PACKAGES CATALOG CRUD ---
  @Get('lab-tests/packages')
  async getLabPackages() {
    const labPackages = await this.abdmService.getLabPackages();
    return { status: 'success', labPackages };
  }

  @UseGuards(JwtAuthGuard)
  @Post('lab-tests/packages')
  async addLabPackage(@Body() body: any) {
    return this.abdmService.saveLabPackage(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('lab-tests/packages')
  async updateLabPackage(@Body() body: any) {
    return this.abdmService.saveLabPackage(body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('lab-tests/packages')
  async deleteLabPackage(@Query('id') id: string) {
    return this.abdmService.deleteLabPackage(id);
  }

  // --- ABDM MODULE INTERFACE ENDPOINTS ---

  @Post('hip')
  async hip(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const context = { ip, userAgent };
    const result = await this.abdmService.handleHip(body, context);
    if (result.status === 'error') {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json(result);
  }

  @Post('consent')
  async consent(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const context = { ip, userAgent };
    const result = await this.abdmService.handleConsent(body, context);
    if (result.status === 'error') {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json(result);
  }

  @Post('scan-share')
  async scanShare(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const context = { ip, userAgent };
    const result = await this.abdmService.handleScanShare(body, context);
    if (result.status === 'error') {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json(result);
  }

  @Post('uhi')
  async uhi(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const context = { ip, userAgent };
    const result = await this.abdmService.handleUhi(body, context);
    if (result.status === 'error') {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json(result);
  }

  @Post('nhcx')
  async nhcx(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const context = { ip, userAgent };
    const result = await this.abdmService.handleNhcx(body, context);
    if (result.status === 'error') {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json(result);
  }

  @Post('hpr')
  async hpr(@Body() body: any, @Res() res: express.Response, @Req() req: express.Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const context = { ip, userAgent };
    const result = await this.abdmService.handleHpr(body, context);
    if (result.status === 'error') {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json(result);
  }

  @Get('tests')
  async tests(@Res() res: express.Response, @Req() req: express.Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const context = { ip, userAgent };
    const result = await this.abdmService.runTests(context);
    if (result.status === 'error') {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json(result);
  }

  // --- DOCTOR CONSULTATION FLOW DATA DIRECTORY ENDPOINTS ---

  @Get('doctor-consultation/specialties')
  async getSpecialtiesMatrix(@Res() res: express.Response) {
    try {
      const data = await this.abdmService.getSpecialtiesMatrix();
      return res.status(HttpStatus.OK).json({ status: 'success', specialties: data });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  @Get('doctor-consultation/doctors')
  async getDoctors(
    @Query('medicalSystem') medicalSystem: string,
    @Query('speciality') speciality: string,
    @Query('specialistRole') specialistRole: string,
    @Query('search') search: string,
    @Res() res: express.Response
  ) {
    try {
      const data = await this.abdmService.getDoctors(medicalSystem, speciality, specialistRole, search);
      return res.status(HttpStatus.OK).json({ status: 'success', doctors: data });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  @Post('doctor-consultation/doctors')
  async saveDoctor(@Body() body: any, @Res() res: express.Response) {
    try {
      const data = await this.abdmService.saveDoctor(body);
      return res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  @Delete('doctor-consultation/doctors')
  async deleteDoctor(@Query('id') id: string, @Res() res: express.Response) {
    try {
      const data = await this.abdmService.deleteDoctor(Number(id));
      return res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }
}
