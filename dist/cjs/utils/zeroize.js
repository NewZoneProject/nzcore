"use strict";
/**
 * Secure memory zeroization
 * Critical: MUST be used for all sensitive data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureBuffer = void 0;
exports.zeroize = zeroize;
exports.zeroizeAll = zeroizeAll;
exports.constantTimeEqual = constantTimeEqual;
exports.constantTimeStringEqual = constantTimeStringEqual;
const types_js_1 = require("../types.js");
const constants_js_1 = require("../constants.js");
/**
 * Securely zero a Uint8Array
 * Uses multiple overwrites to prevent compiler optimization
 */
function zeroize(array) {
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
        throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_KEY, 'Failed to zeroize memory', { error: e });
    }
}
/**
 * Securely zero multiple arrays
 */
function zeroizeAll(...arrays) {
    for (const array of arrays) {
        if (array)
            zeroize(array);
    }
}
/**
 * Create a zeroizable buffer
 */
class SecureBuffer {
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
exports.SecureBuffer = SecureBuffer;
/**
 * Constant-time comparison
 * Prevents timing attacks
 */
function constantTimeEqual(a, b) {
    if (a.length !== b.length)
        return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        const aByte = a[i];
        const bByte = b[i];
        if (aByte === undefined || bByte === undefined) {
            return false;
        }
        result |= aByte ^ bByte;
    }
    return result === 0;
}
/**
 * Constant-time string comparison
 */
function constantTimeStringEqual(a, b) {
    return constantTimeEqual(new TextEncoder().encode(a), new TextEncoder().encode(b));
}
//# sourceMappingURL=zeroize.js.map