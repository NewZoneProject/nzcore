/**
 * Logical Time Model
 * Invariant: logical_time(n+1) > logical_time(n)
 * Wall-clock time MUST NOT be used for security decisions
 */

import { NewZoneCoreError, LogicalClockState } from '../types.js';
import { LOGICAL_TIME, ERROR_CODES } from '../constants.js';

export class LogicalClock {
  #current: number;
  #frozen: boolean = false;
  #maxTime: number = LOGICAL_TIME.MAX;

  constructor(initial: number = LOGICAL_TIME.MIN) {
    if (typeof initial !== 'number' || !Number.isInteger(initial)) {
      throw new NewZoneCoreError(
        ERROR_CODES.LOGICAL_TIME_VIOLATION,
        'Logical time must be an integer'
      );
    }

    if (initial < LOGICAL_TIME.MIN) {
      throw new NewZoneCoreError(
        ERROR_CODES.LOGICAL_TIME_VIOLATION,
        `Logical time MUST start at >= ${LOGICAL_TIME.MIN}`
      );
    }

    this.#current = initial;
  }

  /**
   * Advance logical time
   * Returns new time value
   */
  tick(): number {
    if (this.#frozen) {
      throw new NewZoneCoreError(
        ERROR_CODES.LOGICAL_TIME_VIOLATION,
        'Clock frozen - cannot advance'
      );
    }

    if (this.#current >= this.#maxTime) {
      throw new NewZoneCoreError(
        ERROR_CODES.LOGICAL_TIME_VIOLATION,
        'Logical time overflow'
      );
    }

    this.#current++;
    return this.#current;
  }

  /**
   * Get current logical time
   */
  get current(): number {
    return this.#current;
  }

  /**
   * Check if document is expired using logical time only
   */
  isExpired(expirationTime?: number): boolean {
    if (!expirationTime) return false;
    return this.#current > expirationTime;
  }

  /**
   * Check if document is revoked using logical time only
   */
  isRevoked(revocationTime?: number): boolean {
    if (!revocationTime) return false;
    return this.#current >= revocationTime;
  }

  /**
   * Sync clock with persisted state
   * MUST strictly increase
   */
  sync(lastLogicalTime: number): void {
    if (lastLogicalTime <= this.#current) {
      throw new NewZoneCoreError(
        ERROR_CODES.LOGICAL_TIME_VIOLATION,
        `Logical time MUST increase strictly: ${lastLogicalTime} <= ${this.#current}`
      );
    }
    this.#current = lastLogicalTime;
  }

  /**
   * Freeze clock (for testing/audit)
   */
  freeze(): void {
    this.#frozen = true;
  }

  /**
   * Unfreeze clock
   */
  unfreeze(): void {
    this.#frozen = false;
  }

  /**
   * Serialize to JSON
   */
  toJSON(): LogicalClockState {
    return {
      logical_clock: this.#current,
      version: '1.0'
    };
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(state: LogicalClockState): LogicalClock {
    return new LogicalClock(state.logical_clock);
  }

  /**
   * Validate logical time ordering
   */
  static validateOrder(prev: number, next: number): boolean {
    return next > prev;
  }

  /**
   * Compare logical times
   */
  static compare(a: number, b: number): -1 | 0 | 1 {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }
}
