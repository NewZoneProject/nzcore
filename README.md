# NewZoneCore

**NewZoneCore** is a personal autonomous Root of Trust.

It represents the user as a cryptographic entity and guarantees **identity and origin** — not behavior.

## Core Philosophy

NewZoneCore is **not**:
- a message router
- a service orchestrator
- a network proxy
- a global truth provider

NewZoneCore **is**:
- a personal digital passport
- a root key holder
- a cryptographic notary
- a trust and identity anchor

**Fundamental rule:**
The Core participates in the **birth of trust**, not in its daily life.

## Document-Centric System

Everything in NewZoneCore is a **signed document**.

Five canonical types:
- **Entity** — a subject (user, device, service)
- **Delegation** — rights granted from one key to another
- **Ownership** — key lineage and origin
- **Revocation** — cancellation of keys or documents
- **Fact** — immutable event log

The Core does not interpret document payloads — it only validates structure and signatures.

## Cryptographic Foundation

- **Ed25519** — signatures
- **X25519** — ECDH key agreement
- **BLAKE2b** — hashing
- **BIP-39** — 24-word mnemonic phrases
- **scrypt + HKDF** — hierarchical key derivation

**Master key never resides on the device.**
Only delegated identity keys are used for daily operations.

## Core Principles

- **Offline-first** — no network required
- **User sovereignty** — no external authorities
- **Minimalism** — every line of code is justified
- **Determinism** — full reproducibility from seed
- **Portability** — runs on Linux, Termux, macOS
- **Stability** — the Core is designed to remain unchanged

## What NewZoneCore Enables

A system where users truly own their identity.
No servers. No clouds. No third-party trust.
Only cryptography and autonomy.

---

**NewZoneCore is not a library, not a framework, not a service.**
**It is a foundation.**
