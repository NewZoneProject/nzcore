# Architecture

This document describes the architecture of **nzcore** — a personal autonomous Root of Trust system.

---

## 📋 Table of Contents

- [High-Level Architecture](#-high-level-architecture)
- [System Context Diagram](#-system-context-diagram)
- [Component Architecture](#-component-architecture)
- [Data Flow](#-data-flow)
- [Sequence Diagrams](#-sequence-diagrams)
- [Technology Stack](#-technology-stack)
- [Directory Structure](#-directory-structure)
- [Design Principles](#-design-principles)

---

## 🏗️ High-Level Architecture

nzcore is designed as a **deterministic cryptographic library** that creates and manages a chain of signed documents. The system operates entirely offline with no external dependencies for security-critical operations.

### Core Concepts

```
┌─────────────────────────────────────────────────────────────────┐
│                        nzcore Library                            │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Identity   │───▶│   Document   │───▶│    Chain     │      │
│  │  Derivation  │    │   Builder    │    │    State     │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  BIP-39 +    │    │  RFC 8785    │    │   Logical    │      │
│  │  Ed25519     │    │  Canonical   │    │    Time      │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Trust Validation Layers                      │   │
│  │   Structural → Cryptographic → Policy                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 System Context Diagram

```mermaid
graph TB
    subgraph "External Systems"
        User[User/Application]
        Storage[Persistent Storage]
        SecureStore[Secure Key Storage]
    end

    subgraph "nzcore Library"
        Core[NewZoneCore]
        Identity[Identity Module]
        Document[Document Module]
        Chain[Chain Module]
        Validator[Validator Module]
        ForkDetector[Fork Detector]
    end

    subgraph "Cryptographic Primitives"
        Ed25519[Ed25519 Signatures]
        Blake2b[BLAKE2b Hashing]
        Scrypt[Scrypt KDF]
        HKDF[HKDF Derivation]
        BIP39[BIP-39 Mnemonic]
    end

    User --> Core
    Core <--> Storage
    Core <--> SecureStore

    Core --> Identity
    Core --> Document
    Core --> Chain
    Core --> Validator
    Core --> ForkDetector

    Identity --> BIP39
    Identity --> Scrypt
    Identity --> HKDF
    Identity --> Ed25519

    Document --> Ed25519
    Document --> Blake2b

    Chain --> Blake2b
    Validator --> Ed25519
    Validator --> Blake2b
    ForkDetector --> Chain
```

---

## 🧩 Component Architecture

### Core Components

| Component | Responsibility | Key Files |
|-----------|---------------|-----------|
| **NewZoneCore** | Main entry point, orchestrates all operations | `src/core.ts` |
| **Identity Module** | Mnemonic handling, key derivation | `src/identity/` |
| **Document Module** | Document creation, signing, validation | `src/document/` |
| **Chain Module** | Chain state management, fork detection | `src/chain/` |
| **Crypto Module** | Cryptographic primitives | `src/crypto/` |
| **Utils Module** | Encoding, memory zeroization | `src/utils/` |

### Component Diagram

```mermaid
graph LR
    subgraph "Core Layer"
        Core[NewZoneCore]
    end

    subgraph "Business Logic Layer"
        Identity[IdentityDerivation]
        Mnemonic[Mnemonic]
        Builder[DocumentBuilder]
        Validator[DocumentValidator]
        ChainState[ChainStateManager]
        ForkDetect[ForkDetector]
        Clock[LogicalClock]
    end

    subgraph "Crypto Layer"
        Ed25519[Ed25519]
        Blake2b[Blake2b]
        Scrypt[Scrypt]
        HKDF[Hkdf]
    end

    subgraph "Utilities"
        Canonical[CanonicalJSON]
        Zeroize[zeroize]
        Encoding[encoding utils]
    end

    Core --> Identity
    Core --> Builder
    Core --> Validator
    Core --> ChainState
    Core --> ForkDetect

    Identity --> Mnemonic
    Identity --> Ed25519
    Identity --> Scrypt
    Identity --> HKDF

    Builder --> Canonical
    Builder --> Ed25519
    Builder --> Blake2b

    Validator --> Canonical
    Validator --> Ed25519

    ChainState --> Blake2b
    ChainState --> Clock

    Builder --> Canonical
    Validator --> Canonical
```

---

## 📊 Data Flow

### Document Creation Flow

```mermaid
sequenceDiagram
    participant User
    participant Core as NewZoneCore
    participant Clock as LogicalClock
    participant Builder as DocumentBuilder
    participant Identity as IdentityDerivation
    participant Crypto as Ed25519
    participant Canonical as CanonicalJSON
    participant Chain as ChainStateManager

    User->>Core: createDocument(type, payload)
    Core->>Clock: tick()
    Clock-->>Core: logical_time

    Core->>Chain: getLastHash()
    Chain-->>Core: parent_hash

    Core->>Identity: deriveDocumentId(chainId, parentHash, logicalTime)
    Identity-->>Core: document_id

    Core->>Builder: new DocumentBuilder()
    Builder->>Builder: setType(type)
    Builder->>Builder: setChainId(chainId)
    Builder->>Builder: setParentHash(parent_hash)
    Builder->>Builder: setLogicalTime(logical_time)
    Builder->>Builder: setId(document_id)
    Builder->>Builder: setPayload(payload)

    Core->>Builder: build()
    Builder->>Canonical: serialize(doc)
    Canonical-->>Builder: canonical_json
    Builder-->>Core: document

    Core->>Builder: prepare for signing (remove signature)
    Core->>Canonical: serialize(doc_without_sig)
    Canonical-->>Core: canonical_data

    Core->>Crypto: sign(canonical_data, privateKey)
    Crypto-->>Core: signature

    Core->>Builder: setSignature(signature)
    Core->>Chain: append(document)
    Chain-->>Core: success

    Core-->>User: signed_document
```

### Document Verification Flow

```mermaid
sequenceDiagram
    participant User
    participant Core as NewZoneCore
    participant Validator as DocumentValidator
    participant Canonical as CanonicalJSON
    participant Crypto as Ed25519

    User->>Core: verifyDocument(document)
    Core->>Validator: validate(document, context)

    Note over Validator: Layer 1: Structural
    Validator->>Validator: Check required fields
    Validator->>Validator: Validate logical_time
    Validator->>Validator: Check crypto_suite

    Note over Validator: Layer 2: Cryptographic
    Validator->>Canonical: serialize(doc_without_sig)
    Canonical-->>Validator: canonical_json
    Validator->>Canonical: assertCanonical()
    Validator->>Crypto: verify(signature, data, publicKey)
    Crypto-->>Validator: valid/invalid

    Note over Validator: Layer 3: Policy
    Validator->>Validator: Evaluate policy (if any)

    Validator-->>Core: ValidationResult
    Core-->>User: final_result
```

### Identity Derivation Flow

```mermaid
sequenceDiagram
    participant User
    participant Core as NewZoneCore
    participant Mnemonic as Mnemonic
    participant Scrypt as Scrypt
    participant HKDF as Hkdf
    participant Ed25519 as Ed25519
    participant Blake2b as Blake2b

    User->>Core: create(mnemonic)
    Core->>Mnemonic: validate(mnemonic)
    Mnemonic-->>Core: valid

    Core->>Mnemonic: toSeed(mnemonic, '')
    Mnemonic-->>Core: seed

    Core->>Scrypt: derive(seed, salt)
    Scrypt-->>Core: scryptKey

    Core->>HKDF: derive(scryptKey, salt, info, length)
    HKDF-->>Core: derivedKey

    Core->>Ed25519: generateKeyPair(derivedKey)
    Ed25519-->>Core: {publicKey, privateKey}

    Core->>Blake2b: hashWithDomain(publicKey)
    Blake2b-->>Core: chainId

    Core-->>User: initialized_instance
```

---

## 🔀 Sequence Diagrams

### Fork Detection Scenario

```mermaid
sequenceDiagram
    participant App
    participant Core1 as Core Instance 1
    participant Core2 as Core Instance 2
    participant ForkDetect as ForkDetector

    Note over App,Core2: Both instances share same mnemonic

    App->>Core1: createDocument('data', {v: 1})
    Core1-->>App: doc1 (id: abc123)

    App->>Core2: importState(doc1)
    Core2-->>App: state imported

    par Concurrent modifications
        App->>Core1: createDocument('branch', {name: 'A'})
        Core1-->>App: docA (parent: abc123)
    and
        App->>Core2: createDocument('branch', {name: 'B'})
        Core2-->>App: docB (parent: abc123)
    end

    Note over App: Fork created! Both docs have same parent_hash

    App->>Core1: detectFork()
    Core1->>ForkDetect: scan(documents)
    ForkDetect-->>Core1: fork_detected

    App->>Core2: detectFork()
    Core2->>ForkDetect: scan(documents)
    ForkDetect-->>Core2: fork_detected

    Note over App: Fork resolution is MANUAL (not automatic)
```

### State Export/Import Scenario

```mermaid
sequenceDiagram
    participant App
    participant Core1 as Core Instance 1
    participant Storage
    participant Core2 as Core Instance 2

    App->>Core1: create(mnemonic)
    App->>Core1: createDocument('doc1', {...})
    App->>Core1: createDocument('doc2', {...})

    App->>Core1: exportState()
    Core1-->>App: Uint8Array state

    App->>Storage: save(state)

    Note over App: Later / Different session

    App->>Storage: load(state)
    Storage-->>App: Uint8Array state

    App->>Core2: create(mnemonic)
    App->>Core2: importState(state)

    App->>Core2: getChainState()
    Core2-->>App: restored_state

    App->>Core2: createDocument('doc3', {...})
    Core2-->>App: doc3 (continues chain)
```

---

## 🛠️ Technology Stack

### Languages & Runtimes

| Technology | Version | Purpose |
|------------|---------|---------|
| TypeScript | 5.3+ | Primary language |
| JavaScript (ES2020) | ESNext modules | Runtime target |
| Node.js | 18.0.0+ | Runtime environment |

### Cryptographic Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| @noble/ed25519 | 1.7.3 | Ed25519 signatures |
| @noble/hashes | 1.4.0+ | BLAKE2b, SHA-512 |
| @scure/bip39 | 1.3.0+ | BIP-39 mnemonic |
| canonicalize | 2.1.0 | RFC 8785 JSON canonicalization |

### Development Tools

| Tool | Purpose |
|------|---------|
| TypeScript Compiler | Type checking, transpilation |
| ESLint | Code linting |
| TypeDoc | API documentation generation |
| c8 | Code coverage |
| Node.js test runner | Unit and integration testing |

### Build Targets

| Target | Output | Use Case |
|--------|--------|----------|
| ESM | `dist/esm/` | Modern bundlers, browsers |
| CJS | `dist/cjs/` | Node.js require() |
| Types | `dist/types/` | TypeScript definitions |

---

## 📁 Directory Structure

```
nzcore/
├── src/                          # Source code
│   ├── index.ts                  # Main entry point (public API)
│   ├── core.ts                   # NewZoneCore main class
│   ├── types.ts                  # TypeScript type definitions
│   ├── constants.ts              # System constants
│   │
│   ├── identity/                 # Identity management
│   │   ├── mnemonic.ts           # BIP-39 mnemonic handling
│   │   ├── derivation.ts         # Key derivation (Scrypt → HKDF → Ed25519)
│   │   ├── factory.ts            # Identity factory functions
│   │   └── logical-time.ts       # Logical clock implementation
│   │
│   ├── document/                 # Document system
│   │   ├── builder.ts            # Fluent document builder
│   │   ├── canonical.ts          # RFC 8785 canonicalization
│   │   └── validator.ts          # Three-layer validation
│   │
│   ├── chain/                    # Chain state management
│   │   ├── state.ts              # ChainStateManager
│   │   └── fork.ts               # Fork detection
│   │
│   ├── crypto/                   # Cryptographic primitives
│   │   ├── ed25519.ts            # Ed25519 signatures
│   │   ├── blake2b.ts            # BLAKE2b hashing
│   │   ├── scrypt.ts             # Scrypt KDF
│   │   └── hkdf.ts               # HKDF key derivation
│   │
│   └── utils/                    # Utilities
│       ├── zeroize.ts            # Secure memory zeroization
│       └── encoding.ts           # Hex, Base64URL encoding
│
├── test/                         # Test files
│   ├── integration.test.ts       # Integration tests
│   ├── debug.test.ts             # Debug tests
│   ├── minimal.test.ts           # Minimal tests
│   └── mnemonic-debug.test.ts    # Mnemonic tests
│
├── examples/                     # Usage examples
│   ├── basic-usage.ts            # Basic example
│   └── advanced-usage.ts         # Advanced example
│
├── specs/                        # Technical specifications
│   ├── API_SPEC.md               # API specification
│   ├── ARCHITECTURE_NZCORE.md    # Architecture spec
│   ├── CRYPTO_SPEC.md            # Cryptographic spec
│   ├── DOCUMENT_SYSTEM.md        # Document system spec
│   ├── FORK_MODEL.md             # Fork model spec
│   ├── IDENTITY_MODEL.md         # Identity model spec
│   ├── SECURITY.md               # Security overview
│   ├── THREAT_MODEL.md           # Threat model
│   ├── TIME_MODEL.md             # Time model spec
│   ├── TRUST_MODEL.md            # Trust model spec
│   ├── CRYPTO_AGILITY.md         # Crypto agility spec
│   ├── ENVIRONMENT.md            # Environment spec
│   └── CONTRIBUTING.md           # Contribution guidelines
│
├── docs/                         # Generated TypeDoc documentation
│
├── dist/                         # Build output
│   ├── esm/                      # ES modules
│   ├── cjs/                      # CommonJS modules
│   └── types/                    # TypeScript definitions
│
├── package.json                  # Package configuration
├── tsconfig.json                 # TypeScript configuration
├── tsconfig.esm.json             # ESM build config
├── tsconfig.cjs.json             # CJS build config
├── tsconfig.types.json           # Types build config
├── typedoc.json                  # TypeDoc configuration
├── eslint.config.js              # ESLint configuration
└── README.md                     # This documentation
```

---

## 🎯 Design Principles

### 1. Determinism

All operations MUST be deterministic. Given the same input, the output MUST always be identical.

```typescript
// Same mnemonic always produces same identity
const core1 = await NewZoneCore.create(MNEMONIC);
const core2 = await NewZoneCore.create(MNEMONIC);
// core1.getPublicKeyHex() === core2.getPublicKeyHex()
```

### 2. No External Dependencies

Security-critical operations MUST NOT depend on:
- System wall-clock time
- Network connectivity
- External services

### 3. Logical Time

Logical time is authoritative over wall-clock time:
- Monotonic counter (always increases)
- Used for ordering, expiration, revocation
- Stored in chain state

### 4. Fork Detection (Not Resolution)

The core:
- ✅ MUST detect forks automatically
- ❌ MUST NOT resolve forks automatically
- ⚠️ Resolution is manual (application responsibility)

### 5. Secure Memory

All sensitive data MUST be zeroized:
- Private keys after use
- Mnemonic phrases
- Derived seeds

### 6. Three-Layer Trust

Validation follows strict layering:

```
Trust = Structural ∧ Cryptographic ∧ Policy
```

| Layer | Checks |
|-------|--------|
| **Structural** | Required fields, formats, invariants |
| **Cryptographic** | Signatures, canonical JSON, key validity |
| **Policy** | Application-specific rules (optional) |

### 7. Crypto Agility

Documents include `crypto_suite` field for future algorithm migration:

```typescript
{
  "crypto_suite": "nzcore-crypto-01",
  // ... other fields
}
```

---

## 🔗 Related Documents

- [API Reference](./API.md) — Complete API documentation
- [Security Model](./SECURITY.md) — Security principles and practices
- [Deployment Guide](./DEPLOYMENT.md) — Build and deployment instructions
- [Contributing](./CONTRIBUTING.md) — Development guidelines

---

*Last updated: February 20, 2026*
