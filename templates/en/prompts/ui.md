<protocol_ui>
  **Trigger**: `/archi.ui` | Automatically loaded by Workflow Dispatch when triggered by natural language
  **Goal**: Generate or incrementally update multi-file UI concept designs (`screens/` directory).

<meta>
    <style>Visual, Systematic, Incremental</style>
    <language>English</language>
    <principles>
      1.  **Auto-Detect**: No subcommand, auto-detect `screens/` directory state to decide full generation or incremental update.
      2.  **Multi-File**: Each screen independent `S-XX.html`, shared styles `_shared.css`, `index.html` as navigation hub.
      3.  **Token-Driven**: Visual styles strictly from `design_tokens.json`, no hardcoding.
      4.  **Reference Artifact Only**: `screens/` is UI concept draft and acceptance reference, not production source code; subsequent coding must re-implement using project's own tech stack, do not directly copy `S-XX.html` / `_shared.css` structure or CSS.
      5.  **IDE-Native First**: Leverage IDE native capabilities to drive execution rhythm, this protocol defines quality standards and checkpoints, not opposing IDE's planning/execution mechanisms.
    </principles>
</meta>

<step_1_load>
    **Action**:
    0.  **Context Pack Gate**: Prioritize consuming Context Pack produced by `00_system.md` Front Pipeline; if missing fill first. If `missing_or_stale` non-empty, handle gaps first or explain to user.
    1.  **Pre-flight**: Check `architext.json` → `features` contains `ui`. Not present → Reject ("This project has UI feature disabled").
    2.  **Load**: Read project context + UI-related JSON (design_tokens, ui_context) from Context Pack; if missing then supplement per 00_system.md data governance rules.
    3.  **Mode Detection**:

        | Condition | Mode | Behavior |
        |:---|:---|:---|
        | `screens/` directory does not exist | **Full generation** | Extract screen list from ui_context.md → step_2 |
        | `screens/` exists | **Incremental update** | Compare ui_context.md with existing screens/, identify differences → step_2 |

    **Output**: Mode detection result + context summary. Enter step_2_plan.
</step_1_load>

<step_2_plan>
    **Action**:

    **Full mode**: Extract screen list (S-01, S-02...) from `ui_context.md` screen index, confirm screen IDs match Roadmap task `screens` field.
    **Incremental mode**: Compare existing `screens/` with `ui_context.md`, identify differences:

    | Difference Type | Handling |
    |:---|:---|
    | New screen (ui_context has but no corresponding S-XX.html) | Add to generation list |
    | Screen changed (ui_context description changed) | Add to update list |
    | No change | Skip |

    **Tokens check**: Check `design_tokens.json`:
    - `aestheticDirection.preset` empty → Guide selection
    - `primitivePalette.brand` empty → Guide to fill Hex
    - Other empty values → AI inference, non-blocking

    **Output**: Screen planning list (ID / Name / Status list / Action: New/Update/Skip).

    **Gate**: User replies **OK** then enter step_3_generate; without confirmation do not generate files.
</step_2_plan>

<step_2_5_refinement>
    **Trigger**: User reply is not OK, contains corrections, screen add/delete or mapping adjustments.
    **Action**: Incorporate feedback, refresh screen planning list and re-output, wait for re-confirmation.

    User replies OK → Enter step_3_generate.
</step_2_5_refinement>

<step_3_generate>
    **Action**: Call Skill to execute actual generation.

[[SKILL: archi-ui-wireframe|Per skill protocol, generate multi-file UI concept designs based on ui_context.md screen index. Full mode generates all screens; incremental mode only generates new/changed screens. After generation sync update ui_context.md screen structure summary.]][[NO-SKILL: (Read `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md`, and execute per its protocol in current context)]]

    **Output artifacts**:
    - `[[__DOCS_DIR__]]/global/screens/_shared.css` — CSS variables (from design_tokens) + Base layout + Control panel styles
    - `[[__DOCS_DIR__]]/global/screens/S-XX.html` — Each screen independent file
    - `[[__DOCS_DIR__]]/global/screens/index.html` — Navigation hub, lists all screens
    - `[[__DOCS_DIR__]]/global/ui_context.md` — Update screen structure summary (initialized by start, this step updates file paths and structure details)

    **Boundary statement**: Output is only for visual spec and state reference; do not directly copy into application source code in subsequent `/archi.code`.

    **Output**: Generated file list + change summary. Enter step_4_verify.
</step_3_generate>

<step_4_verify>

    **Verification list**:

    | Check Item | Pass Standard |
    |:---|:---|
    | File completeness | `screens/` contains `index.html` + `_shared.css` + all `S-XX.html` |
    | Cross-file links | All `S-XX.html` links in `index.html` valid; each `S-XX.html` has return-to-index link |
    | CSS references | Each `S-XX.html` references `_shared.css`; CSS variables from design_tokens |
    | State coverage | Each screen has default + applicable states (loading/empty/error) |
    | ui_context.md | Screen structure summary updated, with file paths and key regions |
    | (Incremental mode) Existing screens | Unmodified screen files not overwritten |

    Has failures → Fix and re-check. All pass → Enter step_5_signoff.
</step_4_verify>

<step_5_signoff>
    **Pre-signoff Checklist** (Verify item by item before output):
    □ `screens/` directory structure complete (index.html + _shared.css + S-XX.html)
    □ `ui_context.md` screen structure summary updated
    □ Step 4 verification all passed
    □ (Incremental mode) Only target screens modified, other files unchanged

    **Output**: UI concept design summary, containing:
    - **Mode**: Full generation / Incremental update
    - **Screen coverage**: Total N screens (New X / Updated Y / Preserved Z)
    - **Aesthetic direction**: preset + brand color
    - **File list**: Generated/Modified file list

    **User confirmation**: Reply **OK** to complete; Non-OK enters Refinement (call Skill for local update).

    **Next Steps**:

    | Priority | Action | Description |
    |:---|:---|:---|
    | Recommended | Open `screens/index.html` in browser | Confirm layout and visual effect |
    | 1 | `/archi.plan <first pending task ID>` | Start planning tasks |
</step_5_signoff>

</protocol_ui>