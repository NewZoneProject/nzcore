# NewZoneCore Cryptographic Specification

## 1. Overview

This document specifies the cryptographic algorithms, key derivation procedures, and security protocols used by NewZoneCore. The design follows these principles:

- **Determinism over randomness** where possible
- **Modern, audited algorithms** with wide adoption
- **Defense in depth** with layered key derivation
- **No master key storage** on device
- **Offline-first** operation

## 2. Algorithm Suite

### 2.1 Primary Algorithms

| Purpose | Algorithm | Parameters | Notes |
|---------|-----------|------------|-------|
| Digital Signatures | Ed25519 | RFC 8032 | Pure Ed25519 (not Ed25519ph/ctx) |
| Key Agreement | X25519 | RFC 7748 | Curve25519 in Montgomery form |
| Hash Function | BLAKE2b | RFC 7693 | Variable output length (1-64 bytes) |
| Password KDF | scrypt | RFC 7914 | N=32768, r=8, p=1, dkLen=32 |
| Key Derivation | HKDF | RFC 5869 | Using BLAKE2b as PRF |
| AEAD Cipher | ChaCha20-Poly1305 | RFC 8439 | IETF variant (96-bit nonce) |

### 2.2 Algorithm Identifiers

```javascript
// Used in proof.algo and key_id prefixes
const ALGO = {
  ED25519: 'ed25519',
  X25519: 'x25519',
  BLAKE2B: 'blake2b',
  CHACHA20_POLY1305: 'chacha20-poly1305'
};
```

## 3. Key Hierarchy

### 3.1 Full Derivation Chain

```text
User Memory/Paper
    │
    └── BIP-39 Mnemonic (24 words, 256-bit entropy)
            │
            ├──▶ Seed (32 bytes)
            │       │
            │       └──▶ Master Key (32 bytes)
            │               │
            │               ├──▶ Identity Key (Ed25519)
            │               ├──▶ ECDH Key (X25519)
            │               ├──▶ Service Keys (various)
            │               └──▶ Recovery Bundle (encrypted)
            │
            └──▶ Paper Backup (QR + human-readable)
```

### 3.2 Key Generation Timeline

```text
Time 0: [Offline] User generates mnemonic (24 words)
Time 1: [Setup] Password → scrypt → Master Key
Time 2: [Setup] Master Key → HKDF → Identity Key (Ed25519)
Time 3: [Daily] Identity Key signs documents
Time 4: [Recovery] Mnemonic + Password → repeat above
```

## 4. Detailed Derivation Procedures

### 4.1 Mnemonic → Seed (BIP-39 variant)

```javascript
// Input: 24-word BIP-39 mnemonic
// Output: 32-byte seed
function mnemonicToSeed(mnemonic) {
  // 1. Convert mnemonic to entropy per BIP-39
  const entropy = bip39.mnemonicToEntropy(mnemonic); // 256 bits
  
  // 2. Hash entropy with BLAKE2b-256 (not PBKDF2)
  return blake2b(entropy, 32);
}
```

Note: We use BLAKE2b instead of PBKDF2 for the final seed derivation, maintaining BIP-39 wordlist and checksum.

### 4.2 Password → Master Key (scrypt)

```javascript
// Input: User password (string), optional salt
// Output: 32-byte master key
function deriveMasterKey(password, salt = 'nzcore-master-salt') {
  return scryptSync(
    password,
    salt,
    { N: 32768, r: 8, p: 1, dkLen: 32 }
  );
}
```

### 4.3 Master Key → Identity Key (HKDF + Ed25519)

```javascript
// Input: 32-byte master key
// Output: { seed: 32 bytes, public: 32 bytes }
function deriveIdentityKey(masterKey) {
  // 1. Derive Ed25519 seed via HKDF
  const seed = hkdf(
    hash: 'blake2b',
    ikm: masterKey,
    salt: null,
    info: 'nzcore:key:identity',
    length: 32
  );
  
  // 2. Generate Ed25519 keypair from seed
  const publicKey = ed25519.getPublicKey(seed);
  
  return {
    seed: seed,        // Private key (32-byte seed)
    public: publicKey  // Public key (32 bytes)
  };
}
```

### 4.4 Master Key → ECDH Key (HKDF + X25519)

```javascript
function deriveECDHKey(masterKey) {
  // 1. Derive X25519 seed
  const seed = hkdf(
    hash: 'blake2b',
    ikm: masterKey,
    salt: null,
    info: 'nzcore:key:ecdh',
    length: 32
  );
  
  // 2. Generate X25519 keypair
  const publicKey = x25519.scalarMultBase(seed);
  
  return {
    private: seed,     // Private scalar (32 bytes, clamped)
    public: publicKey  // Public point (32 bytes)
  };
}
```

### 4.5 Service Key Derivation

```javascript
// Derive keys for specific services/contexts
function deriveServiceKey(masterKey, serviceName, purpose) {
  return hkdf(
    hash: 'blake2b',
    ikm: masterKey,
    salt: null,
    info: `nzcore:service:${serviceName}:${purpose}`,
    length: 32
  );
}

// Examples:
deriveServiceKey(mk, 'logging', 'encryption');   // Log encryption key
deriveServiceKey(mk, 'queue', 'mac');           // Message queue MAC key
deriveServiceKey(mk, 'cache', 'aead');          // Cache encryption key
```

## 5. Key Identifiers (key_id Format)

### 5.1 Structure

```text
{algorithm}:{public_key_hex}
```

### 5.2 Examples

```text
ed25519:1a2b3c4d5e6f... (64 hex chars, 32 bytes)
x25519:abcdef012345...   (64 hex chars, 32 bytes)
```

### 5.3 Usage in Documents

```json
{
  "issuer": { "key_id": "ed25519:1a2b3c4d5e6f..." },
  "subject": { "key_id": "ed25519:abcdef012345..." }
}
```

## 6. Document Signing Protocol

### 6.1 Signature Creation

```javascript
function signDocument(document, privateSeed) {
  // 1. Ensure document has metadata and payload
  const { metadata, payload } = document;
  
  // 2. Create canonical JSON representation
  const canonical = canonicalize({ metadata, payload });
  
  // 3. Hash with BLAKE2b-256
  const hash = blake2b(canonical, 32);
  
  // 4. Sign with Ed25519
  const signature = ed25519.sign(hash, privateSeed);
  
  // 5. Add proof to document
  document.proof = {
    algo: 'ed25519',
    hash: 'blake2b-256',
    signature: base64.encode(signature)
  };
  
  return document;
}
```

### 6.2 Signature Verification

```javascript
function verifyDocument(document, publicKey) {
  // 1. Extract proof
  const { proof, metadata, payload } = document;
  
  // 2. Validate proof structure
  if (proof.algo !== 'ed25519') return false;
  if (proof.hash !== 'blake2b-256') return false;
  
  // 3. Recreate canonical JSON
  const canonical = canonicalize({ metadata, payload });
  
  // 4. Recompute hash
  const hash = blake2b(canonical, 32);
  
  // 5. Decode signature
  const signature = base64.decode(proof.signature);
  
  // 6. Verify
  return ed25519.verify(hash, signature, publicKey);
}
```

## 7. Secure Channel Primitives (Future Use)

### 7.1 Handshake Protocol (X25519 + Ed25519)

```text
Label: "NZ-CRYPTO-02/handshake/v1"

Alice → Bob:
  - ephemeral_pub: X25519 public key
  - signature: Ed25519 sign(label || ephemeral_pub)

Bob → Alice:
  - ephemeral_pub: X25519 public key
  - signature: Ed25519 sign(label || ephemeral_pub)
  - shared_secret: X25519(priv, peer_pub)

Both derive session keys from shared_secret via HKDF.
```

### 7.2 Session Key Derivation

```javascript
function deriveSessionKeys(sharedSecret, context) {
  const send = hkdf(
    hash: 'blake2b',
    ikm: sharedSecret,
    info: `${context}:send`,
    length: 32
  );
  
  const recv = hkdf(
    hash: 'blake2b',
    ikm: sharedSecret,
    info: `${context}:recv`,
    length: 32
  );
  
  return { send, recv };
}
```

## 8. AEAD Encryption (ChaCha20-Poly1305)

### 8.1 Encryption

```javascript
function encrypt(key, nonce, plaintext, aad = null) {
  // key: 32 bytes, nonce: 12 bytes
  const cipher = new ChaCha20Poly1305(key);
  return cipher.encrypt(nonce, plaintext, aad);
  // Returns { ciphertext, tag (16 bytes) }
}
```

### 8.2 Decryption

```javascript
function decrypt(key, nonce, ciphertext, tag, aad = null) {
  const cipher = new ChaCha20Poly1305(key);
  return cipher.decrypt(nonce, ciphertext, tag, aad);
  // Returns plaintext or null on auth failure
}
```

## 9. Randomness Generation

### 9.1 Sources

**Cryptographic RNG**: `crypto.getRandomValues()` / `/dev/urandom`

**Deterministic generation**: HKDF from known seed + context

**Mixed entropy**: For key generation where needed

### 9.2 Random Functions

```javascript
function randomBytes(length) {
  // Uses system CSPRNG
  return crypto.getRandomValues(new Uint8Array(length));
}

function randomSeed() {
  return randomBytes(32);  // For Ed25519/X25519 keys
}

function randomNonce() {
  return randomBytes(12);  // For ChaCha20-Poly1305
}
```

## 10. Key Storage and Protection

### 10.1 What is Stored

```text
env/keys/
├── identity.json    # { public: base64, private: base64 } - ENCRYPTED
├── ecdh.json        # { public: base64, private: base64 } - ENCRYPTED
└── service_*.json   # Service keys (encrypted)
```

### 10.2 Encryption at Rest

```javascript
function encryptKey(keyMaterial, kek) {
  // kek: Key Encryption Key (derived from user password)
  const nonce = randomBytes(12);
  const { ciphertext, tag } = encrypt(kek, nonce, keyMaterial);
  return {
    encrypted: base64.encode(ciphertext),
    tag: base64.encode(tag),
    nonce: base64.encode(nonce),
    algo: 'chacha20-poly1305'
  };
}
```

### 10.3 What is NOT Stored

Master key (only in memory during setup)

BIP-39 mnemonic (user responsibility)

Plaintext private keys

## 11. Recovery Procedures

### 11.1 Full Recovery

```text
Input: Mnemonic (24 words) + Password
Steps:
  1. mnemonic → seed (BLAKE2b)
  2. password + seed → master key (scrypt)
  3. master key → identity/ecdh keys (HKDF)
  4. Re-encrypt keys with new KEK
```

### 11.2 Partial Recovery (Lost Password)

```text
If password lost but mnemonic known:
  1. User must set new password
  2. New master key derived (mnemonic + new password)
  3. All derived keys change (identity changes!)
  4. Previous documents still valid (different key)
```

### 11.3 Catastrophic Recovery (Lost Everything)

```text
If device + mnemonic lost:
  - Identity cannot be recovered
  - Start fresh with new mnemonic
  - Previous documents remain valid but unusable
```

## 12. Security Considerations

### 12.1 Side-Channel Protection

Use constant-time operations for signature verification

Use timing-safe comparison for MACs

Clear sensitive memory after use

### 12.2 Algorithm Agility

All algorithm identifiers in metadata

Future algorithms can be added with new identifiers

Old documents remain valid with original algorithms

### 12.3 Key Compromise Response

Create revocation document for compromised key

Generate new identity from mnemonic + password

Re-issue essential documents with new key

Update trust registries

### 12.4 Quantum Resistance Considerations

Ed25519/X25519 vulnerable to quantum computers

Document format supports future post-quantum algorithms

Migration path: new document types with new crypto

## 13. Test Vectors

### 13.1 Key Derivation Test

```text
Mnemonic: "abandon abandon ... art" (standard BIP-39)
Password: "testpassword123"
Expected:
  - Seed: 32-byte deterministic value
  - Master Key: 32-byte deterministic value
  - Identity Public Key: 32-byte deterministic
```

### 13.2 Signature Test

```text
Document: { metadata: {...}, payload: {...} }
Private Key: known 32-byte seed
Expected Signature: known 64-byte value
```

## 14. Compliance and Auditing

### 14.1 Standards Compliance

RFC 8032 (Ed25519)

RFC 7748 (X25519)

RFC 7693 (BLAKE2b)

RFC 5869 (HKDF)

RFC 7914 (scrypt)

RFC 8439 (ChaCha20-Poly1305)

### 14.2 Audit Requirements

Annual cryptographic review

Third-party penetration testing

Algorithm updates tracked in ADRs


