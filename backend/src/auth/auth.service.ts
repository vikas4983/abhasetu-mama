import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'abhasetu-super-secret-key-2026';

  constructor(private readonly db: DbService) {}

  async validateAndLogin(email: string, pass: string) {
    const res = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (res.rowCount === 0) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const user = res.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(pass, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Check role
    if (user.role !== 'admin' && user.role !== 'master_admin') {
      throw new UnauthorizedException('Unauthorized access.');
    }

    // Sign JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
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
        role: user.role,
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
