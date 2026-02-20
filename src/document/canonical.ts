/**
 * RFC 8785 JSON Canonicalization Scheme
 */

import canonicalize from 'canonicalize';

import { NewZoneCoreError } from '../types.js';
import { ERROR_CODES } from '../constants.js';
import { constantTimeStringEqual } from '../utils/zeroize.js';

export class CanonicalJSON {
  /**
   * Serialize object to canonical JSON
   */
  static serialize(obj: unknown): string {
    try {
      const result = canonicalize(obj);

      if (result === undefined) {
        throw new Error('Canonicalization failed');
      }

      return result;
    } catch (e) {
      throw new NewZoneCoreError(
        ERROR_CODES.NON_CANONICAL_JSON,
        'Failed to serialize to canonical JSON',
        { error: e }
      );
    }
  }

  static parse(canonicalString: string): unknown {
    this.assertCanonical(canonicalString);

    try {
      return JSON.parse(canonicalString);
    } catch (e) {
      throw new NewZoneCoreError(
        ERROR_CODES.NON_CANONICAL_JSON,
        'Invalid JSON',
        { error: e }
      );
    }
  }

  static assertCanonical(jsonString: string): void {
    try {
      const obj = JSON.parse(jsonString);
      const recanonicalized = this.serialize(obj);

      if (!constantTimeStringEqual(jsonString, recanonicalized)) {
        throw new NewZoneCoreError(
          ERROR_CODES.NON_CANONICAL_JSON,
          'Non-canonical JSON: MUST reject before signature verification'
        );
      }
    } catch (e) {
      if (e instanceof NewZoneCoreError) throw e;

      throw new NewZoneCoreError(
        ERROR_CODES.NON_CANONICAL_JSON,
        'Invalid JSON structure',
        { error: e }
      );
    }
  }

  static isCanonical(jsonString: string): boolean {
    try {
      this.assertCanonical(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  static canonicalize<T>(obj: T): T {
    const canonical = this.serialize(obj);
    return JSON.parse(canonical) as T;
  }

  static prepareForSigning(doc: Record<string, unknown>): string {
    const docWithoutSig = { ...doc };
    delete (docWithoutSig as { signature?: unknown }).signature;
    return this.serialize(docWithoutSig);
  }

  static canonicalEqual(a: unknown, b: unknown): boolean {
    const aCanonical = this.serialize(a);
    const bCanonical = this.serialize(b);
    return constantTimeStringEqual(aCanonical, bCanonical);
  }

  static hash(obj: unknown): Uint8Array {
    const canonical = this.serialize(obj);
    return new TextEncoder().encode(canonical);
  }

  static pretty(obj: unknown): string {
    return JSON.stringify(obj, null, 2);
  }
}
