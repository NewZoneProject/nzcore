/**
 * scrypt key derivation
 * nzcore-crypto-01 suite
 * Parameters: N=32768, r=8, p=1
 */
export declare class Scrypt {
    /**
     * Derive key using scrypt
     * Memory-hard KDF for master seed derivation
     */
    static derive(password: Uint8Array, salt: Uint8Array, dkLen?: number): Uint8Array;
    /**
     * Derive with personalization string
     */
    static deriveWithContext(password: Uint8Array, salt: Uint8Array, context: string, dkLen?: number): Uint8Array;
    /**
     * Verify derived key (constant-time)
     */
    static verify(password: Uint8Array, salt: Uint8Array, expectedKey: Uint8Array): boolean;
}
//# sourceMappingURL=scrypt.d.ts.map