/**
 * Identity Root Key derivation
 * Deterministic from mnemonic ONLY
 */
import { Mnemonic } from './mnemonic.js';
import { Ed25519 } from '../crypto/ed25519.js';
import { Scrypt } from '../crypto/scrypt.js';
import { Hkdf } from '../crypto/hkdf.js';
import { Blake2b } from '../crypto/blake2b.js';
import { zeroize } from '../utils/zeroize.js';
import { toHex, mergeArrays } from '../utils/encoding.js';
import { NewZoneCoreError } from '../types.js';
import { KEY_LENGTHS, CRYPTO_SUITE, ERROR_CODES } from '../constants.js';
export class IdentityDerivation {
    /**
     * Derive identity root from mnemonic
     * Complete derivation path:
     * Mnemonic → Seed (BIP-39) → Scrypt → HKDF → Ed25519
     */
    static async fromMnemonic(mnemonic) {
        if (!Mnemonic.validate(mnemonic)) {
            throw new NewZoneCoreError(ERROR_CODES.INVALID_MNEMONIC, 'Invalid mnemonic for identity derivation');
        }
        try {
            // Step 1: BIP-39 seed (passphrase always empty per spec)
            const seed = Mnemonic.toSeed(mnemonic, ''); // Empty passphrase - critical!
            // Step 2: Scrypt memory-hard KDF
            const salt = new TextEncoder().encode('nzcore-identity-v1');
            const scryptKey = Scrypt.derive(seed, salt);
            // Step 3: HKDF expansion
            const info = new TextEncoder().encode('ed25519-root-key');
            const hkdfSalt = new TextEncoder().encode('nzcore-hkdf-salt');
            const derivedKey = Hkdf.derive(scryptKey, hkdfSalt, info, KEY_LENGTHS.PRIVATE_KEY);
            // Step 4: Ed25519 keypair (ТЕПЕРЬ С AWAIT!)
            const { publicKey, privateKey } = await Ed25519.generateKeyPair(derivedKey);
            // Step 5: Derive chain ID from public key
            const chainId = this.deriveChainId(publicKey);
            // Zeroize intermediates
            zeroize(scryptKey);
            zeroize(derivedKey);
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
            throw new NewZoneCoreError(ERROR_CODES.INVALID_KEY, 'Identity derivation failed', { error: e });
        }
    }
    /**
     * Derive chain ID from public key
     * Deterministic, collision-resistant
     */
    static deriveChainId(publicKey) {
        const domain = `nzcore-${CRYPTO_SUITE}-chain`;
        const hash = Blake2b.hashWithDomain(domain, publicKey);
        return toHex(hash.slice(0, KEY_LENGTHS.CHAIN_ID));
    }
    /**
     * Derive document ID
     * Deterministic from chain state
     */
    static deriveDocumentId(chainId, parentHash, logicalTime) {
        const domain = `nzcore-${CRYPTO_SUITE}-document`;
        const inputs = mergeArrays(new TextEncoder().encode(chainId), new TextEncoder().encode(parentHash), new Uint8Array(new Uint32Array([logicalTime]).buffer));
        const hash = Blake2b.hashWithDomain(domain, inputs);
        return toHex(hash.slice(0, KEY_LENGTHS.DOCUMENT_ID));
    }
    /**
     * Derive subkey for specific purpose
     */
    static deriveSubKey(rootKey, purpose) {
        const info = new TextEncoder().encode(`nzcore-subkey-${purpose}`);
        const salt = new TextEncoder().encode('subkey-derivation');
        return Hkdf.derive(rootKey, salt, info, KEY_LENGTHS.PRIVATE_KEY);
    }
}
//# sourceMappingURL=derivation.js.map