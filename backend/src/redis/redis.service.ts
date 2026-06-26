/**
 * @file        redis.service.ts
 * @description Redis client wrapper for ABDM session cache and callback correlation
 * @module      redis
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private available = false;

  async onModuleInit(): Promise<void> {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    try {
      this.client = new Redis(url, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 5000,
      });
      await this.client.connect();
      this.available = true;
      this.logger.log('Redis connected');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Redis unavailable, using in-memory fallback: ${message}`);
      this.client = null;
      this.available = false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }

  /**
   * @description Whether Redis is connected and usable
   * @returns {boolean} Connection status
   */
  isAvailable(): boolean {
    return this.available && this.client !== null;
  }

  /**
   * @description Get a cached string value
   * @param {string} key - Redis key
   * @returns {Promise<string | null>} Cached value or null
   */
  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    return this.client.get(key);
  }

  /**
   * @description Set a string value with optional TTL in seconds
   * @param {string} key - Redis key
   * @param {string} value - Value to store
   * @param {number} [ttlSeconds] - Expiry in seconds
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) return;
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * @description Delete a key
   * @param {string} key - Redis key
   */
  async del(key: string): Promise<void> {
    if (!this.client) return;
    await this.client.del(key);
  }

  /**
   * @description Store JSON with TTL
   * @param {string} key - Redis key
   * @param {unknown} data - Serializable object
   * @param {number} ttlSeconds - Expiry in seconds
   */
  async setJson(key: string, data: unknown, ttlSeconds: number): Promise<void> {
    await this.set(key, JSON.stringify(data), ttlSeconds);
  }

  /**
   * @description Retrieve and parse JSON
   * @param {string} key - Redis key
   * @returns {Promise<T | null>} Parsed object or null
   */
  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
}
