"use strict";
/**
 * Identity Factory
 * Helper functions for identity creation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateIdentity = generateIdentity;
exports.createIdentity = createIdentity;
exports.createIdentityFromEntropy = createIdentityFromEntropy;
exports.tryCreateIdentity = tryCreateIdentity;
const mnemonic_js_1 = require("./mnemonic.js");
const core_js_1 = require("../core.js");
/**
 * Generate a new random identity
 * Returns both mnemonic and initialized core
 */
async function generateIdentity() {
    const mnemonic = mnemonic_js_1.Mnemonic.generate();
    const core = await core_js_1.NewZoneCore.create(mnemonic);
    return { mnemonic, core };
}
/**
 * Create identity from existing mnemonic
 */
async function createIdentity(mnemonic) {
    return await core_js_1.NewZoneCore.create(mnemonic);
}
/**
 * Create identity from entropy
 */
async function createIdentityFromEntropy(entropy) {
    const mnemonic = mnemonic_js_1.Mnemonic.fromEntropy(entropy);
    const core = await core_js_1.NewZoneCore.create(mnemonic);
    return { mnemonic, core };
}
/**
 * Validate mnemonic and return identity if valid
 */
async function tryCreateIdentity(mnemonic) {
    try {
        return await core_js_1.NewZoneCore.create(mnemonic);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=factory.js.map