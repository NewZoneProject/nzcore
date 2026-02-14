/**
 * HKDF-SHA256 implementation
 * nzcore-crypto-01 suite
 */
export declare class Hkdf {
    /**
     * HKDF extract
     * PRK = HMAC-Hash(salt, IKM)
     */
    static extract(salt: Uint8Array, ikm: Uint8Array): Uint8Array;
    /**
     * HKDF expand
     * OKM = HKDF-Expand(PRK, info, L)
     */
    static expand(prk: Uint8Array, info: Uint8Array, length: number): Uint8Array;
    /**
     * Full HKDF: extract + expand
     */
    static derive(ikm: Uint8Array, salt: Uint8Array, info: Uint8Array, length: number): Uint8Array;
    /**
     * Derive multiple keys in one call
     */
    static deriveMultiple(ikm: Uint8Array, salt: Uint8Array, contexts: string[], keyLength?: number): Uint8Array[];
}
//# sourceMappingURL=hkdf.d.ts.map