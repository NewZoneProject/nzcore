"use strict";
/**
 * Logical Time Model
 * Invariant: logical_time(n+1) > logical_time(n)
 * Wall-clock time MUST NOT be used for security decisions
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
var _LogicalClock_current, _LogicalClock_frozen, _LogicalClock_maxTime;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicalClock = void 0;
const types_js_1 = require("../types.js");
const constants_js_1 = require("../constants.js");
class LogicalClock {
    constructor(initial = constants_js_1.LOGICAL_TIME.MIN) {
        _LogicalClock_current.set(this, void 0);
        _LogicalClock_frozen.set(this, false);
        _LogicalClock_maxTime.set(this, constants_js_1.LOGICAL_TIME.MAX);
        if (typeof initial !== 'number' || !Number.isInteger(initial)) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.LOGICAL_TIME_VIOLATION, 'Logical time must be an integer');
        }
        if (initial < constants_js_1.LOGICAL_TIME.MIN) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.LOGICAL_TIME_VIOLATION, `Logical time MUST start at >= ${constants_js_1.LOGICAL_TIME.MIN}`);
        }
        __classPrivateFieldSet(this, _LogicalClock_current, initial, "f");
    }
    /**
     * Advance logical time
     * Returns new time value
     */
    tick() {
        var _a;
        if (__classPrivateFieldGet(this, _LogicalClock_frozen, "f")) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.LOGICAL_TIME_VIOLATION, 'Clock frozen - cannot advance');
        }
        if (__classPrivateFieldGet(this, _LogicalClock_current, "f") >= __classPrivateFieldGet(this, _LogicalClock_maxTime, "f")) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.LOGICAL_TIME_VIOLATION, 'Logical time overflow');
        }
        __classPrivateFieldSet(this, _LogicalClock_current, (_a = __classPrivateFieldGet(this, _LogicalClock_current, "f"), _a++, _a), "f");
        return __classPrivateFieldGet(this, _LogicalClock_current, "f");
    }
    /**
     * Get current logical time
     */
    get current() {
        return __classPrivateFieldGet(this, _LogicalClock_current, "f");
    }
    /**
     * Check if document is expired using logical time only
     */
    isExpired(expirationTime) {
        if (!expirationTime)
            return false;
        return __classPrivateFieldGet(this, _LogicalClock_current, "f") > expirationTime;
    }
    /**
     * Check if document is revoked using logical time only
     */
    isRevoked(revocationTime) {
        if (!revocationTime)
            return false;
        return __classPrivateFieldGet(this, _LogicalClock_current, "f") >= revocationTime;
    }
    /**
     * Sync clock with persisted state
     * MUST strictly increase
     */
    sync(lastLogicalTime) {
        if (lastLogicalTime <= __classPrivateFieldGet(this, _LogicalClock_current, "f")) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.LOGICAL_TIME_VIOLATION, `Logical time MUST increase strictly: ${lastLogicalTime} <= ${__classPrivateFieldGet(this, _LogicalClock_current, "f")}`);
        }
        __classPrivateFieldSet(this, _LogicalClock_current, lastLogicalTime, "f");
    }
    /**
     * Freeze clock (for testing/audit)
     */
    freeze() {
        __classPrivateFieldSet(this, _LogicalClock_frozen, true, "f");
    }
    /**
     * Unfreeze clock
     */
    unfreeze() {
        __classPrivateFieldSet(this, _LogicalClock_frozen, false, "f");
    }
    /**
     * Serialize to JSON
     */
    toJSON() {
        return {
            logical_clock: __classPrivateFieldGet(this, _LogicalClock_current, "f"),
            version: '1.0'
        };
    }
    /**
     * Deserialize from JSON
     */
    static fromJSON(state) {
        return new LogicalClock(state.logical_clock);
    }
    /**
     * Validate logical time ordering
     */
    static validateOrder(prev, next) {
        return next > prev;
    }
    /**
     * Compare logical times
     */
    static compare(a, b) {
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    }
}
exports.LogicalClock = LogicalClock;
_LogicalClock_current = new WeakMap(), _LogicalClock_frozen = new WeakMap(), _LogicalClock_maxTime = new WeakMap();
//# sourceMappingURL=logical-time.js.map