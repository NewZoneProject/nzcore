/**
 * Deterministic encoding utilities
 */
/**
 * Hexadecimal encoding (deterministic, lowercase)
 */
export declare function toHex(bytes: Uint8Array): string;
/**
 * Hexadecimal decoding
 */
export declare function fromHex(hex: string): Uint8Array;
/**
 * Base64URL encoding (no padding, deterministic)
 */
export declare function toBase64URL(bytes: Uint8Array): string;
/**
 * Base64URL decoding
 */
export declare function fromBase64URL(base64url: string): Uint8Array;
/**
 * UTF-8 encoding
 */
export declare function toUTF8(str: string): Uint8Array;
/**
 * UTF-8 decoding
 */
export declare function fromUTF8(bytes: Uint8Array): string;
/**
 * Merge Uint8Arrays
 */
export declare function mergeArrays(...arrays: Uint8Array[]): Uint8Array;
/**
 * Split Uint8Array
 */
export declare function splitArray(array: Uint8Array, indices: number[]): Uint8Array[];
/**
 * Deterministic ID generator
 */
export declare function generateDeterministicId(...parts: Uint8Array[]): string;
//# sourceMappingURL=encoding.d.ts.map