# NewZoneCore Architecture Specification

## 1. Philosophy

NewZoneCore is a **personal autonomous Root of Trust**.
It represents the user as a cryptographic entity and guarantees **identity and origin** — not behavior.

The core follows these principles:

- **Offline-first** — operates without network dependencies
- **User sovereignty** — no external authority required
- **Cryptographic truth over network truth** — trust is derived from signatures, not consensus
- **Minimalism** — does only what is essential for a Root of Trust

## 2. Core Responsibility Boundary

### 2.1 What the Core IS
- Personal cryptographic passport
- Root key holder and key derivation engine
- Trust and identity anchor
- Cryptographic notary for documents
- Local document validator
- Deterministic key generator (BIP-39 → seed → HD keys)

### 2.2 What the Core IS NOT
- Message router or network proxy
- Runtime orchestrator or service manager
- Data storage engine for applications
- Behavioral validator or content filter
- Policy enforcement engine (beyond signature validity)
- Global truth provider or consensus mechanism

### 2.3 Fundamental Rule
> The Core participates in the **birth of trust**, not in its daily life.

It establishes identity and signs foundational documents, but does not mediate runtime operations.

## 3. High-Level Architecture
```bash
┌─────────────────────────────────────────────────────────────┐
│ External Systems │
│ (Services, Apps, Networks, Databases, UI) │
└──────────────────────────┬──────────────────────────────────┘
│ Uses cryptographic proofs
┌──────────────────────────▼──────────────────────────────────┐
│ NewZoneCore (nzcore) │
├─────────────────────────────────────────────────────────────┤
│ ┌────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│ │ Document │ │ Key Manager │ │ Trust Registry │ │
│ │ System │ │ │ │ (Local Whitelist)│ │
│ └────────────┘ └──────────────┘ └──────────────────┘ │
│ │ │ │ │
│ ┌────────▼──────────────▼──────────────────────▼────────┐│
│ │ Cryptographic Engine ││
│ │ Ed25519 · X25519 · BLAKE2b · HKDF · ChaCha20-Poly1305││
│ └───────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 4. Document-Centric Design

All objects in NewZoneCore are represented as **signed documents**:

```ts
UniversalDocument {
	metadata: {
		type: "entity" | "delegation" | "ownership" | "revocation" | "fact"
		version: string
		id: UUID
		created_at: ISO8601
		issuer: { key_id: string }
		subject: { key_id: string }
		constraints: { not_before?, expires_at? }
	}
	payload: JSON (opaque to core)
	proof: {
		algo: "ed25519"
		hash: "blake2b"
		signature: base64
	}
}
```

The core validates structure and signatures, but does **not interpret payload semantics**.

## 5. Key Hierarchy

```bash
BIP-39 Mnemonic (24 words, user memorized)
│
├──▶ Seed (BLAKE2b, 32 bytes)
│ │
│ ├──▶ Master Key (scrypt, password-derived)
│ │ │
│ │ ├──▶ Identity Key (Ed25519, delegated)
│ │ ├──▶ ECDH Key (X25519, delegated)
│ │ └──▶ Service Keys (derived as needed)
│ │
│ └──▶ Recovery Key (encrypted backup)
│
└──▶ Paper Backup (QR code, physical storage)
```

**Critical**: Master key never resides on device after initialization.
Only delegated identity keys are used for daily operations.

## 6. Environment Layout

```bash
env/
├── seed.txt # BIP-39 mnemonic (optional encrypted)
├── keys/
│ ├── identity.json # Delegated Ed25519 key
│ ├── ecdh.json # Delegated X25519 key
│ └── service_.json # Derived service keys
├── documents/ # Signed document repository
│ ├── entity_.json
│ ├── delegation_.json
│ ├── ownership_.json
│ ├── revocation_.json
│ └── fact_.json
├── trust/
│ ├── trusted_keys.json # Whitelist of key_ids
│ └── trusted_documents.json # Whitelist of document ids
└── log/ # Append-only fact log
```

## 7. API Layers

### 7.1 Core Library (Primary)
ES modules for direct import by other systems:

```javascript
import { createDocument, validateDocument, deriveKey } from 'nzcore'
```

### 7.2 CLI
Command-line interface for manual operations:

```bash
nzcore init                          # Initialize environment
nzcore document create --type entity # Create document
nzcore document sign <file>          # Sign existing document
nzcore key list                      # List derived keys
nzcore trust add <key_id>            # Add to local trust store
```

### 7.3 HTTP API
REST interface for remote integration:

```text
GET  /health
POST /documents/validate
GET  /keys/:key_id
POST /trust
```

### 7.4 IPC
Local socket for fast inter-process communication.

## 8. Integration Pattern
External systems interact with NewZoneCore by:

**Importing the library** and calling functions directly

**Creating documents** with appropriate payloads

**Requesting signatures** from the core

**Validating documents** received from others

**Managing trust** through the local registry

Example flow for a messaging app:

```text
App → nzcore: "Sign this message envelope"
nzcore → App: Signed document with proof
App → Network: Send signed document
Receiver → nzcore: "Validate this document signature"
nzcore → Receiver: Validation result
```

## 9. Security Boundaries
**Private keys** never leave secure storage

**Seed/master key** never stored on device

**Document validation** is pure function (no side effects)

**Trust decisions** are explicit and local

**All operations** are deterministic when possible

## 10. Stability Guarantee
The core API and document format are versioned and immutable.
Changes require:

New document `version` field

Backward-compatible validation

Explicit migration path for users
