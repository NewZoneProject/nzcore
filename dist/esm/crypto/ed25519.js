/**
 * Ed25519 signature implementation
 * nzcore-crypto-01 suite
 */
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { randomBytes } from '@noble/hashes/utils';
import { NewZoneCoreError } from '../types.js';
import { ERROR_CODES } from '../constants.js';
export class Ed25519 {
    /**
     * Generate Ed25519 keypair
     */
    static async generateKeyPair(seed) {
        try {
            let privateKey;
            if (seed) {
                // Use seed to generate private key
                const hash = sha512(seed);
                privateKey = hash.slice(0, 32);
            }
            else {
                privateKey = randomBytes(32);
            }
            const publicKey = await ed.getPublicKey(privateKey);
            return { publicKey, privateKey };
        }
        catch (e) {
            throw new NewZoneCoreError(ERROR_CODES.INVALID_KEY, 'Failed to generate Ed25519 keypair', { error: e });
        }
    }
    /**
     * Sign data with Ed25519
     * @noble/ed25519 guarantees 64-byte signatures
     */
    static async sign(data, privateKey) {
        try {
            return await ed.sign(data, privateKey);
        }
        catch (e) {
            throw new NewZoneCoreError(ERROR_CODES.INVALID_SIGNATURE, 'Failed to sign data', { error: e });
        }
    }
    /**
     * Verify Ed25519 signature
     */
    static async verify(signature, data, publicKey) {
        try {
            return await ed.verify(signature, data, publicKey);
        }
        catch {
            return false;
        }
    }
    /**
     * Convert public key to string format
     */
    static publicKeyToString(key) {
        return Array.from(key)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
    /**
     * Validate key format
     */
    static validatePublicKey(key) {
        return key.length === 32;
    }
    static validatePrivateKey(key) {
        return key.length === 32;
    }
}
//# sourceMappingURL=ed25519.js.map