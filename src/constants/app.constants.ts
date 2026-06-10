/**
 * @file        app.constants.ts
 * @description Application metadata and pagination defaults
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-10
 */

/** Application name */
export const APP_NAME = 'Abha Setu' as const;

/** Application version */
export const APP_VERSION = '2.0.0' as const;

/** Pagination defaults */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
} as const;
