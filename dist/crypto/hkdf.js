"use strict";
/**
 * HKDF-SHA256 implementation
 * nzcore-crypto-01 suite
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hkdf = void 0;
const hkdf_1 = require("@noble/hashes/hkdf");
const sha256_1 = require("@noble/hashes/sha256");
const types_js_1 = require("../types.js");
const constants_js_1 = require("../constants.js"); // Добавить
const zeroize_js_1 = require("../utils/zeroize.js");
class Hkdf {
    /**
     * HKDF extract
     * PRK = HMAC-Hash(salt, IKM)
     */
    static extract(salt, ikm) {
        try {
            // HKDF extract phase
            const prk = (0, hkdf_1.hkdf)(sha256_1.sha256, ikm, salt, '', 32);
            return prk;
        }
        catch (e) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_KEY, 'HKDF extract failed', { error: e });
        }
    }
    /**
     * HKDF expand
     * OKM = HKDF-Expand(PRK, info, L)
     */
    static expand(prk, info, length) {
        try {
            const okm = (0, hkdf_1.hkdf)(sha256_1.sha256, prk, new Uint8Array(0), info, length);
            return okm;
        }
        catch (e) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_KEY, 'HKDF expand failed', { error: e });
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
            (0, zeroize_js_1.zeroize)(prk);
            return okm;
        }
        catch (e) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_KEY, 'HKDF derive failed', { error: e });
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
            (0, zeroize_js_1.zeroize)(prk);
        }
        return keys;
    }
}
exports.Hkdf = Hkdf;
//# sourceMappingURL=hkdf.js.map