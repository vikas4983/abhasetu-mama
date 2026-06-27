/**
 * @file        stakeholder-jwt.guard.ts
 * @description JWT guard for facility stakeholders (non-patient roles)
 * @module      auth
 * @layer       guard
 * @author      Platform Team
 * @created     2026-06-26
 */

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import type { JwtUserPayload } from './auth-user.interface';

@Injectable()
export class StakeholderJwtGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Access token is missing.');
    }
    const decoded: JwtUserPayload = this.authService.verifyJwt(authHeader.split(' ')[1]);
    if (decoded.role === 'patient') {
      throw new UnauthorizedException('Citizen accounts cannot access stakeholder operations.');
    }
    request.user = decoded;
    return true;
  }
}
