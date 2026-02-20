/**
 * NewZoneCore - Core Type Definitions
 */
import { CRYPTO_SUITE, DOCUMENT_VERSION, ERROR_CODES } from './constants.js';
export interface IdentityKeyPair {
    publicKey: Uint8Array;
    privateKey: Uint8Array;
    chainId: string;
}
export interface IdentityDerivationResult {
    seed: Uint8Array;
    rootKey: IdentityKeyPair;
    mnemonic?: string;
}
export interface DocumentMetadata {
    type: string;
    version: typeof DOCUMENT_VERSION;
    id: string;
    chain_id: string;
    parent_hash: string;
    logical_time: number;
    crypto_suite: typeof CRYPTO_SUITE;
    created_at: string;
}
export interface DocumentPayload {
    [key: string]: unknown;
}
export interface Document extends DocumentMetadata {
    payload?: DocumentPayload;
    signature?: string;
    [key: string]: unknown;
}
export interface CanonicalDocument extends Omit<Document, 'signature'> {
    signature?: never;
}
export interface ValidationResult {
    structural_valid: boolean;
    cryptographic_valid: boolean;
    policy_valid: boolean;
    final: boolean;
    errors?: string[];
    warnings?: string[];
}
export interface ValidationContext {
    currentTime: number;
    trustedKeys: Uint8Array[];
    policyEngine?: PolicyEngine;
}
export interface PolicyEngine {
    evaluate(document: Document, context: ValidationContext): boolean;
}
export interface ChainState {
    chainId: string;
    lastHash: string;
    logicalClock: number;
    documentCount: number;
    forks: ForkInfo[];
}
export interface ForkInfo {
    parentHash: string;
    documents: string[];
    detectedAt: number;
    resolved: boolean;
    resolution?: string;
}
export interface LogicalClockState {
    logical_clock: number;
    version: string;
}
export type HashFunction = (data: Uint8Array) => Uint8Array;
export type SignFunction = (data: Uint8Array, privateKey: Uint8Array) => Promise<Uint8Array>;
export type VerifyFunction = (signature: Uint8Array, data: Uint8Array, publicKey: Uint8Array) => Promise<boolean>;
export interface CryptoSuite {
    id: typeof CRYPTO_SUITE;
    hash: HashFunction;
    sign: SignFunction;
    verify: VerifyFunction;
    deriveKey: (seed: Uint8Array, salt: Uint8Array) => Uint8Array;
}
export declare class NewZoneCoreError extends Error {
    readonly code: string;
    readonly context?: Record<string, unknown>;
    constructor(code: string, message: string, context?: Record<string, unknown>);
}
export interface RateLimitConfig {
    enabled: boolean;
    limit: number;
    windowMs: number;
}
export interface NewZoneCoreOptions {
    chainId?: string;
    initialTime?: number;
    policyEngine?: PolicyEngine;
    rateLimit?: RateLimitConfig;
}
export interface NewZoneCoreInstance {
    createDocument(type: string, payload?: DocumentPayload): Promise<Document>;
    verifyDocument(document: Document): Promise<ValidationResult>;
    getChainState(): ChainState;
    detectFork(): ForkInfo[];
    destroy(): void;
}
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
//# sourceMappingURL=types.d.ts.map