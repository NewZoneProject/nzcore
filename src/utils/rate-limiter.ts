/**
 * Rate Limiter
 * Token bucket algorithm for DoS protection
 */

import { NewZoneCoreError } from '../types.js';
import { ERROR_CODES } from '../constants.js';

export interface RateLimiterOptions {
  /** Maximum number of requests allowed in window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export class RateLimiter {
  #limit: number;
  #windowMs: number;
  #requests: number[] = [];

  constructor(options: RateLimiterOptions) {
    if (options.limit < 1) {
      throw new NewZoneCoreError(
        ERROR_CODES.VALIDATION_FAILED,
        'Rate limit must be at least 1'
      );
    }
    if (options.windowMs < 1) {
      throw new NewZoneCoreError(
        ERROR_CODES.VALIDATION_FAILED,
        'Window must be at least 1ms'
      );
    }

    this.#limit = options.limit;
    this.#windowMs = options.windowMs;
  }

  /**
   * Check if request is allowed
   * @throws NewZoneCoreError if rate limit exceeded
   */
  check(): void {
    const now = Date.now();
    const windowStart = now - this.#windowMs;

    // Remove old requests outside window
    this.#requests = this.#requests.filter(time => time > windowStart);

    // Check if limit exceeded
    if (this.#requests.length >= this.#limit) {
      const oldestRequest = this.#requests[0];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const retryAfter = Math.ceil((oldestRequest! + this.#windowMs - now) / 1000);

      throw new NewZoneCoreError(
        ERROR_CODES.VALIDATION_FAILED,
        `Rate limit exceeded. Try again in ${retryAfter}s`,
        { retryAfter, limit: this.#limit, windowMs: this.#windowMs }
      );
    }

    // Record this request
    this.#requests.push(now);
  }

  /**
   * Check if request would be allowed without recording it
   */
  wouldAllow(): boolean {
    const now = Date.now();
    const windowStart = now - this.#windowMs;
    const activeRequests = this.#requests.filter(time => time > windowStart);
    return activeRequests.length < this.#limit;
  }

  /**
   * Get remaining requests in current window
   */
  getRemaining(): number {
    const now = Date.now();
    const windowStart = now - this.#windowMs;
    const activeRequests = this.#requests.filter(time => time > windowStart);
    return Math.max(0, this.#limit - activeRequests.length);
  }

  /**
   * Reset rate limiter state
   */
  reset(): void {
    this.#requests = [];
  }

  /**
   * Get current state for monitoring
   */
  getState(): {
    limit: number;
    windowMs: number;
    activeRequests: number;
    remaining: number;
    resetAt: number;
  } {
    const now = Date.now();
    const windowStart = now - this.#windowMs;
    const activeRequests = this.#requests.filter(time => time > windowStart);
    const oldestRequest = activeRequests[0];
    
    return {
      limit: this.#limit,
      windowMs: this.#windowMs,
      activeRequests: activeRequests.length,
      remaining: Math.max(0, this.#limit - activeRequests.length),
      resetAt: oldestRequest ? oldestRequest + this.#windowMs : now
    };
  }
}

/**
 * Default rate limiter configurations
 */
export const RateLimitPresets = {
  /** Strict: 10 requests per second */
  strict: { limit: 10, windowMs: 1000 } as RateLimiterOptions,
  
  /** Moderate: 100 requests per minute */
  moderate: { limit: 100, windowMs: 60000 } as RateLimiterOptions,
  
  /** Relaxed: 1000 requests per minute */
  relaxed: { limit: 1000, windowMs: 60000 } as RateLimiterOptions,
  
  /** For verifyDocument: 50 per second */
  verifyDocument: { limit: 50, windowMs: 1000 } as RateLimiterOptions,
  
  /** For createDocument: 10 per second */
  createDocument: { limit: 10, windowMs: 1000 } as RateLimiterOptions
} as const;
