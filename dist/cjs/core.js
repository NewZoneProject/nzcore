"use strict";
/**
 * NewZoneCore - Main Implementation
 * Personal autonomous Root of Trust
 */
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _NewZoneCore_identity, _NewZoneCore_chainState, _NewZoneCore_clock, _NewZoneCore_validator, _NewZoneCore_mnemonic, _NewZoneCore_options;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewZoneCore = void 0;
const derivation_js_1 = require("./identity/derivation.js");
const mnemonic_js_1 = require("./identity/mnemonic.js");
const builder_js_1 = require("./document/builder.js");
const validator_js_1 = require("./document/validator.js");
const state_js_1 = require("./chain/state.js");
const fork_js_1 = require("./chain/fork.js");
const logical_time_js_1 = require("./identity/logical-time.js");
const ed25519_js_1 = require("./crypto/ed25519.js");
const zeroize_js_1 = require("./utils/zeroize.js");
const encoding_js_1 = require("./utils/encoding.js");
const canonical_js_1 = require("./document/canonical.js");
const types_js_1 = require("./types.js");
const constants_js_1 = require("./constants.js");
class NewZoneCore {
    constructor(mnemonic, options = {}) {
        _NewZoneCore_identity.set(this, null);
        _NewZoneCore_chainState.set(this, null);
        _NewZoneCore_clock.set(this, null);
        _NewZoneCore_validator.set(this, null);
        _NewZoneCore_mnemonic.set(this, void 0);
        _NewZoneCore_options.set(this, void 0);
        // Validate mnemonic
        if (!mnemonic_js_1.Mnemonic.validate(mnemonic)) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_MNEMONIC, 'Invalid BIP-39 mnemonic');
        }
        __classPrivateFieldSet(this, _NewZoneCore_mnemonic, mnemonic, "f");
        __classPrivateFieldSet(this, _NewZoneCore_options, options, "f");
    }
    /**
     * Статический фабричный метод для асинхронного создания
     */
    static async create(mnemonic, options = {}) {
        const instance = new NewZoneCore(mnemonic, options);
        await instance.initialize();
        return instance;
    }
    /**
     * Асинхронная инициализация
     */
    async initialize() {
        try {
            // Derive identity (deterministic from mnemonic ONLY)
            const derivation = await derivation_js_1.IdentityDerivation.fromMnemonic(__classPrivateFieldGet(this, _NewZoneCore_mnemonic, "f"));
            __classPrivateFieldSet(this, _NewZoneCore_identity, derivation.rootKey, "f");
            // Initialize logical time
            __classPrivateFieldSet(this, _NewZoneCore_clock, new logical_time_js_1.LogicalClock(__classPrivateFieldGet(this, _NewZoneCore_options, "f").initialTime || 1), "f");
            // Initialize chain state
            const chainId = __classPrivateFieldGet(this, _NewZoneCore_options, "f").chainId || __classPrivateFieldGet(this, _NewZoneCore_identity, "f").chainId;
            __classPrivateFieldSet(this, _NewZoneCore_chainState, new state_js_1.ChainStateManager(chainId, __classPrivateFieldGet(this, _NewZoneCore_clock, "f").current), "f");
            // Initialize validator
            __classPrivateFieldSet(this, _NewZoneCore_validator, new validator_js_1.DocumentValidator(), "f");
        }
        catch (e) {
            this.destroy();
            throw e;
        }
    }
    /**
     * Create a new document
     * Core API: deterministic, no wall-clock dependencies
     */
    async createDocument(type, payload = {}) {
        this.assertInitialized();
        const logicalTime = __classPrivateFieldGet(this, _NewZoneCore_clock, "f").tick();
        const parentHash = __classPrivateFieldGet(this, _NewZoneCore_chainState, "f").getLastHash();
        const builder = new builder_js_1.DocumentBuilder()
            .setType(type)
            .setChainId(__classPrivateFieldGet(this, _NewZoneCore_chainState, "f").chainId)
            .setParentHash(parentHash)
            .setLogicalTime(logicalTime)
            .setCryptoSuite('nzcore-crypto-01')
            .setPayload(payload);
        // Generate deterministic ID
        const id = derivation_js_1.IdentityDerivation.deriveDocumentId(__classPrivateFieldGet(this, _NewZoneCore_chainState, "f").chainId, parentHash, logicalTime);
        builder.setId(id);
        // Build document (canonical)
        const doc = await builder.build();
        // Sign document
        const docWithoutSig = { ...doc };
        delete docWithoutSig.signature;
        const canonical = await canonical_js_1.CanonicalJSON.serialize(docWithoutSig);
        const signatureBytes = await ed25519_js_1.Ed25519.sign(new TextEncoder().encode(canonical), __classPrivateFieldGet(this, _NewZoneCore_identity, "f").privateKey);
        if (!signatureBytes || signatureBytes.length !== 64) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.INVALID_SIGNATURE, 'Failed to generate signature - empty result');
        }
        doc.signature = (0, encoding_js_1.toHex)(signatureBytes);
        // Commit to chain
        __classPrivateFieldGet(this, _NewZoneCore_chainState, "f").append(doc);
        return doc;
    }
    /**
     * Verify document
     * Core API: returns validation result with all layers
     */
    async verifyDocument(document) {
        this.assertInitialized();
        return __classPrivateFieldGet(this, _NewZoneCore_validator, "f").validate(document, {
            currentTime: __classPrivateFieldGet(this, _NewZoneCore_clock, "f").current,
            trustedKeys: [__classPrivateFieldGet(this, _NewZoneCore_identity, "f").publicKey]
        });
    }
    /**
     * Get current chain state
     * Core API: deterministic snapshot
     */
    getChainState() {
        this.assertInitialized();
        return __classPrivateFieldGet(this, _NewZoneCore_chainState, "f").getState();
    }
    /**
     * Detect forks
     * Core API: MUST NOT attempt automatic resolution
     */
    detectFork() {
        this.assertInitialized();
        const forks = fork_js_1.ForkDetector.scan(__classPrivateFieldGet(this, _NewZoneCore_chainState, "f").documents);
        // Mark detected at current logical time
        return forks.map(fork => ({
            ...fork,
            detectedAt: __classPrivateFieldGet(this, _NewZoneCore_clock, "f").current,
            resolved: false
        }));
    }
    /**
     * Export identity (for backup)
     * Returns mnemonic only - no other state
     */
    exportIdentity() {
        this.assertInitialized();
        if (!__classPrivateFieldGet(this, _NewZoneCore_mnemonic, "f")) {
            throw new Error('Identity not available');
        }
        return {
            mnemonic: __classPrivateFieldGet(this, _NewZoneCore_mnemonic, "f"),
            chainId: __classPrivateFieldGet(this, _NewZoneCore_chainState, "f").chainId
        };
    }
    /**
     * Export chain state (for persistence)
     */
    exportState() {
        this.assertInitialized();
        return __classPrivateFieldGet(this, _NewZoneCore_chainState, "f").export();
    }
    /**
     * Import chain state
     */
    importState(state) {
        this.assertInitialized();
        const imported = state_js_1.ChainStateManager.import(state, __classPrivateFieldGet(this, _NewZoneCore_chainState, "f").chainId);
        __classPrivateFieldSet(this, _NewZoneCore_chainState, imported, "f");
        __classPrivateFieldSet(this, _NewZoneCore_clock, imported.clock, "f");
    }
    /**
     * Get public key
     */
    getPublicKey() {
        this.assertInitialized();
        return __classPrivateFieldGet(this, _NewZoneCore_identity, "f").publicKey;
    }
    /**
     * Get public key as hex
     */
    getPublicKeyHex() {
        return (0, encoding_js_1.toHex)(this.getPublicKey());
    }
    /**
     * Get chain ID
     */
    getChainId() {
        this.assertInitialized();
        return __classPrivateFieldGet(this, _NewZoneCore_chainState, "f").chainId;
    }
    /**
     * Check if initialized
     */
    assertInitialized() {
        if (!__classPrivateFieldGet(this, _NewZoneCore_identity, "f") || !__classPrivateFieldGet(this, _NewZoneCore_chainState, "f") || !__classPrivateFieldGet(this, _NewZoneCore_clock, "f") || !__classPrivateFieldGet(this, _NewZoneCore_validator, "f")) {
            throw new Error('NewZoneCore instance not properly initialized');
        }
    }
    /**
     * Securely destroy instance
     * Zeroizes private key material
     */
    destroy() {
        if (__classPrivateFieldGet(this, _NewZoneCore_identity, "f")) {
            (0, zeroize_js_1.zeroize)(__classPrivateFieldGet(this, _NewZoneCore_identity, "f").privateKey);
            __classPrivateFieldSet(this, _NewZoneCore_identity, null, "f");
        }
        __classPrivateFieldSet(this, _NewZoneCore_chainState, null, "f");
        __classPrivateFieldSet(this, _NewZoneCore_clock, null, "f");
        __classPrivateFieldSet(this, _NewZoneCore_validator, null, "f");
        __classPrivateFieldSet(this, _NewZoneCore_mnemonic, undefined, "f");
    }
}
exports.NewZoneCore = NewZoneCore;
_NewZoneCore_identity = new WeakMap(), _NewZoneCore_chainState = new WeakMap(), _NewZoneCore_clock = new WeakMap(), _NewZoneCore_validator = new WeakMap(), _NewZoneCore_mnemonic = new WeakMap(), _NewZoneCore_options = new WeakMap();
//# sourceMappingURL=core.js.map