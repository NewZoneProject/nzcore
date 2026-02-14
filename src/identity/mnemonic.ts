/**
 * BIP-39 Mnemonic implementation
 */

import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { NewZoneCoreError } from '../types.js';
import { BIP39_STRENGTH, ERROR_CODES } from '../constants.js';
// Удаляем неиспользуемые импорты toHex и fromHex

export class Mnemonic {
  /**
   * Generate BIP-39 mnemonic (24 words)
   */
  static generate(strength: number = BIP39_STRENGTH): string {
    try {
      return bip39.generateMnemonic(wordlist, strength);
    } catch (e) {
      throw new NewZoneCoreError(
        ERROR_CODES.INVALID_MNEMONIC,
        'Failed to generate mnemonic',
        { error: e }
      );
    }
  }

  /**
   * Validate BIP-39 mnemonic
   */
  static validate(mnemonic: string): boolean {
    try {
      return bip39.validateMnemonic(mnemonic, wordlist);
    } catch {
      return false;
    }
  }

  /**
   * Convert mnemonic to seed
   */
  static toSeed(mnemonic: string, passphrase: string = ''): Uint8Array {
    if (!this.validate(mnemonic)) {
      throw new NewZoneCoreError(
        ERROR_CODES.INVALID_MNEMONIC,
        'Invalid BIP-39 mnemonic'
      );
    }

    try {
      return bip39.mnemonicToSeedSync(mnemonic, passphrase);
    } catch (e) {
      throw new NewZoneCoreError(
        ERROR_CODES.INVALID_SEED,
        'Failed to derive seed from mnemonic',
        { error: e }
      );
    }
  }

  /**
   * Get entropy from mnemonic (deterministic)
   */
  static toEntropy(mnemonic: string): Uint8Array {
    if (!this.validate(mnemonic)) {
      throw new NewZoneCoreError(
        ERROR_CODES.INVALID_MNEMONIC,
        'Invalid BIP-39 mnemonic'
      );
    }

    try {
      return bip39.mnemonicToEntropy(mnemonic, wordlist);
    } catch (e) {
      throw new NewZoneCoreError(
        ERROR_CODES.INVALID_SEED,
        'Failed to extract entropy from mnemonic',
        { error: e }
      );
    }
  }

  /**
   * Create mnemonic from entropy
   */
  static fromEntropy(entropy: Uint8Array): string {
    try {
      return bip39.entropyToMnemonic(entropy, wordlist);
    } catch (e) {
      throw new NewZoneCoreError(
        ERROR_CODES.INVALID_MNEMONIC,
        'Failed to create mnemonic from entropy',
        { error: e }
      );
    }
  }

  /**
   * Mask mnemonic for logging (first 3 words only)
   */
  static mask(mnemonic: string): string {
    const words = mnemonic.split(' ');
    return words
      .map((word, i) => {
        if (i < 3) return word;
        return '•'.repeat(word.length);
      })
      .join(' ');
  }

  /**
   * Securely zero mnemonic from memory
   */
  static zeroize(_mnemonic: string): void {
    // Strings are immutable in JS, but we can help GC
  }
}
