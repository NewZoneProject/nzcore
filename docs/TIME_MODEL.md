# TIME_MODEL

Logical Time is authoritative.

Invariant:
logical_time(n+1) > logical_time(n)

Expiration and revocation MUST use logical_time only.
