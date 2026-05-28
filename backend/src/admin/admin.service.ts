import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminLoginDto } from './dtos/admin.dto';

@Injectable()
export class AdminService {
  /**
   * Authorizes admin session using official developer keys
   */
  async login(dto: AdminLoginDto) {
    const { email, password } = dto;

    if (email === 'admin@abhasetu.com' && password === 'MasterAdminPassword1!') {
      // In production, generate a real cryptographically signed JWT
      const token = `ABHA_ADMIN_JWT_${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
      return {
        statusCode: 200,
        message: 'Master Admin authenticated successfully',
        accessToken: token,
        role: 'MASTER_ADMIN',
        expiresIn: 1800, // 30 minutes
      };
    }

    throw new UnauthorizedException('Invalid administrator credentials. Access Denied.');
  }
}
