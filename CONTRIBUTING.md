# Contributing to nzcore

Thank you for your interest in contributing to **nzcore**! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Setup](#-development-setup)
- [Project Structure](#-project-structure)
- [Coding Standards](#-coding-standards)
- [Testing Guidelines](#-testing-guidelines)
- [Documentation](#-documentation)
- [Commit Guidelines](#-commit-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Issue Reporting](#-issue-reporting)
- [Release Process](#-release-process)

---

## 🤝 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone. We welcome contributors of all backgrounds and identities.

### Expected Behavior

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

---

## 🚀 Getting Started

### First Contributions

If you're new to open source, here are some ways to get started:

1. **Fix a typo** in documentation
2. **Improve error messages** for better clarity
3. **Add tests** for existing functionality
4. **Report bugs** with detailed reproduction steps
5. **Suggest features** via GitHub Issues

### Good First Issues

Look for issues labeled:
- `good first issue` — Suitable for newcomers
- `help wanted` — Need community help
- `documentation` — Documentation improvements

---

## 🛠️ Development Setup

### Prerequisites

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18.0.0+ | Runtime |
| npm | 7.0.0+ | Package manager |
| Git | 2.0+ | Version control |

### Clone and Install

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/nzcore.git
cd nzcore

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Development Workflow

```bash
# 1. Create a branch for your feature
git checkout -b feature/your-feature-name

# 2. Make changes and run tests
npm run build
npm test

# 3. Lint your code
npm run lint

# 4. Commit your changes
git commit -m "feat: add your feature description"

# 5. Push to your fork
git push origin feature/your-feature-name
```

---

## 📁 Project Structure

```
nzcore/
├── src/                    # Source code
│   ├── index.ts           # Main entry point
│   ├── core.ts            # NewZoneCore class
│   ├── types.ts           # Type definitions
│   ├── constants.ts       # Constants
│   │
│   ├── identity/          # Identity management
│   ├── document/          # Document system
│   ├── chain/             # Chain state
│   ├── crypto/            # Cryptographic primitives
│   └── utils/             # Utilities
│
├── test/                   # Test files
├── examples/               # Usage examples
├── specs/                  # Technical specifications
├── docs/                   # Generated documentation
│
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript config
└── CONTRIBUTING.md        # This file
```

---

## 📝 Coding Standards

### TypeScript Guidelines

#### Strict Mode

All code must pass strict TypeScript checks:

```typescript
// ✅ GOOD: Explicit types
function add(a: number, b: number): number {
  return a + b;
}

// ❌ BAD: Implicit any
function add(a, b) {
  return a + b;
}
```

#### Error Handling

```typescript
// ✅ GOOD: Specific error types
import { NewZoneCoreError, ERROR_CODES } from './types.js';

function validateMnemonic(mnemonic: string): void {
  if (!Mnemonic.validate(mnemonic)) {
    throw new NewZoneCoreError(
      ERROR_CODES.INVALID_MNEMONIC,
      'Invalid BIP-39 mnemonic'
    );
  }
}

// ❌ BAD: Generic errors
throw new Error('Something went wrong');
```

#### Async/Await

```typescript
// ✅ GOOD: Async/await
async function createDocument(type: string): Promise<Document> {
  const doc = await builder.build();
  return doc;
}

// ❌ BAD: Promise chains
function createDocument(type: string): Promise<Document> {
  return builder.build().then(doc => doc);
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Classes** | PascalCase | `NewZoneCore`, `DocumentBuilder` |
| **Functions** | camelCase | `generateIdentity`, `verifyDocument` |
| **Constants** | UPPER_SNAKE_CASE | `CRYPTO_SUITE`, `ERROR_CODES` |
| **Types/Interfaces** | PascalCase | `Document`, `ValidationResult` |
| **Private fields** | #prefix | `#privateField`, `#privateMethod()` |

### Code Style

```typescript
// ✅ GOOD: Consistent formatting
export class DocumentBuilder {
  #doc: Partial<Document> = {};

  constructor() {
    this.#doc.version = DOCUMENT_VERSION;
  }

  async build(): Promise<Document> {
    this.validate();
    return this.#doc as Document;
  }

  private validate(): void {
    // Validation logic
  }
}

// Use single quotes for strings
const SUITE = 'nzcore-crypto-01';

// Use trailing commas for multi-line objects
const config = {
  N: 32768,
  r: 8,
  p: 1,
};
```

### Security-Sensitive Code

```typescript
// ✅ GOOD: Zeroize sensitive data
import { zeroize } from './utils/zeroize.js';

function processKey(key: Uint8Array): void {
  try {
    // Use key
  } finally {
    zeroize(key); // Always cleanup
  }
}

// ✅ GOOD: Constant-time comparison
import { constantTimeEqual } from './utils/zeroize.js';

function verifySignature(a: Uint8Array, b: Uint8Array): boolean {
  return constantTimeEqual(a, b); // Not: a === b
}
```

---

## 🧪 Testing Guidelines

### Test Structure

```typescript
// test/example.test.ts
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { NewZoneCore } from '../src/index.js';

describe('NewZoneCore', () => {
  let core: NewZoneCore;

  before(async () => {
    // Setup
    const { mnemonic } = await generateIdentity();
    core = await NewZoneCore.create(mnemonic);
  });

  after(() => {
    // Cleanup
    core.destroy();
  });

  it('should create a document', async () => {
    const doc = await core.createDocument('test', { data: 'value' });
    assert.ok(doc.id);
    assert.ok(doc.signature);
  });

  it('should verify a valid document', async () => {
    const doc = await core.createDocument('test', { data: 'value' });
    const result = await core.verifyDocument(doc);
    assert.strictEqual(result.final, true);
  });
});
```

### Test Categories

| Category | Location | Purpose |
|----------|----------|---------|
| **Unit Tests** | `test/*.test.ts` | Test individual components |
| **Integration Tests** | `test/integration.test.ts` | Test component interactions |
| **Security Tests** | `test/security.test.ts` | Verify security properties |

### Coverage Requirements

```bash
# Run tests with coverage
npx c8 npm test

# Minimum coverage: 80%
# Critical paths: 100%
```

### Test Naming

```typescript
// ✅ GOOD: Descriptive names
it('should reject invalid mnemonic', async () => {...});
it('should zeroize private key on destroy', async () => {...});

// ❌ BAD: Vague names
it('should work', async () => {...});
it('test1', async () => {...});
```

---

## 📖 Documentation

### Code Comments

```typescript
// ✅ GOOD: Explain why, not what
/**
 * Derive identity from mnemonic.
 * Uses Scrypt for memory-hard KDF to prevent GPU attacks.
 * See BIP-39 specification for mnemonic format.
 */
async function deriveIdentity(mnemonic: string): Promise<Identity> {
  // Scrypt parameters chosen for ~100ms derivation time
  const scryptKey = Scrypt.derive(seed, salt);
  return IdentityDerivation.fromKey(scryptKey);
}

// ❌ BAD: Obvious comments
// Generate mnemonic
const mnemonic = Mnemonic.generate();
```

### JSDoc Comments

```typescript
/**
 * Create and sign a new document.
 * 
 * @param type - Document type (e.g., 'profile', 'settings')
 * @param payload - Document payload data
 * @returns Signed document with cryptographic signature
 * @throws {NewZoneCoreError} With code INVALID_SIGNATURE if signing fails
 * 
 * @example
 * ```typescript
 * const doc = await core.createDocument('profile', {
 *   name: 'Alice',
 *   email: 'alice@example.com'
 * });
 * ```
 */
async createDocument(type: string, payload?: DocumentPayload): Promise<Document> {
  // Implementation
}
```

### README Updates

When adding new features:

1. Update the main README.md
2. Add usage examples
3. Update API.md if API changes
4. Update ARCHITECTURE.md if architecture changes

---

## 📦 Commit Guidelines

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Test additions/changes |
| `chore` | Build/config changes |
| `security` | Security fixes |

### Examples

```bash
# Feature
feat(identity): add support for custom derivation paths

# Bug fix
fix(document): correct canonical JSON serialization for nested objects

# Documentation
docs(api): add examples for DocumentBuilder methods

# Breaking change
feat(crypto)!: migrate to new cryptographic suite

BREAKING CHANGE: Documents created with old crypto suite will require migration.
```

### Commit Best Practices

```bash
# ✅ GOOD: Atomic commits
git add src/crypto/ed25519.ts
git commit -m "feat(crypto): improve Ed25519 error handling"

# ❌ BAD: Large mixed commits
git add .
git commit -m "Update everything"
```

---

## 🔀 Pull Request Process

### Before Submitting

```bash
# 1. Ensure your branch is up to date
git fetch origin
git rebase origin/main

# 2. Run all tests
npm test

# 3. Run linter
npm run lint

# 4. Build the project
npm run build

# 5. Check for type errors
npx tsc --noEmit
```

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (would require version bump)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added (if applicable)
- [ ] Test coverage maintained or improved

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added where necessary
- [ ] Documentation updated
- [ ] No new warnings introduced
```

### Review Process

1. **Automated Checks** — CI must pass
2. **Code Review** — At least one maintainer approval
3. **Testing** — Changes tested by reviewer if needed
4. **Merge** — Squash and merge by maintainer

### Review Response Time

- **Bug fixes**: Within 48 hours
- **Features**: Within 1 week
- **Documentation**: Within 1 week

---

## 🐛 Issue Reporting

### Bug Report Template

```markdown
## Description
Clear description of the bug

## Reproduction
Steps to reproduce:
1. ...
2. ...
3. ...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- nzcore version: 
- Node.js version:
- Operating system:

## Additional Context
Screenshots, logs, or other context
```

### Feature Request Template

```markdown
## Problem Statement
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
Other approaches you've thought about

## Use Cases
Who would benefit from this feature?

## Additional Context
Any other relevant information
```

---

## 📤 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH

MAJOR — Incompatible API changes
MINOR — Backwards-compatible features
PATCH — Backwards-compatible bug fixes
```

### Release Checklist

```markdown
## Pre-release
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Git tag created

## Post-release
- [ ] Published to npm
- [ ] Release notes on GitHub
- [ ] Documentation deployed
```

### Publishing

```bash
# Bump version (choose appropriate level)
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Push with tags
git push --follow-tags

# Publish to npm
npm publish
```

---

## 🏆 Recognition

Contributors are recognized in:

- **README.md** — Notable contributors section
- **GitHub Contributors** — Automatic via GitHub
- **Release Notes** — Major contributors mentioned

---

## 📞 Getting Help

| Channel | Purpose |
|---------|---------|
| **GitHub Issues** | Bug reports, feature requests |
| **GitHub Discussions** | Questions, ideas |
| **Email** | Security issues (see SECURITY.md) |

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's dual license (MIT/Apache-2.0).

---

*Last updated: February 20, 2026*
