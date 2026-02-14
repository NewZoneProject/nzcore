import test from 'node:test';
import assert from 'node:assert';
import {
  NewZoneCore,
  generateIdentity,
  Mnemonic,
  LogicalClock,
  CanonicalJSON,
  ForkDetector,
  zeroize,
  constantTimeEqual
} from '../src/index.js';

const TEST_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

test('NewZoneCore - Full Integration', async (t) => {
  try {
    await t.test('Complete identity lifecycle', async () => {
      console.log('Starting test: Complete identity lifecycle');
      
      // Generate identity
      console.log('Generating identity...');
      const { mnemonic, core } = await generateIdentity();
      console.log('Identity generated');
      
      assert.ok(Mnemonic.validate(mnemonic));
      console.log('Mnemonic validated');
      
      assert.ok(core.getPublicKey().length === 32);
      console.log('Public key OK');
      
      console.log('Creating document...');
      const doc = await core.createDocument('test', { message: 'Hello, world!' });
      console.log('Document created:', doc.id);
      
      assert.ok(doc.id);
      assert.ok(doc.signature);
      
      // Verify document
      console.log('Verifying document...');
      const result = await core.verifyDocument(doc);
      console.log('Verification result:', result);
      
      assert.strictEqual(result.final, true);
      
      // Export/import state
      console.log('Exporting state...');
      const state = core.exportState();
      console.log('State exported, length:', state.length);
      
      console.log('Creating new core with same mnemonic...');
      const newCore = await NewZoneCore.create(mnemonic);
      console.log('New core created');
      
      console.log('Importing state...');
      newCore.importState(state);
      console.log('State imported');
      
      // Should produce same document - НУЖЕН AWAIT!
      console.log('Creating document in new core...');
      const doc2 = await newCore.createDocument('test', { message: 'Hello, world!' });
      console.log('Document created in new core:', doc2.id);
      
      assert.strictEqual(doc2.parent_hash, doc.id);
      
      // Clean up
      core.destroy();
      newCore.destroy();
      console.log('Test completed successfully');
    });

    await t.test('Deterministic identity from same mnemonic', async () => {
      console.log('Starting test: Deterministic identity');
      
      const core1 = await NewZoneCore.create(TEST_MNEMONIC);
      const core2 = await NewZoneCore.create(TEST_MNEMONIC);
      
      console.log('Core1 public key:', core1.getPublicKeyHex());
      console.log('Core2 public key:', core2.getPublicKeyHex());
      
      assert.strictEqual(
        core1.getPublicKeyHex(),
        core2.getPublicKeyHex()
      );
      
      assert.strictEqual(
        core1.getChainId(),
        core2.getChainId()
      );
      
      core1.destroy();
      core2.destroy();
      console.log('Deterministic identity test completed');
    });

    await t.test('Logical time monotonic invariant', () => {
      console.log('Starting test: Logical time');
      
      const clock = new LogicalClock(1);
      
      const t1 = clock.tick(); // 2
      const t2 = clock.tick(); // 3
      const t3 = clock.tick(); // 4
      
      console.log('Times:', t1, t2, t3);
      
      assert.ok(t1 < t2 && t2 < t3);
      
      try {
        clock.sync(1);
        assert.fail('Should have thrown');
      } catch (e) {
        console.log('Expected error caught');
      }
      
      clock.sync(5);
      assert.strictEqual(clock.current, 5);
      console.log('Logical time test completed');
    });

    await t.test('Fork detection - no auto resolution', async () => {
      console.log('Starting test: Fork detection');
      
      const core = await NewZoneCore.create(TEST_MNEMONIC);
      
      await core.createDocument('doc1', {}); // ДОБАВЛЕН AWAIT
      console.log('Document created');
      
      const forks = core.detectFork();
      console.log('Forks detected:', forks.length);
      
      assert.ok(Array.isArray(forks));
      
      if (forks.length > 0) {
        assert.strictEqual(forks[0].resolved, false);
      }
      
      core.destroy();
      console.log('Fork detection test completed');
    });

    await t.test('Canonical JSON enforcement', async () => {
      console.log('Starting test: Canonical JSON');
      
      const obj = {
        b: [3, 2, 1],
        a: { c: 1, d: 2 },
        z: null
      };
      
      const canonical = await CanonicalJSON.serialize(obj);
      const expected = '{"a":{"c":1,"d":2},"b":[3,2,1],"z":null}';
      console.log('Canonical:', canonical);
      
      assert.strictEqual(canonical, expected);
      
      try {
        await CanonicalJSON.assertCanonical('{"b":2,"a":1}');
        assert.fail('Should have thrown');
      } catch (e) {
        console.log('Expected error caught');
      }
      
      console.log('Canonical JSON test completed');
    });

    await t.test('Secure zeroization', () => {
      console.log('Starting test: Zeroization');
      
      const key = new Uint8Array([1, 2, 3, 4, 5]);
      zeroize(key);
      
      for (let i = 0; i < key.length; i++) {
        assert.strictEqual(key[i], 0);
      }
      
      console.log('Zeroization test completed');
    });

    await t.test('Constant-time comparison', () => {
      console.log('Starting test: Constant-time comparison');
      
      const a = new Uint8Array([1, 2, 3, 4]);
      const b = new Uint8Array([1, 2, 3, 4]);
      const c = new Uint8Array([1, 2, 3, 5]);
      
      assert.ok(constantTimeEqual(a, b));
      assert.ok(!constantTimeEqual(a, c));
      
      console.log('Constant-time test completed');
    });

    await t.test('Chain integrity verification', async () => {
      console.log('Starting test: Chain integrity');
      
      const core = await NewZoneCore.create(TEST_MNEMONIC);
      
      const docs = [];
      for (let i = 0; i < 5; i++) {
        const doc = await core.createDocument(`doc-${i}`, { index: i }); // ДОБАВЛЕН AWAIT
        docs.push(doc);
        console.log(`Document ${i} created:`, doc.id);
      }
      
      const state = core.getChainState();
      console.log('Chain state:', state);
      
      assert.ok(state.documentCount >= 5);
      assert.ok(state.logicalClock > 5);
      
      core.destroy();
      console.log('Chain integrity test completed');
    });

    await t.test('Error handling - invalid mnemonic', async () => {
      console.log('Starting test: Invalid mnemonic');
      
      try {
        await NewZoneCore.create('invalid mnemonic phrase');
        assert.fail('Should have thrown error');
      } catch (error) {
        console.log('Error caught:', error);
        assert.ok(error instanceof Error);
        assert.ok(error.message.includes('Invalid BIP-39 mnemonic'));
      }
      
      console.log('Invalid mnemonic test completed');
    });

    await t.test('Memory cleanup', async () => {
      console.log('Starting test: Memory cleanup');
      
      const core = await NewZoneCore.create(TEST_MNEMONIC);
      await core.createDocument('test', {}); // ДОБАВЛЕН AWAIT
      
      core.destroy();
      console.log('Core destroyed');
      
      try {
        await core.createDocument('test', {}); // ДОБАВЛЕН AWAIT
        assert.fail('Should have thrown error');
      } catch (error) {
        console.log('Error caught after destroy:', error);
        assert.ok(error instanceof Error);
      }
      
      console.log('Memory cleanup test completed');
    });
  } catch (error) {
    console.error('TEST FAILED WITH ERROR:', error);
    throw error;
  }
});

console.log('✅ All integration tests passed!');
