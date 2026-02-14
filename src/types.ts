/**
 * NewZoneCore - Core Type Definitions
 */

import { CRYPTO_SUITE, DOCUMENT_VERSION, ERROR_CODES } from './constants.js';

// ============ Identity Types ============

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

// ============ Document Types ============

export interface DocumentMetadata {
  type: string;
  version: typeof DOCUMENT_VERSION;
  id: string;
  chain_id: string;
  parent_hash: string;
  logical_time: number;
  crypto_suite: typeof CRYPTO_SUITE;
  created_at: string; // ISO8601, informational only
}

export interface DocumentPayload {
  [key: string]: unknown;
}

export interface Document extends DocumentMetadata {
  payload?: DocumentPayload;
  signature?: string;
  [key: string]: unknown; // Unknown fields preserved
}

export interface CanonicalDocument extends Omit<Document, 'signature'> {
  signature?: never;
}

// ============ Validation Types ============

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

// ============ Chain Types ============

export interface ChainState {
  chainId: string;
  lastHash: string;
  logicalClock: number;
  documentCount: number;
  forks: ForkInfo[];
}

export interface ForkInfo {
  parentHash: string;
  documents: string[]; // Document IDs
  detectedAt: number;  // Logical time
  resolved: boolean;
  resolution?: string; // Merge document ID
}

export interface LogicalClockState {
  logical_clock: number;
  version: string;
}

// ============ Crypto Types ============

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

// ============ Error Types ============

export class NewZoneCoreError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(code: string, message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'NewZoneCoreError';
    this.code = code;
    this.context = context;
    Object.setPrototypeOf(this, NewZoneCoreError.prototype);
  }
}

// ============ API Types ============

export interface NewZoneCoreOptions {
  chainId?: string;
  initialTime?: number;
  policyEngine?: PolicyEngine;
}

export interface NewZoneCoreInstance {
  createDocument(type: string, payload?: DocumentPayload): Promise<Document>; // ИЗМЕНЕНО: теперь возвращает Promise
  verifyDocument(document: Document): Promise<ValidationResult>;
  getChainState(): ChainState;
  detectFork(): ForkInfo[];
  destroy(): void;
}

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
