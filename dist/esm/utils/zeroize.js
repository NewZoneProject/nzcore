/**
 * Secure memory zeroization
 * Critical: MUST be used for all sensitive data
 */
import { NewZoneCoreError } from '../types.js';
import { ERROR_CODES } from '../constants.js';
/**
 * Securely zero a Uint8Array
 * Uses multiple overwrites to prevent compiler optimization
 */
export function zeroize(array) {
    if (!array)
        return;
    try {
        // Overwrite with zeros multiple times
        for (let i = 0; i < 3; i++) {
            array.fill(0);
            // Prevent dead store elimination
            if (array[0] !== 0) {
                array.fill(0);
            }
        }
    }
    catch (e) {
        throw new NewZoneCoreError(ERROR_CODES.INVALID_KEY, 'Failed to zeroize memory', { error: e });
    }
}
/**
 * Securely zero multiple arrays
 */
export function zeroizeAll(...arrays) {
    for (const array of arrays) {
        if (array)
            zeroize(array);
    }
}
/**
 * Create a zeroizable buffer
 */
export class SecureBuffer {
    constructor(size) {
        this.buffer = new Uint8Array(size);
    }
    get data() {
        return this.buffer;
    }
    set data(value) {
        if (value.length !== this.buffer.length) {
            throw new Error('Buffer size mismatch');
        }
        this.buffer.set(value);
    }
    destroy() {
        zeroize(this.buffer);
    }
}
/**
 * Constant-time comparison
 * Prevents timing attacks
 */
export function constantTimeEqual(a, b) {
    if (a.length !== b.length)
        return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a[i] ^ b[i];
    }
    return result === 0;
}
/**
 * Constant-time string comparison
 */
export function constantTimeStringEqual(a, b) {
    return constantTimeEqual(new TextEncoder().encode(a), new TextEncoder().encode(b));
}
//# sourceMappingURL=zeroize.js.map