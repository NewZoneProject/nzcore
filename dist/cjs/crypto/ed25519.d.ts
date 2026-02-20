/**
 * Ed25519 signature implementation
 * nzcore-crypto-01 suite
 */
export declare class Ed25519 {
    /**
     * Generate Ed25519 keypair
     */
    static generateKeyPair(seed?: Uint8Array): Promise<{
        publicKey: Uint8Array;
        privateKey: Uint8Array;
    }>;
    /**
     * Sign data with Ed25519
     * @noble/ed25519 guarantees 64-byte signatures
     */
    static sign(data: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array>;
    /**
     * Verify Ed25519 signature
     */
    static verify(signature: Uint8Array, data: Uint8Array, publicKey: Uint8Array): Promise<boolean>;
    /**
     * Convert public key to string format
     */
    static publicKeyToString(key: Uint8Array): string;
    /**
     * Validate key format
     */
    static validatePublicKey(key: Uint8Array): boolean;
    static validatePrivateKey(key: Uint8Array): boolean;
}
//# sourceMappingURL=ed25519.d.ts.map