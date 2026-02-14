"use strict";
/**
 * scrypt key derivation
 * nzcore-crypto-01 suite
 * Parameters: N=32768, r=8, p=1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scrypt = void 0;
const scrypt_1 = require("@noble/hashes/scrypt");
const constants_js_1 = require("../constants.js");
const types_js_1 = require("../types.js");
const zeroize_js_1 = require("../utils/zeroize.js");
const encoding_js_1 = require("../utils/encoding.js");
class Scrypt {
    /**
     * Derive key using scrypt
     * Memory-hard KDF for master seed derivation
     */
    static derive(password, salt, dkLen = constants_js_1.SCRYPT_PARAMS.dkLen) {
        try {
            const key = (0, scrypt_1.scrypt)(password, salt, {
                N: constants_js_1.SCRYPT_PARAMS.N,
                r: constants_js_1.SCRYPT_PARAMS.r,
                p: constants_js_1.SCRYPT_PARAMS.p,
                dkLen
            });
            return key;
        }
        catch (e) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_KEY, 'scrypt key derivation failed', { error: e });
        }
    }
    /**
     * Derive with personalization string
     */
    static deriveWithContext(password, salt, context, dkLen) {
        const contextBytes = new TextEncoder().encode(context);
        const personalSalt = (0, encoding_js_1.mergeArrays)(salt, contextBytes);
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
                result |= derived[i] ^ expectedKey[i];
            }
            // Zeroize derived key
            (0, zeroize_js_1.zeroize)(derived);
            return result === 0;
        }
        catch {
            return false;
        }
    }
}
exports.Scrypt = Scrypt;
//# sourceMappingURL=scrypt.js.map