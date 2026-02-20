/**
 * Document Validator
 * Trust layers: Structural → Cryptographic → Policy
 * Final trust = AND of all layers
 */

import { CanonicalJSON } from './canonical.js';
import { Ed25519 } from '../crypto/ed25519.js';
import { Document, ValidationResult, ValidationContext } from '../types.js';
import { CRYPTO_SUITE } from '../constants.js';
import { fromHex } from '../utils/encoding.js';

export class DocumentValidator {
  /**
   * Validate document
   * Implements three-layer trust model
   */
  async validate(
    document: Document,
    context: ValidationContext
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      structural_valid: false,
      cryptographic_valid: false,
      policy_valid: false,
      final: false,
      errors: [],
      warnings: []
    };

    try {
      // Layer 1: Structural validation
      result.structural_valid = this.validateStructural(document, result);
      
      if (!result.structural_valid) {
        return this.finalize(result);
      }

      // Layer 2: Cryptographic validation
      result.cryptographic_valid = await this.validateCryptographic(document, context, result);
      
      if (!result.cryptographic_valid) {
        return this.finalize(result);
      }

      // Layer 3: Policy validation (implementation-defined, out of Core scope)
      result.policy_valid = this.validatePolicy(document, context, result);
      
      // Final trust = AND of all layers
      result.final = result.structural_valid && 
                     result.cryptographic_valid && 
                     result.policy_valid;
      
      return this.finalize(result);
    } catch (e) {
      result.errors?.push(e instanceof Error ? e.message : String(e));
      return this.finalize(result);
    }
  }

  /**
   * Structural validation
   * Checks document format, required fields, invariants
   */
  private validateStructural(
    doc: Document,
    result: ValidationResult
  ): boolean {
    const errors: string[] = [];

    // Check required fields
    const required = [
      'type', 'version', 'id', 'chain_id',
      'parent_hash', 'logical_time', 'crypto_suite'
    ];

    for (const field of required) {
      if (!doc[field as keyof Document]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Check logical time invariant
    if (typeof doc.logical_time !== 'number') {
      errors.push('logical_time must be a number');
    } else if (doc.logical_time < 1) {
      errors.push(`logical_time MUST be >= 1, got ${doc.logical_time}`);
    }

    // Check crypto suite
    if (doc.crypto_suite !== CRYPTO_SUITE) {
      errors.push(`crypto_suite MUST be ${CRYPTO_SUITE}, got ${doc.crypto_suite}`);
    }

    // Check version
    if (doc.version !== '1.0') {
      errors.push(`version MUST be 1.0, got ${doc.version}`);
    }

    // Check signature presence
    if (!doc.signature) {
      errors.push('Missing signature');
    }

    // Check parent hash format
    if (doc.parent_hash && !/^[0-9a-f]{64}$/.test(doc.parent_hash)) {
      errors.push('parent_hash must be 64 character hex string');
    }

    if (errors.length > 0) {
      result.errors = [...(result.errors || []), ...errors];
      return false;
    }

    return true;
  }

  /**
   * Cryptographic validation
   * Checks signature, canonical JSON, key validity
   */
  private async validateCryptographic(
    doc: Document,
    context: ValidationContext,
    result: ValidationResult
  ): Promise<boolean> {
    const errors: string[] = [];

    try {
      // MUST verify canonical JSON before signature
      const docWithoutSig = { ...doc };
      delete (docWithoutSig as { signature?: unknown }).signature;

      const canonical = CanonicalJSON.serialize(docWithoutSig);

      try {
        CanonicalJSON.assertCanonical(canonical);
      } catch {
        errors.push('Document is not canonical JSON');
        result.errors = [...(result.errors || []), ...errors];
        return false;
      }

      // Verify signature
      if (!doc.signature) {
        errors.push('No signature provided');
        result.errors = [...(result.errors || []), ...errors];
        return false;
      }

      const signature = fromHex(doc.signature);
      const data = new TextEncoder().encode(canonical);
      
      // Get trusted keys from context
      const trustedKeys = context.trustedKeys || [];
      
      if (trustedKeys.length === 0) {
        errors.push('No trusted keys provided for verification');
        result.errors = [...(result.errors || []), ...errors];
        return false;
      }

      // Try each trusted key
      let verified = false;
      for (const key of trustedKeys) {
        try {
          const valid = await Ed25519.verify(signature, data, key);
          if (valid) {
            verified = true;
            break;
          }
        } catch {
          continue;
        }
      }

      if (!verified) {
        errors.push('Signature verification failed');
        result.errors = [...(result.errors || []), ...errors];
        return false;
      }

      // Check logical time if in context
      if (context.currentTime) {
        if (doc.logical_time > context.currentTime) {
          result.warnings = [
            ...(result.warnings || []),
            `Document logical time (${doc.logical_time}) > current time (${context.currentTime})`
          ];
        }
      }

      return true;
    } catch (e) {
      errors.push(`Cryptographic validation error: ${e instanceof Error ? e.message : String(e)}`);
      result.errors = [...(result.errors || []), ...errors];
      return false;
    }
  }

  /**
   * Policy validation
   * Implementation-defined, out of Core scope
   * Stub that always returns true unless policy engine provided
   */
  private validatePolicy(
    doc: Document,
    context: ValidationContext,
    result: ValidationResult
  ): boolean {
    // Policy evaluation is implementation-defined
    // Core provides hook for policy engines
    if (context.policyEngine) {
      try {
        return context.policyEngine.evaluate(doc, context);
      } catch (e) {
        result.errors = [
          ...(result.errors || []),
          `Policy evaluation error: ${e instanceof Error ? e.message : String(e)}`
        ];
        return false;
      }
    }
    
    // Default: no policy restrictions
    return true;
  }

  /**
   * Finalize validation result
   */
  private finalize(result: ValidationResult): ValidationResult {
    result.final = result.structural_valid && 
                   result.cryptographic_valid && 
                   result.policy_valid;
    return result;
  }

  /**
   * Quick validation - single layer only
   */
  async quickValidate(
    document: Document,
    publicKey: Uint8Array
  ): Promise<boolean> {
    const result = await this.validate(document, {
      currentTime: 0,
      trustedKeys: [publicKey]
    });
    
    return result.cryptographic_valid;
  }

  /**
   * Validate document chain integrity
   */
  validateChain(documents: Document[]): boolean {
    // Sort by logical time
    const sorted = [...documents].sort((a, b) => a.logical_time - b.logical_time);
  
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
    
      if (!prev || !curr) return false;
    
      // Check hash chain
      if (curr.parent_hash !== prev.id) {
        return false;
      }
    
      // Check time monotonicity
      if (curr.logical_time <= prev.logical_time) {
        return false;
      }
    }
  
    return true;
  }
}
