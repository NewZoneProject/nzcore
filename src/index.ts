/**
 * NewZoneCore
 * Personal autonomous Root of Trust
 * 
 * This is the main entry point for the library
 * Exports public API and types
 */

// Core class
export { NewZoneCore } from './core.js';

// Identity
export { Mnemonic } from './identity/mnemonic.js';
export { IdentityDerivation } from './identity/derivation.js';
export { generateIdentity, createIdentity } from './identity/factory.js';

// Document
export { DocumentBuilder } from './document/builder.js';
export { DocumentValidator } from './document/validator.js';
export { CanonicalJSON } from './document/canonical.js';

// Chain
export { LogicalClock } from './identity/logical-time.js';
export { ChainStateManager } from './chain/state.js';
export { ForkDetector } from './chain/fork.js';

// Crypto
export { Ed25519 } from './crypto/ed25519.js';
export { Blake2b } from './crypto/blake2b.js';
export { Scrypt } from './crypto/scrypt.js';
export { Hkdf } from './crypto/hkdf.js';

// Utils
export { zeroize, constantTimeEqual } from './utils/zeroize.js';
export { toHex, fromHex, toBase64URL, fromBase64URL } from './utils/encoding.js';

// Types
export * from './types.js';

// Constants
export * from './constants.js';

// Version
export const VERSION = '1.0.0';
