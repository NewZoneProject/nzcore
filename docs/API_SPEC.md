# NewZoneCore API Specification

## 1. Overview

NewZoneCore provides three API layers for different integration scenarios:

1. **Core Library** — ES modules for direct programmatic use
2. **CLI** — Command-line interface for manual operations
3. **HTTP API** — RESTful interface for remote integration
4. **IPC** — Local inter-process communication

All APIs operate on the same underlying document model and cryptographic primitives.

## 2. Core Library (Primary API)

### 2.1 Module Structure

```javascript
// Main entry points
import {
  // Environment management
  Environment,
  TestEnvironment,
  
  // Document operations
  Document,
  DocumentFactory,
  DocumentValidator,
  
  // Cryptographic operations
  Crypto,
  KeyManager,
  TrustManager,
  
  // Utilities
  utils,
  constants,
  errors
} from 'nzcore';
```

### 2.2 Environment API

```javascript
class Environment {
  // Constructor
  static async create(path: string, options?: Object): Promise<Environment>
  static async load(path: string): Promise<Environment>
  static async recover(options: RecoveryOptions): Promise<Environment>
  
  // Properties
  readonly path: string
  readonly meta: EnvironmentMeta
  readonly keys: KeyStore
  readonly documents: DocumentStore
  readonly trust: TrustStore
  readonly log: LogStore
  
  // Methods
  async initialize(options: InitOptions): Promise<void>
  async isInitialized(): Promise<boolean>
  async validate(): Promise<ValidationReport>
  async backup(targetPath: string): Promise<void>
  async destroy(): Promise<void>
  
  // Lifecycle
  async lock(): Promise<void>      // Clear sensitive data from memory
  async unlock(password: string): Promise<void>
  async isLocked(): boolean
}
```

### 2.3 Document API
```javascript
class DocumentFactory {
  // Create new documents
  async createEntity(payload: Object, options?: CreateOptions): Promise<Document>
  async createDelegation(payload: Object, options?: CreateOptions): Promise<Document>
  async createOwnership(payload: Object, options?: CreateOptions): Promise<Document>
  async createRevocation(targetId: string, reason: string, options?: CreateOptions): Promise<Document>
  async createFact(payload: Object, options?: CreateOptions): Promise<Document>
  
  // Sign existing document
  async sign(unsigned: Object, keyId?: string): Promise<Document>
  
  // Verify document
  async verify(document: Document | Object): Promise<VerificationResult>
}

class DocumentStore {
  // CRUD operations
  async add(document: Document): Promise<string>  // Returns document ID
  async get(id: string): Promise<Document | null>
  async update(id: string, updates: Partial<Document>): Promise<void>
  async remove(id: string): Promise<void>
  
  // Query
  async list(filter?: DocumentFilter): Promise<Document[]>
  async findByIssuer(issuerKeyId: string): Promise<Document[]>
  async findBySubject(subjectKeyId: string): Promise<Document[]>
  async findByType(type: DocumentType): Promise<Document[]>
  
  // Bulk operations
  async import(documents: Document[]): Promise<string[]>
  async export(filter?: DocumentFilter): Promise<Document[]>
}
```

### 2.4 Cryptographic API

```javascript
class Crypto {
  // Key generation
  static async generateMnemonic(strength: 128 | 160 | 192 | 224 | 256 = 256): Promise<string>
  static async mnemonicToSeed(mnemonic: string): Promise<Uint8Array>
  static async deriveMasterKey(seed: Uint8Array, password: string): Promise<Uint8Array>
  
  // Key derivation
  static async deriveIdentityKey(masterKey: Uint8Array): Promise<KeyPair>
  static async deriveECDHKey(masterKey: Uint8Array): Promise<KeyPair>
  static async deriveServiceKey(masterKey: Uint8Array, service: string, purpose: string): Promise<Uint8Array>
  
  // Sign/verify
  static async sign(data: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array>
  static async verify(data: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): Promise<boolean>
  
  // Encryption
  static async encrypt(key: Uint8Array, plaintext: Uint8Array, aad?: Uint8Array): Promise<{ciphertext: Uint8Array, tag: Uint8Array}>
  static async decrypt(key: Uint8Array, ciphertext: Uint8Array, tag: Uint8Array, aad?: Uint8Array): Promise<Uint8Array | null>
}

class KeyManager {
  // Key storage
  async storeKey(key: KeyPair, name: string, options?: StoreOptions): Promise<string>
  async getKey(id: string): Promise<KeyPair | null>
  async listKeys(filter?: KeyFilter): Promise<KeyInfo[]>
  async rotateKey(id: string): Promise<string>  // Returns new key ID
  
  // Key usage
  async signWithKey(keyId: string, data: Uint8Array): Promise<Uint8Array>
  async getPublicKey(keyId: string): Promise<Uint8Array>
  
  // Key protection
  async lock(): Promise<void>      // Clear all private keys from memory
  async unlock(password: string): Promise<void>
}
```

### 2.5 Trust API

```javascript
class TrustManager {
  // Trust management
  async trustKey(keyId: string, metadata?: Object): Promise<void>
  async untrustKey(keyId: string): Promise<void>
  async isTrusted(keyId: string): Promise<boolean>
  async listTrustedKeys(): Promise<TrustedKey[]>
  
  // Document trust
  async trustDocument(documentId: string, reason?: string): Promise<void>
  async untrustDocument(documentId: string): Promise<void>
  async isDocumentTrusted(documentId: string): Promise<boolean>
  
  // Policy
  async setPolicy(policy: TrustPolicy): Promise<void>
  async getPolicy(): Promise<TrustPolicy>
  async evaluate(document: Document): Promise<TrustEvaluation>
}
```

## 3. Command Line Interface (CLI)

### 3.1 Command Structure

```text
nzcore [global-options] <command> [command-options] [arguments]
```

### 3.2 Global Options

```bash
--env, -e PATH      # Environment path (default: ./env)
--verbose, -v       # Verbose output
--quiet, -q         # Quiet mode
--version           # Show version
--help              # Show help
```

### 3.3 Core Commands

#### 3.3.1 Environment Management

```bash
# Initialize new environment
nzcore init [--name NAME] [--path PATH]

# Setup from mnemonic
nzcore setup --generate [--words 24]
nzcore setup --restore [--mnemonic "word1 word2..."]

# Environment status
nzcore status
nzcore doctor
nzcore validate

# Backup and recovery
nzcore backup [--output PATH]
nzcore recover --mnemonic "words..." [--path PATH]
```

#### 3.3.2 Document Operations

```bash
# Create documents
nzcore document create --type entity --payload '{...}'
nzcore document create --type delegation --payload '{...}'
nzcore document create --type revocation --target ID --reason "compromised"

# List and query
nzcore document list [--type TYPE] [--issuer KEY_ID] [--subject KEY_ID]
nzcore document get ID
nzcore document search --query QUERY

# Sign and verify
nzcore document sign FILE.json [--key KEY_ID]
nzcore document verify FILE.json
nzcore document verify --id DOCUMENT_ID

# Import/export
nzcore document import FILE.json [--validate]
nzcore document export --type TYPE --output FILE.json
3.3.3 Key Management
bash
# List keys
nzcore key list
nzcore key info KEY_ID

# Key operations
nzcore key generate --name "my-key" [--type ed25519|x25519]
nzcore key rotate KEY_ID
nzcore key delete KEY_ID

# Export public keys
nzcore key export KEY_ID --format json|pem|hex
3.3.4 Trust Management
bash
# Trust keys
nzcore trust key add KEY_ID [--name NAME] [--expires DATE]
nzcore trust key remove KEY_ID
nzcore trust key list

# Trust documents
nzcore trust document add DOCUMENT_ID [--reason REASON]
nzcore trust document remove DOCUMENT_ID
nzcore trust document list

# Policy management
nzcore trust policy set FILE.json
nzcore trust policy show
3.3.5 Crypto Operations
bash
# Mnemonic operations
nzcore crypto mnemonic generate [--words 24]
nzcore crypto mnemonic validate "word1 word2..."

# Encryption/decryption
nzcore crypto encrypt --key KEY_ID --input FILE --output FILE.enc
nzcore crypto decrypt --key KEY_ID --input FILE.enc --output FILE

# Sign/verify data
nzcore crypto sign --key KEY_ID --input FILE --signature FILE.sig
nzcore crypto verify --key KEY_ID --input FILE --signature FILE.sig
```

### 3.4 Utility Commands

```bash
# Log viewing
nzcore log show [--tail N] [--follow]
nzcore log search --query QUERY

# Configuration
nzcore config get [KEY]
nzcore config set KEY VALUE
nzcore config list

# System info
nzcore info
nzcore stats
nzcore version
```

### 3.5 Interactive Mode

```bash
# Start interactive shell
nzcore shell

# In-shell commands
> env.status()
> docs = documents.list({type: 'entity'})
> key = keys.get('identity')
> trust.isTrusted('ed25519:abc...')
```

## 4. HTTP API

### 4.1 Server Configuration

```javascript
// Starting the HTTP server
const { HTTPServer } = require('nzcore');
const server = new HTTPServer({
  port: 3000,
  host: '127.0.0.1',
  auth: {
    type: 'token',
    token: process.env.API_TOKEN
  },
  cors: {
    origin: ['https://app.example.com']
  }
});
await server.start();
```

### 4.2 Authentication

All endpoints require authentication via:

```bash
# Header
Authorization: Bearer nz_sk_1234567890abcdef

# Or query parameter
GET /documents?token=nz_sk_1234567890abcdef
```

### 4.3 API Endpoints

#### 4.3.1 Health & Status

```http
GET /health
Response: {
  "status": "ok",
  "version": "1.0.0",
  "uptime": 3600,
  "environment": {
    "initialized": true,
    "locked": false,
    "documents_count": 42
  }
}

GET /status
GET /metrics
```

#### 4.3.2 Document Endpoints

```http
# List documents
GET /documents
Query params: type, issuer, subject, limit, offset
Response: {
  "documents": [...],
  "total": 100,
  "limit": 20,
  "offset": 0
}

# Get document
GET /documents/{id}
Response: Document

# Create document
POST /documents
Body: {
  "type": "entity",
  "payload": {...},
  "options": {...}
}
Response: { "id": "urn:uuid:...", "document": {...} }

# Verify document
POST /documents/verify
Body: Document
Response: {
  "valid": true,
  "reason": "signature_valid",
  "details": {...}
}

# Batch operations
POST /documents/batch
Body: {
  "operations": [
    {"action": "create", "document": {...}},
    {"action": "verify", "id": "..."}
  ]
}
Response: {
  "results": [...]
}
```

#### 4.3.3 Key Endpoints

```http
# List keys
GET /keys
Response: {
  "keys": [
    {
      "id": "identity",
      "type": "ed25519",
      "public_key": "base64...",
      "created_at": "...",
      "metadata": {...}
    }
  ]
}

# Get key info
GET /keys/{id}
Response: KeyInfo

# Create signature
POST /keys/{id}/sign
Body: {
  "data": "base64...",
  "format": "raw|hex|base64"
}
Response: {
  "signature": "base64...",
  "algorithm": "ed25519"
}

# Verify signature
POST /keys/{id}/verify
Body: {
  "data": "base64...",
  "signature": "base64..."
}
Response: { "valid": true }
```

#### 4.3.4 Trust Endpoints

```http
# Trust management
POST /trust/keys
Body: {
  "key_id": "ed25519:...",
  "metadata": {...}
}
Response: { "trusted": true }

DELETE /trust/keys/{key_id}
GET /trust/keys

# Document trust
POST /trust/documents
Body: { "document_id": "urn:uuid:..." }
DELETE /trust/documents/{document_id}
GET /trust/documents

# Policy
GET /trust/policy
PUT /trust/policy
Body: TrustPolicy
```

#### 4.3.5 Crypto Endpoints

```http
# Mnemonic generation
POST /crypto/mnemonic
Body: { "strength": 256 }
Response: { "mnemonic": "word1 word2 ..." }

# Encryption
POST /crypto/encrypt
Body: {
  "key_id": "...",
  "data": "base64...",
  "aad": "base64..."
}
Response: {
  "ciphertext": "base64...",
  "tag": "base64...",
  "algorithm": "chacha20-poly1305"
}

# Decryption
POST /crypto/decrypt
Body: {
  "key_id": "...",
  "ciphertext": "base64...",
  "tag": "base64...",
  "aad": "base64..."
}
Response: { "data": "base64..." }
```

#### 4.3.6 System Endpoints

```http
# Environment lock/unlock
POST /system/lock
POST /system/unlock
Body: { "password": "..." }

# Backup
POST /system/backup
Response: { "backup_id": "...", "size": 1024 }

# Restore
POST /system/restore
Body: { "backup_id": "..." }

# Configuration
GET /config
PUT /config/{key}
Body: { "value": "..." }
```

### 4.4 Error Responses

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "INVALID_DOCUMENT",
    "message": "Document validation failed",
    "details": {
      "field": "metadata.id",
      "reason": "invalid_uuid_format"
    },
    "timestamp": "2024-01-20T10:30:00Z",
    "request_id": "req_123456"
  }
}
```

**Common error codes:**

`UNAUTHORIZED` — Authentication required

`INVALID_TOKEN` — Invalid authentication token

`ENVIRONMENT_LOCKED` — Environment is locked

`DOCUMENT_NOT_FOUND` — Document doesn't exist

`KEY_NOT_FOUND` — Key doesn't exist

`INVALID_SIGNATURE` — Signature verification failed

`TRUST_REQUIRED` — Operation requires trust relationship

## 5. IPC (Inter-Process Communication)

### 5.1 Socket Configuration

```javascript
// UNIX socket (Linux/macOS)
const socketPath = '/tmp/nzcore.sock'

// Windows named pipe
const socketPath = '\\\\.\\pipe\\nzcore'

// Abstract socket (Linux)
const socketPath = '\0nzcore'
```

### 5.2 Protocol

```javascript
// Request format
{
  "id": "req_123456",
  "method": "document.create",
  "params": {
    "type": "entity",
    "payload": {...}
  },
  "timestamp": "2024-01-20T10:30:00Z"
}

// Response format
{
  "id": "req_123456",
  "result": {...},
  "error": null,
  "timestamp": "2024-01-20T10:30:01Z"
}

// Error response
{
  "id": "req_123456",
  "result": null,
  "error": {
    "code": "INVALID_PARAMS",
    "message": "Missing required parameter: type"
  },
  "timestamp": "2024-01-20T10:30:01Z"
}
```

### 5.3 Available Methods

```javascript
// Document methods
"document.create"
"document.get"
"document.list"
"document.verify"
"document.sign"

// Key methods
"key.list"
"key.get"
"key.sign"
"key.verify"

// Trust methods
"trust.key.add"
"trust.key.remove"
"trust.key.list"
"trust.document.add"

// System methods
"system.status"
"system.lock"
"system.unlock"
"system.backup"

// Batch operations
"batch.execute"  // Multiple operations in one call
```

### 5.4 Client Example

```javascript
import { IPCClient } from 'nzcore';

const client = new IPCClient('/tmp/nzcore.sock');

// Single request
const result = await client.request({
  method: 'document.create',
  params: {
    type: 'entity',
    payload: { name: 'Alice' }
  }
});

// Batch request
const batchResult = await client.batch([
  { method: 'document.create', params: {...} },
  { method: 'key.sign', params: {...} }
]);

// Subscription (events)
const subscription = await client.subscribe('document.created', (event) => {
  console.log('New document:', event.document);
});
```

## 6. Integration Examples

### 6.1 Direct Library Integration

```javascript
import { Environment, DocumentFactory } from 'nzcore';

async function createUserIdentity(name, email) {
  // Load environment
  const env = await Environment.load('./env');
  
  // Create entity document
  const factory = new DocumentFactory(env);
  const entity = await factory.createEntity({
    entity_type: 'user',
    attributes: { name, email }
  });
  
  // Store document
  const docId = await env.documents.add(entity);
  
  // Trust this entity
  await env.trust.trustDocument(docId, {
    reason: 'self_identity'
  });
  
  return {
    document_id: docId,
    key_id: env.keys.identity.publicKey,
    entity
  };
}
```

### 6.2 CLI Script Integration

```bash
#!/bin/bash
# create-user.sh

# Generate mnemonic if needed
if [ ! -f "env/seed.txt" ]; then
  nzcore setup --generate --words 24 --password "$PASSWORD"
fi

# Create user entity
nzcore document create --type entity \
  --payload '{"entity_type":"user","attributes":{"name":"Alice","email":"alice@example.com"}}' \
  --output alice-entity.json

# Export public key for sharing
nzcore key export identity --format pem > alice-public.pem

echo "User identity created: alice-entity.json"
```

### 6.3 HTTP API Integration (Python)

```python
import requests
import json

class NZCoreClient:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def create_document(self, doc_type, payload):
        response = requests.post(
            f'{self.base_url}/documents',
            headers=self.headers,
            json={
                'type': doc_type,
                'payload': payload
            }
        )
        response.raise_for_status()
        return response.json()
    
    def verify_document(self, document):
        response = requests.post(
            f'{self.base_url}/documents/verify',
            headers=self.headers,
            json=document
        )
        return response.json()

# Usage
client = NZCoreClient('http://localhost:3000', 'nz_sk_123456')
result = client.create_document('entity', {
    'entity_type': 'device',
    'attributes': {'name': 'Phone', 'model': 'XYZ'}
})
```

### 6.4 IPC Integration (Node.js Service)

```javascript
// service.js
const { IPCClient } = require('nzcore');

class DocumentService {
  constructor(socketPath) {
    this.client = new IPCClient(socketPath);
  }
  
  async validateUserDocument(userDoc) {
    // Verify document signature
    const verification = await this.client.request({
      method: 'document.verify',
      params: { document: userDoc }
    });
    
    if (!verification.valid) {
      throw new Error(`Invalid document: ${verification.reason}`);
    }
    
    // Check if issuer is trusted
    const isTrusted = await this.client.request({
      method: 'trust.key.check',
      params: { key_id: userDoc.metadata.issuer.key_id }
    });
    
    return isTrusted.trusted;
  }
  
  async signResponse(responseData) {
    return await this.client.request({
      method: 'key.sign',
      params: {
        key_id: 'identity',
        data: Buffer.from(JSON.stringify(responseData)).toString('base64')
      }
    });
  }
}
```

## 7. Error Handling

### 7.1 Common Error Patterns

```javascript
try {
  const result = await env.documents.add(document);
} catch (error) {
  switch (error.code) {
    case 'DUPLICATE_DOCUMENT':
      // Handle duplicate ID
      break;
    case 'INVALID_SIGNATURE':
      // Handle invalid signature
      break;
    case 'ENVIRONMENT_LOCKED':
      // Environment needs unlocking
      await env.unlock(password);
      break;
    default:
      throw error;
  }
}
```

### 7.2 Retry Logic

```javascript
async function withRetry(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (error.code === 'ENVIRONMENT_LOCKED' && i < maxRetries - 1) {
        await sleep(100 * Math.pow(2, i)); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
}
```

## 8. Security Considerations

### 8.1 API Security

```javascript
// Rate limiting
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per window
};

// Input validation
function validateDocumentInput(input) {
  if (!input.type || !input.payload) {
    throw new Error('INVALID_INPUT');
  }
  // Additional validation...
}

// Output sanitization
function sanitizeDocumentOutput(doc) {
  const sanitized = { ...doc };
  delete sanitized.proof?.signature; // Don't expose signatures in listings
  return sanitized;
}
```

### 8.2 Authentication Best Practices

```javascript
// Token rotation
async function rotateAPIToken(oldToken) {
  const newToken = generateSecureToken();
  await revokeToken(oldToken);
  await storeToken(newToken);
  return newToken;
}

// Session management
class APISession {
  constructor() {
    this.sessions = new Map();
    this.maxAge = 24 * 60 * 60 * 1000; // 24 hours
  }
  
  async validateSession(token) {
    const session = this.sessions.get(token);
    if (!session || Date.now() - session.created > this.maxAge) {
      throw new Error('SESSION_EXPIRED');
    }
    return session;
  }
}
```

## 9. Monitoring and Metrics

### 9.1 API Metrics

```javascript
const metrics = {
  requests: {
    total: 0,
    by_endpoint: {},
    by_method: {},
    errors: 0
  },
  performance: {
    avg_response_time: 0,
    p95_response_time: 0,
    throughput: 0
  },
  security: {
    failed_auth: 0,
    rate_limited: 0,
    invalid_input: 0
  }
};
```

### 9.2 Health Checks

```javascript
async function healthCheck() {
  return {
    api: await checkAPIHealth(),
    environment: await checkEnvironmentHealth(),
    storage: await checkStorageHealth(),
    crypto: await checkCryptoHealth(),
    overall: 'healthy' | 'degraded' | 'unhealthy'
  };
}
```

**Implementation Note**: This specification defines the complete API surface for NewZoneCore v1.0. All implementations must adhere to these interfaces while maintaining backward compatibility for the documented APIs.
