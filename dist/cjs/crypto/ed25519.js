"use strict";
/**
 * Ed25519 signature implementation
 * nzcore-crypto-01 suite
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
exports.Ed25519 = void 0;
const ed = __importStar(require("@noble/ed25519"));
const sha512_1 = require("@noble/hashes/sha512");
const utils_1 = require("@noble/hashes/utils");
const types_js_1 = require("../types.js");
const constants_js_1 = require("../constants.js");
class Ed25519 {
    /**
     * Generate Ed25519 keypair
     */
    static async generateKeyPair(seed) {
        try {
            let privateKey;
            if (seed) {
                // Use seed to generate private key
                const hash = (0, sha512_1.sha512)(seed);
                privateKey = hash.slice(0, 32);
            }
            else {
                privateKey = (0, utils_1.randomBytes)(32);
            }
            const publicKey = await ed.getPublicKey(privateKey);
            return { publicKey, privateKey };
        }
        catch (e) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_KEY, 'Failed to generate Ed25519 keypair', { error: e });
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
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_SIGNATURE, 'Failed to sign data', { error: e });
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
exports.Ed25519 = Ed25519;
//# sourceMappingURL=ed25519.js.map