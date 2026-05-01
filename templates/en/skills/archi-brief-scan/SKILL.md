---
name: archi-brief-scan
description: Parse project briefs and linked assets for /archi.init. Must run in isolated context/subagent. Protocol-invoked only; do not auto-trigger from casual user requests.
disable-model-invocation: true
allowed-tools: Read, Glob, WebFetch
---

## Invocation

- **Auto-invoke**: No, not triggered by model based on description.
- **Trigger location**: Only explicitly called via `[[SUBAGENT]]` / `[[NO-SUBAGENT]]` in `/archi.*` protocols.
- **Execution context**: When subagent supported must execute in independent subagent/independent context; only downgrade to inline Skill when no subagent.
- **Boundary**: Only return protocol-required structured artifacts, subsequent write, confirm and signoff handled by calling protocol.


## Design Conventions

1. **No Side Effects**: Do not write files, do not execute commands
2. **Parse + Scan + Check Three-in-One**: Brief location / Asset inventory / External reference reachability completed in one pass
3. **User Interaction Extracted**: unreachable only output as field to main agent, this skill does not do [A/B/C] Gate
4. **Missing Exits**: When Brief completely doesn't exist return `{ status: "no_brief" }`, caller decides next steps

## Execution Phases

### step_a_locate Locate Brief

1. If caller passes `brief_path` → Use that path
2. Otherwise search in following order, take first existing non-empty file:
   - `project-brief.md` (project root directory)
   - `[[__DOCS_DIR__]]/project-brief.md`
3. If none exist or all candidates empty → Return `{ status: "no_brief" }` and exit

Output: `brief_file_path` or `no_brief` status.

### step_b_asset_scan Asset Inventory and Reachability

Prerequisite: step_a successfully obtained `brief_file_path`.

**b.1 `brief-assets/` directory scan**: Check if `brief-assets/` exists in project root, if exists recursively enumerate all files, record path and type (image / pdf / json / md / schema / txt / other). Read content of readable files; binary only record meta info (type + size).

**b.2 Brief full text external reference scan**: Match Markdown links `[text](URL)` / `![alt](URL)`, bare URLs `https?://...`, relative paths `./...` / `../...`. For each reference determine type:

| Type | Determination | Handling |
|:---|:---|:---|
| `brief-assets/` local file | Path starts with `./brief-assets/` or `brief-assets/` | Match with b.1 results, mark `[reachable-local]` |
| Public HTTP(S) URL | Accessible (no auth) | Try to read, success mark `[reachable-remote]`, failure mark `[unreadable]` |
| Auth-required link | Returns 401/403 or Notion/Google Drive private link | Mark `[unreadable-auth-required]` |
| Dead link | 404/timeout | Mark `[unreadable-dead]` |
| Pure descriptive reference | Not real URL (e.g. "refer to iOS HIG guidelines") | Mark `[descriptive-no-access-needed]` |

**b.3 Asset semantic tag extraction**: Resources referenced in Brief with `- [semantic-tag] path` format (or variant `path — semantic-tag`), record mapping:

| Semantic tag | Route impact |
|:---|:---|
| `[competitor-ref]` / `[visual-ref]` | design_tokens / vision.md Visual Reference |
| `[brand-guide]` | design_tokens primitivePalette |
| `[db-schema]` / `[Schema]` | data_snapshot.json |
| `[API-doc]` / `[OpenAPI]` | api_snapshot.json + vision.md Context |
| `[existing-code]` | Prompt caller this scenario better suited for inherit |
| `[brand-logo]` / `[assets]` | Only record reference relationship, does not affect constitution files |
| Other custom tags | Preserve as-is, caller interprets

Output: `asset_inventory`, containing `local_assets` / `external_refs` (with reachability status) / `tagged_assets` (semantic tag → resource path mapping) / `unreachable` (inaccessible resource list).

### step_c_brief_parse Parse Brief Fields

Parse Brief sections, extract following fields (missing fields return null, do not fabricate data):

- `identity`: { projectName, oneLiner, problemStatement }
- `targetUsers`: [{ role, description }]
- `featureTags`: [ui / data / cli / lib / api / mobile / desktop / miniapp / extension / realtime / ai]
- `coreTasks`: [{ title, description, dependencies? }]
- `businessFlow`: Business flow description (preserve original)
- `predefinedDecisions`: Design decisions user has made
- `techStack`: { language, runtime, framework, database, deployment, ... } (distinguish filled / empty / recommended)
- `dataModel`: Data model draft (if any)
- `existingAPI`: Existing API endpoints (if any)
- `existingResources`: Design specs/brand/existing services etc
- `boundaries`: Anti-goals and hard constraints
- `styleTone`: Style tone (only ui/cli/api related fields)
- `successMetrics`: Success metrics
- `references`: Reference projects
- `supplementaryNotes`: Supplementary notes original text (preserve for subsequent routing to 90_custom_rules)

Output: `brief_data` structured object.

### step_e_return Return Results

```
{
  status:          "ok" | "no_brief",
  brief_file_path: string | null,
  brief_data:      <step_c result> | null,
  asset_inventory: <step_b result> | null
}
```