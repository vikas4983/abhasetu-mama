/**
 * @file        app.constants.ts
 * @description NestJS API metadata and pagination defaults
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-10
 */

export const APP_NAME = 'AbhaSetuApi' as const;
export const APP_PORT = 3001 as const;

/** When true, gateway failures fall back to simulated responses (dev only) */
export const ABDM_SIMULATION_MODE =
  process.env.ABDM_SIMULATION_MODE !== 'false';

/** Base URL for ABDM async callback registration */
export const ABDM_CALLBACK_BASE_URL =
  process.env.ABDM_CALLBACK_BASE_URL || 'http://localhost:3001';
