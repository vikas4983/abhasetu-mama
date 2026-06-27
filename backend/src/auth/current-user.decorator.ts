/**
 * @file        current-user.decorator.ts
 * @description Param decorator — authenticated JWT user from request
 * @module      auth
 * @layer       decorator
 * @author      Platform Team
 * @created     2026-06-26
 */

import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtUserPayload } from './auth-user.interface';

/**
 * @description Inject the JWT user set by JwtAuthGuard / StakeholderJwtGuard
 * @param _data — unused
 * @param ctx — Nest execution context
 * @returns {JwtUserPayload} authenticated user
 * @throws {UnauthorizedException} when guard did not attach user
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUserPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (!request.user) {
      throw new UnauthorizedException('Authenticated user not found on request.');
    }
    return request.user;
  },
);
