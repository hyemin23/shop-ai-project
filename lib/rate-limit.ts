/**
 * In-memory sliding window rate limiter.
 * Limits requests per identifier (userId or IP) within a time window.
 */

import { LRUCache } from "lru-cache";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  /** Max tracked identifiers (LRU eviction) */
  maxEntries?: number;
}

export class RateLimiter {
  private cache: LRUCache<string, RateLimitEntry>;
  private windowMs: number;
  private maxRequests: number;

  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
    this.cache = new LRUCache<string, RateLimitEntry>({
      max: options.maxEntries ?? 1000,
      ttl: options.windowMs,
    });
  }

  check(identifier: string): { allowed: boolean; remaining: number; retryAfterMs: number } {
    const now = Date.now();
    const entry = this.cache.get(identifier);

    if (!entry || now >= entry.resetAt) {
      this.cache.set(identifier, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.maxRequests - 1, retryAfterMs: 0 };
    }

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: entry.resetAt - now,
      };
    }

    entry.count++;
    return { allowed: true, remaining: this.maxRequests - entry.count, retryAfterMs: 0 };
  }
}

// Studio API: 분당 5회 요청 제한 (인메모리 기반이므로 보수적)
export const studioRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
});

// Batch API: 분당 2회 요청 제한 (리소스 집약적)
export const batchRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 2,
});
