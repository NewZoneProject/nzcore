# nzcore 🔐

[![npm version](https://img.shields.io/npm/v/nzcore.svg)](https://www.npmjs.com/package/nzcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js Version](https://img.shields.io/node/v/nzcore)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue)](https://www.typescriptlang.org/)

**Personal autonomous Root of Trust** — deterministic identity and cryptographic document chain based on RFC 8785 (Canonical JSON), Ed25519, BIP-39, logical time, and fork detection.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Project Status](#-project-status)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Documentation](#-documentation)
- [Usage Examples](#-usage-examples)
- [Security](#-security)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 📖 Project Overview

**nzcore** is a cryptographic library for creating a personal autonomous Root of Trust. It provides deterministic identity and maintains an immutable chain of signed documents without relying on external services or system time.

### Core Purpose

- **Deterministic Identity**: Your identity is derived solely from a BIP-39 mnemonic phrase
- **Cryptographic Document Chain**: Each document is signed and linked to the previous one via hash
- **Logical Time**: Monotonic counter instead of system time for security decisions
- **Fork Detection**: Automatic detection of chain divergences

### Trust Architecture

```
BIP-39 Mnemonic → Seed → Master Key → Identity
                       ↓
            Document Chain (Ed25519)
                       ↓
            RFC 8785 Canonical JSON
                       ↓
            Logical Time (monotonic)
```

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔑 **Deterministic Identity** | Identity derived solely from 24-word BIP-39 mnemonic phrase |
| 📝 **Canonical JSON (RFC 8785)** | Deterministic serialization for reproducible signatures |
| ⏰ **Logical Time** | Monotonic counter without system clock dependencies |
| 🔍 **Fork Detection** | Automatic detection of chain divergences |
| 🛡️ **Secure Memory** | Zeroization of sensitive data after use |
| 🔐 **Multi-layer Trust** | Structural → Cryptographic → Policy validation |
| 🌐 **Cross-platform** | Works in Node.js and browsers |
| 📦 **Minimal Dependencies** | Only audited cryptographic libraries |

---

## 📊 Project Status

| Parameter | Value |
|-----------|-------|
| **Version** | 1.0.0 |
| **Status** | ✅ Production Ready |
| **Minimum Node.js** | 18.0.0+ |
| **TypeScript Types** | ✅ Included |
| **License** | MIT / Apache-2.0 (dual) |

---

## 🚀 Quick Start

### 1. Installation

```bash
npm install nzcore
```

### 2. Create Identity

```typescript
import { generateIdentity, NewZoneCore } from 'nzcore';

// Generate new identity (24-word BIP-39 mnemonic)
const { mnemonic, core } = await generateIdentity();
console.log('Mnemonic:', mnemonic); // ⚠️ Store securely!
console.log('Public Key:', core.getPublicKeyHex());
console.log('Chain ID:', core.getChainId());
```

### 3. Create and Sign Document

```typescript
const doc = await core.createDocument('profile', {
  name: 'Alice Johnson',
  email: 'alice@example.com'
});

console.log('Document ID:', doc.id);
console.log('Signature:', doc.signature);
```

### 4. Verify Document

```typescript
const result = await core.verifyDocument(doc);
console.log('Valid:', result.final); // true if valid
```

### 5. Export/Import State

```typescript
// Export chain state
const state = core.exportState();

// Create new instance and import
const newCore = await NewZoneCore.create(mnemonic);
newCore.importState(state);
```

### 6. Detect Forks

```typescript
const forks = core.detectFork();
if (forks.length > 0) {
  console.log('⚠️ Fork detected:', forks);
  // Core does NOT resolve forks automatically
}
```

### 7. Secure Cleanup

```typescript
// Securely zeroize private key
core.destroy();
```

---

## 📦 Installation

### From npm

```bash
npm install nzcore
```

### From GitHub (Development)

```bash
git clone https://github.com/NewZoneProject/nzcore.git
cd nzcore
npm install
npm run build
```

### System Requirements

| Component | Requirement |
|-----------|-------------|
| **Node.js** | 18.0.0 or higher |
| **npm** | 7.0.0 or higher |
| **Operating System** | Linux, macOS, Windows |
| **Memory** | Minimum 256 MB RAM |

---

## 📚 Documentation

Complete documentation is organized into the following sections:

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, component and data flow diagrams |
| [API.md](./API.md) | Complete API reference with examples |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment and integration guide |
| [SECURITY.md](./SECURITY.md) | Security model and best practices |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contributor guidelines |

### Additional Specifications

The [`specs/`](./specs/) folder contains detailed specifications:

- `TRUST_MODEL.md` — Trust model (three validation layers)
- `CRYPTO_SPEC.md` — Cryptographic stack (nzcore-crypto-01)
- `IDENTITY_MODEL.md` — Identity model
- `DOCUMENT_SYSTEM.md` — Document system
- `TIME_MODEL.md` — Logical time model
- `FORK_MODEL.md` — Fork detection model
- `THREAT_MODEL.md` — Threat model

---

## 💡 Usage Examples

### Basic Example

```bash
npm run example:basic
```

Source: [`examples/basic-usage.ts`](./examples/basic-usage.ts)

### Advanced Example

```bash
npm run example:advanced
```

Source: [`examples/advanced-usage.ts`](./examples/advanced-usage.ts)

### Usage Scenarios

#### 1. Personal Data Store

```typescript
// Create chain of personal data
const profile = await core.createDocument('profile', {
  name: 'Alice',
  publicKey: '...'
});

const settings = await core.createDocument('settings', {
  theme: 'dark',
  language: 'en'
});

const activity = await core.createDocument('activity', {
  action: 'login',
  timestamp: Date.now()
});
```

#### 2. Audit Logging

```typescript
// Immutable event log
const auditLog = await core.createDocument('audit', {
  event: 'data_access',
  userId: '123',
  resource: '/api/data'
});
```

#### 3. External Data Verification

```typescript
// Verify document through three trust layers
const result = await core.verifyDocument(document);
console.log('Structural validity:', result.structural_valid);
console.log('Cryptographic validity:', result.cryptographic_valid);
console.log('Policy validity:', result.policy_valid);
console.log('Final result:', result.final);
```

---

## 🛡️ Security

### Cryptographic Stack (nzcore-crypto-01)

| Component | Implementation |
|-----------|----------------|
| **Digital Signatures** | Ed25519 (@noble/ed25519) |
| **Hashing** | BLAKE2b-256 (@noble/hashes) |
| **KDF** | scrypt (N=32768, r=8, p=1) |
| **Key Derivation** | HKDF-SHA256 |
| **Mnemonic** | BIP-39 (@scure/bip39) |
| **Canonicalization** | RFC 8785 Canonical JSON |

### Security Principles

1. **Deterministic Identity**: Identity is a function of mnemonic only
2. **No External Dependencies**: No system time dependencies for security decisions
3. **Secure Memory**: All sensitive data is zeroized before garbage collection
4. **Constant-Time Operations**: Comparison operations run in constant time
5. **Manual Fork Resolution**: Core detects but never resolves forks automatically

### Best Practices

```typescript
// ✅ GOOD: Store mnemonic in secure storage
const { mnemonic } = await generateIdentity();
await secureStorage.save('mnemonic', mnemonic);

// ✅ GOOD: Destroy instance after use
core.destroy();

// ❌ BAD: Store mnemonic in code or environment variables
const MNEMONIC = process.env.MNEMONIC; // Never do this!
```

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Individual Tests

```bash
# Integration tests
node --test dist/test/integration.test.js

# Debug tests
node --test dist/test/debug.test.js

# Mnemonic tests
node --test dist/test/mnemonic-debug.test.js
```

### Test Structure

| Test Type | Description |
|-----------|-------------|
| **Unit Tests** | Testing individual components |
| **Integration Tests** | Testing complete workflows |
| **Security Tests** | Verifying security properties |

### Code Coverage

```bash
npx c8 npm test
```

---

## 🤝 Contributing

We welcome contributions! Please see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

### Development Setup

```bash
# Clone repository
git clone https://github.com/NewZoneProject/nzcore.git
cd nzcore

# Install dependencies
npm install

# Build project
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new features
4. Ensure all tests pass
5. Update documentation
6. Submit Pull Request

---

## 📄 License

Dual-licensed (your choice):

- **MIT License** — see `LICENSE-MIT` file
- **Apache License 2.0** — see `LICENSE-APACHE` file

---

## 🙏 Acknowledgments

This library uses the following open-source projects:

- **[@noble/ed25519](https://github.com/paulmillr/noble-ed25519)** — Ed25519 implementation
- **[@noble/hashes](https://github.com/paulmillr/noble-hashes)** — Cryptographic hash functions
- **[@scure/bip39](https://github.com/paulmillr/scure-bip39)** — BIP-39 implementation
- **[canonicalize](https://github.com/bergos/canonicalize)** — JSON canonicalization (RFC 8785)

---

## 📞 Support

| Channel | Link |
|---------|------|
| **GitHub Issues** | [Report an issue](https://github.com/NewZoneProject/nzcore/issues) |
| **npm** | [Package on npm](https://www.npmjs.com/package/nzcore) |
| **Repository** | [GitHub](https://github.com/NewZoneProject/nzcore) |

### Security Vulnerabilities

For reporting security vulnerabilities, please contact project maintainers **privately**. Do not disclose vulnerabilities publicly before they are resolved.

---

## 📖 Glossary

| Term | Definition |
|------|------------|
| **Root of Trust** | Source of truth for verification |
| **Mnemonic** | 24-word phrase for identity recovery (BIP-39) |
| **Chain ID** | Unique identifier for document chain |
| **Logical Time** | Monotonic counter for document ordering |
| **Fork** | Situation where two documents reference the same parent hash |
| **Canonical JSON** | Deterministic JSON serialization (RFC 8785) |

---

*Last updated: February 20, 2026*
