# Deployment Guide

This guide covers building, deploying, and integrating **nzcore** into your projects.

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Building from Source](#-building-from-source)
- [Build Outputs](#-build-outputs)
- [Using in Projects](#-using-in-projects)
- [Browser Deployment](#-browser-deployment)
- [Node.js Deployment](#-nodejs-deployment)
- [Package Publishing](#-package-publishing)
- [Continuous Integration](#-continuous-integration)
- [Troubleshooting](#-troubleshooting)

---

## 📦 Prerequisites

### Required Software

| Software | Minimum Version | Recommended |
|----------|-----------------|-------------|
| Node.js | 18.0.0 | 20.x LTS |
| npm | 7.0.0 | 10.x |
| Git | 2.0 | Latest |

### Verify Installation

```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 7.0.0 or higher
```

### System Requirements

| Resource | Requirement |
|----------|-------------|
| RAM | 256 MB minimum |
| Disk Space | 100 MB for build |
| OS | Linux, macOS, Windows |

---

## 📥 Installation

### From npm (Recommended)

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

### Verify Installation

```bash
# Check package is installed
npm list nzcore

# Verify build outputs exist
ls -la dist/
```

---

## 🔨 Building from Source

### Clean Build

```bash
# Clean previous build
npm run clean

# Install dependencies
npm install

# Build all targets
npm run build
```

### Build Steps Explained

The build process creates three output targets:

```bash
# 1. ES Modules (for bundlers and modern Node.js)
npm run build:esm

# 2. CommonJS (for require() in Node.js)
npm run build:cjs

# 3. TypeScript Declarations
npm run build:types
```

### Build Configuration

| File | Purpose |
|------|---------|
| `tsconfig.json` | Base TypeScript configuration |
| `tsconfig.esm.json` | ES module build settings |
| `tsconfig.cjs.json` | CommonJS build settings |
| `tsconfig.types.json` | Type declaration settings |

### Build Output Structure

```
dist/
├── esm/           # ES modules
│   ├── index.js
│   ├── core.js
│   ├── types.js
│   ├── constants.js
│   ├── identity/
│   ├── document/
│   ├── chain/
│   ├── crypto/
│   └── utils/
│
├── cjs/           # CommonJS modules
│   ├── index.js
│   ├── core.js
│   └── ...
│
└── types/         # TypeScript declarations
    ├── index.d.ts
    ├── core.d.ts
    └── ...
```

---

## 📦 Using in Projects

### ES Modules (Recommended)

```typescript
// TypeScript or modern JavaScript
import { NewZoneCore, generateIdentity } from 'nzcore';

async function main() {
  const { mnemonic, core } = await generateIdentity();
  const doc = await core.createDocument('test', { data: 'value' });
  console.log(doc);
}
```

### CommonJS

```javascript
// Node.js with require()
const { NewZoneCore, generateIdentity } = require('nzcore');

async function main() {
  const { mnemonic, core } = await generateIdentity();
  const doc = await core.createDocument('test', { data: 'value' });
  console.log(doc);
}
```

### TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

---

## 🌐 Browser Deployment

### Using a Bundler

#### Vite

```bash
npm install vite nzcore
```

```typescript
// src/main.ts
import { generateIdentity } from 'nzcore';

export async function init() {
  const { mnemonic, core } = await generateIdentity();
  return { mnemonic, core };
}
```

#### Webpack

```bash
npm install webpack webpack-cli nzcore
```

```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist'
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};
```

### CDN Usage

nzcore can be loaded via CDN services that support npm packages:

```html
<!DOCTYPE html>
<html>
<head>
  <title>nzcore Browser Example</title>
</head>
<body>
  <script type="module">
    import { generateIdentity } from 'https://cdn.jsdelivr.net/npm/nzcore/+esm';
    
    async function init() {
      const { mnemonic, core } = await generateIdentity();
      console.log('Identity created:', core.getPublicKeyHex());
    }
    
    init();
  </script>
</body>
</html>
```

### Browser Compatibility

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 14+ |
| Edge | 80+ |

---

## 🖥️ Node.js Deployment

### Minimum Node.js Version

nzcore requires Node.js 18.0.0 or higher for ES module support.

### package.json Configuration

```json
{
  "name": "your-project",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "nzcore": "^1.0.0"
  }
}
```

### Example: CLI Application

```typescript
#!/usr/bin/env node
// bin/my-cli.js

import { generateIdentity, NewZoneCore } from 'nzcore';
import { writeFile, readFile } from 'fs/promises';

async function createIdentity() {
  const { mnemonic, core } = await generateIdentity();
  
  // Store securely
  await writeFile('.identity', JSON.stringify({
    mnemonic,
    chainId: core.getChainId()
  }, null, 2));
  
  console.log('Identity created. Store .identity securely!');
  core.destroy();
}

async function loadIdentity() {
  const data = JSON.parse(await readFile('.identity', 'utf-8'));
  const core = await NewZoneCore.create(data.mnemonic);
  return core;
}

// Command handling
const command = process.argv[2];
if (command === 'create') {
  createIdentity().catch(console.error);
} else if (command === 'status') {
  loadIdentity()
    .then(core => {
      console.log('Chain ID:', core.getChainId());
      core.destroy();
    })
    .catch(console.error);
}
```

### Example: Server Application

```typescript
// server.ts
import express from 'express';
import { NewZoneCore } from 'nzcore';

const app = express();
app.use(express.json());

// Store cores in memory (use proper session management in production)
const userCores = new Map<string, NewZoneCore>();

app.post('/api/documents', async (req, res) => {
  const { userId, type, payload } = req.body;
  
  let core = userCores.get(userId);
  if (!core) {
    // Load from secure storage
    const mnemonic = await loadMnemonicFromStorage(userId);
    core = await NewZoneCore.create(mnemonic);
    userCores.set(userId, core);
  }
  
  const doc = await core.createDocument(type, payload);
  res.json(doc);
});

// Cleanup on shutdown
process.on('SIGTERM', () => {
  for (const core of userCores.values()) {
    core.destroy();
  }
  process.exit(0);
});
```

---

## 📤 Package Publishing

### Before Publishing

```bash
# Run all tests
npm test

# Run linter
npm run lint

# Build all targets
npm run build

# Verify build outputs
npm pack --dry-run
```

### Publish to npm

```bash
# Login to npm
npm login

# Publish (make sure you're on main branch)
npm publish
```

### Publish to GitHub Packages

```bash
# Add to .npmrc
# @NewZoneProject:registry=https://npm.pkg.github.com

npm publish --registry=https://npm.pkg.github.com
```

### Version Management

```bash
# Bump version (follows semver)
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# This also creates a git tag
git push --follow-tags
```

---

## 🔄 Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Test
      run: npm test
    
    - name: Lint
      run: npm run lint

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        registry-url: 'https://registry.npmjs.org'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Publish to npm
      run: npm publish --access public
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 🔧 Troubleshooting

### Build Errors

#### "Cannot find module"

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

#### TypeScript Errors

```bash
# Check TypeScript version
npx tsc --version

# Should be 5.3+
# Update if needed
npm install typescript@latest --save-dev
```

### Runtime Errors

#### "ERR_MODULE_NOT_FOUND"

Ensure your package.json has:

```json
{
  "type": "module"
}
```

Or use CommonJS imports:

```javascript
const { NewZoneCore } = require('nzcore');
```

#### "Invalid mnemonic"

Ensure mnemonic is:
- Exactly 24 words
- Valid BIP-39 English words
- Separated by single spaces

```typescript
import { Mnemonic } from 'nzcore';

const valid = Mnemonic.validate(mnemonic);
if (!valid) {
  console.error('Invalid mnemonic format');
}
```

### Performance Issues

#### Slow Build Times

```bash
# Use incremental builds
npm run build:esm -- --watch

# Or use ts-node for development
npm install --save-dev ts-node
```

#### Large Bundle Size

```bash
# Analyze bundle
npm install --save-dev rollup-plugin-visualizer

# Tree-shake unused exports
import { generateIdentity } from 'nzcore'; // Only import what you need
```

---

## 📊 Performance Benchmarks

### Build Performance

| Operation | Time (approx.) |
|-----------|----------------|
| Clean build | 5-10 seconds |
| Incremental build | 1-2 seconds |
| Type check | 3-5 seconds |

### Runtime Performance

| Operation | Time (approx.) |
|-----------|----------------|
| Identity creation | 100-200ms |
| Document creation | 10-20ms |
| Document verification | 5-10ms |
| Fork detection | <1ms per document |

---

## 🔗 Related Documents

- [Architecture](./ARCHITECTURE.md) — System architecture
- [API Reference](./API.md) — Complete API documentation
- [Security](./SECURITY.md) — Security best practices
- [Contributing](./CONTRIBUTING.md) — Development guidelines

---

*Last updated: February 20, 2026*
