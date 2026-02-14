/**
 * Logical Time Model
 * Invariant: logical_time(n+1) > logical_time(n)
 * Wall-clock time MUST NOT be used for security decisions
 */
import { LogicalClockState } from '../types.js';
export declare class LogicalClock {
    #private;
    constructor(initial?: number);
    /**
     * Advance logical time
     * Returns new time value
     */
    tick(): number;
    /**
     * Get current logical time
     */
    get current(): number;
    /**
     * Check if document is expired using logical time only
     */
    isExpired(expirationTime?: number): boolean;
    /**
     * Check if document is revoked using logical time only
     */
    isRevoked(revocationTime?: number): boolean;
    /**
     * Sync clock with persisted state
     * MUST strictly increase
     */
    sync(lastLogicalTime: number): void;
    /**
     * Freeze clock (for testing/audit)
     */
    freeze(): void;
    /**
     * Unfreeze clock
     */
    unfreeze(): void;
    /**
     * Serialize to JSON
     */
    toJSON(): LogicalClockState;
    /**
     * Deserialize from JSON
     */
    static fromJSON(state: LogicalClockState): LogicalClock;
    /**
     * Validate logical time ordering
     */
    static validateOrder(prev: number, next: number): boolean;
    /**
     * Compare logical times
     */
    static compare(a: number, b: number): -1 | 0 | 1;
}
//# sourceMappingURL=logical-time.d.ts.map