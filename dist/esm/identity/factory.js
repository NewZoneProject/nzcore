/**
 * Identity Factory
 * Helper functions for identity creation
 */
import { Mnemonic } from './mnemonic.js';
import { NewZoneCore } from '../core.js';
/**
 * Generate a new random identity
 * Returns both mnemonic and initialized core
 */
export async function generateIdentity() {
    const mnemonic = Mnemonic.generate();
    const core = await NewZoneCore.create(mnemonic);
    return { mnemonic, core };
}
/**
 * Create identity from existing mnemonic
 */
export async function createIdentity(mnemonic) {
    return await NewZoneCore.create(mnemonic);
}
/**
 * Create identity from entropy
 */
export async function createIdentityFromEntropy(entropy) {
    const mnemonic = Mnemonic.fromEntropy(entropy);
    const core = await NewZoneCore.create(mnemonic);
    return { mnemonic, core };
}
/**
 * Validate mnemonic and return identity if valid
 */
export async function tryCreateIdentity(mnemonic) {
    try {
        return await NewZoneCore.create(mnemonic);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=factory.js.map