import test from 'node:test';
import assert from 'node:assert';
import { Mnemonic } from '../src/identity/mnemonic.js';
import { IdentityDerivation } from '../src/identity/derivation.js';
import { Ed25519 } from '../src/crypto/ed25519.js';
const TEST_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
test('Mnemonic Debug', async (t) => {
    await t.test('Check mnemonic validation', () => {
        console.log('1. Testing mnemonic validation...');
        const isValid = Mnemonic.validate(TEST_MNEMONIC);
        console.log('Is valid?', isValid);
        assert.ok(isValid);
    });
    await t.test('Check seed generation', () => {
        console.log('2. Testing seed generation...');
        const seed = Mnemonic.toSeed(TEST_MNEMONIC);
        console.log('Seed length:', seed.length);
        console.log('Seed (first 16 bytes):', Array.from(seed.slice(0, 16)).map(b => b.toString(16)).join(''));
        assert.ok(seed.length === 64);
    });
    await t.test('Check key derivation', async () => {
        console.log('3. Testing key derivation...');
        const derivation = await IdentityDerivation.fromMnemonic(TEST_MNEMONIC);
        console.log('Public key:', Array.from(derivation.rootKey.publicKey).map(b => b.toString(16)).join(''));
        console.log('Private key length:', derivation.rootKey.privateKey.length);
        assert.ok(derivation.rootKey.privateKey.length === 32);
    });
    await t.test('Check signing', async () => {
        console.log('4. Testing signing...');
        const derivation = await IdentityDerivation.fromMnemonic(TEST_MNEMONIC);
        const data = new TextEncoder().encode('test message');
        console.log('Signing with private key...');
        const signature = await Ed25519.sign(data, derivation.rootKey.privateKey);
        console.log('Signature length:', signature.length);
        console.log('Signature:', Array.from(signature).map(b => b.toString(16)).join(''));
        assert.ok(signature.length === 64);
    });
});
