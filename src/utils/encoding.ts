/**
 * Deterministic encoding utilities
 */

import { NewZoneCoreError } from '../types.js';
import { ERROR_CODES } from '../constants.js';
// import { constantTimeEqual } from './zeroize.js';

/**
 * Hexadecimal encoding (deterministic, lowercase)
 */
export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toLowerCase();
}

/**
 * Hexadecimal decoding
 */
export function fromHex(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new NewZoneCoreError(
      ERROR_CODES.INVALID_KEY,
      'Invalid hex string length'
    );
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
export function toBase64URL(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64URL decoding
 */
export function fromBase64URL(base64url: string): Uint8Array {
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
export function toUTF8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * UTF-8 decoding
 */
export function fromUTF8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

/**
 * Merge Uint8Arrays
 */
export function mergeArrays(...arrays: Uint8Array[]): Uint8Array {
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
export function splitArray(array: Uint8Array, indices: number[]): Uint8Array[] {
  const result: Uint8Array[] = [];
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
export function generateDeterministicId(...parts: Uint8Array[]): string {
  // Will be hashed with BLAKE2b
  const combined = mergeArrays(...parts);
  return toHex(combined); // Temporary, actual hash in crypto layer
}
