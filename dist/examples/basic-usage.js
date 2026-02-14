/**
 * nzcore - Basic Usage Example
 *
 * This example demonstrates:
 * - Creating an identity
 * - Creating and signing documents
 * - Verifying documents
 * - Exporting/importing state
 * - Detecting forks
 * - Secure cleanup
 */
import { NewZoneCore, generateIdentity, Mnemonic } from '../src/index.js';
async function runBasicExample() {
    console.log('🚀 Starting nzcore basic example\n');
    // ============================================
    // 1. CREATE OR LOAD IDENTITY
    // ============================================
    console.log('📝 Step 1: Creating new identity...');
    // Generate a random identity (24-word BIP-39 mnemonic)
    const { mnemonic, core } = await generateIdentity();
    console.log('   ✅ Identity created');
    console.log('   🔑 Mnemonic (store securely!):', Mnemonic.mask(mnemonic));
    console.log('   🔓 Public key:', core.getPublicKeyHex());
    console.log('   🔗 Chain ID:', core.getChainId());
    console.log();
    // ============================================
    // 2. CREATE DOCUMENTS
    // ============================================
    console.log('📝 Step 2: Creating documents...');
    // Create first document - user profile
    const profileDoc = await core.createDocument('profile', {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        created: new Date().toISOString()
    });
    console.log('   ✅ Profile document created');
    console.log('      ID:', profileDoc.id);
    console.log('      Type:', profileDoc.type);
    console.log('      Time:', profileDoc.logical_time);
    console.log('      Signature:', profileDoc.signature?.substring(0, 20) + '...');
    console.log();
    // Create second document - settings
    const settingsDoc = await core.createDocument('settings', {
        theme: 'dark',
        notifications: true,
        language: 'en'
    });
    console.log('   ✅ Settings document created');
    console.log('      ID:', settingsDoc.id);
    console.log('      Type:', settingsDoc.type);
    console.log('      Time:', settingsDoc.logical_time);
    console.log('      Parent hash:', settingsDoc.parent_hash.substring(0, 20) + '...');
    console.log();
    // ============================================
    // 3. VERIFY DOCUMENTS
    // ============================================
    console.log('🔍 Step 3: Verifying documents...');
    // Verify profile document
    const profileResult = await core.verifyDocument(profileDoc);
    console.log('   Profile document verification:');
    printVerificationResult(profileResult);
    console.log();
    // Verify settings document
    const settingsResult = await core.verifyDocument(settingsDoc);
    console.log('   Settings document verification:');
    printVerificationResult(settingsResult);
    console.log();
    // ============================================
    // 4. CHECK CHAIN STATE
    // ============================================
    console.log('📊 Step 4: Checking chain state...');
    const chainState = core.getChainState();
    console.log('   Chain state:');
    console.log('      Documents:', chainState.documentCount);
    console.log('      Last hash:', chainState.lastHash.substring(0, 20) + '...');
    console.log('      Logical clock:', chainState.logicalClock);
    console.log('      Forks detected:', chainState.forks.length);
    console.log();
    // ============================================
    // 5. DETECT FORKS
    // ============================================
    console.log('🔀 Step 5: Checking for forks...');
    const forks = core.detectFork();
    if (forks.length === 0) {
        console.log('   ✅ No forks detected - chain is consistent');
    }
    else {
        console.log('   ⚠️ Forks detected:', forks.length);
        forks.forEach((fork, i) => {
            console.log(`      Fork ${i + 1}: parent ${fork.parentHash.substring(0, 20)}...`);
        });
    }
    console.log();
    // ============================================
    // 6. EXPORT AND IMPORT STATE
    // ============================================
    console.log('💾 Step 6: Exporting and importing state...');
    // Export current state
    const exportedState = core.exportState();
    console.log('   ✅ State exported, size:', exportedState.length, 'bytes');
    // Create new instance with same mnemonic
    console.log('   Creating new instance...');
    const newCore = await NewZoneCore.create(mnemonic);
    // Import state
    console.log('   Importing state...');
    newCore.importState(exportedState);
    // Verify the new instance has the same state
    const newChainState = newCore.getChainState();
    console.log('   New chain state:');
    console.log('      Documents:', newChainState.documentCount);
    console.log('      Last hash:', newChainState.lastHash.substring(0, 20) + '...');
    console.log('      Logical clock:', newChainState.logicalClock);
    console.log();
    // ============================================
    // 7. CREATE ANOTHER DOCUMENT
    // ============================================
    console.log('📝 Step 7: Creating document in new instance...');
    const newDoc = await newCore.createDocument('activity', {
        action: 'login',
        timestamp: Date.now()
    });
    console.log('   ✅ Activity document created');
    console.log('      ID:', newDoc.id);
    console.log('      Type:', newDoc.type);
    console.log('      Parent hash matches:', newDoc.parent_hash === settingsDoc.id);
    console.log();
    // ============================================
    // 8. VERIFY DOCUMENT IN NEW INSTANCE
    // ============================================
    console.log('🔍 Step 8: Verifying document in new instance...');
    const newDocResult = await newCore.verifyDocument(newDoc);
    console.log('   Activity document verification:');
    printVerificationResult(newDocResult);
    console.log();
    // ============================================
    // 9. CLEANUP
    // ============================================
    console.log('🧹 Step 9: Cleaning up...');
    core.destroy();
    newCore.destroy();
    console.log('   ✅ Sensitive data zeroized');
    console.log();
    console.log('✨ Example completed successfully!');
}
function printVerificationResult(result) {
    console.log(`      Structural: ${result.structural_valid ? '✅' : '❌'}`);
    console.log(`      Cryptographic: ${result.cryptographic_valid ? '✅' : '❌'}`);
    console.log(`      Policy: ${result.policy_valid ? '✅' : '❌'}`);
    console.log(`      Final: ${result.final ? '✅' : '❌'}`);
    if (result.errors?.length) {
        console.log('      Errors:', result.errors);
    }
    if (result.warnings?.length) {
        console.log('      Warnings:', result.warnings);
    }
}
// Run the example
runBasicExample().catch(error => {
    console.error('❌ Example failed:', error);
    process.exit(1);
});
