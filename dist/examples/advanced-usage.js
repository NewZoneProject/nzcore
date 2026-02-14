/**
 * nzcore - Advanced Usage Example
 *
 * This example demonstrates:
 * - Working with existing mnemonics
 * - Handling forks manually
 * - Custom document types and validation
 * - Error handling patterns
 */
import { NewZoneCore, Mnemonic, DocumentBuilder, NewZoneCoreError } from '../src/index.js';
const TEST_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
async function runAdvancedExample() {
    console.log('🚀 Starting nzcore advanced example\n');
    // ============================================
    // 1. LOAD EXISTING IDENTITY
    // ============================================
    console.log('📝 Step 1: Loading existing identity...');
    const core = await NewZoneCore.create(TEST_MNEMONIC);
    console.log('   ✅ Identity loaded');
    console.log('   🔓 Public key:', core.getPublicKeyHex());
    console.log('   🔗 Chain ID:', core.getChainId());
    console.log();
    // ============================================
    // 2. CREATE DIFFERENT DOCUMENT TYPES
    // ============================================
    console.log('📝 Step 2: Creating various document types...');
    // Genesis document (first in chain)
    const genesisDoc = await core.createDocument('genesis', {
        version: '1.0.0',
        created: new Date().toISOString()
    });
    console.log('   ✅ Genesis document created');
    // Configuration document
    const configDoc = await core.createDocument('config', {
        settings: {
            maxDocuments: 1000,
            requireSignatures: true
        }
    });
    console.log('   ✅ Config document created');
    // Data document
    const dataDoc = await core.createDocument('data', {
        records: [
            { id: 1, value: 'first' },
            { id: 2, value: 'second' }
        ]
    });
    console.log('   ✅ Data document created');
    console.log();
    // ============================================
    // 3. BUILD DOCUMENT MANUALLY
    // ============================================
    console.log('🔨 Step 3: Building document manually...');
    const customDoc = await new DocumentBuilder()
        .setType('custom')
        .setChainId(core.getChainId())
        .setParentHash(dataDoc.id)
        .setLogicalTime(dataDoc.logical_time + 1)
        .setCryptoSuite('nzcore-crypto-01')
        .setPayload({ custom: 'data' })
        .addField('metadata', { author: 'example' })
        .build();
    console.log('   ✅ Custom document built');
    console.log('      ID:', customDoc.id);
    console.log('      Fields:', Object.keys(customDoc).join(', '));
    console.log();
    // ============================================
    // 4. ERROR HANDLING PATTERNS
    // ============================================
    console.log('⚠️ Step 4: Error handling patterns...');
    // Try to create document with invalid mnemonic
    try {
        await NewZoneCore.create('invalid mnemonic');
    }
    catch (error) {
        if (error instanceof NewZoneCoreError) {
            console.log('   ✅ Caught expected error:');
            console.log('      Code:', error.code);
            console.log('      Message:', error.message);
        }
    }
    // Try to verify tampered document
    const tamperedDoc = { ...genesisDoc, payload: { hacked: true } };
    try {
        await core.verifyDocument(tamperedDoc);
    }
    catch (error) {
        console.log('   ✅ Tampered document rejected');
    }
    console.log();
    // ============================================
    // 5. FORK SIMULATION AND DETECTION
    // ============================================
    console.log('🔀 Step 5: Simulating and detecting forks...');
    // Create first branch
    const branch1 = await core.createDocument('branch', { name: 'branch-1' });
    console.log('   ✅ Branch 1 created:', branch1.id.substring(0, 20) + '...');
    // In real scenario, this would be another instance
    // For demo, we'll create a fork manually by manipulating state
    const forkInfo = {
        parentHash: branch1.parent_hash,
        documents: [branch1.id, 'fake-doc-id'],
        detectedAt: branch1.logical_time + 1,
        resolved: false
    };
    const forks = core.detectFork();
    if (forks.length === 0) {
        console.log('   ✅ No forks detected (normal operation)');
    }
    console.log();
    // ============================================
    // 6. BATCH OPERATIONS
    // ============================================
    console.log('📦 Step 6: Batch operations...');
    const batchDocs = [];
    for (let i = 0; i < 3; i++) {
        const doc = await core.createDocument('batch', { index: i });
        batchDocs.push(doc);
        console.log(`   ✅ Batch document ${i} created:`, doc.id.substring(0, 20) + '...');
    }
    console.log();
    // ============================================
    // 7. VERIFY ALL DOCUMENTS
    // ============================================
    console.log('🔍 Step 7: Verifying all documents...');
    const allDocs = [
        genesisDoc,
        configDoc,
        dataDoc,
        ...batchDocs
    ];
    for (const doc of allDocs) {
        const result = await core.verifyDocument(doc);
        console.log(`   Document ${doc.type}: ${result.final ? '✅' : '❌'}`);
    }
    console.log();
    // ============================================
    // 8. EXPORT IDENTITY AND STATE
    // ============================================
    console.log('💾 Step 8: Exporting identity and state...');
    const identity = core.exportIdentity();
    console.log('   ✅ Identity exported');
    console.log('      Chain ID:', identity.chainId);
    console.log('      Mnemonic (masked):', Mnemonic.mask(identity.mnemonic));
    const state = core.exportState();
    console.log('   ✅ State exported, size:', state.length, 'bytes');
    console.log();
    // ============================================
    // 9. FINAL STATE
    // ============================================
    console.log('📊 Step 9: Final chain state...');
    const finalState = core.getChainState();
    console.log('   Total documents:', finalState.documentCount);
    console.log('   Logical clock:', finalState.logicalClock);
    console.log('   Forks detected:', finalState.forks.length);
    console.log();
    // ============================================
    // 10. CLEANUP
    // ============================================
    console.log('🧹 Step 10: Cleaning up...');
    core.destroy();
    console.log('   ✅ Instance destroyed securely');
    console.log();
    console.log('✨ Advanced example completed successfully!');
}
// Run the example
runAdvancedExample().catch(error => {
    console.error('❌ Advanced example failed:', error);
    process.exit(1);
});
