import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ('admin' | 'master_admin')[]) =>
  SetMetadata(ROLES_KEY, roles);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Access token is missing or malformed.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = this.authService.verifyJwt(token);

    // Attach user payload to the request
    request.user = decoded;

    // Check roles if defined
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      // If no specific roles required, having any valid admin token is enough
      return decoded.role === 'admin' || decoded.role === 'master_admin';
    }

    const hasRole = requiredRoles.includes(decoded.role);
    if (!hasRole) {
      throw new UnauthorizedException('Insufficient permissions for this action.');
    }

    return true;
  }
}
