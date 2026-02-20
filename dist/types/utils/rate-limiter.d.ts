/**
 * Rate Limiter
 * Token bucket algorithm for DoS protection
 */
export interface RateLimiterOptions {
    /** Maximum number of requests allowed in window */
    limit: number;
    /** Time window in milliseconds */
    windowMs: number;
}
export declare class RateLimiter {
    #private;
    constructor(options: RateLimiterOptions);
    /**
     * Check if request is allowed
     * @throws NewZoneCoreError if rate limit exceeded
     */
    check(): void;
    /**
     * Check if request would be allowed without recording it
     */
    wouldAllow(): boolean;
    /**
     * Get remaining requests in current window
     */
    getRemaining(): number;
    /**
     * Reset rate limiter state
     */
    reset(): void;
    /**
     * Get current state for monitoring
     */
    getState(): {
        limit: number;
        windowMs: number;
        activeRequests: number;
        remaining: number;
        resetAt: number;
    };
}
/**
 * Default rate limiter configurations
 */
export declare const RateLimitPresets: {
    /** Strict: 10 requests per second */
    readonly strict: RateLimiterOptions;
    /** Moderate: 100 requests per minute */
    readonly moderate: RateLimiterOptions;
    /** Relaxed: 1000 requests per minute */
    readonly relaxed: RateLimiterOptions;
    /** For verifyDocument: 50 per second */
    readonly verifyDocument: RateLimiterOptions;
    /** For createDocument: 10 per second */
    readonly createDocument: RateLimiterOptions;
};
//# sourceMappingURL=rate-limiter.d.ts.map