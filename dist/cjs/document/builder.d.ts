/**
 * Document Builder
 * Fluent interface for creating canonical documents
 */
import { Document, DocumentPayload } from '../types.js';
import { CRYPTO_SUITE } from '../constants.js';
export declare class DocumentBuilder {
    private doc;
    constructor();
    /**
     * Set document type
     */
    setType(type: string): this;
    /**
     * Set document version
     */
    setVersion(version: string): this;
    /**
     * Set document ID
     */
    setId(id: string): this;
    /**
     * Set chain ID
     */
    setChainId(chainId: string): this;
    /**
     * Set parent hash
     */
    setParentHash(hash: string): this;
    /**
     * Set logical time
     */
    setLogicalTime(time: number): this;
    /**
     * Set crypto suite
     */
    setCryptoSuite(suite: typeof CRYPTO_SUITE): this;
    /**
     * Set creation time (informational only)
     */
    setCreatedAt(time?: string): this;
    /**
     * Set document payload
     */
    setPayload(payload: DocumentPayload): this;
    /**
     * Set signature
     */
    setSignature(signature: Uint8Array | string): this;
    /**
     * Add custom field (preserved but not verified)
     */
    addField(key: string, value: unknown): this;
    /**
     * Build document
     * Automatically canonicalizes
     */
    build(): Promise<Document>;
    /**
     * Validate required fields
     */
    private validate;
    /**
     * Create builder from existing document
     */
    static fromDocument(doc: Document): DocumentBuilder;
    /**
     * Create genesis document
     */
    static genesis(chainId: string): DocumentBuilder;
}
//# sourceMappingURL=builder.d.ts.map