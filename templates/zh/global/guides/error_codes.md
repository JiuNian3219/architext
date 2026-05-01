# error_codes.json

- `codes[]`: project business error codes.
- `codes[].code`: stable code, format `ERR_<MODULE>_<REASON>`.
- `codes[].message`: user/developer visible message.
- `codes[].recovery`: suggested recovery action.
- `codes[].owner`: task id or module that owns the error.

Invariants:
- Codes are append/stabilize by default; do not silently rename used codes.
- Only register project/business errors, not generic framework errors.
