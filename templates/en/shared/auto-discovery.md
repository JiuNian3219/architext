# Auto-Discovery Flow

1. Analyze [context], extract key entities (function name, module name, file path, class name, error message fragment).
2. Match in tasks/ index by following priority:
   - Exact match Task title or slug
   - Fuzzy match Task title (edit distance / keyword overlap)
   - Reverse lookup associated Task via map.json directoryMapping
   - Reverse lookup associated Task via dictionary.json entity registration
3. Match result branching:
   - Unique match → Auto-lock, output "Auto-located to <ID>_<Slug>", enter subprotocol main flow.
   - Multiple matches (≤ 5) → List candidates (ID + Title + one-sentence summary), ask user to select.
   - Multiple matches (> 5) → Error "Ambiguous match, please provide <ID> or more specific description", terminate.
   - No match → Error "No related Task found, please provide <ID> or check description accuracy", terminate.

# Output Contract

- When auto-locked, must explicitly tell user: "Auto-located to FEAT-07_user-login, basis: context mentions 'login button' and exact match with task title".
- User can reply "switch" before subprotocol step_2 to undo selection, return to candidate list or re-provide description.