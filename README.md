# nzcore 🔐

[![npm version](https://img.shields.io/npm/v/nzcore.svg)](https://www.npmjs.com/package/nzcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js Version](https://img.shields.io/node/v/nzcore)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue)](https://www.typescriptlang.org/)

**Personal autonomous Root of Trust** - deterministic identity and cryptographic document chain.
Built on RFC 8785 (Canonical JSON), Ed25519, BIP-39, logical time, and fork detection.

## 📋 Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Overview](#api-overview)
- [Security](#security)
- [Documentation](#documentation)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **🔑 Deterministic Identity** - Identity derived solely from BIP-39 mnemonic
- **📝 Canonical JSON** - RFC 8785 compliant for deterministic signatures
- **⏰ Logical Time** - Monotonic counters, no wall-clock dependencies
- **🔍 Fork Detection** - Automatic detection, manual resolution required
- **🛡️ Memory Safety** - Secure zeroization of sensitive data
- **🔐 Multi-layer Trust** - Structural → Cryptographic → Policy validation
- **🌐 Cross-platform** - Works in Node.js and browsers
- **📦 Zero Dependencies** - Only cryptographic libraries

## 🚀 Installation

### From npm
```bash
npm install nzcore
```

### From GitHub
```bash
git clone https://github.com/NewZoneProject/nzcore.git
cd nzcore
npm install
npm run build
```

### Requirements
- Node.js 18.0.0 or higher
- npm 7.0.0 or higher

## 🏃 Quick Start
**1. Create a new identity**
```typescript
import { generateIdentity, NewZoneCore } from 'nzcore';

// Generate random identity (24-word BIP-39 mnemonic)
const { mnemonic, core } = await generateIdentity();
console.log('Mnemonic:', mnemonic); // ⚠️ Store securely!
console.log('Public key:', core.getPublicKeyHex());
console.log('Chain ID:', core.getChainId());
```

**2. Create and sign a document**
```typescript
// Create a document
const doc = await core.createDocument('profile', {
  name: 'Alice',
  email: 'alice@example.com'
});

console.log('Document ID:', doc.id);
console.log('Signature:', doc.signature);
```

**3. Verify document**
```typescript
const result = await core.verifyDocument(doc);
console.log('Valid:', result.final); // true if valid
```

**4. Export and import state**
```typescript
// Export current chain state
const state = core.exportState();

// Create new instance and import state
const newCore = await NewZoneCore.create(mnemonic);
newCore.importState(state);

// Continue from where you left off
const nextDoc = await newCore.createDocument('profile', {
  name: 'Alice',
  updated: true
});
```

**5. Detect forks**
```typescript
const forks = core.detectFork();
if (forks.length > 0) {
  console.log('⚠️ Fork detected:', forks);
  // Core never resolves forks automatically
}
```

**6. Clean up**
```typescript
// Securely zeroize private key
core.destroy();
```

## 📚 API Overview
### Core Classes
| Class |  Description |
| ----- |  ----------- |
| `NewZoneCore` |	Main entry point for all operations |
| `Mnemonic` |	BIP-39 mnemonic generation and validation |
| `IdentityDerivation` |	Deterministic key derivation |
| `DocumentBuilder` |	Fluent API for document creation |
| `DocumentValidator` |	Three-layer validation |
| `ChainStateManager` |	Chain state management |
| `LogicalClock` |	Monotonic logical time |
| `ForkDetector` |	Fork detection utilities |

### Key Methods
`NewZoneCore.create(mnemonic: string, options?: Options): Promise<NewZoneCore>`

Create a new instance from mnemonic.

`createDocument(type: string, payload?: object): Promise<Document>`

Create and sign a new document.

`verifyDocument(document: Document): Promise<ValidationResult>`

Verify document through all trust layers.

`getChainState(): ChainState`

Get current chain state snapshot.

`detectFork(): ForkInfo[]`

Detect any forks in the chain.

`exportState(): Uint8Array`

Export chain state for persistence.

`importState(state: Uint8Array): void`

Import previously exported state.

`destroy(): void`

Securely zeroize sensitive data.

## 🛡️ Security
### Security Features
- **Deterministic Identity**: Identity is a pure function of mnemonic only
- **No External Dependencies**: No wall-clock time used for security decisions
- **Memory Zeroization**: All sensitive data is overwritten before garbage collection
- **Constant-time Operations**: Comparison operations are constant-time
- **Fork Detection**: Automatic detection, manual resolution only

### Best Practices
1. **Store mnemonic offline**: Never store in code or environment variables
2. **Regular backups**: Export chain state regularly
3. **Manual fork resolution**: Never automate fork resolution
4. **Destroy instances**: Always call `destroy()` when done

## 📖 Documentation
### Generate documentation locally
```bash
# Install TypeDoc
npm install --save-dev typedoc

# Generate docs
npm run docs

# Serve docs locally
npx serve docs
```

## 🧪 Testing
```bash
# Run all tests
npm test

# Run specific test
node --test dist/test/debug.test.js
node --test dist/test/integration.test.js
node --test dist/test/mnemonic-debug.test.js
```

### Test Structure
- **Unit tests**: Test individual components
- **Integration tests**: Test full workflows
- **Security tests**: Verify security properties

## 🤝 Contributing
We welcome contributions! Please see CONTRIBUTING.md

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
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Update documentation
6. Submit pull request

## 📄 License
Dual-licensed under either:
- MIT License
- Apache License 2.0

at your option.

## 🙏 Acknowledgments
- [@noble/ed25519](https://github.com/paulmillr/noble-ed25519) - Ed25519 implementation
- [@noble/hashes](https://github.com/paulmillr/noble-hashes) - Cryptographic hashes
- [@scure/bip39](https://github.com/paulmillr/scure-bip39) - BIP-39 implementation
- [canonicalize](https://github.com/bergos/canonicalize) - RFC 8785 JSON canonicalization

## 📞 Support
Issues: [GitHub Issues](https://github.com/NewZoneProject/nzcore/issues)
