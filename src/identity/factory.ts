/**
 * Identity Factory
 * Helper functions for identity creation
 */

import { Mnemonic } from './mnemonic.js';
import { NewZoneCore } from '../core.js';

export interface GeneratedIdentity {
  mnemonic: string;
  core: NewZoneCore;
}

/**
 * Generate a new random identity
 * Returns both mnemonic and initialized core
 */
export async function generateIdentity(): Promise<GeneratedIdentity> {
  const mnemonic = Mnemonic.generate();
  const core = await NewZoneCore.create(mnemonic);
  
  return { mnemonic, core };
}

/**
 * Create identity from existing mnemonic
 */
export async function createIdentity(mnemonic: string): Promise<NewZoneCore> {
  return await NewZoneCore.create(mnemonic);
}

/**
 * Create identity from entropy
 */
export async function createIdentityFromEntropy(entropy: Uint8Array): Promise<GeneratedIdentity> {
  const mnemonic = Mnemonic.fromEntropy(entropy);
  const core = await NewZoneCore.create(mnemonic);
  
  return { mnemonic, core };
}

/**
 * Validate mnemonic and return identity if valid
 */
export async function tryCreateIdentity(mnemonic: string): Promise<NewZoneCore | null> {
  try {
    return await NewZoneCore.create(mnemonic);
  } catch {
    return null;
  }
}
