/**
 * scrypt key derivation
 * nzcore-crypto-01 suite
 * Parameters: N=32768, r=8, p=1
 */
import { scrypt } from '@noble/hashes/scrypt';
import { SCRYPT_PARAMS, ERROR_CODES } from '../constants.js';
import { NewZoneCoreError } from '../types.js';
import { zeroize } from '../utils/zeroize.js';
import { mergeArrays } from '../utils/encoding.js';
export class Scrypt {
    /**
     * Derive key using scrypt
     * Memory-hard KDF for master seed derivation
     */
    static derive(password, salt, dkLen = SCRYPT_PARAMS.dkLen) {
        try {
            const key = scrypt(password, salt, {
                N: SCRYPT_PARAMS.N,
                r: SCRYPT_PARAMS.r,
                p: SCRYPT_PARAMS.p,
                dkLen
            });
            return key;
        }
        catch (e) {
            throw new NewZoneCoreError(ERROR_CODES.INVALID_KEY, 'scrypt key derivation failed', { error: e });
        }
    }
    /**
     * Derive with personalization string
     */
    static deriveWithContext(password, salt, context, dkLen) {
        const contextBytes = new TextEncoder().encode(context);
        const personalSalt = mergeArrays(salt, contextBytes);
        return this.derive(password, personalSalt, dkLen);
    }
    /**
     * Verify derived key (constant-time)
     */
    static verify(password, salt, expectedKey) {
        try {
            const derived = this.derive(password, salt, expectedKey.length);
            // Constant-time comparison
            let result = 0;
            for (let i = 0; i < expectedKey.length; i++) {
                const derivedByte = derived[i];
                const expectedByte = expectedKey[i];
                if (derivedByte === undefined || expectedByte === undefined) {
                    return false;
                }
                result |= derivedByte ^ expectedByte;
            }
            // Zeroize derived key
            zeroize(derived);
            return result === 0;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=scrypt.js.map