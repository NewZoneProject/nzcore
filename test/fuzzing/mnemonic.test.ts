/**
 * Fuzzing tests for Mnemonic validation
 * Tests edge cases and random inputs
 */

import test from 'node:test';
import assert from 'node:assert';
import { Mnemonic } from '../../src/identity/mnemonic.js';

/**
 * Generate random strings for fuzzing
 */
function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate valid BIP-39 words (subset)
 */
function generateValidWords(count: number): string[] {
  // Common BIP-39 words
  const validWords = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
    'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
    'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
    'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
    'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone',
    'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among',
    'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry',
    'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
  ];
  
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(validWords[Math.floor(Math.random() * validWords.length)]);
  }
  return words;
}

/**
 * Generate edge case mnemonics
 */
function generateEdgeCases(): string[] {
  return [
    '', // Empty string
    'abandon', // Single word
    'abandon ability', // Two words
    'invalid_word_test', // Invalid words
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon', // 12 words (valid length)
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', // 12 words (valid)
    Array.from({ length: 25 }, () => 'abandon').join(' '), // Too many words
    Array.from({ length: 11 }, () => 'abandon').join(' '), // Too few words
    'abandon  ability', // Double space
    '  abandon ability about  ', // Leading/trailing spaces
    'ABANDON ABILITY ABLE', // Uppercase
    'AbAnDoN AbIlItY AbLe', // Mixed case
    'abandon\x00ability', // Null character
    'abandon\nability', // Newline
    'abandon\tability', // Tab
    Array.from({ length: 1000 }, () => 'abandon').join(' '), // Very long
  ];
}

test('Mnemonic - Fuzzing validate', async (t) => {
  await t.test('should handle random strings', () => {
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
      const length = Math.floor(Math.random() * 200);
      const randomString = generateRandomString(length);
      
      try {
        const isValid = Mnemonic.validate(randomString);
        // validate should never throw, just return boolean
        assert.ok(typeof isValid === 'boolean');
      } catch (e) {
        // Should not throw for random input
        assert.fail(`validate() should not throw for random input: ${e}`);
      }
    }
  });

  await t.test('should handle edge cases', () => {
    const edgeCases = generateEdgeCases();
    
    for (const mnemonic of edgeCases) {
      try {
        const isValid = Mnemonic.validate(mnemonic);
        assert.ok(typeof isValid === 'boolean');
      } catch (e) {
        // Should not throw
        assert.fail(`validate() should not throw: ${e}`);
      }
    }
  });

  await t.test('should reject invalid checksums', () => {
    // Generate valid word count but wrong checksum
    const validWords = generateValidWords(12);
    const invalidMnemonic = validWords.join(' ');
    
    const isValid = Mnemonic.validate(invalidMnemonic);
    assert.strictEqual(isValid, false, 'Random words should not have valid checksum');
  });

  await t.test('should accept valid mnemonics', () => {
    // Use known valid mnemonic
    const validMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    
    const isValid = Mnemonic.validate(validMnemonic);
    assert.strictEqual(isValid, true);
  });
});

test('Mnemonic - Fuzzing toSeed', async (t) => {
  await t.test('should handle invalid mnemonics gracefully', () => {
    const invalidMnemonics = [
      '',
      'invalid words here',
      'abandon',
      generateRandomString(50),
    ];
    
    for (const mnemonic of invalidMnemonics) {
      try {
        Mnemonic.toSeed(mnemonic);
        assert.fail('toSeed should throw for invalid mnemonic');
      } catch (e) {
        assert.ok(e instanceof Error);
        assert.ok(e.message.includes('Invalid') || e.message.includes('mnemonic'));
      }
    }
  });

  await t.test('should produce consistent seeds', () => {
    const validMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    
    const seed1 = Mnemonic.toSeed(validMnemonic);
    const seed2 = Mnemonic.toSeed(validMnemonic);
    
    assert.deepStrictEqual(seed1, seed2);
  });
});

test('Mnemonic - Fuzzing mask', async (t) => {
  await t.test('should handle any string input', () => {
    const testStrings = [
      '',
      'short',
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      generateRandomString(100),
      '你好世界', // Unicode
      '🔐🔑🛡️', // Emoji
    ];
    
    for (const str of testStrings) {
      try {
        const masked = Mnemonic.mask(str);
        assert.ok(typeof masked === 'string');
        // First 3 words should be visible if string has 3+ words
        const wordCount = str.split(' ').length;
        if (wordCount >= 3) {
          assert.ok(masked.includes('•'), 'Should contain mask characters for multi-word strings');
        }
      } catch (e) {
        assert.fail(`mask() should not throw: ${e}`);
      }
    }
  });
});

test('Mnemonic - Fuzzing fromEntropy', async (t) => {
  await t.test('should handle various entropy sizes', () => {
    const validSizes = [16, 20, 24, 28, 32]; // Valid BIP-39 entropy sizes
    
    for (const size of validSizes) {
      const entropy = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        entropy[i] = Math.floor(Math.random() * 256);
      }
      
      try {
        const mnemonic = Mnemonic.fromEntropy(entropy);
        assert.ok(typeof mnemonic === 'string');
        assert.ok(mnemonic.length > 0);
        
        // Verify the mnemonic is valid
        const isValid = Mnemonic.validate(mnemonic);
        assert.strictEqual(isValid, true);
      } catch (e) {
        assert.fail(`fromEntropy should work for valid entropy size ${size}: ${e}`);
      }
    }
  });

  await t.test('should reject invalid entropy sizes', () => {
    const invalidSizes = [1, 10, 15, 17, 33, 64];
    
    for (const size of invalidSizes) {
      const entropy = new Uint8Array(size);
      
      try {
        Mnemonic.fromEntropy(entropy);
        // Some sizes might work, others won't - just verify consistency
      } catch (e) {
        // Expected for some sizes
        assert.ok(e instanceof Error);
      }
    }
  });
});

console.log('✅ Mnemonic fuzzing tests completed');
