/**
 * BLAKE2b-256 hash implementation
 * nzcore-crypto-01 suite
 */
export declare class Blake2b {
    /**
     * BLAKE2b-256 hash
     * Primary hash function for nzcore-crypto-01
     */
    static hash(data: Uint8Array, key?: Uint8Array): Uint8Array;
    /**
     * Double hash: BLAKE2b(BLAKE2b(data))
     * Used for document IDs
     */
    static doubleHash(data: Uint8Array): Uint8Array;
    /**
     * Keyed hash (MAC)
     */
    static mac(data: Uint8Array, key: Uint8Array): Uint8Array;
    /**
     * Hash with domain separation
     */
    static hashWithDomain(domain: string, data: Uint8Array): Uint8Array;
    /**
     * Verify hash equality (constant-time)
     */
    static verifyHash(expected: Uint8Array, actual: Uint8Array): boolean;
    /**
     * Convert hash to hex string
     */
    static toHex(hash: Uint8Array): string;
    /**
     * SHA-256 (fallback, not primary)
     */
    static sha256(data: Uint8Array): Uint8Array;
    /**
     * Compute document hash for integrity verification
     * Uses same algorithm as IdentityDerivation.deriveDocumentId()
     */
    static computeDocumentHash(chainId: string, parentHash: string, logicalTime: number, payload?: Record<string, unknown>): string;
}
//# sourceMappingURL=blake2b.d.ts.map