/**
 * Identity Factory
 * Helper functions for identity creation
 */
import { NewZoneCore } from '../core.js';
export interface GeneratedIdentity {
    mnemonic: string;
    core: NewZoneCore;
}
/**
 * Generate a new random identity
 * Returns both mnemonic and initialized core
 */
export declare function generateIdentity(): Promise<GeneratedIdentity>;
/**
 * Create identity from existing mnemonic
 */
export declare function createIdentity(mnemonic: string): Promise<NewZoneCore>;
/**
 * Create identity from entropy
 */
export declare function createIdentityFromEntropy(entropy: Uint8Array): Promise<GeneratedIdentity>;
/**
 * Validate mnemonic and return identity if valid
 */
export declare function tryCreateIdentity(mnemonic: string): Promise<NewZoneCore | null>;
//# sourceMappingURL=factory.d.ts.map