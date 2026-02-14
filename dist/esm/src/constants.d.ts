/**
 * NewZoneCore - System Constants
 * Specification: nzcore-crypto-01
 */
export declare const CRYPTO_SUITE: "nzcore-crypto-01";
export declare const SCRYPT_PARAMS: {
    readonly N: 32768;
    readonly r: 8;
    readonly p: 1;
    readonly dkLen: 64;
};
export declare const KEY_LENGTHS: {
    readonly SEED: 64;
    readonly PRIVATE_KEY: 32;
    readonly PUBLIC_KEY: 32;
    readonly SIGNATURE: 64;
    readonly HASH: 32;
    readonly CHAIN_ID: 32;
    readonly DOCUMENT_ID: 32;
};
export declare const LOGICAL_TIME: {
    readonly MIN: 1;
    readonly MAX: number;
};
export declare const DOCUMENT_VERSION: "1.0";
export declare const BIP39_STRENGTH = 256;
export declare const BIP39_WORDLIST: "english";
export declare const TRUST_LAYERS: readonly ["structural", "cryptographic", "policy"];
export declare const ERROR_CODES: {
    readonly INVALID_MNEMONIC: "ERR_INVALID_MNEMONIC";
    readonly INVALID_SEED: "ERR_INVALID_SEED";
    readonly INVALID_KEY: "ERR_INVALID_KEY";
    readonly INVALID_SIGNATURE: "ERR_INVALID_SIGNATURE";
    readonly NON_CANONICAL_JSON: "ERR_NON_CANONICAL_JSON";
    readonly FORK_DETECTED: "ERR_FORK_DETECTED";
    readonly LOGICAL_TIME_VIOLATION: "ERR_LOGICAL_TIME_VIOLATION";
    readonly CRYPTO_SUITE_MISMATCH: "ERR_CRYPTO_SUITE_MISMATCH";
    readonly VALIDATION_FAILED: "ERR_VALIDATION_FAILED";
};
//# sourceMappingURL=constants.d.ts.map