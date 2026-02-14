/**
 * Document Builder
 * Fluent interface for creating canonical documents
 */
import { CanonicalJSON } from './canonical.js';
import { NewZoneCoreError } from '../types.js';
import { DOCUMENT_VERSION, CRYPTO_SUITE, ERROR_CODES } from '../constants.js';
import { IdentityDerivation } from '../identity/derivation.js';
export class DocumentBuilder {
    constructor() {
        this.doc = {};
        this.doc.version = DOCUMENT_VERSION;
        this.doc.crypto_suite = CRYPTO_SUITE;
        this.doc.created_at = new Date().toISOString(); // informational only
    }
    /**
     * Set document type
     */
    setType(type) {
        this.doc.type = type;
        return this;
    }
    /**
     * Set document version
     */
    setVersion(version) {
        this.doc.version = version;
        return this;
    }
    /**
     * Set document ID
     */
    setId(id) {
        this.doc.id = id;
        return this;
    }
    /**
     * Set chain ID
     */
    setChainId(chainId) {
        this.doc.chain_id = chainId;
        return this;
    }
    /**
     * Set parent hash
     */
    setParentHash(hash) {
        this.doc.parent_hash = hash;
        return this;
    }
    /**
     * Set logical time
     */
    setLogicalTime(time) {
        this.doc.logical_time = time;
        return this;
    }
    /**
     * Set crypto suite
     */
    setCryptoSuite(suite) {
        this.doc.crypto_suite = suite;
        return this;
    }
    /**
     * Set creation time (informational only)
     */
    setCreatedAt(time = new Date().toISOString()) {
        this.doc.created_at = time;
        return this;
    }
    /**
     * Set document payload
     */
    setPayload(payload) {
        this.doc.payload = payload;
        return this;
    }
    /**
     * Set signature
     */
    setSignature(signature) {
        this.doc.signature = typeof signature === 'string'
            ? signature
            : Buffer.from(signature).toString('hex');
        return this;
    }
    /**
     * Add custom field (preserved but not verified)
     */
    addField(key, value) {
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
    async build() {
        this.validate();
        // Generate ID if not set
        if (!this.doc.id && this.doc.chain_id && this.doc.parent_hash && this.doc.logical_time) {
            this.doc.id = IdentityDerivation.deriveDocumentId(this.doc.chain_id, this.doc.parent_hash, this.doc.logical_time);
        }
        // Ensure canonical form
        const canonicalized = await CanonicalJSON.canonicalize(this.doc);
        return canonicalized;
    }
    /**
     * Validate required fields
     */
    validate() {
        const required = [
            'type',
            'version',
            'chain_id',
            'parent_hash',
            'logical_time',
            'crypto_suite'
        ];
        for (const field of required) {
            if (!this.doc[field]) {
                throw new NewZoneCoreError(ERROR_CODES.VALIDATION_FAILED, `Missing required field: ${field}`);
            }
        }
        // Validate logical time
        if (typeof this.doc.logical_time !== 'number' || this.doc.logical_time < 1) {
            throw new NewZoneCoreError(ERROR_CODES.LOGICAL_TIME_VIOLATION, 'Invalid logical time');
        }
        // Validate crypto suite
        if (this.doc.crypto_suite !== CRYPTO_SUITE) {
            throw new NewZoneCoreError(ERROR_CODES.CRYPTO_SUITE_MISMATCH, `Invalid crypto suite: ${this.doc.crypto_suite}`);
        }
    }
    /**
     * Create builder from existing document
     */
    static fromDocument(doc) {
        const builder = new DocumentBuilder();
        Object.assign(builder.doc, doc);
        return builder;
    }
    /**
     * Create genesis document
     */
    static genesis(chainId) {
        return new DocumentBuilder()
            .setType('genesis')
            .setChainId(chainId)
            .setParentHash('0'.repeat(64))
            .setLogicalTime(1);
    }
}
