"use strict";
/**
 * BLAKE2b-256 hash implementation
 * nzcore-crypto-01 suite
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blake2b = void 0;
const blake2b_1 = require("@noble/hashes/blake2b");
const sha256_1 = require("@noble/hashes/sha256");
const types_js_1 = require("../types.js");
const constants_js_1 = require("../constants.js");
const zeroize_js_1 = require("../utils/zeroize.js");
const encoding_js_1 = require("../utils/encoding.js");
class Blake2b {
    /**
     * BLAKE2b-256 hash
     * Primary hash function for nzcore-crypto-01
     */
    static hash(data, key) {
        try {
            return (0, blake2b_1.blake2b)(data, { dkLen: 32, key });
        }
        catch (e) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_KEY, 'Failed to compute BLAKE2b hash', { error: e });
        }
    }
    /**
     * Double hash: BLAKE2b(BLAKE2b(data))
     * Used for document IDs
     */
    static doubleHash(data) {
        return this.hash(this.hash(data));
    }
    /**
     * Keyed hash (MAC)
     */
    static mac(data, key) {
        return this.hash(data, key);
    }
    /**
     * Hash with domain separation
     */
    static hashWithDomain(domain, data) {
        const domainBytes = new TextEncoder().encode(domain + ':');
        const combined = new Uint8Array(domainBytes.length + data.length);
        combined.set(domainBytes);
        combined.set(data, domainBytes.length);
        return this.hash(combined);
    }
    /**
     * Verify hash equality (constant-time)
     */
    static verifyHash(expected, actual) {
        return (0, zeroize_js_1.constantTimeEqual)(expected, actual);
    }
    /**
     * Convert hash to hex string
     */
    static toHex(hash) {
        return (0, encoding_js_1.toHex)(hash);
    }
    /**
     * SHA-256 (fallback, not primary)
     */
    static sha256(data) {
        return (0, sha256_1.sha256)(data);
    }
}
exports.Blake2b = Blake2b;
//# sourceMappingURL=blake2b.js.map