# Test Quality Standard

When writing tests or generating test plans, tests must prove behavior is correct, not prove implementation "was called" or "file exists".

- **Behavior First**: Assert user-visible behavior, public APIs, command output, persisted results, error types or state changes; avoid only asserting mock call counts, function types, object non-empty.
- **Narrow Assertions**: Key outputs prefer `toBe` / `toEqual` / `toMatchObject` / precise error types; `toContain` only for text search, cannot replace structural or behavioral verification.
- **Must Cover Failure Paths**: New/fix critical logic must include at least two of: normal path, boundary inputs, error inputs, or permission/state anomalies; Bug fix must have reproduction test that fails first.
- **Real Test Data**: Include null values, extra spaces, newlines, Unicode, invalid formats, duplicates, missing fields etc noise; prohibit only using perfectly fitting data.
- **Integration Tests Must Verify Content**: Generated files, scaffolds, renders, command execution tests must verify key content/structure/diff; cannot only check path exists or JSON parseable.
- **Avoid Implementation Coupling**: Test public contracts and observable results, don't lock down internal private functions, temporary variable names or implementation order.
- **Deduplication**: Same logic use `test.each` or shared helper to merge; prohibit copying a set of tests only changing names.
- **Acceptance Mapping**: Each new test must map to `spec.md` AC, `plan.json` `tests` entry, or this bug's reproduction steps.