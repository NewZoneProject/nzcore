# API_SPEC

All API calls MUST be deterministic.
No API call may depend on system wall-clock time for security decisions.

Core API MUST expose:

- create_document(type, payload)
- verify_document(document)
- get_chain_state()
- detect_fork()

detect_fork() MUST NOT attempt automatic resolution.

Validation result:

{
  structural_valid: bool,
  cryptographic_valid: bool,
  policy_valid: bool,
  final: bool
}
