<protocol_code>
  **Trigger**: `/archi.code <id>`
  **Goal**: Based on the `features/<id>_<Slug>/plan.md` task list, complete feature development; follow `02_tech_stack.md` ([?UI] also follow `03_design_tokens.md`); pass build, type check, lint, formatting, test and audit.

<meta>
    <style>Deterministic, Type-Safe, SOTA-First</style>
    <language>English</language>
    <principles>
      1.  **Frontmatter Preservation**: Prohibited from modifying existing files' YAML Frontmatter.
      2.  **Follow Conventions**: Use only existing repo libraries and patterns; read before modify.
      3.  **Security First**: Prohibit introducing/printing secrets; sensitive info must not be written to disk.
      4.  **SOTA Pattern Check**: Reject outdated practices; adopt best practices defined in tech_stack.
      5.  **No Commit Policy**: Do not commit without authorization; present changes as patches.
      6.  **Static Check First**: Must pass all static checks (Type/Lint/Format).
      7.  **Plan Completion Gate**: Verify plan.md completion before signing off. All AI-completable tasks must be finished; only "Human Intervention" and "Force Majeure" are exempt.
    </principles>
</meta>

<step_1_resolve>
    **Role**: System Analyst
    **Action**:
    1.  **Resolve ID**: Parse `<id>` → Feature Name, Slug, phase/status from `[[__DOCS_DIR__]]/global/00_roadmap.md`.
    2.  **Status Gate** — Only `active` can enter code workflow:

        | Status | Handling |
        |:---|:---|
        | `active` 🟢 | Pass, continue |
        | `pending` ⏳ | Reject — prompt to run `/archi.plan <ID>` first |
        | `blocked` 🧱 | Reject — prerequisites not completed |
        | `done` ✅ | Reject — already completed, use `/archi.edit <ID>` for modifications |

    3.  **Load Context** (Use Roadmap `📁 Slug` to locate):
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/spec.md` — Logic & Scenarios
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/ui.md` — Design & Components (if exists)
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/plan.md` — Task Breakdown
        - `02_tech_stack.md` — Technical Red Lines
        - [?UI] `[[__DOCS_DIR__]]/global/03_design_tokens.md`
        - [?Data] `[[__DOCS_DIR__]]/global/04_data_snapshot.md`

    **Output**: Atomic list of tasks to implement, marking dependencies and order.
</step_1_resolve>

<step_2_plan>
    **Role**: Tech Lead
    **Action**:
    Generate execution blueprint (dynamically adjusted by project type):
    - **Phase A (Domain/Data/API)**: Data models/interfaces/validation
    - **Phase B (UI/Presentation)**: Component structure/styling (use Design Tokens only); non-UI projects adjust to corresponding presentation layer
    - **Phase C (Integration)**: End-to-end wiring (state management, routing, data flow, error handling)

    Write completion criteria for each task: static checks passed, tests passed, compliant with tech_stack specs.

    **Output**: Implementation-oriented atomic task list (Checkbox).
</step_2_plan>

<step_3_implement>
    **Role**: Senior Engineer
    **Protocol**:
    - **Read First**: Must read target file before modification; follow existing code style.
    - **Use Existing Stack**: Use only technologies and libraries declared in `02_tech_stack.md`.
    - [?UI] **Design Tokens Only**: Styles strictly use Tokens; prohibited hardcoding Hex/px/rem.
    - **Type-Safe**: Complete type definitions; use the project tech stack's type system to guard boundaries.
    - **Code Organization**: Follow the architecture pattern and file placement strategy defined in `02_tech_stack.md`.
    - **Comments**: Explain Why, not What; reject nonsense comments.
    - **Naming**: Self-documenting names; reject `a`, `b`, `tmp` etc. (except loop variable `i`).
    - **Error Handling**: Prohibit swallowing errors/silent failures; must properly propagate errors and provide observable feedback to callers (UI: Toast; CLI: Exit Code; API: Status Code + Body).
    - **Robustness**: Explicitly handle edge cases (Loading/Error/Empty/Timeout); prohibit writing only Happy Path.
    - **SOTA**: Follow tech_stack best practices; reject explicitly forbidden outdated patterns.
    - **Scaffold Safety**: Scaffolds in non-empty directories may overwrite files — must generate in new directory and protect `[[__DOCS_DIR__]]/`; delete/overwrite operations must list manifest and confirm first.
    - **Patch Output**: Output changes as patches, with Code References.

    **Action**: Implement Phase A/B/C step by step; produce complete, production-quality code (with necessary tests); new files/directories must align with tech_stack.
</step_3_implement>

<step_4_validate>
    **Role**: Validation Engineer
    **Action** (Execute in order, fix any failure; commands subject to `02_tech_stack.md` or project config):

    | Check Item | Requirement |
    |:---|:---|
    | **Build** | Build succeeds, no compilation errors |
    | **Type Check** | Zero type errors |
    | **Lint** | Zero lint errors (warnings must explain reason) |
    | **Format** | Compliant with format rules (if failed, auto-fix then re-check) |
    | **Test** | Unit/integration tests pass; E2E only on critical paths (if configured) |
    | **Runtime** | [?Web] Local preview [?CLI] Key command verification [?API] Health check [?Lib] Example verification |

    Any validation failure must not be marked complete; must rollback or fix until passed.

    **Output**: Pass/fail status and reason for each check.
</step_4_validate>

<step_5_audit>
    **Role**: Chief Auditor
    **Checklist**:
    1.  **Tech Consistency**: Consistent with `02_tech_stack.md` (libraries/patterns/API style).
    2.  [?UI] **Design Compliance**: Styles use Tokens only; no hardcoded values.
    3.  [?Data] **Data Integrity**: Compliant with `04_data_snapshot.md`; field names/types match.
    4.  **SOTA**: Reject outdated patterns; adopt tech_stack best practices.
    5.  [?UI] **Accessibility**: Include necessary accessibility attributes.
    6.  [?I18n] **I18n**: No hardcoded strings; must use Key/dictionary reference.
    7.  **Performance**: Avoid unnecessary large dependencies/full imports/useless computation/memory leaks.
    8.  **Security**: No sensitive info leakage; inputs validated.
    9.  **Static Check Zero**: All static check issues resolved.
    10. **Build + Test**: Build error-free; critical logic has test coverage.

    Detail issues can be Auto-Fixed with explanation; major risks marked `⚠️ Risk` with alternatives proposed.
</step_5_audit>

<step_6_signoff>
    **CLI Mandatory Execution**: The following commands must be executed in terminal; prohibited from text suggestion only.

    **Plan Completion Gate (Mandatory)**:
    1.  Run `npx archi plan <ID>` to check plan.md task completion.
    2.  Pass criteria: All `[x]` or uncompleted items only belong to 🧑 Human Intervention / 🌐 Force Majeure.
    3.  Not passed: Prohibited from signing off, return to step_3 to continue.
    4.  Exempt items must annotate reason and category.

    **Signoff Action** (After Gate passes, execute in order):
    1. **CLI Mandatory Execution** (must run in terminal, do not skip):
       - `npx archi task <ID> --status done` (or `active`). Prohibited from editing roadmap directly.
       - `npx archi task --check`; fix if failed.
    2. Output completed task list with patch links (Code Reference).
    3. Update plan.md, check completed Checkboxes.
    4. Provide next step suggestions and Git Commit Suggestion (Conventional Commits).

    **Checkpoint** (Confirm before Output): □ `npx archi plan` executed □ `npx archi task --status` executed □ `npx archi task --check` executed.

    **Output**: Completion summary with completed tasks, exempt items (if any), Git Commit suggestion, Next Steps table.
</step_6_signoff>

</protocol_code>
