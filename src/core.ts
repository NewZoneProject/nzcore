/**
 * NewZoneCore - Main Implementation
 * Personal autonomous Root of Trust
 */

import { IdentityDerivation } from './identity/derivation.js';
import { Mnemonic } from './identity/mnemonic.js';
import { DocumentBuilder } from './document/builder.js';
import { DocumentValidator } from './document/validator.js';
import { ChainStateManager } from './chain/state.js';
import { ForkDetector } from './chain/fork.js';
import { LogicalClock } from './identity/logical-time.js';
import { Ed25519 } from './crypto/ed25519.js';
import { zeroize } from './utils/zeroize.js';
import { toHex } from './utils/encoding.js';
import { CanonicalJSON } from './document/canonical.js';

import {
  Document,
  DocumentPayload,
  ValidationResult,
  ChainState,
  ForkInfo,
  NewZoneCoreOptions,
  NewZoneCoreInstance,
  NewZoneCoreError
} from './types.js';
import { ERROR_CODES } from './constants.js';

export class NewZoneCore implements NewZoneCoreInstance {
  #identity: {
    publicKey: Uint8Array;
    privateKey: Uint8Array;
    chainId: string;
  } | null = null;
  
  #chainState: ChainStateManager | null = null;
  #clock: LogicalClock | null = null;
  #validator: DocumentValidator | null = null;
  #mnemonic?: string;
  #options: NewZoneCoreOptions;

  constructor(mnemonic: string, options: NewZoneCoreOptions = {}) {
    // Validate mnemonic
    if (!Mnemonic.validate(mnemonic)) {
      throw new NewZoneCoreError(
        ERROR_CODES.INVALID_MNEMONIC,
        'Invalid BIP-39 mnemonic'
      );
    }

    this.#mnemonic = mnemonic;
    this.#options = options;
  }

  /**
   * Статический фабричный метод для асинхронного создания
   */
  static async create(mnemonic: string, options: NewZoneCoreOptions = {}): Promise<NewZoneCore> {
    const instance = new NewZoneCore(mnemonic, options);
    await instance.initialize();
    return instance;
  }

  /**
   * Асинхронная инициализация
   */
  private async initialize(): Promise<void> {
    try {
      // Derive identity (deterministic from mnemonic ONLY)
      const derivation = await IdentityDerivation.fromMnemonic(this.#mnemonic!);
      this.#identity = derivation.rootKey;
      
      // Initialize logical time
      this.#clock = new LogicalClock(this.#options.initialTime || 1);
      
      // Initialize chain state
      const chainId = this.#options.chainId || this.#identity.chainId;
      this.#chainState = new ChainStateManager(chainId, this.#clock.current);
      
      // Initialize validator
      this.#validator = new DocumentValidator();
    } catch (e) {
      this.destroy();
      throw e;
    }
  }

  /**
   * Create a new document
   * Core API: deterministic, no wall-clock dependencies
   */
async createDocument(type: string, payload: DocumentPayload = {}): Promise<Document> {
  console.log('=== createDocument start ===');
  console.log('Type:', type);
  console.log('Payload:', payload);
  
  this.assertInitialized();
  console.log('Instance initialized OK');

  const logicalTime = this.#clock!.tick();
  const parentHash = this.#chainState!.getLastHash();
  console.log('Logical time:', logicalTime);
  console.log('Parent hash:', parentHash);

  const builder = new DocumentBuilder()
    .setType(type)
    .setChainId(this.#chainState!.chainId)
    .setParentHash(parentHash)
    .setLogicalTime(logicalTime)
    .setCryptoSuite('nzcore-crypto-01')
    .setPayload(payload);

  // Generate deterministic ID
  const id = IdentityDerivation.deriveDocumentId(
    this.#chainState!.chainId,
    parentHash,
    logicalTime
  );
  builder.setId(id);
  console.log('Document ID:', id);

  // Build document (canonical)
  console.log('Building document...');
  const doc = await builder.build();
  console.log('Document built, fields:', Object.keys(doc));

  // Sign document
  console.log('Preparing for signing...');
  const docWithoutSig = { ...doc };
  delete (docWithoutSig as { signature?: unknown }).signature;
  
  console.log('Serializing to canonical JSON...');
  const canonical = await CanonicalJSON.serialize(docWithoutSig);
  console.log('Canonical JSON:', canonical.substring(0, 100) + '...');
  
  console.log('Signing with private key...');
  console.log('Private key length:', this.#identity!.privateKey.length);
  
  const signatureBytes = await Ed25519.sign(
    new TextEncoder().encode(canonical),
    this.#identity!.privateKey
  );
  
  console.log('Signature bytes length:', signatureBytes.length);
  console.log('Signature bytes (first 10):', Array.from(signatureBytes.slice(0, 10)).map(b => b.toString(16)).join(''));
  
  if (!signatureBytes || signatureBytes.length === 0) {
    throw new NewZoneCoreError(
      ERROR_CODES.INVALID_SIGNATURE,
      'Failed to generate signature - empty result'
    );
  }
  
  doc.signature = toHex(signatureBytes);
  console.log('Signature hex length:', doc.signature.length);
  console.log('Signature hex (first 20):', doc.signature.substring(0, 20));
  console.log('=== createDocument end ===');

  // Commit to chain
  this.#chainState!.append(doc);

  return doc;
}

  /**
   * Verify document
   * Core API: returns validation result with all layers
   */
  async verifyDocument(document: Document): Promise<ValidationResult> {
    this.assertInitialized();

    return this.#validator!.validate(document, {
      currentTime: this.#clock!.current,
      trustedKeys: [this.#identity!.publicKey]
    });
  }

  /**
   * Get current chain state
   * Core API: deterministic snapshot
   */
  getChainState(): ChainState {
    this.assertInitialized();
    return this.#chainState!.getState();
  }

  /**
   * Detect forks
   * Core API: MUST NOT attempt automatic resolution
   */
  detectFork(): ForkInfo[] {
    this.assertInitialized();
    
    const forks = ForkDetector.scan(this.#chainState!.documents);
    
    // Mark detected at current logical time
    return forks.map(fork => ({
      ...fork,
      detectedAt: this.#clock!.current,
      resolved: false
    }));
  }

  /**
   * Export identity (for backup)
   * Returns mnemonic only - no other state
   */
  exportIdentity(): { mnemonic: string; chainId: string } {
    this.assertInitialized();
    
    if (!this.#mnemonic) {
      throw new Error('Identity not available');
    }
    
    return {
      mnemonic: this.#mnemonic,
      chainId: this.#chainState!.chainId
    };
  }

  /**
   * Export chain state (for persistence)
   */
  exportState(): Uint8Array {
    this.assertInitialized();
    return this.#chainState!.export();
  }

  /**
   * Import chain state
   */
  importState(state: Uint8Array): void {
    this.assertInitialized();
    
    const imported = ChainStateManager.import(
      state,
      this.#chainState!.chainId
    );
    
    this.#chainState = imported;
    this.#clock = imported.clock;
  }

  /**
   * Get public key
   */
  getPublicKey(): Uint8Array {
    this.assertInitialized();
    return this.#identity!.publicKey;
  }

  /**
   * Get public key as hex
   */
  getPublicKeyHex(): string {
    return toHex(this.getPublicKey());
  }

  /**
   * Get chain ID
   */
  getChainId(): string {
    this.assertInitialized();
    return this.#chainState!.chainId;
  }

  /**
   * Check if initialized
   */
  private assertInitialized(): void {
    if (!this.#identity || !this.#chainState || !this.#clock || !this.#validator) {
      throw new Error('NewZoneCore instance not properly initialized');
    }
  }

  /**
   * Securely destroy instance
   * Zeroizes private key material
   */
  destroy(): void {
    if (this.#identity) {
      zeroize(this.#identity.privateKey);
      this.#identity = null;
    }
    
    this.#chainState = null;
    this.#clock = null;
    this.#validator = null;
    this.#mnemonic = undefined;
  }
}
