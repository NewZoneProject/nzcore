/**
 * NewZoneCore
 * Personal autonomous Root of Trust
 *
 * This is the main entry point for the library
 * Exports public API and types
 */
export { NewZoneCore } from './core.js';
export { Mnemonic } from './identity/mnemonic.js';
export { IdentityDerivation } from './identity/derivation.js';
export { generateIdentity, createIdentity } from './identity/factory.js';
export { DocumentBuilder } from './document/builder.js';
export { DocumentValidator } from './document/validator.js';
export { CanonicalJSON } from './document/canonical.js';
export { LogicalClock } from './identity/logical-time.js';
export { ChainStateManager } from './chain/state.js';
export { ForkDetector } from './chain/fork.js';
export { Ed25519 } from './crypto/ed25519.js';
export { Blake2b } from './crypto/blake2b.js';
export { Scrypt } from './crypto/scrypt.js';
export { Hkdf } from './crypto/hkdf.js';
export { zeroize, constantTimeEqual } from './utils/zeroize.js';
export { toHex, fromHex, toBase64URL, fromBase64URL } from './utils/encoding.js';
export * from './types.js';
export * from './constants.js';
export declare const VERSION = "1.0.0";
//# sourceMappingURL=index.d.ts.map