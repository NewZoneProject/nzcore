"use strict";
/**
 * Rate Limiter
 * Token bucket algorithm for DoS protection
 */
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _RateLimiter_limit, _RateLimiter_windowMs, _RateLimiter_requests;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitPresets = exports.RateLimiter = void 0;
const types_js_1 = require("../types.js");
const constants_js_1 = require("../constants.js");
class RateLimiter {
    constructor(options) {
        _RateLimiter_limit.set(this, void 0);
        _RateLimiter_windowMs.set(this, void 0);
        _RateLimiter_requests.set(this, []);
        if (options.limit < 1) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.VALIDATION_FAILED, 'Rate limit must be at least 1');
        }
        if (options.windowMs < 1) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.VALIDATION_FAILED, 'Window must be at least 1ms');
        }
        __classPrivateFieldSet(this, _RateLimiter_limit, options.limit, "f");
        __classPrivateFieldSet(this, _RateLimiter_windowMs, options.windowMs, "f");
    }
    /**
     * Check if request is allowed
     * @throws NewZoneCoreError if rate limit exceeded
     */
    check() {
        const now = Date.now();
        const windowStart = now - __classPrivateFieldGet(this, _RateLimiter_windowMs, "f");
        // Remove old requests outside window
        __classPrivateFieldSet(this, _RateLimiter_requests, __classPrivateFieldGet(this, _RateLimiter_requests, "f").filter(time => time > windowStart), "f");
        // Check if limit exceeded
        if (__classPrivateFieldGet(this, _RateLimiter_requests, "f").length >= __classPrivateFieldGet(this, _RateLimiter_limit, "f")) {
            const oldestRequest = __classPrivateFieldGet(this, _RateLimiter_requests, "f")[0];
            const retryAfter = Math.ceil((oldestRequest + __classPrivateFieldGet(this, _RateLimiter_windowMs, "f") - now) / 1000);
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.VALIDATION_FAILED, `Rate limit exceeded. Try again in ${retryAfter}s`, { retryAfter, limit: __classPrivateFieldGet(this, _RateLimiter_limit, "f"), windowMs: __classPrivateFieldGet(this, _RateLimiter_windowMs, "f") });
        }
        // Record this request
        __classPrivateFieldGet(this, _RateLimiter_requests, "f").push(now);
    }
    /**
     * Check if request would be allowed without recording it
     */
    wouldAllow() {
        const now = Date.now();
        const windowStart = now - __classPrivateFieldGet(this, _RateLimiter_windowMs, "f");
        const activeRequests = __classPrivateFieldGet(this, _RateLimiter_requests, "f").filter(time => time > windowStart);
        return activeRequests.length < __classPrivateFieldGet(this, _RateLimiter_limit, "f");
    }
    /**
     * Get remaining requests in current window
     */
    getRemaining() {
        const now = Date.now();
        const windowStart = now - __classPrivateFieldGet(this, _RateLimiter_windowMs, "f");
        const activeRequests = __classPrivateFieldGet(this, _RateLimiter_requests, "f").filter(time => time > windowStart);
        return Math.max(0, __classPrivateFieldGet(this, _RateLimiter_limit, "f") - activeRequests.length);
    }
    /**
     * Reset rate limiter state
     */
    reset() {
        __classPrivateFieldSet(this, _RateLimiter_requests, [], "f");
    }
    /**
     * Get current state for monitoring
     */
    getState() {
        const now = Date.now();
        const windowStart = now - __classPrivateFieldGet(this, _RateLimiter_windowMs, "f");
        const activeRequests = __classPrivateFieldGet(this, _RateLimiter_requests, "f").filter(time => time > windowStart);
        const oldestRequest = activeRequests[0];
        return {
            limit: __classPrivateFieldGet(this, _RateLimiter_limit, "f"),
            windowMs: __classPrivateFieldGet(this, _RateLimiter_windowMs, "f"),
            activeRequests: activeRequests.length,
            remaining: Math.max(0, __classPrivateFieldGet(this, _RateLimiter_limit, "f") - activeRequests.length),
            resetAt: oldestRequest ? oldestRequest + __classPrivateFieldGet(this, _RateLimiter_windowMs, "f") : now
        };
    }
}
exports.RateLimiter = RateLimiter;
_RateLimiter_limit = new WeakMap(), _RateLimiter_windowMs = new WeakMap(), _RateLimiter_requests = new WeakMap();
/**
 * Default rate limiter configurations
 */
exports.RateLimitPresets = {
    /** Strict: 10 requests per second */
    strict: { limit: 10, windowMs: 1000 },
    /** Moderate: 100 requests per minute */
    moderate: { limit: 100, windowMs: 60000 },
    /** Relaxed: 1000 requests per minute */
    relaxed: { limit: 1000, windowMs: 60000 },
    /** For verifyDocument: 50 per second */
    verifyDocument: { limit: 50, windowMs: 1000 },
    /** For createDocument: 10 per second */
    createDocument: { limit: 10, windowMs: 1000 }
};
//# sourceMappingURL=rate-limiter.js.map