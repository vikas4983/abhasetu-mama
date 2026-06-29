/**
 * @file        public.controller.ts
 * @description Public BFF routes — branding only (no ABDM secrets)
 * @module      abdm/public
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-29
 */

import { Controller, Get } from '@nestjs/common';
import { SessionService } from '../session/session.service';

/** @description Keys safe to expose to the browser */
const PUBLIC_BRANDING_KEYS = ['selectedLogo', 'theme', 'iconStyle'] as const;

@Controller()
export class PublicAbdmController {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * @description Public branding config — no client_id / client_secret
   */
  @Get('public/branding')
  async getBranding() {
    const config = await this.sessionService.getConfig();
    const branding: Record<string, string> = {};
    for (const key of PUBLIC_BRANDING_KEYS) {
      if (config[key] != null && config[key] !== '') {
        branding[key] = String(config[key]);
      }
    }
    return { status: 'success', branding };
  }
}
