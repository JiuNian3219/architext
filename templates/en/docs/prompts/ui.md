<protocol_ui>
  **Trigger**: `/archi.ui` | Auto-loaded by Workflow Dispatch on natural language trigger
  **Goal**: Generate or incrementally update multi-file UI concept designs (`screens/` directory).

<meta>
    <style>Visual, Systematic, Incremental</style>
    <language>English</language>
    <principles>
      1.  **Auto-Detect**: No subcommands; automatically detects `screens/` directory state to decide full generation or incremental update.
      2.  **Multi-File**: Each screen as independent `S-XX.html`, shared styles in `_shared.css`, `index.html` as navigation hub.
      3.  **Token-Driven**: Visual styles strictly from `design_tokens.json`; no hardcoding.
      4.  **IDE-Native First**: Leverage IDE native capabilities to drive execution rhythm; this protocol defines quality standards and checkpoints without fighting IDE planning/execution mechanisms.
    </principles>
</meta>

<step_1_load>
    **Action**:
    1.  **Pre-flight**: Check `architext.json` → `features` contains `ui`. If not → reject ("UI feature not enabled for this project").
    2.  **Load**: vision.md (platform/users/north star), roadmap.json (UI-related tasks), design_tokens.json, tech_stack.md (platform/navigation framework), ui_context.md (if exists).
    3.  **Mode Detection**:

        | Condition | Mode | Behavior |
        |:---|:---|:---|
        | `screens/` directory does not exist | **Full Generation** | Extract all UI screens from roadmap → step_2 |
        | `screens/` exists | **Incremental Update** | Compare roadmap + ui_context.md, identify new/changed screens → step_2 |

    **Output**: Mode determination + context summary. Proceed to step_2_plan.
</step_1_load>

<step_2_plan>
    **Action**:

    **Full mode**: Extract all UI-related screens from roadmap tasks, assign screen IDs (S-01, S-02...).
    **Incremental mode**: Compare existing `screens/` with roadmap, identify differences:

    | Diff Type | Action |
    |:---|:---|
    | New screen (roadmap has task but no corresponding S-XX) | Assign new ID, add to generation list |
    | Screen change (existing screen's task has requirement changes) | Add to update list |
    | No change | Skip |

    **Tokens Check**: Check `design_tokens.json`:
    - `aestheticDirection.preset` empty → guide selection
    - `primitivePalette.brand` empty → guide Hex input
    - Other empty values → AI infers, non-blocking

    **Output**: Screen plan list (ID / Name / Task / States / Action: add/update/skip).

    **Gate**: User replies **OK** to proceed to step_3_generate; no file generation without confirmation.
</step_2_plan>

<step_2_5_refinement>
    **Trigger**: User replies non-OK, with corrections, screen additions/removals, or mapping adjustments.
    **Action**: Incorporate feedback, refresh screen plan list and re-output, await confirmation.

    User replies OK → proceed to step_3_generate.
</step_2_5_refinement>

<step_3_generate>
    **Action**: Call Skill for actual generation.

    [[SKILL: archi-ui-wireframe|Follow skill protocol to generate multi-file UI concept designs based on confirmed screen plan. Full mode generates all screens; incremental mode generates only new/changed screens.]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md` and follow its protocol)]]

    **Artifacts**:
    - `[[__DOCS_DIR__]]/global/screens/_shared.css` — CSS variables (from design_tokens) + base layout + control bar styles
    - `[[__DOCS_DIR__]]/global/screens/S-XX.html` — Each screen as independent file
    - `[[__DOCS_DIR__]]/global/screens/index.html` — Navigation hub listing all screens
    - `[[__DOCS_DIR__]]/global/ui_context.md` — AI screen index (routes reference `screens/S-XX.html`)

    **Output**: Generated file list + change summary. Proceed to step_4_verify.
</step_3_generate>

<step_4_verify>
    **Role**: Independent Reviewer

    **Verification checklist**:

    | Check | Pass Criteria |
    |:---|:---|
    | File completeness | `screens/` contains `index.html` + `_shared.css` + all `S-XX.html` |
    | Cross-file links | All `S-XX.html` links in `index.html` are valid; each `S-XX.html` has back-to-index link |
    | CSS references | Each `S-XX.html` references `_shared.css`; CSS variables from design_tokens |
    | State coverage | Each screen contains default + applicable states (loading/empty/error) |
    | ui_context.md | Screen index routes reference `screens/S-XX.html` paths |
    | (Incremental) Existing screens | Unmodified screen files were not overwritten |

    Failed items → fix and recheck. All pass → proceed to step_5_signoff.
</step_4_verify>

<step_5_signoff>
    **Pre-signoff Checklist** (confirm before output):
    □ `screens/` directory structure complete (index.html + _shared.css + S-XX.html)
    □ `ui_context.md` generated/updated with correct path references
    □ Step 4 verification all passed
    □ (Incremental) Only target screens modified, other files unchanged

    **Output**: UI concept design summary:
    - **Mode**: Full generation / Incremental update
    - **Screen coverage**: N screens total (X new / Y updated / Z retained)
    - **Aesthetic direction**: preset + brand color
    - **File list**: Generated/modified files

    **User confirmation**: Reply **OK** to finish; non-OK enters Refinement (calls Skill for partial update).

    **Next Steps**:

    | Priority | Action | Description |
    |:---|:---|:---|
    | Recommended | Open `screens/index.html` in browser | Verify layout and visual design |
    | 1 | `/archi.plan <first pending task ID>` | Start planning tasks |
</step_5_signoff>

</protocol_ui>
