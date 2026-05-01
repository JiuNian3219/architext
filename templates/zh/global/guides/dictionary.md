# dictionary.json

- `terms[]`: approved business terms.
- `terms[].term`: canonical human-readable term.
- `terms[].codeName`: canonical code identifier.
- `terms[].definition`: short meaning.
- `terms[].forbiddenSynonyms[]`: names that must not be used.
- `verbs[]`: approved action names when present.
- `components[]`: reusable UI/business components when present.

Invariants:
- One concept should have one canonical `codeName`.
- Do not register framework/library concepts as business terms.
