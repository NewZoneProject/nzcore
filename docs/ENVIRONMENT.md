# ENVIRONMENT

Directory layout:

/env
  meta.json
  keys/
  documents/
  factchain/

meta.json is the single source of truth for logical_clock.

Rules:
- logical_clock MUST increase strictly
- last_state_hash MUST update per commit
- Implementations MUST fsync state before acknowledging commit
