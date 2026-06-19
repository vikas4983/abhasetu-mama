/**
 * @file        auth.service.ts
 * @description Authentication service implementing JWT issuance, validation, and credentials checking.
 * @module      auth
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DbService } from '../../database/db.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'abhasetu-super-secret-key-2026';

  constructor(private readonly db: DbService) {}

  async validateAndLogin(email: string, pass: string) {
    const res = await this.db.query(`
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1
    `, [email]);

    if (res.rowCount === 0) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const user = res.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(pass, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const resolvedRole = user.role_name || user.role;

    // Reject patients from stakeholder console
    if (resolvedRole === 'patient') {
      throw new UnauthorizedException('Please log in via the Citizen Portal.');
    }

    // Enforce approval status for all non-admins
    if (resolvedRole !== 'admin' && resolvedRole !== 'master_admin') {
      if (user.status === 'pending') {
        throw new UnauthorizedException('Your facility registration is pending administrator approval.');
      }
      if (user.status === 'rejected') {
        throw new UnauthorizedException('Your facility registration request was rejected.');
      }
      if (user.status === 'blocked') {
        throw new UnauthorizedException('Your facility account has been blocked. Please contact support.');
      }
      if (user.status !== 'approved') {
        throw new UnauthorizedException(`Your account status is ${user.status || 'pending'}. Access denied.`);
      }
    }

    // Sign JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: resolvedRole,
        name: user.name,
      },
      this.jwtSecret,
      { expiresIn: '8h' }
    );

    return {
      status: 'success',
      token,
      user: {
        email: user.email,
        role: resolvedRole,
        name: user.name,
      },
    };
  }

  verifyJwt(token: string) {
    try {
      return jwt.verify(token, this.jwtSecret) as any;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired authentication token.');
    }
  }
}
