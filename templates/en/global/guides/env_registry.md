# env_registry.json

- `vars[]`: environment variable registry.
- `vars[].name`: exact env var name.
- `vars[].required`: boolean required flag.
- `vars[].example`: safe example value, never a real secret.
- `vars[].description`: purpose and usage.
- `vars[].owner`: task id or module that introduced it.

Invariants:
- Never store real secrets.
- Register new env vars when code starts reading them.