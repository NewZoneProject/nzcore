# DOCUMENT_SYSTEM

All documents MUST use RFC 8785 canonical JSON.

Unknown fields MUST be preserved but MUST NOT affect signature verification.

Required metadata fields:

- type
- version
- id
- chain_id
- parent_hash
- logical_time
- crypto_suite
- created_at

created_at is informational only.

Signature MUST cover canonical JSON excluding the signature field.
