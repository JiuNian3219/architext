# design_tokens.json

- `aestheticDirection`: visual direction/preset.
- `primitivePalette`: base color palette.
- `semanticTokens`: role-based colors and states.
- `typography`: font families, sizes, weights.
- `spacing`: spacing scale.
- `radius`: corner radius scale.
- `motion`: animation timing/easing.

Invariants:
- UI code should use tokens, not hard-coded visual constants.
- Keep light/dark or state variants consistent when present.