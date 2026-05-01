# Spec-Status Detection

Read tasks/<ID>_<Slug>/spec.md frontmatter Spec-Status field.

| Spec-Status | Handling |
|---|---|
| Full | Enter sub-protocol main flow directly |
| Stub | Enter Stub Enrich flow (see below) |
| Missing | Treat as Full (backward compatible with old spec), but sub-protocol Verify phase silent-audit must output INFO prompt to add frontmatter |

# Stub Enrich Flow (Only triggered by Stub)

1. Inform user: "This Task is currently a lightweight snapshot (Stub), must complete full spec before continuing."
2. Extract source code paths (entry + core logic) from spec.md "Related Files" section.
3. Read source code one by one, extract:
   - Interface signatures / type definitions / exports
   - Main flow behaviors (infer Gherkin Scenarios)
   - Error handling paths
4. Based on source code analysis, complete spec.md: Preserve original "Overview" and "Related Files" sections, append Gherkin Scenarios + interface/type definitions.
5. Update frontmatter: Spec-Status: Stub → Full.
[[WHEN: ui | 6. When module has UI, sync complete ui.md; if new screens needed:
   [[SKILL: archi-ui-wireframe | Call skill to generate screens]]
   [[NO-SKILL: (Please read [[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md, and execute in current context per its protocol)]]
]]
7. If plan.json doesn't exist, generate a placeholder plan.json (all tasks marked done, corresponding to implemented behaviors).
8. Output completed spec summary to user.

# Gate

After user confirms completion result, return to sub-protocol main flow next step.

# Exception Handling

- "Related Files" missing or path doesn't exist / moved → Prompt user to update related paths, terminate Enrich.
- Source code too large to read at once → Call archi-code-survey SUBAGENT for summary then complete.