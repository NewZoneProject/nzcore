# NewZoneCore Environment Specification

## 1. Overview

The NewZoneCore environment is a portable, self-contained directory structure that contains all persistent state for a node. It is designed to be:

- **Deterministic** — Can be recreated from seed phrase
- **Portable** — Can be moved between devices
- **Human-inspectable** — Files are JSON/text where possible
- **Recoverable** — Single mnemonic can restore everything
- **Isolated** — No external dependencies or absolute paths

## 2. Directory Layout

### 2.1 Root Structure

```bash
env/ # Environment root
├── meta.json # Environment metadata
├── seed.txt # BIP-39 mnemonic (optional, encrypted)
├── keys/ # Cryptographic keys
│ ├── identity.json # Delegated Ed25519 identity key
│ ├── ecdh.json # Delegated X25519 ECDH key
│ └── service/ # Service-specific keys
│ ├── logging.json
│ ├── queue.json
│ └── {service}.json
├── documents/ # Signed document repository
│ ├── index.json # Document index
│ ├── entity/
│ ├── delegation/
│ ├── ownership/
│ ├── revocation/
│ └── fact/
├── trust/ # Trust management
│ ├── trusted_keys.json
│ ├── trusted_documents.json
│ └── blacklist.json
├── log/ # Append-only operation log
│ ├── audit.log # Human-readable log
│ └── factchain.bin # Binary fact chain
└── cache/ # Ephemeral cache (can be deleted)
├── sessions/
└── temp/
```

### 2.2 Production vs Test Environments

Production (live data)
./env/

Test (isolated, can be deleted)
./env_test/ # Mirrors production structure

Development (git-ignored)
./env_dev/ # Developer-specific

## 3. File Specifications

### 3.1 meta.json — Environment Metadata

```json
{
  "version": "nzcore-env-01",
  "created_at": "2024-01-15T14:30:00Z",
  "updated_at": "2024-01-20T10:15:00Z",
  "node_id": "user.alice.device1",
  "environment": "production | test | development",
  "flags": {
    "initialized": true,
    "master_key_derived": true,
    "identity_ready": true
  },
  "statistics": {
    "documents_count": 42,
    "trusted_keys_count": 5,
    "last_backup": "2024-01-19T23:00:00Z"
  }
}
```

### 3.2 seed.txt — BIP-39 Mnemonic

```text
abandon ability able about above absent absorb abstract absurd abuse access accident account
```

Rules:

12, 15, 18, 21, or 24 words (BIP-39 standard)

Separated by single spaces

Optional trailing newline

Recommendation: Keep encrypted or store offline

### 3.3 keys/identity.json — Delegated Identity Key

```json
{
  "version": "nzcore-key-01",
  "key_id": "ed25519:1a2b3c4d5e6f...",
  "created_at": "2024-01-15T14:30:00Z",
  "derivation_path": "m/identity",
  "public_key": "base64...",          // 32 bytes, Ed25519 public key
  "private_key_encrypted": {          // Encrypted Ed25519 seed
    "ciphertext": "base64...",
    "tag": "base64...",
    "nonce": "base64...",
    "algo": "chacha20-poly1305",
    "kek_id": "key_encryption_key_1"
  },
  "metadata": {
    "purpose": "document_signing",
    "rotation_policy": "90d",
    "last_used": "2024-01-20T09:00:00Z"
  }
}
```

### 3.4 keys/ecdh.json — Delegated ECDH Key

```json
{
  "version": "nzcore-key-01",
  "key_id": "x25519:abcdef012345...",
  "created_at": "2024-01-15T14:30:00Z",
  "derivation_path": "m/ecdh",
  "public_key": "base64...",          // 32 bytes, X25519 public key
  "private_key_encrypted": {          // Encrypted X25519 private scalar
    "ciphertext": "base64...",
    "tag": "base64...",
    "nonce": "base64...",
    "algo": "chacha20-poly1305",
    "kek_id": "key_encryption_key_1"
  },
  "metadata": {
    "purpose": "key_agreement",
    "ephemeral": false
  }
}
```

### 3.5 documents/index.json — Document Registry

```json
{
  "version": "nzcore-index-01",
  "updated_at": "2024-01-20T10:00:00Z",
  "documents": {
    "urn:uuid:550e8400-e29b-41d4-a716-446655440000": {
      "type": "entity",
      "file": "entity/user_550e8400.json",
      "issuer": "ed25519:1a2b3c...",
      "subject": "ed25519:1a2b3c...",
      "created_at": "2024-01-15T14:30:00Z",
      "status": "active | revoked | expired"
    }
  },
  "indices": {
    "by_issuer": {
      "ed25519:1a2b3c...": [
        "urn:uuid:550e8400-e29b-41d4-a716-446655440000"
      ]
    },
    "by_subject": {
      "ed25519:1a2b3c...": [
        "urn:uuid:550e8400-e29b-41d4-a716-446655440000"
      ]
    },
    "by_type": {
      "entity": [
        "urn:uuid:550e8400-e29b-41d4-a716-446655440000"
      ]
    }
  }
}
```

### 3.6 trust/trusted_keys.json — Key Whitelist

```json
{
  "version": "nzcore-trust-01",
  "updated_at": "2024-01-20T09:30:00Z",
  "keys": [
    {
      "key_id": "ed25519:1a2b3c4d5e6f...",
      "added_at": "2024-01-15T14:30:00Z",
      "added_by": "urn:uuid:550e8400-e29b-41d4-a716-446655440000",
      "metadata": {
        "name": "Alice's Phone",
        "purpose": "personal_device",
        "expires_at": "2025-01-15T14:30:00Z"
      }
    }
  ]
}
```

### 3.7 log/audit.log — Human-Readable Log

```text
2024-01-15T14:30:00Z [INFO] Environment initialized
2024-01-15T14:31:00Z [INFO] Identity key derived: ed25519:1a2b3c...
2024-01-15T14:32:00Z [INFO] Entity document created: user.alice
2024-01-20T09:00:00Z [INFO] Document signed: urn:uuid:...
2024-01-20T10:00:00Z [WARN] Key nearing rotation: ed25519:1a2b3c...
```

### 3.8 log/factchain.bin — Binary Fact Chain

Format:

```text
[Header][Fact][Fact][Fact]...
Header: {
  magic: "NZFACT" (6 bytes)
  version: 1 (1 byte)
  reserved: 0 (9 bytes)
}
Fact: {
  length: uint32 (4 bytes)
  document_id: uuid (16 bytes)
  timestamp: uint64 (8 bytes, microseconds)
  hash: blake2b-256 (32 bytes)
  data: JSON (variable)
}
```

## 4. Environment Lifecycle

### 4.1 Initialization Flow

```javascript
// Step 1: Create environment structure
nzcore init --name "alice.device1"

// Step 2: Generate or restore from mnemonic
nzcore setup --generate  // New identity
// OR
nzcore setup --restore   // From existing mnemonic

// Step 3: Set password (derives master key)
nzcore setup --password "secure-password"

// Step 4: Verify environment
nzcore doctor
```

### 4.2 Normal Operation

```javascript
// Environment is loaded on startup
const env = await Environment.load('./env');

// Keys are decrypted in memory
const identity = await env.keys.identity.decrypt(kek);

// Documents are read/written via environment
await env.documents.add(document);
await env.trust.addKey(trustedKey);
```

### 4.3 Shutdown

```javascript
// 1. Clear sensitive memory
env.keys.identity.clear();  // Zero-fill private key buffer

// 2. Flush pending writes
await env.documents.flush();
await env.log.flush();

// 3. Update metadata
env.meta.updated_at = new Date().toISOString();
await env.meta.save();

// 4. Environment can be safely unmounted
```

## 5. Portability Requirements

### 5.1 Path Independence

No absolute paths in configuration

Use path.join(__dirname, 'env/') pattern

Symlink support for flexible mounting

### 5.2 Cross-Platform Compatibility

UTF-8 encoding for all text files

Unix line endings (LF) preferred, CRLF tolerated

Case-sensitive filename handling

Permission preservation (600 for sensitive files)

### 5.3 Backup and Migration

```bash
# Backup entire environment
tar -czf nzcore-backup-$(date +%Y%m%d).tar.gz env/

# Restore to new device
tar -xzf nzcore-backup-20240120.tar.gz
nzcore migrate --new-device
```

## 6. Security Considerations

### 6.1 File Permissions

```text
env/                          # 0700 (drwx------)
env/seed.txt                 # 0600 (-rw-------)
env/keys/                    # 0700 (drwx------)
env/keys/*.json              # 0600 (-rw-------)
env/documents/               # 0755 (drwxr-xr-x)
env/documents/*.json         # 0644 (-rw-r--r--)
env/log/                     # 0755 (drwxr-xr-x)
env/log/*.log               # 0644 (-rw-r--r--)
```

### 6.2 Encryption at Rest

```javascript
// Key Encryption Key (KEK) derived from password
const kek = scrypt(password, salt, { N: 32768, r: 8, p: 1, dkLen: 32 });

// Encrypt private key
const encrypted = await encrypt(
  kek,
  privateKeyBytes,
  { additionalData: keyMetadata }
);

// Store encrypted
await writeFile('keys/identity.json', {
  public_key: base64(publicKey),
  encrypted: encrypted
});
```

### 6.3 Memory Protection

Zero-fill buffers after use

Use safe-buffer for sensitive data

Prevent swap file leakage (mlock where available)

## 7. Recovery Procedures

### 7.1 Standard Recovery (Mnemonic + Password)

```javascript
// 1. User provides mnemonic and password
const mnemonic = await promptMnemonic();
const password = await promptPassword();

// 2. Recreate environment
const env = await Environment.recover({
  mnemonic,
  password,
  targetPath: './env_recovered'
});

// 3. Verify identity matches
const matches = await env.verifyIdentity(previousPublicKey);
```

### 7.2 Password Reset (Mnemonic Known)

```javascript
// Password change re-encrypts keys but doesn't change identity
await env.changePassword(oldPassword, newPassword);
// All keys re-encrypted with new KEK
// Identity key remains same (derived from mnemonic)
```

### 7.3 Emergency Recovery (Metadata Only)

```json
{
  "recovery_bundle": {
    "version": "nzcore-recovery-01",
    "created_at": "2024-01-15T14:30:00Z",
    "essential_documents": [
      "urn:uuid:550e8400-e29b-41d4-a716-446655440000"
    ],
    "trusted_keys": [
      "ed25519:1a2b3c4d5e6f..."
    ],
    "metadata_only": true,
    "checksum": "blake2b-256..."
  }
}

## 8. Test Environment

### 8.1 Creation

```bash
# Create isolated test environment
nzcore testenv create --name "test-run-001"

# Use in tests
import { TestEnvironment } from 'nzcore';
const testEnv = await TestEnvironment.create();
```

### 8.2 Automatic Cleanup

```javascript
// Jest-like setup/teardown
beforeEach(async () => {
  global.testEnv = await TestEnvironment.create();
});

afterEach(async () => {
  await global.testEnv.destroy();
});

## 9. Validation and Integrity Checks

### 9.1 Environment Validation

```javascript
class EnvironmentValidator {
  async validate(envPath) {
    return {
      structure: await this.checkStructure(envPath),
      permissions: await this.checkPermissions(envPath),
      integrity: await this.checkIntegrity(envPath),
      consistency: await this.checkConsistency(envPath),
      security: await this.checkSecurity(envPath)
    };
  }
}
```

### 9.2 Integrity Verification

```javascript
// Verify document chain integrity
async function verifyDocumentChain(env) {
  const documents = await env.documents.list();
  for (const doc of documents) {
    if (doc.type === 'revocation') {
      const target = await env.documents.get(doc.payload.target_id);
      if (!target) {
        throw new Error(`Revocation target missing: ${doc.payload.target_id}`);
      }
    }
  }
}
```

## 10. Performance Considerations

### 10.1 Lazy Loading

```javascript
// Documents loaded on-demand
class LazyDocumentStore {
  async get(id) {
    if (!this.cache[id]) {
      this.cache[id] = await this.loadFromFile(id);
    }
    return this.cache[id];
  }
}
```

### 10.2 Index Optimization

```javascript
// Keep indices in memory, persist periodically
class DocumentIndex {
  constructor() {
    this.inMemory = new Map();
    this.persisted = false;
  }
  
  async persist() {
    if (this.dirty) {
      await writeIndexToFile(this.inMemory);
      this.dirty = false;
    }
  }
}
```

## 11. Monitoring and Observability

### 11.1 Health Metrics

```json
{
  "environment_health": {
    "keys": {
      "identity": { "status": "valid", "age_days": 5 },
      "ecdh": { "status": "valid", "age_days": 5 }
    },
    "documents": {
      "total": 42,
      "active": 40,
      "revoked": 2,
      "expired": 0
    },
    "storage": {
      "used_bytes": 1048576,
      "available_bytes": 1073741824
    },
    "uptime_seconds": 86400
  }
}
```

### 11.2 Alert Conditions
- Identity key > 90 days old
- Disk space < 100MB
- Document index corrupted
- Permission violations detected


