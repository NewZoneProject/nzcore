"use strict";
/**
 * NewZoneCore
 * Personal autonomous Root of Trust
 *
 * This is the main entry point for the library
 * Exports public API and types
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = exports.fromBase64URL = exports.toBase64URL = exports.fromHex = exports.toHex = exports.constantTimeEqual = exports.zeroize = exports.Hkdf = exports.Scrypt = exports.Blake2b = exports.Ed25519 = exports.ForkDetector = exports.ChainStateManager = exports.LogicalClock = exports.CanonicalJSON = exports.DocumentValidator = exports.DocumentBuilder = exports.createIdentity = exports.generateIdentity = exports.IdentityDerivation = exports.Mnemonic = exports.NewZoneCore = void 0;
// Core class
var core_js_1 = require("./core.js");
Object.defineProperty(exports, "NewZoneCore", { enumerable: true, get: function () { return core_js_1.NewZoneCore; } });
// Identity
var mnemonic_js_1 = require("./identity/mnemonic.js");
Object.defineProperty(exports, "Mnemonic", { enumerable: true, get: function () { return mnemonic_js_1.Mnemonic; } });
var derivation_js_1 = require("./identity/derivation.js");
Object.defineProperty(exports, "IdentityDerivation", { enumerable: true, get: function () { return derivation_js_1.IdentityDerivation; } });
var factory_js_1 = require("./identity/factory.js");
Object.defineProperty(exports, "generateIdentity", { enumerable: true, get: function () { return factory_js_1.generateIdentity; } });
Object.defineProperty(exports, "createIdentity", { enumerable: true, get: function () { return factory_js_1.createIdentity; } });
// Document
var builder_js_1 = require("./document/builder.js");
Object.defineProperty(exports, "DocumentBuilder", { enumerable: true, get: function () { return builder_js_1.DocumentBuilder; } });
var validator_js_1 = require("./document/validator.js");
Object.defineProperty(exports, "DocumentValidator", { enumerable: true, get: function () { return validator_js_1.DocumentValidator; } });
var canonical_js_1 = require("./document/canonical.js");
Object.defineProperty(exports, "CanonicalJSON", { enumerable: true, get: function () { return canonical_js_1.CanonicalJSON; } });
// Chain
var logical_time_js_1 = require("./identity/logical-time.js");
Object.defineProperty(exports, "LogicalClock", { enumerable: true, get: function () { return logical_time_js_1.LogicalClock; } });
var state_js_1 = require("./chain/state.js");
Object.defineProperty(exports, "ChainStateManager", { enumerable: true, get: function () { return state_js_1.ChainStateManager; } });
var fork_js_1 = require("./chain/fork.js");
Object.defineProperty(exports, "ForkDetector", { enumerable: true, get: function () { return fork_js_1.ForkDetector; } });
// Crypto
var ed25519_js_1 = require("./crypto/ed25519.js");
Object.defineProperty(exports, "Ed25519", { enumerable: true, get: function () { return ed25519_js_1.Ed25519; } });
var blake2b_js_1 = require("./crypto/blake2b.js");
Object.defineProperty(exports, "Blake2b", { enumerable: true, get: function () { return blake2b_js_1.Blake2b; } });
var scrypt_js_1 = require("./crypto/scrypt.js");
Object.defineProperty(exports, "Scrypt", { enumerable: true, get: function () { return scrypt_js_1.Scrypt; } });
var hkdf_js_1 = require("./crypto/hkdf.js");
Object.defineProperty(exports, "Hkdf", { enumerable: true, get: function () { return hkdf_js_1.Hkdf; } });
// Utils
var zeroize_js_1 = require("./utils/zeroize.js");
Object.defineProperty(exports, "zeroize", { enumerable: true, get: function () { return zeroize_js_1.zeroize; } });
Object.defineProperty(exports, "constantTimeEqual", { enumerable: true, get: function () { return zeroize_js_1.constantTimeEqual; } });
var encoding_js_1 = require("./utils/encoding.js");
Object.defineProperty(exports, "toHex", { enumerable: true, get: function () { return encoding_js_1.toHex; } });
Object.defineProperty(exports, "fromHex", { enumerable: true, get: function () { return encoding_js_1.fromHex; } });
Object.defineProperty(exports, "toBase64URL", { enumerable: true, get: function () { return encoding_js_1.toBase64URL; } });
Object.defineProperty(exports, "fromBase64URL", { enumerable: true, get: function () { return encoding_js_1.fromBase64URL; } });
// Types
__exportStar(require("./types.js"), exports);
// Constants
__exportStar(require("./constants.js"), exports);
// Version
exports.VERSION = '1.0.0';
//# sourceMappingURL=index.js.map