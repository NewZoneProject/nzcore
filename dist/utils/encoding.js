"use strict";
/**
 * Deterministic encoding utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHex = toHex;
exports.fromHex = fromHex;
exports.toBase64URL = toBase64URL;
exports.fromBase64URL = fromBase64URL;
exports.toUTF8 = toUTF8;
exports.fromUTF8 = fromUTF8;
exports.mergeArrays = mergeArrays;
exports.splitArray = splitArray;
exports.generateDeterministicId = generateDeterministicId;
const types_js_1 = require("../types.js");
const constants_js_1 = require("../constants.js");
// import { constantTimeEqual } from './zeroize.js';
/**
 * Hexadecimal encoding (deterministic, lowercase)
 */
function toHex(bytes) {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toLowerCase();
}
/**
 * Hexadecimal decoding
 */
function fromHex(hex) {
    if (hex.length % 2 !== 0) {
        throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_KEY, 'Invalid hex string length');
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
}
/**
 * Base64URL encoding (no padding, deterministic)
 */
function toBase64URL(bytes) {
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
/**
 * Base64URL decoding
 */
function fromBase64URL(base64url) {
    const base64 = base64url
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(base64url.length + (4 - (base64url.length % 4)) % 4, '=');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}
/**
 * UTF-8 encoding
 */
function toUTF8(str) {
    return new TextEncoder().encode(str);
}
/**
 * UTF-8 decoding
 */
function fromUTF8(bytes) {
    return new TextDecoder().decode(bytes);
}
/**
 * Merge Uint8Arrays
 */
function mergeArrays(...arrays) {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}
/**
 * Split Uint8Array
 */
function splitArray(array, indices) {
    const result = [];
    let start = 0;
    for (const index of indices) {
        result.push(array.slice(start, start + index));
        start += index;
    }
    if (start < array.length) {
        result.push(array.slice(start));
    }
    return result;
}
/**
 * Deterministic ID generator
 */
function generateDeterministicId(...parts) {
    // Will be hashed with BLAKE2b
    const combined = mergeArrays(...parts);
    return toHex(combined); // Temporary, actual hash in crypto layer
}
//# sourceMappingURL=encoding.js.map