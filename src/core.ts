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
import { RateLimiter } from './utils/rate-limiter.js';

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
  #rateLimiter: RateLimiter | null = null;
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

      // Initialize rate limiter if enabled
      if (this.#options.rateLimit?.enabled) {
        const config = this.#options.rateLimit;
        this.#rateLimiter = new RateLimiter({
          limit: config.limit,
          windowMs: config.windowMs
        });
      }
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
    this.assertInitialized();

    const logicalTime = this.#clock!.tick();
    const parentHash = this.#chainState!.getLastHash();

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

    // Build document (canonical)
    const doc = await builder.build();

    // Sign document
    const docWithoutSig = { ...doc };
    delete (docWithoutSig as { signature?: unknown }).signature;

    const canonical = CanonicalJSON.serialize(docWithoutSig);

    const signatureBytes = await Ed25519.sign(
      new TextEncoder().encode(canonical),
      this.#identity!.privateKey
    );

    if (!signatureBytes || signatureBytes.length !== 64) {
      throw new NewZoneCoreError(
        ERROR_CODES.INVALID_SIGNATURE,
        'Failed to generate signature - empty result'
      );
    }

    doc.signature = toHex(signatureBytes);

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

    // Check rate limit if enabled
    this.#rateLimiter?.check();

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
   * Get rate limiter state (if enabled)
   */
  getRateLimitState(): {
    enabled: boolean;
    limit?: number;
    windowMs?: number;
    remaining?: number;
    resetAt?: number;
  } | null {
    if (!this.#rateLimiter) {
      return null;
    }

    const state = this.#rateLimiter.getState();
    return {
      enabled: true,
      limit: state.limit,
      windowMs: state.windowMs,
      remaining: state.remaining,
      resetAt: state.resetAt
    };
  }

  /**
   * Reset rate limiter
   */
  resetRateLimit(): void {
    this.#rateLimiter?.reset();
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
