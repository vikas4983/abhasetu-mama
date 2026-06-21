/**
 * @file        logger.ts
 * @description Standard console logging module for application telemetry.
 * @module      utils
 * @layer       utility
 * @author      Platform Team
 * @created     2026-06-21
 * @modified    2026-06-21
 */

class Logger {
  info(message: string, context?: Record<string, any>) {
    console.log(`[INFO] ${message}`, context ? JSON.stringify(context) : '');
  }

  warn(message: string, context?: Record<string, any>) {
    console.warn(`[WARN] ${message}`, context ? JSON.stringify(context) : '');
  }

  error(message: string, error?: Error | unknown, context?: Record<string, any>) {
    console.error(`[ERROR] ${message}`, error, context ? JSON.stringify(context) : '');
  }
}

export const logger = new Logger();
