/**
 * @file        admin-config.util.ts
 * @description Strip ABDM secrets from admin config before API responses
 * @module      abdm/admin/utils
 * @layer       util
 * @author      Platform Team
 * @created     2026-06-29
 */

/** @description Keys that must never be sent to the browser */
export const SENSITIVE_CONFIG_KEYS = [
  'ABDM_CLIENT_SECRET',
  'ABDM_CLIENT_ID',
  'ABDM_PUBLIC_KEY',
] as const;

/**
 * @description Mask or remove gateway credentials from config map
 */
export function sanitizeAdminConfigForClient(
  config: Record<string, string>,
): Record<string, string> {
  const safe: Record<string, string> = { ...config };
  for (const key of SENSITIVE_CONFIG_KEYS) {
    if (key in safe) {
      if (key === 'ABDM_CLIENT_ID' && safe[key]) {
        const v = safe[key];
        safe[key] = v.length > 4 ? `***${v.slice(-4)}` : '***';
      } else {
        delete safe[key];
      }
    }
  }
  return safe;
}
