# NewZoneCore

NewZoneCore is a personal autonomous Root of Trust.

It represents a user as a cryptographic entity and guarantees identity and origin — not behavior.

## Project Status

Specification-first project.
Reference implementation pending.

## Scope

NewZoneCore defines the cryptographic foundation only.
Networking, transport, UI, and policy engines are explicitly out of scope.

## Design Goals

- Offline-first
- Deterministic from mnemonic
- Minimal and stable core
- No external trust authorities
- Explicit validation model

## Architectural Guarantees

- Logical monotonic time model
- Fork detection (no implicit resolution)
- RFC 8785 canonical JSON signing
- Explicit trust evaluation layers
- Cryptographic suite versioning

The Core participates in the birth of trust, not in its daily life.

## License

TBD
