import test from 'node:test';
import assert from 'node:assert';
import { NewZoneCore, generateIdentity, Mnemonic } from '../src/index.js';

test('Debug signature issue', async (t) => {
  await t.test('Check document signature', async () => {
    console.log('1. Generating identity...');
    const { mnemonic, core } = await generateIdentity();
    console.log('2. Identity generated, public key:', core.getPublicKeyHex());
    
    console.log('3. Creating document...');
    const doc = await core.createDocument('test', { message: 'Hello' });
    console.log('4. Document created:', JSON.stringify(doc, null, 2));
    
    console.log('5. Checking signature field...');
    console.log('doc.signature type:', typeof doc.signature);
    console.log('doc.signature value:', doc.signature);
    console.log('doc.signature length:', doc.signature?.length);
    
    assert.ok(doc.signature, 'Signature should exist');
    assert.ok(doc.signature.length > 0, 'Signature should not be empty');
    
    console.log('6. Verifying document...');
    const result = await core.verifyDocument(doc);
    console.log('7. Verification result:', JSON.stringify(result, null, 2));
    
    assert.strictEqual(result.final, true);
    
    core.destroy();
    console.log('8. Test completed');
  });
});
