/**
 * @file        express.d.ts
 * @description Augment Express Request with JWT user payload from auth guards
 * @module      types
 * @layer       types
 * @author      Platform Team
 * @created     2026-06-26
 */

import type { JwtUserPayload } from '../auth/auth-user.interface';

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtUserPayload;
  }
}

export {};
