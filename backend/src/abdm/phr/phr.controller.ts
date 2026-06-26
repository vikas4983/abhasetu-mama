/**
 * @file        phr.controller.ts
 * @description Controller for PHR registration, login, profile, locker, and consent PIN APIs
 * @module      abdm/phr
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Controller, Post, Get, Body, Res, Req, HttpStatus, Query } from '@nestjs/common';
import { PhrService } from './phr.service';
import { PHR_POSTMAN_COLLECTIONS } from './phr-postman.constants';
import * as express from 'express';
import { PhrActionDto } from './dto/phr-action.dto';

@Controller()
export class PhrController {
  constructor(private readonly phrService: PhrService) {}

  /**
   * @description Unified PHR action router (enrollment, login, PIN, locker, consent)
   */
  @Post('phr')
  async handlePhr(@Body() body: PhrActionDto, @Res() res: express.Response, @Req() req: express.Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const result = await this.phrService.handlePhr(body as unknown as Record<string, unknown>, { ip, userAgent });
    if (result.status === 'error') {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json(result);
  }

  @Get('phr/compliance')
  async getComplianceCatalog(@Res() res: express.Response) {
    return res.status(HttpStatus.OK).json({
      status: 'success',
      modules: ['PHR_ENROLL', 'PHR_LOGIN', 'PHR_PROFILE', 'PHR_PIN', 'PHR_LOCKER', 'PHR_CONSENT', 'PHR_HID', 'PHR_HIECM_CM'],
      postmanCollections: PHR_POSTMAN_COLLECTIONS,
      docs: 'docs/abdm/postman/phr-collections-index.md',
      reference: '/docs/abdm/certification-checklist.md',
    });
  }

  @Get('phr/postman')
  async getPostmanReference(@Res() res: express.Response) {
    return res.status(HttpStatus.OK).json({
      status: 'success',
      collections: {
        registrationEnrollment: {
          file: PHR_POSTMAN_COLLECTIONS.REGISTRATION_ENROLLMENT,
          bffActions: [
            'hid-aadhaar-generate-otp',
            'hid-aadhaar-verify-otp',
            'hid-mobile-generate-otp',
            'hid-mobile-verify-otp',
            'hid-mobile-create-health-id',
            'hid-search-exists',
            'enrollment-request-otp',
            'enrollment-verify',
            'enrollment-enrol',
          ],
        },
        login: {
          file: PHR_POSTMAN_COLLECTIONS.LOGIN,
          bffActions: [
            'hid-auth-init',
            'hid-auth-confirm-aadhaar-otp',
            'hid-auth-confirm-mobile-otp',
            'hid-mobile-login-generate-otp',
            'hid-mobile-login-verify-otp',
            'login-abha-search',
            'login-abha-verify',
          ],
        },
        profile: {
          file: PHR_POSTMAN_COLLECTIONS.PROFILE,
          bffActions: ['hid-account-profile', 'hid-account-update-profile', 'hid-account-qrcode', 'get-profile', 'get-phr-card'],
        },
        lockerHiecm: {
          file: PHR_POSTMAN_COLLECTIONS.LOCKER_HIECM,
          bffActions: [
            'cm-create-session',
            'cm-otp-session-verify',
            'cm-patients-me',
            'cm-list-consent-requests',
            'cm-grant-consent',
            'cm-deny-consent',
            'cm-get-patient-lockers',
            'cm-patient-requests',
            'cm-patient-links',
            'list-lockers',
            'approve-consent',
          ],
        },
        consentPin: {
          file: PHR_POSTMAN_COLLECTIONS.CONSENT_PIN,
          bffActions: ['create-pin', 'verify-pin', 'change-pin', 'forgot-pin-generate-otp', 'forgot-pin-validate-otp', 'reset-pin'],
        },
      },
    });
  }

  @Get('phr/v3/web/login/profile')
  async proxyGetProfile(@Query('xToken') xToken: string, @Req() req: express.Request, @Res() res: express.Response) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const token = xToken || (req.headers['x-token'] as string) || '';
    const result = await this.phrService.handlePhr({ action: 'get-profile', xToken: token }, { ip });
    return res.status(result.status === 'error' ? HttpStatus.BAD_REQUEST : HttpStatus.OK).json(result);
  }
}
