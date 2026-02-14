"use strict";
/**
 * NewZoneCore - System Constants
 * Specification: nzcore-crypto-01
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = exports.TRUST_LAYERS = exports.BIP39_WORDLIST = exports.BIP39_STRENGTH = exports.DOCUMENT_VERSION = exports.LOGICAL_TIME = exports.KEY_LENGTHS = exports.SCRYPT_PARAMS = exports.CRYPTO_SUITE = void 0;
// Crypto suite identifier - immutable once defined
exports.CRYPTO_SUITE = 'nzcore-crypto-01';
// Scrypt parameters per specification
exports.SCRYPT_PARAMS = {
    N: 32768, // 2^15
    r: 8,
    p: 1,
    dkLen: 64
};
// Key lengths
exports.KEY_LENGTHS = {
    SEED: 64,
    PRIVATE_KEY: 32,
    PUBLIC_KEY: 32,
    SIGNATURE: 64,
    HASH: 32,
    CHAIN_ID: 32,
    DOCUMENT_ID: 32
};
// Logical time bounds
exports.LOGICAL_TIME = {
    MIN: 1,
    MAX: Number.MAX_SAFE_INTEGER
};
// Document versions
exports.DOCUMENT_VERSION = '1.0';
// BIP-39 wordlist
exports.BIP39_STRENGTH = 256; // 24 words
exports.BIP39_WORDLIST = 'english';
// Validation layers
exports.TRUST_LAYERS = [
    'structural',
    'cryptographic',
    'policy'
];
// Error codes
exports.ERROR_CODES = {
    INVALID_MNEMONIC: 'ERR_INVALID_MNEMONIC',
    INVALID_SEED: 'ERR_INVALID_SEED',
    INVALID_KEY: 'ERR_INVALID_KEY',
    INVALID_SIGNATURE: 'ERR_INVALID_SIGNATURE',
    NON_CANONICAL_JSON: 'ERR_NON_CANONICAL_JSON',
    FORK_DETECTED: 'ERR_FORK_DETECTED',
    LOGICAL_TIME_VIOLATION: 'ERR_LOGICAL_TIME_VIOLATION',
    CRYPTO_SUITE_MISMATCH: 'ERR_CRYPTO_SUITE_MISMATCH',
    VALIDATION_FAILED: 'ERR_VALIDATION_FAILED'
};
//# sourceMappingURL=constants.js.map