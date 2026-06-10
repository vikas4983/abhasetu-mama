/**
 * @file        ui.constants.ts
 * @description UI theme tokens, breakpoints, z-index, animations
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-10
 */

export const BREAKPOINTS = {
  xs: '320px',
  sm: '480px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 0.15,
  NORMAL: 0.25,
  SLOW: 0.4,
} as const;

export const Z_INDEX = {
  NAVBAR: 100,
  MODAL: 1000,
  TOAST: 2000,
} as const;
