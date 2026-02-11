# NewZoneCore Document System Specification

## 1. Overview

All objects in NewZoneCore are represented as **signed documents**.
A document is a JSON object with three layers:

1. **Metadata** — Universal, type-independent, signed
2. **Payload** — Structured semantic content (opaque to core)
3. **Proof** — Cryptographic signature over metadata + payload

The document system ensures:
- **Minimalism** — Core only validates structure and signatures
- **Reproducibility** — Canonical encoding guarantees deterministic signatures
- **Cryptographic integrity** — All documents are signed
- **Complete autonomy** — No external validation required
- **No master-key storage** — Only delegated keys on device

## 2. Universal Document Structure

```json
{
  "metadata": {
    "type": "entity | delegation | ownership | revocation | fact",
    "version": "nzcore-doc-01",
    "id": "urn:uuid:550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-15T14:30:00Z",
    "issuer": {
      "key_id": "ed25519:abc123..."
    },
    "subject": {
      "key_id": "ed25519:def456..."
    },
    "constraints": {
      "not_before": "2024-01-15T14:30:00Z",
      "expires_at": "2024-12-31T23:59:59Z"
    }
  },
  "payload": {
    // Type-specific structure (opaque to core)
  },
  "proof": {
    "algo": "ed25519",
    "hash": "blake2b-256",
    "signature": "MEUCIQD...base64"
  }
}
```

## 3. Metadata Specification

### 3.1 Required Fields

| Field	| Type	| Description |
| ----- | ----- | ----------- |
| type	| string	| Ontological class. Must be one of: entity, delegation, ownership, revocation, fact |
| version	| string	| Document schema version. Format: nzcore-doc-XX |
| id	| string	| Unique document identifier (URN/UUID). Must be globally unique. |
| created_at	| string	| ISO 8601 timestamp. Acts as nonce to prevent replay attacks. |
| issuer.key_id	| string	| Key identifier of the signing party. Format: algorithm:public_key_hex |
| subject.key_id	| string	| Key identifier this document refers to. Same format as issuer. |
| constraints	| object	| Validity constraints (see below) |

### 3.2 Constraints Object

```json
{
  "constraints": {
    "not_before": "2024-01-15T14:30:00Z",  // Optional: document invalid before
    "expires_at": "2024-12-31T23:59:59Z",   // Optional: document invalid after
    // Additional custom constraints may be added by users
    // Core ignores unknown constraint fields
  }
}
```
Note: created_at is part of the signed content and prevents replay attacks.

## 4. Proof Specification

```json
{
  "proof": {
    "algo": "ed25519",           // Signature algorithm
    "hash": "blake2b-256",       // Hash algorithm used before signing
    "signature": "MEUCIQD..."    // Base64-encoded signature
  }
}
```

### 4.1 Signature Creation

Create canonical JSON representation of {metadata, payload}

Compute hash = BLAKE2b-256(canonical_json)

Sign hash with issuer's Ed25519 private key

Encode signature as base64

### 4.2 Signature Verification

Extract proof.signature (base64 → bytes)

Recreate canonical JSON of {metadata, payload}

Compute hash = BLAKE2b-256(canonical_json)

Verify signature using issuer's public key

## 5. Canonical JSON Encoding

For deterministic signatures, JSON must be canonicalized:

No whitespace outside string values

Sorted keys in all objects (lexicographic Unicode order)

No duplicate keys

String encoding: UTF-8

Number representation: IEEE 754 with no unnecessary fractional digits

Example implementation:

```javascript
function canonicalize(obj) {
  return JSON.stringify(obj, (key, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value).sort().reduce((sorted, k) => {
        sorted[k] = value[k];
        return sorted;
      }, {});
    }
    return value;
  });
}
```

## 6. Document Types (Semantic Payloads)

The core does not interpret payload content, but these are the canonical types:

### 6.1 Entity Document

Describes a subject (user, device, service, agent).

```json
{
  "payload": {
    "entity_type": "user | device | service | agent | other",
    "metrics": { /* arbitrary metrics */ },
    "attributes": { /* arbitrary attributes */ }
  }
}
```

### 6.2 Delegation Document

Grants rights from one key to another.

```json
{
  "payload": {
    "delegation_type": "access | role | capability | session | other",
    "rights": ["read", "write", "execute"],
    "scope": { /* delegation scope */ },
    "context": { /* delegation context */ }
  }
}
```

### 6.3 Ownership Document

Expresses lineage and origin of keys.

```json
{
  "payload": {
    "parent_key_id": "ed25519:parent123",
    "origin": "master | delegated | external",
    "lineage": ["key_id1", "key_id2", "key_id3"],
    "attributes": { /* lineage attributes */ }
  }
}
```

### 6.4 Revocation Document

Cancels keys or documents.

```json
{
  "payload": {
    "target_type": "key | document | delegation | entity",
    "target_id": "urn:uuid:target-id",
    "reason": "compromised | expired | replaced",
    "severity": "low | medium | high | critical"
  }
}
```

### 6.5 Fact Document

Records events in append-only log.

```json
{
  "payload": {
    "fact_type": "event | measurement | state | other",
    "data": { /* fact data */ },
    "context": { /* fact context */ }
  }
}
```

## 7. Document Lifecycle

### 7.1 Creation

User/system prepares payload

Core generates metadata with:

Unique id (UUID v4)

Current timestamp as created_at

Issuer/subject key IDs

Core signs {metadata, payload}

Document saved to env/documents/

### 7.2 Validation

Check required metadata fields exist

Validate id format (URN/UUID)

Check timestamp constraints (not_before, expires_at)

Verify proof.signature against issuer's public key

Return validation result (boolean + reason if invalid)

### 7.3 Revocation

Create revocation document targeting existing document/key

revocation.issuer must have authority over target

Once validated, target document is considered invalid

Core maintains revocation list but does not delete original documents

## 8. Storage and Retrieval

### 8.1 File System Layout

```text
env/documents/
├── entity/
│   ├── user_550e8400.json
│   └── device_def456.json
├── delegation/
│   ├── access_abc123.json
│   └── role_789xyz.json
├── ownership/
│   └── lineage_parent123.json
├── revocation/
│   └── revoked_compromised.json
└── fact/
    └── event_20240115.json
```

### 8.2 Naming Convention

{type}_{short_id}.json where short_id is first 8 chars of document id.

### 8.3 Indexing

Core maintains minimal index:

```json
{
  "documents_by_id": {
    "urn:uuid:550e8400...": "entity/user_550e8400.json"
  },
  "documents_by_issuer": {
    "ed25519:abc123...": ["entity/user_550e8400.json"]
  },
  "documents_by_subject": {
    "ed25519:def456...": ["delegation/access_abc123.json"]
  }
}
```

## 9. Trust Model

All trust is derived from documents:

Self-signed root: First entity document (self-signed)

Delegation chains: A → B → C (verifiable signatures)

Local whitelist: User explicitly trusts specific key_ids

Revocation override: Any document can be revoked by its issuer

The core never makes trust decisions automatically — only validates cryptographic proofs.

## 10. Error Handling

### 10.1 Validation Errors

INVALID_SIGNATURE: Proof verification failed

EXPIRED: created_at outside constraints

MISSING_FIELD: Required metadata field absent

INVALID_ID: Document ID malformed

REVOKED: Document has valid revocation

### 10.2 Storage Errors

DUPLICATE_ID: Document ID already exists

CORRUPTED_FILE: JSON parsing failed

PERMISSION_DENIED: Filesystem access denied

## 11. Versioning and Evolution

### 11.1 Document Version

metadata.version follows format: nzcore-doc-XX

nzcore-doc-01: Initial release

Future versions maintain backward compatibility

### 11.2 Schema Evolution

New fields may be added to payloads

Metadata fields are immutable after v1

New document types can be added

Old documents remain valid forever

## 12. Examples

### 12.1 Complete Entity Document

```json
{
  "metadata": {
    "type": "entity",
    "version": "nzcore-doc-01",
    "id": "urn:uuid:550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-15T14:30:00Z",
    "issuer": { "key_id": "ed25519:abc123def456" },
    "subject": { "key_id": "ed25519:abc123def456" },
    "constraints": {
      "not_before": "2024-01-15T14:30:00Z",
      "expires_at": "2025-01-15T14:30:00Z"
    }
  },
  "payload": {
    "entity_type": "user",
    "metrics": { "created": 1 },
    "attributes": { "name": "alice", "role": "admin" }
  },
  "proof": {
    "algo": "ed25519",
    "hash": "blake2b-256",
    "signature": "MEUCIQD4v6y6...base64"
  }
}
```


