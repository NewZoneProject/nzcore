# API Reference

Complete API reference for **nzcore** — Personal autonomous Root of Trust.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Installation](#-installation)
- [Main Entry Point](#-main-entry-point)
- [Core API](#-core-api)
  - [NewZoneCore Class](#-newzonecore-class)
  - [Factory Functions](#-factory-functions)
- [Identity Module](#-identity-module)
  - [Mnemonic](#-mnemonic)
  - [IdentityDerivation](#-identityderivation)
- [Document Module](#-document-module)
  - [DocumentBuilder](#-documentbuilder)
  - [DocumentValidator](#-documentvalidator)
  - [CanonicalJSON](#-canonicaljson)
- [Chain Module](#-chain-module)
  - [ChainStateManager](#-chainstatemanager)
  - [ForkDetector](#-forkdetector)
  - [LogicalClock](#-logicalclock)
- [Crypto Module](#-crypto-module)
  - [Ed25519](#-ed25519)
  - [Blake2b](#-blake2b)
  - [Scrypt](#-scrypt)
  - [Hkdf](#-hkdf)
- [Utils](#-utils)
  - [Memory Zeroization](#-memory-zeroization)
  - [Encoding](#-encoding)
- [Types](#-types)
- [Constants](#-constants)
- [Error Handling](#-error-handling)

---

## 📖 Overview

nzcore provides a deterministic identity system with cryptographic document signing and verification. All APIs are designed to be:

- **Deterministic** — Same input always produces same output
- **Type-safe** — Full TypeScript support
- **Secure** — Memory zeroization, constant-time operations
- **Offline-first** — No external dependencies for security operations

---

## 📦 Installation

```bash
npm install nzcore
```

```typescript
// ES Modules (recommended)
import { NewZoneCore, generateIdentity } from 'nzcore';

// CommonJS
const { NewZoneCore, generateIdentity } = require('nzcore');
```

---

## 🚀 Main Entry Point

### Exports from `nzcore`

```typescript
import {
  // Core
  NewZoneCore,
  
  // Identity
  Mnemonic,
  IdentityDerivation,
  generateIdentity,
  createIdentity,
  
  // Document
  DocumentBuilder,
  DocumentValidator,
  CanonicalJSON,
  
  // Chain
  LogicalClock,
  ChainStateManager,
  ForkDetector,
  
  // Crypto
  Ed25519,
  Blake2b,
  Scrypt,
  Hkdf,
  
  // Utils
  zeroize,
  constantTimeEqual,
  toHex,
  fromHex,
  toBase64URL,
  fromBase64URL,
  
  // Types
  Document,
  ValidationResult,
  ChainState,
  ForkInfo,
  NewZoneCoreError,
  
  // Constants
  CRYPTO_SUITE,
  DOCUMENT_VERSION,
  ERROR_CODES,
  VERSION
} from 'nzcore';
```

---

## 🎯 Core API

### `NewZoneCore` Class

Main entry point for all operations.

#### Constructor

```typescript
constructor(mnemonic: string, options?: NewZoneCoreOptions)
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mnemonic` | `string` | Yes | BIP-39 mnemonic phrase (24 words) |
| `options` | `NewZoneCoreOptions` | No | Configuration options |

**Throws:** `NewZoneCoreError` with code `ERR_INVALID_MNEMONIC` if mnemonic is invalid.

#### `create()` — Static Factory

```typescript
static async create(mnemonic: string, options?: NewZoneCoreOptions): Promise<NewZoneCore>
```

Creates and initializes a new NewZoneCore instance.

**Example:**
```typescript
const core = await NewZoneCore.create('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
```

#### `createDocument()` — Create and Sign Document

```typescript
async createDocument(type: string, payload?: DocumentPayload): Promise<Document>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | `string` | Yes | Document type (e.g., 'profile', 'settings') |
| `payload` | `DocumentPayload` | No | Document payload data |

**Returns:** `Promise<Document>` — Signed document

**Example:**
```typescript
const doc = await core.createDocument('profile', {
  name: 'Alice Johnson',
  email: 'alice@example.com'
});

console.log(doc.id);        // Document ID
console.log(doc.signature); // Hex signature
console.log(doc.logical_time); // Logical timestamp
```

**Document Structure:**
```typescript
{
  type: "profile",
  version: "1.0",
  id: "abc123...",
  chain_id: "def456...",
  parent_hash: "000000...",
  logical_time: 1,
  crypto_suite: "nzcore-crypto-01",
  created_at: "2026-02-20T12:00:00.000Z",
  payload: { name: "Alice", email: "alice@example.com" },
  signature: "hex_signature_here"
}
```

#### `verifyDocument()` — Verify Document

```typescript
async verifyDocument(document: Document): Promise<ValidationResult>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `document` | `Document` | Yes | Document to verify |

**Returns:** `Promise<ValidationResult>`

**ValidationResult Structure:**
```typescript
{
  structural_valid: boolean,   // Required fields present
  cryptographic_valid: boolean, // Signature valid
  policy_valid: boolean,       // Policy rules pass
  final: boolean,              // AND of all layers
  errors?: string[],           // Error messages
  warnings?: string[]          // Warning messages
}
```

**Example:**
```typescript
const result = await core.verifyDocument(doc);
if (result.final) {
  console.log('Document is valid');
} else {
  console.log('Validation failed:', result.errors);
}
```

#### `getChainState()` — Get Chain State

```typescript
getChainState(): ChainState
```

**Returns:** `ChainState`

**ChainState Structure:**
```typescript
{
  chainId: string,
  lastHash: string,
  logicalClock: number,
  documentCount: number,
  forks: ForkInfo[]
}
```

**Example:**
```typescript
const state = core.getChainState();
console.log(`Documents: ${state.documentCount}`);
console.log(`Logical time: ${state.logicalClock}`);
```

#### `detectFork()` — Detect Forks

```typescript
detectFork(): ForkInfo[]
```

**Returns:** `ForkInfo[]` — Array of detected forks

**ForkInfo Structure:**
```typescript
{
  parentHash: string,
  documents: string[],  // Document IDs in fork
  detectedAt: number,   // Logical time of detection
  resolved: boolean,
  resolution?: string   // Resolution document ID
}
```

**Example:**
```typescript
const forks = core.detectFork();
if (forks.length > 0) {
  console.warn(`⚠️ ${forks.length} fork(s) detected`);
  // Manual resolution required
}
```

#### `exportIdentity()` — Export Identity

```typescript
exportIdentity(): { mnemonic: string; chainId: string }
```

**Returns:** Identity backup data

**Example:**
```typescript
const identity = core.exportIdentity();
// Store identity.mnemonic securely!
```

#### `exportState()` — Export Chain State

```typescript
exportState(): Uint8Array
```

**Returns:** Serialized chain state for persistence

**Example:**
```typescript
const state = core.exportState();
await fs.writeFile('chain-state.bin', state);
```

#### `importState()` — Import Chain State

```typescript
importState(state: Uint8Array): void
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `state` | `Uint8Array` | Yes | Previously exported state |

**Example:**
```typescript
const state = await fs.readFile('chain-state.bin');
core.importState(state);
```

#### `getPublicKey()` — Get Public Key

```typescript
getPublicKey(): Uint8Array
```

**Returns:** 32-byte Ed25519 public key

#### `getPublicKeyHex()` — Get Public Key as Hex

```typescript
getPublicKeyHex(): string
```

**Returns:** 64-character hex string

#### `getChainId()` — Get Chain ID

```typescript
getChainId(): string
```

**Returns:** 64-character hex chain identifier

#### `destroy()` — Secure Cleanup

```typescript
destroy(): void
```

Securely zeroizes all sensitive data (private keys, mnemonic).

**Example:**
```typescript
core.destroy();
// Instance is now unusable, sensitive data zeroized
```

---

### Factory Functions

#### `generateIdentity()`

```typescript
async function generateIdentity(): Promise<{ mnemonic: string; core: NewZoneCore }>
```

Generates a new random identity.

**Example:**
```typescript
const { mnemonic, core } = await generateIdentity();
console.log('Store this securely:', mnemonic);
```

#### `createIdentity()`

```typescript
async function createIdentity(mnemonic: string): Promise<NewZoneCore>
```

Creates a NewZoneCore instance from existing mnemonic.

**Example:**
```typescript
const core = await createIdentity(MY_MNEMONIC);
```

---

## 🔑 Identity Module

### `Mnemonic` Class

BIP-39 mnemonic handling.

#### `generate()`

```typescript
static generate(strength?: number): string
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `strength` | `number` | 256 | Entropy bits (256 = 24 words) |

**Returns:** 24-word mnemonic phrase

**Example:**
```typescript
const mnemonic = Mnemonic.generate();
```

#### `validate()`

```typescript
static validate(mnemonic: string): boolean
```

**Returns:** `true` if valid BIP-39 mnemonic

**Example:**
```typescript
if (Mnemonic.validate(mnemonic)) {
  console.log('Valid mnemonic');
}
```

#### `toSeed()`

```typescript
static toSeed(mnemonic: string, passphrase?: string): Uint8Array
```

**Returns:** 64-byte seed

#### `toEntropy()`

```typescript
static toEntropy(mnemonic: string): Uint8Array
```

**Returns:** Original entropy bytes

#### `fromEntropy()`

```typescript
static fromEntropy(entropy: Uint8Array): string
```

**Returns:** Mnemonic phrase

#### `mask()`

```typescript
static mask(mnemonic: string): string
```

Returns masked version for logging (first 3 words visible).

**Example:**
```typescript
console.log(Mnemonic.mask(mnemonic));
// Output: "abandon abandon abandon •••••• •••••• ..."
```

---

### `IdentityDerivation` Class

Deterministic key derivation.

#### `fromMnemonic()`

```typescript
static async fromMnemonic(mnemonic: string): Promise<{
  seed: Uint8Array;
  rootKey: {
    publicKey: Uint8Array;
    privateKey: Uint8Array;
    chainId: string;
  };
}>
```

**Derivation Path:**
```
Mnemonic → BIP-39 Seed → Scrypt → HKDF → Ed25519 KeyPair
```

#### `deriveChainId()`

```typescript
static deriveChainId(publicKey: Uint8Array): string
```

**Returns:** 64-character hex chain ID

#### `deriveDocumentId()`

```typescript
static deriveDocumentId(
  chainId: string,
  parentHash: string,
  logicalTime: number
): string
```

**Returns:** 64-character hex document ID

---

## 📄 Document Module

### `DocumentBuilder` Class

Fluent API for document creation.

#### Constructor

```typescript
constructor()
```

#### Builder Methods

All methods return `this` for chaining:

| Method | Parameters | Description |
|--------|------------|-------------|
| `setType(type)` | `type: string` | Set document type |
| `setVersion(version)` | `version: string` | Set version (default: "1.0") |
| `setId(id)` | `id: string` | Set document ID |
| `setChainId(chainId)` | `chainId: string` | Set chain ID |
| `setParentHash(hash)` | `hash: string` | Set parent hash |
| `setLogicalTime(time)` | `time: number` | Set logical time |
| `setCryptoSuite(suite)` | `suite: string` | Set crypto suite |
| `setPayload(payload)` | `payload: object` | Set document payload |
| `setSignature(sig)` | `sig: Uint8Array | string` | Set signature |
| `addField(key, value)` | `key: string, value: any` | Add custom field |

#### `build()`

```typescript
async build(): Promise<Document>
```

**Example:**
```typescript
const doc = await new DocumentBuilder()
  .setType('custom')
  .setChainId(chainId)
  .setParentHash(parentHash)
  .setLogicalTime(42)
  .setCryptoSuite('nzcore-crypto-01')
  .setPayload({ data: 'value' })
  .addField('metadata', { author: 'Alice' })
  .build();
```

#### Static Methods

```typescript
static fromDocument(doc: Document): DocumentBuilder
static genesis(chainId: string): DocumentBuilder
```

---

### `DocumentValidator` Class

Three-layer document validation.

#### `validate()`

```typescript
async validate(
  document: Document,
  context: ValidationContext
): Promise<ValidationResult>
```

**ValidationContext:**
```typescript
{
  currentTime: number,
  trustedKeys: Uint8Array[],
  policyEngine?: PolicyEngine
}
```

#### `quickValidate()`

```typescript
async quickValidate(
  document: Document,
  publicKey: Uint8Array
): Promise<boolean>
```

Quick cryptographic validation only.

#### `validateChain()`

```typescript
validateChain(documents: Document[]): boolean
```

Validates chain integrity (hash chain, time monotonicity).

---

### `CanonicalJSON` Class

RFC 8785 JSON canonicalization.

#### `serialize()`

```typescript
static async serialize(obj: unknown): Promise<string>
```

**Example:**
```typescript
const canonical = await CanonicalJSON.serialize({ b: 2, a: 1 });
// Result: '{"a":1,"b":2}' (keys sorted)
```

#### `parse()`

```typescript
static async parse(canonicalString: string): Promise<unknown>
```

#### `assertCanonical()`

```typescript
static async assertCanonical(jsonString: string): Promise<void>
```

Throws if JSON is not canonical form.

#### `isCanonical()`

```typescript
static async isCanonical(jsonString: string): Promise<boolean>
```

#### `canonicalize()`

```typescript
static async canonicalize<T>(obj: T): Promise<T>
```

#### `prepareForSigning()`

```typescript
static async prepareForSigning(doc: Record<string, unknown>): Promise<string>
```

Removes signature field and canonicalizes.

#### `canonicalEqual()`

```typescript
static async canonicalEqual(a: unknown, b: unknown): Promise<boolean>
```

---

## ⛓️ Chain Module

### `ChainStateManager` Class

Chain state management.

#### Constructor

```typescript
constructor(chainId: string, initialTime?: number)
```

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `append(document)` | `void` | Append document to chain |
| `getDocument(id)` | `Document \| undefined` | Get document by ID |
| `getLastHash()` | `string` | Get last document hash |
| `getState()` | `ChainState` | Get chain state snapshot |
| `verifyIntegrity()` | `boolean` | Verify chain integrity |
| `export()` | `Uint8Array` | Export state |
| `reset()` | `void` | Reset chain state |

#### Static Methods

```typescript
static import(data: Uint8Array, chainId: string): ChainStateManager
```

---

### `ForkDetector` Class

Fork detection utilities.

#### `scan()`

```typescript
static scan(documents: Document[]): ForkInfo[]
```

#### `createMergeDocument()`

```typescript
static createMergeDocument(
  conflictHashes: string[],
  resolution: Record<string, unknown>
): Partial<Document>
```

#### `isForkActive()`

```typescript
static isForkActive(fork: ForkInfo, currentDocuments: Document[]): boolean
```

#### `resolveFork()`

```typescript
static resolveFork(fork: ForkInfo, resolutionDocId: string): ForkInfo
```

---

### `LogicalClock` Class

Monotonic logical time.

#### Constructor

```typescript
constructor(initial?: number)
```

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `tick()` | `number` | Advance and return time |
| `current` (getter) | `number` | Get current time |
| `isExpired(expirationTime)` | `boolean` | Check expiration |
| `isRevoked(revocationTime)` | `boolean` | Check revocation |
| `sync(lastTime)` | `void` | Sync with persisted state |
| `freeze()` | `void` | Freeze clock |
| `unfreeze()` | `void` | Unfreeze clock |
| `toJSON()` | `LogicalClockState` | Serialize |

#### Static Methods

```typescript
static fromJSON(state: LogicalClockState): LogicalClock
static validateOrder(prev: number, next: number): boolean
static compare(a: number, b: number): -1 | 0 | 1
```

---

## 🔐 Crypto Module

### `Ed25519` Class

Ed25519 digital signatures.

#### `generateKeyPair()`

```typescript
static async generateKeyPair(seed?: Uint8Array): Promise<{
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}>
```

#### `sign()`

```typescript
static async sign(
  data: Uint8Array,
  privateKey: Uint8Array
): Promise<Uint8Array>
```

**Returns:** 64-byte signature

#### `verify()`

```typescript
static async verify(
  signature: Uint8Array,
  data: Uint8Array,
  publicKey: Uint8Array
): Promise<boolean>
```

#### `publicKeyToString()`

```typescript
static publicKeyToString(key: Uint8Array): string
```

---

### `Blake2b` Class

BLAKE2b-256 hashing.

#### `hash()`

```typescript
static hash(data: Uint8Array): Uint8Array
```

**Returns:** 32-byte hash

#### `hashWithDomain()`

```typescript
static hashWithDomain(domain: string, data: Uint8Array): Uint8Array
```

Domain-separated hashing.

#### `doubleHash()`

```typescript
static doubleHash(data: Uint8Array): Uint8Array
```

---

### `Scrypt` Class

Scrypt key derivation.

#### `derive()`

```typescript
static derive(password: Uint8Array, salt: Uint8Array): Uint8Array
```

**Parameters:** N=32768, r=8, p=1, dkLen=64

---

### `Hkdf` Class

HKDF-SHA256 key derivation.

#### `derive()`

```typescript
static derive(
  keyMaterial: Uint8Array,
  salt: Uint8Array,
  info: Uint8Array,
  length: number
): Uint8Array
```

---

## 🛠️ Utils

### Memory Zeroization

#### `zeroize()`

```typescript
function zeroize(array: Uint8Array): void
```

Securely zeroes a Uint8Array (3 passes).

#### `zeroizeAll()`

```typescript
function zeroizeAll(...arrays: Uint8Array[]): void
```

#### `constantTimeEqual()`

```typescript
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean
```

Constant-time comparison to prevent timing attacks.

#### `constantTimeStringEqual()`

```typescript
function constantTimeStringEqual(a: string, b: string): boolean
```

---

### Encoding

#### `toHex()`

```typescript
function toHex(bytes: Uint8Array): string
```

**Returns:** Lowercase hex string

#### `fromHex()`

```typescript
function fromHex(hex: string): Uint8Array
```

#### `toBase64URL()`

```typescript
function toBase64URL(bytes: Uint8Array): string
```

**Returns:** Base64URL without padding

#### `fromBase64URL()`

```typescript
function fromBase64URL(base64url: string): Uint8Array
```

#### `mergeArrays()`

```typescript
function mergeArrays(...arrays: Uint8Array[]): Uint8Array
```

---

## 📐 Types

### Core Types

```typescript
interface Document {
  type: string;
  version: "1.0";
  id: string;
  chain_id: string;
  parent_hash: string;
  logical_time: number;
  crypto_suite: "nzcore-crypto-01";
  created_at: string;
  payload?: DocumentPayload;
  signature?: string;
  [key: string]: unknown;
}

interface ValidationResult {
  structural_valid: boolean;
  cryptographic_valid: boolean;
  policy_valid: boolean;
  final: boolean;
  errors?: string[];
  warnings?: string[];
}

interface ChainState {
  chainId: string;
  lastHash: string;
  logicalClock: number;
  documentCount: number;
  forks: ForkInfo[];
}

interface ForkInfo {
  parentHash: string;
  documents: string[];
  detectedAt: number;
  resolved: boolean;
  resolution?: string;
}
```

### Error Types

```typescript
class NewZoneCoreError extends Error {
  code: string;
  context?: Record<string, unknown>;
}
```

---

## 🔢 Constants

```typescript
const CRYPTO_SUITE = "nzcore-crypto-01";
const DOCUMENT_VERSION = "1.0";
const VERSION = "1.0.0";

const ERROR_CODES = {
  INVALID_MNEMONIC: "ERR_INVALID_MNEMONIC",
  INVALID_SEED: "ERR_INVALID_SEED",
  INVALID_KEY: "ERR_INVALID_KEY",
  INVALID_SIGNATURE: "ERR_INVALID_SIGNATURE",
  NON_CANONICAL_JSON: "ERR_NON_CANONICAL_JSON",
  FORK_DETECTED: "ERR_FORK_DETECTED",
  LOGICAL_TIME_VIOLATION: "ERR_LOGICAL_TIME_VIOLATION",
  CRYPTO_SUITE_MISMATCH: "ERR_CRYPTO_SUITE_MISMATCH",
  VALIDATION_FAILED: "ERR_VALIDATION_FAILED"
};
```

---

## ⚠️ Error Handling

### Error Codes

| Code | Description |
|------|-------------|
| `ERR_INVALID_MNEMONIC` | Invalid BIP-39 mnemonic phrase |
| `ERR_INVALID_SEED` | Failed to derive seed |
| `ERR_INVALID_KEY` | Invalid key format |
| `ERR_INVALID_SIGNATURE` | Signature generation/verification failed |
| `ERR_NON_CANONICAL_JSON` | JSON is not in canonical form |
| `ERR_FORK_DETECTED` | Fork detected in chain |
| `ERR_LOGICAL_TIME_VIOLATION` | Logical time invariant violated |
| `ERR_CRYPTO_SUITE_MISMATCH` | Unexpected crypto suite |
| `ERR_VALIDATION_FAILED` | Document validation failed |

### Handling Errors

```typescript
import { NewZoneCoreError, ERROR_CODES } from 'nzcore';

try {
  const core = await NewZoneCore.create('invalid mnemonic');
} catch (error) {
  if (error instanceof NewZoneCoreError) {
    console.error('Error code:', error.code);
    console.error('Message:', error.message);
    
    switch (error.code) {
      case ERROR_CODES.INVALID_MNEMONIC:
        console.error('Please provide a valid BIP-39 mnemonic');
        break;
      case ERROR_CODES.FORK_DETECTED:
        console.error('Fork detected - manual resolution required');
        break;
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

*Last updated: February 20, 2026*
