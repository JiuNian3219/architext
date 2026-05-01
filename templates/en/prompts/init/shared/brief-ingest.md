<shared_brief_ingest>
**Contract**:
- **Input**: Caller provides `brief_path` (optional, empty triggers default path search)
- **Output**: Structured Brief data object + asset inventory, injected into caller context
- **Failure Mode**: When Brief completely does not exist, return `{ status: "no_brief" }`, caller decides next steps

<step_a_locate>
**Action**:
1. If caller passes `brief_path` → Use that path
2. Otherwise search in following order, take first existing non-empty file:
   - `project-brief.md` (project root directory)
   - `[[__DOCS_DIR__]]/project-brief.md`
3. If none exist or all candidates empty → Return `{ status: "no_brief" }` and exit this fragment

**Output**: `brief_file_path` or `no_brief` status
</step_a_locate>

<step_b_asset_scan>
**Prerequisite**: step_a successfully obtained `brief_file_path`
**Action**:

**b.1 `brief-assets/` directory scan**
- Check if `brief-assets/` folder exists in project root
- If exists, enumerate all files recursively, record path and file type (image / pdf / json / md / schema / txt / other)
- Read content of readable files; binary files only record meta info (type + size)

**b.2 Brief full text external reference scan**
- Read Brief full text, match all external references with following patterns:
  - Markdown links: `[text](URL)` and `![alt](URL)`
  - Bare URLs: `https?://...`
  - Relative path references: `./...` `../...` especially `./brief-assets/...`
- For each reference, determine type:

| Type | Determination | Handling |
|:---|:---|:---|
| `brief-assets/` local file | Path starts with `./brief-assets/` or `brief-assets/` | Match with b.1 results, mark `[reachable-local]` |
| Public HTTP(S) URL | Accessible (no auth) | Try to read, success mark `[reachable-remote]`, failure mark `[unreadable]` |
| Auth-required link | Returns 401/403 or Notion/Google Drive private link | Mark `[unreadable-auth-required]` |
| Dead link | 404/timeout | Mark `[unreadable-dead]` |
| Pure descriptive reference | Not real URL (e.g. "refer to iOS HIG guidelines") | Mark `[descriptive-no-access-needed]` |

**b.3 Asset semantic tag extraction**
- Resources referenced in Brief with `- [semantic-tag] path` format (or variant `path — semantic-tag`), record mapping:

| Semantic tag | Route impact (prompt caller) |
|:---|:---|
[[WHEN: ui | | `[competitor-ref]` / `[visual-ref]` | Affects design_tokens / vision.md Visual Reference | ]]
[[WHEN: ui | | `[brand-guide]` | Affects design_tokens primitivePalette | ]]
[[WHEN: data | | `[db-schema]` / `[Schema]` | Affects data_snapshot.json | ]]
[[WHEN: api | | `[API-doc]` / `[OpenAPI]` | Affects api_snapshot.json + vision.md Context | ]]
| `[existing-code]` | Prompt caller this scenario better suited for inherit |
| `[brand-logo]` / `[assets]` | Only record reference relationship, does not affect constitution files |
| Other custom tags | Preserve as-is, caller interprets |

**Output**: `asset_inventory` object containing:
- `local_assets`: file list under brief-assets/
- `external_refs`: external reference list (with reachability status)
- `tagged_assets`: semantic tag → resource path mapping
- `unreachable`: inaccessible resource list (for caller to decide whether to interrupt)
</step_b_asset_scan>

<step_c_brief_parse>
**Action**: Parse Brief sections, extract following fields (missing fields return null, do not fabricate data):

- `identity`: { projectName, oneLiner, problemStatement }
- `targetUsers`: [{ role, description }]
- `featureTags`: [ui / data / cli / lib / api / mobile / desktop / miniapp / extension / realtime / ai] (checked or inferred from Brief)
- `coreTasks`: [{ title, description, dependencies? }]
- `businessFlow`: Business flow description (preserve original)
- `predefinedDecisions`: Design decisions user has made
- `techStack`: { language, runtime, framework, database, deployment, ... } (distinguish "filled" / "empty" / "recommended")
- `dataModel`: Data model draft (if any)
- `existingAPI`: Existing API endpoints (if any)
- `existingResources`: Design specs/brand/existing services etc
- `boundaries`: Anti-goals and hard constraints
- `styleTone`: Style tone (only ui/cli/api related fields)
- `successMetrics`: Success metrics
- `references`: Reference projects
- `supplementaryNotes`: Supplementary notes original text (preserve for subsequent routing to 90_custom_rules)

**Output**: `brief_data` structured object
</step_c_brief_parse>

<step_d_reachability_gate>
**Trigger**: Only when step_b's `unreachable` is non-empty
**Action**: Immediately output resource reachability report, pause execution:

```
### 📎 Resource Reachability Report

Brief referenced following resources that cannot be accessed:

| # | Reference | Status | Location in Brief |
|:---|:---|:---|:---|
| 1 | https://figma.com/... | [unreadable-auth-required] | "Existing resources → Design specs" |
| 2 | ./designs/hero.png | [unreadable-dead] | "Visual reference" |

**Please choose**:
- `[A] Skip these resources, continue initialization`
- `[B] Provide accessible alternative links/files`
- `[C] Abort, complete resources then retry`
```

Do not continue before user chooses.
</step_d_reachability_gate>

<step_e_return>
**Output**: Return to caller:
{
  status: "ok" | "no_brief",
  brief_file_path,
  brief_data,         // step_c result
  asset_inventory,    // step_b result
}

> Caller is responsible for deciding how to route to specific constitution files based on `tagged_assets` (see init/shared/constitution-files.md data source matrix).
</step_e_return>
</shared_brief_ingest>