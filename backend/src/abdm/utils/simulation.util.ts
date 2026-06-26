/**
 * @file        simulation.util.ts
 * @description Utility to gate ABDM simulation fallbacks behind ABDM_SIMULATION_MODE
 * @module      abdm/utils
 * @layer       util
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { ABDM_SIMULATION_MODE } from '../../constants/app.constants';

/**
 * @description Returns whether simulation fallbacks are enabled
 * @returns {boolean} True when simulation mode is on
 */
export function isSimulationEnabled(): boolean {
  return ABDM_SIMULATION_MODE;
}

/**
 * @description Standard simulated OTP for sandbox dev flows
 */
export const SIMULATED_OTP = '123456' as const;
