/**
 * HKDF-SHA256 implementation
 * nzcore-crypto-01 suite
 */
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';
import { NewZoneCoreError } from '../types.js';
import { ERROR_CODES } from '../constants.js'; // Добавить
import { zeroize } from '../utils/zeroize.js';
export class Hkdf {
    /**
     * HKDF extract
     * PRK = HMAC-Hash(salt, IKM)
     */
    static extract(salt, ikm) {
        try {
            // HKDF extract phase
            const prk = hkdf(sha256, ikm, salt, '', 32);
            return prk;
        }
        catch (e) {
            throw new NewZoneCoreError(ERROR_CODES.INVALID_KEY, 'HKDF extract failed', { error: e });
        }
    }
    /**
     * HKDF expand
     * OKM = HKDF-Expand(PRK, info, L)
     */
    static expand(prk, info, length) {
        try {
            const okm = hkdf(sha256, prk, new Uint8Array(0), info, length);
            return okm;
        }
        catch (e) {
            throw new NewZoneCoreError(ERROR_CODES.INVALID_KEY, 'HKDF expand failed', { error: e });
        }
    }
    /**
     * Full HKDF: extract + expand
     */
    static derive(ikm, salt, info, length) {
        try {
            const prk = this.extract(salt, ikm);
            const okm = this.expand(prk, info, length);
            // Zeroize intermediate key
            zeroize(prk);
            return okm;
        }
        catch (e) {
            throw new NewZoneCoreError(ERROR_CODES.INVALID_KEY, 'HKDF derive failed', { error: e });
        }
    }
    /**
     * Derive multiple keys in one call
     */
    static deriveMultiple(ikm, salt, contexts, keyLength = 32) {
        const prk = this.extract(salt, ikm);
        const keys = [];
        try {
            for (let i = 0; i < contexts.length; i++) {
                const info = new TextEncoder().encode(`nzcore-${contexts[i]}-${i}`);
                const key = this.expand(prk, info, keyLength);
                keys.push(key);
            }
        }
        finally {
            zeroize(prk);
        }
        return keys;
    }
}
//# sourceMappingURL=hkdf.js.map