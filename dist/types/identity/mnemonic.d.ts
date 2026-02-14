/**
 * BIP-39 Mnemonic implementation
 */
export declare class Mnemonic {
    /**
     * Generate BIP-39 mnemonic (24 words)
     */
    static generate(strength?: number): string;
    /**
     * Validate BIP-39 mnemonic
     */
    static validate(mnemonic: string): boolean;
    /**
     * Convert mnemonic to seed
     */
    static toSeed(mnemonic: string, passphrase?: string): Uint8Array;
    /**
     * Get entropy from mnemonic (deterministic)
     */
    static toEntropy(mnemonic: string): Uint8Array;
    /**
     * Create mnemonic from entropy
     */
    static fromEntropy(entropy: Uint8Array): string;
    /**
     * Mask mnemonic for logging (first 3 words only)
     */
    static mask(mnemonic: string): string;
    /**
     * Securely zero mnemonic from memory
     */
    static zeroize(_mnemonic: string): void;
}
//# sourceMappingURL=mnemonic.d.ts.map