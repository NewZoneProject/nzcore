/**
 * BLAKE2b-256 hash implementation
 * nzcore-crypto-01 suite
 */
import { blake2b } from '@noble/hashes/blake2b';
import { sha256 } from '@noble/hashes/sha256';
import { NewZoneCoreError } from '../types.js';
import { ERROR_CODES } from '../constants.js';
import { constantTimeEqual } from '../utils/zeroize.js';
import { toHex } from '../utils/encoding.js';
export class Blake2b {
    /**
     * BLAKE2b-256 hash
     * Primary hash function for nzcore-crypto-01
     */
    static hash(data, key) {
        try {
            return blake2b(data, { dkLen: 32, key });
        }
        catch (e) {
            throw new NewZoneCoreError(ERROR_CODES.INVALID_KEY, 'Failed to compute BLAKE2b hash', { error: e });
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
        return constantTimeEqual(expected, actual);
    }
    /**
     * Convert hash to hex string
     */
    static toHex(hash) {
        return toHex(hash);
    }
    /**
     * SHA-256 (fallback, not primary)
     */
    static sha256(data) {
        return sha256(data);
    }
}
//# sourceMappingURL=blake2b.js.map