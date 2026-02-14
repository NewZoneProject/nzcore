/**
 * Document Validator
 * Trust layers: Structural → Cryptographic → Policy
 * Final trust = AND of all layers
 */
import { Document, ValidationResult, ValidationContext } from '../types.js';
export declare class DocumentValidator {
    /**
     * Validate document
     * Implements three-layer trust model
     */
    validate(document: Document, context: ValidationContext): Promise<ValidationResult>;
    /**
     * Structural validation
     * Checks document format, required fields, invariants
     */
    private validateStructural;
    /**
     * Cryptographic validation
     * Checks signature, canonical JSON, key validity
     */
    private validateCryptographic;
    /**
     * Policy validation
     * Implementation-defined, out of Core scope
     * Stub that always returns true unless policy engine provided
     */
    private validatePolicy;
    /**
     * Finalize validation result
     */
    private finalize;
    /**
     * Quick validation - single layer only
     */
    quickValidate(document: Document, publicKey: Uint8Array): Promise<boolean>;
    /**
     * Validate document chain integrity
     */
    validateChain(documents: Document[]): boolean;
}
//# sourceMappingURL=validator.d.ts.map