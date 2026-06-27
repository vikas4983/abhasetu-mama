/**
 * @file        auth-user.interface.ts
 * @description JWT payload shape attached to authenticated requests
 * @module      auth
 * @layer       interface
 * @author      Platform Team
 * @created     2026-06-26
 */

/** @description Decoded JWT claims for admin and stakeholder sessions */
export interface JwtUserPayload {
  id: number;
  email: string;
  role: string;
  name: string;
  iat?: number;
  exp?: number;
}
