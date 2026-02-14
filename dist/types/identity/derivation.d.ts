/**
 * Identity Root Key derivation
 * Deterministic from mnemonic ONLY
 */
export declare class IdentityDerivation {
    /**
     * Derive identity root from mnemonic
     * Complete derivation path:
     * Mnemonic → Seed (BIP-39) → Scrypt → HKDF → Ed25519
     */
    static fromMnemonic(mnemonic: string): Promise<{
        seed: Uint8Array;
        rootKey: {
            publicKey: Uint8Array;
            privateKey: Uint8Array;
            chainId: string;
        };
    }>;
    /**
     * Derive chain ID from public key
     * Deterministic, collision-resistant
     */
    static deriveChainId(publicKey: Uint8Array): string;
    /**
     * Derive document ID
     * Deterministic from chain state
     */
    static deriveDocumentId(chainId: string, parentHash: string, logicalTime: number): string;
    /**
     * Derive subkey for specific purpose
     */
    static deriveSubKey(rootKey: Uint8Array, purpose: string): Uint8Array;
}
//# sourceMappingURL=derivation.d.ts.map