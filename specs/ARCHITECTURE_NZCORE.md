# ARCHITECTURE_NZCORE

This document is normative. All MUST/SHALL statements are binding for compliant implementations.

## 1. Core Responsibility

The Core:
- MUST create identity
- MUST sign documents
- MUST validate structure and signatures
- MUST maintain deterministic document chain

The Core MUST NOT:
- Route messages
- Resolve forks automatically
- Interpret payload semantics

## 2. Chain Model

Each environment is a linear document chain.

Every document MUST contain:
- chain_id
- parent_hash
- logical_time
- crypto_suite

Fork definition:
Two documents referencing the same parent_hash.

Core MUST detect forks and MUST NOT resolve them automatically.

## 3. Logical Time

Logical time:
- MUST be monotonic
- MUST be stored in env/meta.json
- MUST be used for ordering, revocation and expiration

Wall clock time:
- MUST NOT be used for security decisions
