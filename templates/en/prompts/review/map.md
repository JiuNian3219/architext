<protocol_review_map>
**Trigger**: Dispatched by prompts/review.md router, or /archi.review map alias direct call
**Goal**: Scan project actual directory structure, compare with map.json, identify new/stale/changed, update architecture map after user confirmation.

<meta>
  <style>Systematic, Precise, Architecture-Aware</style>
  <language>English</language>
  <principles>
    Scan vs Map: Actual filesystem is Ground Truth, map.json is old snapshot.
    Smart Granularity: Default directory-level; single file carrying multiple responsibilities must refine to file-level.
    Architecture Inference: New entry's layer classification must reference existing map patterns + tech_stack.md.
    Batch Confirm: All changes displayed at once, user batch confirms.
    No Re-routing: If scan finds project structure overall abnormal (many orphan directories / many unregistered modules) → Prompt user to run /archi.review (project-level health check); subprotocol does not auto-switch.
    IDE-Native First: Leverage IDE native capabilities to drive execution rhythm.
  </principles>
</meta>

<step_1_scan>
1. Read map.json — Current architecture map.
2. Read tech_stack.md — Directory structure conventions, architecture patterns.
3. Scan project directory structure.
   - Exclude: .git/, node_modules/, dist/, build/, `[[__DOCS_DIR__]]/`, and paths declared in .gitignore.
   - Depth: Follow existing entries' granularity pattern in map.json.

Output (internal): Actual directory tree + existing map structure.
</step_1_scan>

<step_2_diff>
Compare actual directory tree with map.json entry by entry, classify as three difference types.

| Difference Type | Judgment Condition | Handling |
|---|---|---|
| New (New) | Actually exists but no record in map | Needs classification before registration |
| Stale (Stale) | Has record in map but actually doesn't exist | Direct remove |
| Suspected Rename (Renamed) | Path in map doesn't exist, but a new path has highly similar structure/content | Mark as rename candidate |

### File-Level Detection

Quick scan files in new directories, identify **single file multiple responsibilities** → Refine granularity to file-level.

Output (internal): Difference list, enter step_3.
</step_2_diff>

<step_3_classify>
Architecture classification for new entries.

### Classification Strategy

1. **Pattern Matching**: Reference classification of existing entries at same level in map.json.
2. **Tech Stack Conventions**: Directory structure rules in tech_stack.md.
3. **Content Inference**: Read file content (import relationships, export types).
4. **Cannot Determine**: Mark as [?], let user specify.

For each new entry fill: path, layer, description, [?file-level] contains.

Output (internal): Classified new entry list, enter step_4.
</step_3_classify>

<step_4_propose>
Display complete change list to user:

### Architecture Map Change Proposal

**Scan Scope**: [Project root directory]
**Current map entry count**: N | **After change**: M

---

#### Stale Entries (Will Remove)
| Path | Original Layer |
|---|---|

#### New Entries (Will Register)
| Path | Layer | Description | Granularity |
|---|---|---|---|

#### Suspected Renames
| Original Path | New Path | Confidence |
|---|---|---|

---

> Reply **OK** to confirm all; or specify modifications.

**Gate**: After user confirmation enter step_5.
</step_4_propose>

<step_5_apply>
1. Update map.json per confirmed list:
   - Remove stale entries
   - Add new entries (path + layer + description + file-level contains)
   - Handle renames
2. featureRelations — If directory change affects linkage relationships, sync update.
3. Update lastUpdated.

**Terminal Gate** (Do not skip): Standard check task --check + render.

**Pre-signoff Checklist** (Verify item by item before output):
□ User already explicitly confirmed change list in step_4 (Gate passed before execution)
□ Stale entries removed from directoryMapping
□ New entries correctly classified (path + layer + description all filled)
□ Suspected renames explicitly handled (not silently ignored)
□ featureRelations synced update (if applicable)
□ lastUpdated updated
□ Terminal Gate — task --check + render passed

Output update summary: Removed N entries / Added N entries (M file-level) / Renamed N entries / Current total entries.
</step_5_apply>

</protocol_review_map>