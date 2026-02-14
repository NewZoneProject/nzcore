/**
 * Secure memory zeroization
 * Critical: MUST be used for all sensitive data
 */
/**
 * Securely zero a Uint8Array
 * Uses multiple overwrites to prevent compiler optimization
 */
export declare function zeroize(array: Uint8Array): void;
/**
 * Securely zero multiple arrays
 */
export declare function zeroizeAll(...arrays: Uint8Array[]): void;
/**
 * Create a zeroizable buffer
 */
export declare class SecureBuffer {
    private buffer;
    constructor(size: number);
    get data(): Uint8Array;
    set data(value: Uint8Array);
    destroy(): void;
}
/**
 * Constant-time comparison
 * Prevents timing attacks
 */
export declare function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean;
/**
 * Constant-time string comparison
 */
export declare function constantTimeStringEqual(a: string, b: string): boolean;
//# sourceMappingURL=zeroize.d.ts.map