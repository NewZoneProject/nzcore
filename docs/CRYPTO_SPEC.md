# CRYPTO_SPEC

## crypto_suite: nzcore-crypto-01

- Ed25519
- X25519
- BLAKE2b-256
- scrypt (N=32768,r=8,p=1)
- HKDF-SHA256

All cryptographic operations MUST use constant-time implementations.
Private keys MUST be zeroized from memory after use.

## Identity Model

Mnemonic (BIP-39) → Master Seed → Identity Root Key

Password:
- Protects encrypted storage only
- MUST NOT affect identity derivation

Identity is derived solely from mnemonic.

## Cryptographic Agility

Documents MUST include:

"crypto_suite": "nzcore-crypto-01"

Deprecated suites MUST remain verifiable but MUST NOT be used for new documents.
