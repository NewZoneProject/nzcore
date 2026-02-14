/**
 * Document Builder
 * Fluent interface for creating canonical documents
 */

import { CanonicalJSON } from './canonical.js';
import { Document, DocumentMetadata, DocumentPayload, NewZoneCoreError } from '../types.js';
import { DOCUMENT_VERSION, CRYPTO_SUITE, ERROR_CODES } from '../constants.js';
import { IdentityDerivation } from '../identity/derivation.js';

export class DocumentBuilder {
  private doc: Partial<Document> = {};

  constructor() {
    this.doc.version = DOCUMENT_VERSION;
    this.doc.crypto_suite = CRYPTO_SUITE;
    this.doc.created_at = new Date().toISOString(); // informational only
  }

  /**
   * Set document type
   */
  setType(type: string): this {
    this.doc.type = type;
    return this;
  }

  /**
   * Set document version
   */
  setVersion(version: string): this {
    this.doc.version = version as "1.0";
    return this;
  }

  /**
   * Set document ID
   */
  setId(id: string): this {
    this.doc.id = id;
    return this;
  }

  /**
   * Set chain ID
   */
  setChainId(chainId: string): this {
    this.doc.chain_id = chainId;
    return this;
  }

  /**
   * Set parent hash
   */
  setParentHash(hash: string): this {
    this.doc.parent_hash = hash;
    return this;
  }

  /**
   * Set logical time
   */
  setLogicalTime(time: number): this {
    this.doc.logical_time = time;
    return this;
  }

  /**
   * Set crypto suite
   */
  setCryptoSuite(suite: typeof CRYPTO_SUITE): this {
    this.doc.crypto_suite = suite;
    return this;
  }

  /**
   * Set creation time (informational only)
   */
  setCreatedAt(time: string = new Date().toISOString()): this {
    this.doc.created_at = time;
    return this;
  }

  /**
   * Set document payload
   */
  setPayload(payload: DocumentPayload): this {
    this.doc.payload = payload;
    return this;
  }

  /**
   * Set signature
   */
  setSignature(signature: Uint8Array | string): this {
    this.doc.signature = typeof signature === 'string'
      ? signature
      : Buffer.from(signature).toString('hex');
    return this;
  }

  /**
   * Add custom field (preserved but not verified)
   */
  addField(key: string, value: unknown): this {
    if (key in this.doc) {
      throw new Error(`Field ${key} already exists`);
    }
    this.doc[key] = value;
    return this;
  }

  /**
   * Build document
   * Automatically canonicalizes
   */
  async build(): Promise<Document> {
    this.validate();
    
    // Generate ID if not set
    if (!this.doc.id && this.doc.chain_id && this.doc.parent_hash && this.doc.logical_time) {
      this.doc.id = IdentityDerivation.deriveDocumentId(
        this.doc.chain_id,
        this.doc.parent_hash,
        this.doc.logical_time
      );
    }
    
    // Ensure canonical form
    const canonicalized = await CanonicalJSON.canonicalize(this.doc);
    return canonicalized as Document;
  }

  /**
   * Validate required fields
   */
  private validate(): void {
    const required: (keyof DocumentMetadata)[] = [
      'type',
      'version',
      'chain_id',
      'parent_hash',
      'logical_time',
      'crypto_suite'
    ];

    for (const field of required) {
      if (!this.doc[field]) {
        throw new NewZoneCoreError(
          ERROR_CODES.VALIDATION_FAILED,
          `Missing required field: ${field}`
        );
      }
    }

    // Validate logical time
    if (typeof this.doc.logical_time !== 'number' || this.doc.logical_time < 1) {
      throw new NewZoneCoreError(
        ERROR_CODES.LOGICAL_TIME_VIOLATION,
        'Invalid logical time'
      );
    }

    // Validate crypto suite
    if (this.doc.crypto_suite !== CRYPTO_SUITE) {
      throw new NewZoneCoreError(
        ERROR_CODES.CRYPTO_SUITE_MISMATCH,
        `Invalid crypto suite: ${this.doc.crypto_suite}`
      );
    }
  }

  /**
   * Create builder from existing document
   */
  static fromDocument(doc: Document): DocumentBuilder {
    const builder = new DocumentBuilder();
    Object.assign(builder.doc, doc);
    return builder;
  }

  /**
   * Create genesis document
   */
  static genesis(chainId: string): DocumentBuilder {
    return new DocumentBuilder()
      .setType('genesis')
      .setChainId(chainId)
      .setParentHash('0'.repeat(64))
      .setLogicalTime(1);
  }
}
