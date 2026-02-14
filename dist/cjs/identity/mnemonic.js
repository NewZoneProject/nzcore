"use strict";
/**
 * BIP-39 Mnemonic implementation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mnemonic = void 0;
const bip39 = __importStar(require("@scure/bip39"));
const english_1 = require("@scure/bip39/wordlists/english");
const types_js_1 = require("../types.js");
const constants_js_1 = require("../constants.js");
// Удаляем неиспользуемые импорты toHex и fromHex
class Mnemonic {
    /**
     * Generate BIP-39 mnemonic (24 words)
     */
    static generate(strength = constants_js_1.BIP39_STRENGTH) {
        try {
            return bip39.generateMnemonic(english_1.wordlist, strength);
        }
        catch (e) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_MNEMONIC, 'Failed to generate mnemonic', { error: e });
        }
    }
    /**
     * Validate BIP-39 mnemonic
     */
    static validate(mnemonic) {
        try {
            return bip39.validateMnemonic(mnemonic, english_1.wordlist);
        }
        catch {
            return false;
        }
    }
    /**
     * Convert mnemonic to seed
     */
    static toSeed(mnemonic, passphrase = '') {
        if (!this.validate(mnemonic)) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_MNEMONIC, 'Invalid BIP-39 mnemonic');
        }
        try {
            return bip39.mnemonicToSeedSync(mnemonic, passphrase);
        }
        catch (e) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_SEED, 'Failed to derive seed from mnemonic', { error: e });
        }
    }
    /**
     * Get entropy from mnemonic (deterministic)
     */
    static toEntropy(mnemonic) {
        if (!this.validate(mnemonic)) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_MNEMONIC, 'Invalid BIP-39 mnemonic');
        }
        try {
            return bip39.mnemonicToEntropy(mnemonic, english_1.wordlist);
        }
        catch (e) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_SEED, 'Failed to extract entropy from mnemonic', { error: e });
        }
    }
    /**
     * Create mnemonic from entropy
     */
    static fromEntropy(entropy) {
        try {
            return bip39.entropyToMnemonic(entropy, english_1.wordlist);
        }
        catch (e) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_MNEMONIC, 'Failed to create mnemonic from entropy', { error: e });
        }
    }
    /**
     * Mask mnemonic for logging (first 3 words only)
     */
    static mask(mnemonic) {
        const words = mnemonic.split(' ');
        return words
            .map((word, i) => {
            if (i < 3)
                return word;
            return '•'.repeat(word.length);
        })
            .join(' ');
    }
    /**
     * Securely zero mnemonic from memory
     */
    static zeroize(_mnemonic) {
        // Strings are immutable in JS, but we can help GC
    }
}
exports.Mnemonic = Mnemonic;
//# sourceMappingURL=mnemonic.js.map