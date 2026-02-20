/**
 * Chain State Management
 * Single source of truth for document chain
 */

import { Blake2b } from '../crypto/blake2b.js';
import { Document, ChainState, ForkInfo, NewZoneCoreError } from '../types.js';
import { ERROR_CODES } from '../constants.js';
import { LogicalClock } from '../identity/logical-time.js';

export class ChainStateManager {
  readonly chainId: string;
  #documents: Map<string, Document> = new Map();
  #lastHash: string = '0'.repeat(64);
  #clock: LogicalClock;
  #detectedForks: Map<string, ForkInfo> = new Map();

  constructor(chainId: string, initialTime: number = 1) {
    this.chainId = chainId;
    this.#clock = new LogicalClock(initialTime);
  }

  /**
   * Append document to chain
   */
  append(document: Document): void {
    // Verify chain ID
    if (document.chain_id !== this.chainId) {
      throw new NewZoneCoreError(
        ERROR_CODES.VALIDATION_FAILED,
        'Document chain ID mismatch',
        { expected: this.chainId, got: document.chain_id }
      );
    }

    // Verify parent hash
    if (document.parent_hash !== this.#lastHash) {
      // Check if this creates a fork
      this.#detectFork(document);
    }

    // Store document
    this.#documents.set(document.id, document);
    
    // Update last hash
    this.#lastHash = document.id;
    
    // Advance logical time
    this.#clock.tick();
  }

  /**
   * Detect fork condition
   */
  #detectFork(document: Document): void {
    // Find other documents with same parent
    const siblings = Array.from(this.#documents.values())
      .filter(d => d.parent_hash === document.parent_hash);
    
    if (siblings.length > 0) {
      const forkInfo: ForkInfo = {
        parentHash: document.parent_hash,
        documents: [...siblings.map(d => d.id), document.id],
        detectedAt: this.#clock.current,
        resolved: false
      };
      
      this.#detectedForks.set(document.parent_hash, forkInfo);
    }
  }

  /**
   * Get document by ID
   */
  getDocument(id: string): Document | undefined {
    return this.#documents.get(id);
  }

  /**
   * Get last document hash
   */
  getLastHash(): string {
    return this.#lastHash;
  }

  /**
   * Get logical clock
   */
  get clock(): LogicalClock {
    return this.#clock;
  }

  /**
   * Get document count
   */
  get length(): number {
    return this.#documents.size;
  }

  /**
   * Get all documents
   */
  get documents(): Document[] {
    return Array.from(this.#documents.values());
  }

  /**
   * Get detected forks
   */
  get forks(): ForkInfo[] {
    return Array.from(this.#detectedForks.values());
  }

  /**
   * Get chain state
   */
  getState(): ChainState {
    return {
      chainId: this.chainId,
      lastHash: this.#lastHash,
      logicalClock: this.#clock.current,
      documentCount: this.#documents.size,
      forks: this.forks
    };
  }

  /**
   * Verify chain integrity
   */
  verifyIntegrity(): boolean {
    let prevHash = '0'.repeat(64);

    // Sort by logical time
    const sorted = Array.from(this.#documents.values())
      .sort((a, b) => a.logical_time - b.logical_time);

    for (const doc of sorted) {
      // Check parent chain
      if (doc.parent_hash !== prevHash) {
        return false;
      }

      // Verify hash chain using unified document hash computation
      const computedHash = Blake2b.computeDocumentHash(
        doc.chain_id,
        doc.parent_hash,
        doc.logical_time,
        doc.payload
      );
      if (computedHash !== doc.id) {
        return false;
      }

      prevHash = doc.id;
    }

    return true;
  }

  /**
   * Reset chain state
   */
  reset(): void {
    this.#documents.clear();
    this.#lastHash = '0'.repeat(64);
    this.#detectedForks.clear();
  }

  /**
   * Export state for persistence
   */
  export(): Uint8Array {
    const state = {
      chainId: this.chainId,
      lastHash: this.#lastHash,
      clock: this.#clock.toJSON(),
      documents: Array.from(this.#documents.entries()),
      forks: Array.from(this.#detectedForks.entries())
    };
    
    return new TextEncoder().encode(JSON.stringify(state));
  }

  /**
   * Import state from persistence
   */
  static import(data: Uint8Array, chainId: string): ChainStateManager {
    const state = JSON.parse(new TextDecoder().decode(data));
    
    if (state.chainId !== chainId) {
      throw new NewZoneCoreError(
        ERROR_CODES.VALIDATION_FAILED,
        'Chain ID mismatch during import'
      );
    }
    
    const manager = new ChainStateManager(chainId, state.clock.logical_clock);
    manager.#lastHash = state.lastHash;
    
    for (const [id, doc] of state.documents) {
      manager.#documents.set(id, doc);
    }
    
    for (const [hash, fork] of state.forks) {
      manager.#detectedForks.set(hash, fork);
    }
    
    return manager;
  }
}
