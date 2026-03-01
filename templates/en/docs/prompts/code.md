<protocol_code>
  **Trigger**: `/archi.code <id>`
  **Goal**: Based on the `tasks/<id>_<Slug>/plan.json` task list, complete task implementation; follow `02_tech_stack.md` ([?UI] also follow `design_tokens.json`); pass build, type check, lint, formatting, test and audit.

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
      7.  **Plan Completion Gate**: Verify Plan completion before signing off. All AI-completable tasks must be finished; only "Human Intervention" and "Force Majeure" are exempt.
    </principles>
</meta>

<step_1_resolve>
    **Role**: System Analyst
    **Action**:
    1.  **Resolve ID**: Parse `<id>` → Task Name, Slug, phase/status from `[[__DOCS_DIR__]]/global/roadmap.json`.
    2.  **Status Gate** — Only `active` can enter code workflow:

        | Status | Handling |
        |:---|:---|
        | `active` | Pass, continue |
        | `pending` | Reject — prompt to run `/archi.plan <ID>` first |
        | `blocked` | Reject — prerequisites not completed |
        | `done` | Reject — already completed, use `/archi.edit <ID>` for modifications |

    3.  **Load Context** (Use Roadmap `📁 Slug` to locate):
        - `[[__DOCS_DIR__]]/tasks/<id>_<Slug>/spec.md` — Logic & Scenarios
        - `[[__DOCS_DIR__]]/tasks/<id>_<Slug>/ui.md` — task UI scope declaration (if exists)
        - [?Complex] `[[__DOCS_DIR__]]/tasks/<id>_<Slug>/design.md` — Technical design (if exists): state machine/pipeline/protocol definitions, parameter table, invariants
        - [?UI] `[[__DOCS_DIR__]]/global/ui_context.md` — AI screen index (screen IDs / routes / states / navigation graph / shared components)
        - [?UI] `[[__DOCS_DIR__]]/global/ui_concept.html` — read-only visual reference (calibrate layout against this during implementation; do not redesign — design is already locked in ui.md)
        - `[[__DOCS_DIR__]]/tasks/<id>_<Slug>/plan.json` — Task breakdown (contains `notes` shorthand; must reference during execution)
        - `02_tech_stack.md` — Technical Red Lines
        - [?UI] `[[__DOCS_DIR__]]/global/design_tokens.json`
        - [?Data] `[[__DOCS_DIR__]]/global/data_snapshot.json`
        - **Read Refs** (if any): Read `[[__DOCS_DIR__]]/refs/index.json` (if exists); match by tags and spec.md tech domain semantics; load only matched ref files as supplementary context; skip if `refs/` missing or empty.

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
    - [?UI] **Design Tokens Only**: Styles strictly use visual patterns defined by Tokens/Presets; prohibited hardcoding magic values (colors, sizes, spacing, etc.).
    - **Type-Safe**: Complete type definitions; use the project tech stack's type system to guard boundaries.
    - **Code Organization**: Follow the architecture pattern and file placement strategy defined in `02_tech_stack.md`.
    - **Comments**: Explain Why, not What; reject nonsense comments.
    - **Naming**: Self-documenting names; reject `a`, `b`, `tmp` etc. (except loop variable `i`).
    - [?Complex] **Design Adherence**: When `design.md` exists, implementation must strictly follow its state machine/pipeline/protocol definitions; parameters must reference design.md § 3 values (no hardcoding other values); must satisfy all § 4 Invariants (use assert or runtime checks).
    - **Error Handling**: Prohibit swallowing errors/silent failures; must properly propagate errors and provide observable feedback to callers (UI: Toast; CLI: Exit Code; API: Status Code + Body).
    - **Robustness**: Explicitly handle edge cases (Loading/Error/Empty/Timeout); prohibit writing only Happy Path.
    - **SOTA**: Follow tech_stack best practices; reject explicitly forbidden outdated patterns.
    - **Scaffold Safety**: Scaffolds in non-empty directories may overwrite files — must generate in new directory and protect `[[__DOCS_DIR__]]/`; delete/overwrite operations must list manifest and confirm first.
    - **.gitkeep Cleanup**: Empty dirs may use `.gitkeep` for Git tracking; when adding other files to a dir, must remove that dir's `.gitkeep`.
    - **Patch Output**: Output changes as patches, with Code References.
    - **Progress Tracking**: After completing each task, immediately update the corresponding task's `done: true` in `plan.json`; prohibited from batch-updating at signoff (progress will be lost if session is interrupted).

    **Action**: Implement Phase A/B/C step by step; produce complete, production-quality code (with necessary tests); new files/directories must align with tech_stack.
</step_3_implement>

<step_4_validate>
    **Role**: Validation Engineer
    **Action** (Fix and re-run on failure; commands subject to `02_tech_stack.md` Section 5):

    **Automated Check**: Run `[[__DOCS_DIR__]]/scripts/validate` (if exists); otherwise execute the checklist below manually.

    | Phase | Check Item | Requirement |
    |:---|:---|:---|
    | **Static** | Build | Zero compilation errors |
    | | Type Check | Zero type errors |
    | | Lint | Zero lint errors (warnings must explain reason) |
    | | Format | Compliant with format rules (if failed, auto-fix then re-check) |
    | **Test** | Existing Tests | Run existing test suite, all pass; must not break existing tests |
    | | New Coverage | Add tests for newly added/modified critical logic; pure styling exempt |

    **Task Verification (Mandatory)**

    > Prohibited from marking complete via code review or automated tests alone; must actually run and verify the target task.
    > If dev server is not running, execute `[[__DOCS_DIR__]]/scripts/dev-up` first.
    > **Read `notes.Verify` first**: Read the `Verify: [...]` portion at the end of the current task's `notes` field and use that operation as the concrete e2e step. Fall back to the table below only if the `notes` field has no `Verify` entry.

    | Project Type | Verification Action | Pass Criteria |
    |:---|:---|:---|
    | [?Web] | Browser-navigate target task path | Renders correctly, no interaction errors, clean console |
    | [?API] | Call new/modified endpoints | Status code and body match spec |
    | [?CLI] | Execute target command (normal args + edge cases) | stdout as expected, correct exit code |
    | [?Lib] | Run example code or playground to verify exported API | No runtime errors, correct return values |
    | [?Mobile] | Emulator/device operate target task | UI renders, interactions respond |
    | [?Desktop] | Launch app operate target task | Window renders, task functional |

    **Evidence**: Output must include verification results (command output summary / screenshot / error log).
    **Fallback**: If verification keeps failing and environment issues suspected → `[[__DOCS_DIR__]]/scripts/dev-reset` → `[[__DOCS_DIR__]]/scripts/dev-up` → retry.

    **Output**: ✅/❌ status and reason for each check; Task Verification evidence.
</step_4_validate>

<step_5_verify>
    **Role**: Independent Reviewer

    **5A. Code quality review**:
    [[SUBAGENT: archi-silent-audit|mode: code-impl, context: Review step_3 implemented code (Tech/SOTA/Security/Performance + conditional dimensions)]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md`, follow mode: code-impl review dimension table item by item)]]

    **5B. Linkage check**:
    [[SUBAGENT: archi-feature-relations|mode: check, context: Semantically compare this implementation with featureRelations sources]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-feature-relations/SKILL.md`, follow mode: check logic)]]

    **5C. Data governance sync**:
    [[SUBAGENT: archi-data-sync|context: Scan this implementation for new business entities/error codes/Schema; incremental sync per 03_data_governance.md rules]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-data-sync/SKILL.md`, follow its execution protocol)]]

    [[INCLUDE: shared/verify-result-handling.md]]
</step_5_verify>

<step_6_signoff>
    **Terminal Gate** (Do not skip; must complete before output summary):
    | Step | Command | Pass Condition |
    |:---|:---|:---|
    | 1 | `npx archi plan <ID>` | All done or exempt only; not passed → return to step_3 |
    | 2 | `npx archi task <ID> --status done` | Task status updated |
    | 3 | `npx archi task --check` | No ERROR-level issues |
    | 4 | `npx archi render` | `.md` views generated |

    **Action** (After Gate passes):
    1.  Confirm all task `done` marks in `plan.json` are updated (should be done in real-time during step_3; this is a final check).
    2.  **Drift Warning**: Compare code changes against `spec.md`'s key checkpoints (interface signatures, return types, key operations in Gherkin scenarios). If code exceeds spec coverage → mark `⚠️ Spec Drift`, suggest running `/archi.edit <ID>` to sync docs.
    3.  Output completed task list with patch links (Code Reference).
    4.  Provide next step suggestions and Git Commit Suggestion (Conventional Commits).

    **Checkpoint** (Confirm before Output): □ Terminal Gate all executed

    **Output**: Completion summary with completed tasks, exempt items (if any), Git Commit suggestion, Next Steps table.
</step_6_signoff>

</protocol_code>
