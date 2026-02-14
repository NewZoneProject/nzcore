"use strict";
/**
 * Identity Root Key derivation
 * Deterministic from mnemonic ONLY
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityDerivation = void 0;
const mnemonic_js_1 = require("./mnemonic.js");
const ed25519_js_1 = require("../crypto/ed25519.js");
const scrypt_js_1 = require("../crypto/scrypt.js");
const hkdf_js_1 = require("../crypto/hkdf.js");
const blake2b_js_1 = require("../crypto/blake2b.js");
const zeroize_js_1 = require("../utils/zeroize.js");
const encoding_js_1 = require("../utils/encoding.js");
const types_js_1 = require("../types.js");
const constants_js_1 = require("../constants.js");
class IdentityDerivation {
    /**
     * Derive identity root from mnemonic
     * Complete derivation path:
     * Mnemonic → Seed (BIP-39) → Scrypt → HKDF → Ed25519
     */
    static async fromMnemonic(mnemonic) {
        if (!mnemonic_js_1.Mnemonic.validate(mnemonic)) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_MNEMONIC, 'Invalid mnemonic for identity derivation');
        }
        try {
            // Step 1: BIP-39 seed (passphrase always empty per spec)
            const seed = mnemonic_js_1.Mnemonic.toSeed(mnemonic, ''); // Empty passphrase - critical!
            // Step 2: Scrypt memory-hard KDF
            const salt = new TextEncoder().encode('nzcore-identity-v1');
            const scryptKey = scrypt_js_1.Scrypt.derive(seed, salt);
            // Step 3: HKDF expansion
            const info = new TextEncoder().encode('ed25519-root-key');
            const hkdfSalt = new TextEncoder().encode('nzcore-hkdf-salt');
            const derivedKey = hkdf_js_1.Hkdf.derive(scryptKey, hkdfSalt, info, constants_js_1.KEY_LENGTHS.PRIVATE_KEY);
            // Step 4: Ed25519 keypair (ТЕПЕРЬ С AWAIT!)
            const { publicKey, privateKey } = await ed25519_js_1.Ed25519.generateKeyPair(derivedKey);
            // Step 5: Derive chain ID from public key
            const chainId = this.deriveChainId(publicKey);
            // Zeroize intermediates
            (0, zeroize_js_1.zeroize)(scryptKey);
            (0, zeroize_js_1.zeroize)(derivedKey);
            return {
                seed,
                rootKey: {
                    publicKey,
                    privateKey,
                    chainId
                }
            };
        }
        catch (e) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_KEY, 'Identity derivation failed', { error: e });
        }
    }
    /**
     * Derive chain ID from public key
     * Deterministic, collision-resistant
     */
    static deriveChainId(publicKey) {
        const domain = `nzcore-${constants_js_1.CRYPTO_SUITE}-chain`;
        const hash = blake2b_js_1.Blake2b.hashWithDomain(domain, publicKey);
        return (0, encoding_js_1.toHex)(hash.slice(0, constants_js_1.KEY_LENGTHS.CHAIN_ID));
    }
    /**
     * Derive document ID
     * Deterministic from chain state
     */
    static deriveDocumentId(chainId, parentHash, logicalTime) {
        const domain = `nzcore-${constants_js_1.CRYPTO_SUITE}-document`;
        const inputs = (0, encoding_js_1.mergeArrays)(new TextEncoder().encode(chainId), new TextEncoder().encode(parentHash), new Uint8Array(new Uint32Array([logicalTime]).buffer));
        const hash = blake2b_js_1.Blake2b.hashWithDomain(domain, inputs);
        return (0, encoding_js_1.toHex)(hash.slice(0, constants_js_1.KEY_LENGTHS.DOCUMENT_ID));
    }
    /**
     * Derive subkey for specific purpose
     */
    static deriveSubKey(rootKey, purpose) {
        const info = new TextEncoder().encode(`nzcore-subkey-${purpose}`);
        const salt = new TextEncoder().encode('subkey-derivation');
        return hkdf_js_1.Hkdf.derive(rootKey, salt, info, constants_js_1.KEY_LENGTHS.PRIVATE_KEY);
    }
}
exports.IdentityDerivation = IdentityDerivation;
//# sourceMappingURL=derivation.js.map