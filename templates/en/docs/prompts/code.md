<protocol_code>
  **Trigger**: `/archi.code <id>`
  **Goal**: Based on the `features/<id>_<Slug>/plan.json` task list, complete feature development; follow `02_tech_stack.md` ([?UI] also follow `design_tokens.json`); pass build, type check, lint, formatting, test and audit.

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
    1.  **Resolve ID**: Parse `<id>` → Feature Name, Slug, phase/status from `[[__DOCS_DIR__]]/global/roadmap.json`.
    2.  **Status Gate** — Only `active` can enter code workflow:

        | Status | Handling |
        |:---|:---|
        | `active` 🟢 | Pass, continue |
        | `pending` ⏳ | Reject — prompt to run `/archi.plan <ID>` first |
        | `blocked` 🧱 | Reject — prerequisites not completed |
        | `done` ✅ | Reject — already completed, use `/archi.edit <ID>` for modifications |

    3.  **Load Context** (Use Roadmap `📁 Slug` to locate):
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/spec.md` — Logic & Scenarios
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/ui.md` — task UI scope declaration (if exists)
        - `[[__DOCS_DIR__]]/global/ui_concept.html` — global visual reference, **[?UI] read first** (screens, design language, motion)
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/plan.json` — Task breakdown (contains `notes` shorthand; must reference during execution)
        - `02_tech_stack.md` — Technical Red Lines
        - [?UI] `[[__DOCS_DIR__]]/global/design_tokens.json`
        - [?Data] `[[__DOCS_DIR__]]/global/data_snapshot.json`

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

    **Feature Verification (Mandatory)**

    > Prohibited from marking complete via code review or automated tests alone; must actually run and verify the target feature.
    > If dev server is not running, execute `[[__DOCS_DIR__]]/scripts/dev-up` first.
    > **Read `notes.Verify` first**: Read the `Verify: [...]` portion at the end of the current task's `notes` field and use that operation as the concrete e2e step. Fall back to the table below only if the `notes` field has no `Verify` entry.

    | Project Type | Verification Action | Pass Criteria |
    |:---|:---|:---|
    | [?Web] | Browser-navigate target feature path | Renders correctly, no interaction errors, clean console |
    | [?API] | Call new/modified endpoints | Status code and body match spec |
    | [?CLI] | Execute target command (normal args + edge cases) | stdout as expected, correct exit code |
    | [?Lib] | Run example code or playground to verify exported API | No runtime errors, correct return values |
    | [?Mobile] | Emulator/device operate target feature | UI renders, interactions respond |
    | [?Desktop] | Launch app operate target feature | Window renders, feature functional |

    **Evidence**: Output must include verification results (command output summary / screenshot / error log).
    **Fallback**: If verification keeps failing and environment issues suspected → `[[__DOCS_DIR__]]/scripts/dev-reset` → `[[__DOCS_DIR__]]/scripts/dev-up` → retry.

    **Output**: ✅/❌ status and reason for each check; Feature Verification evidence.
</step_4_validate>

<step_5_audit>
    **Role**: Chief Auditor
    **Checklist**:
    1.  **Tech Consistency**: Consistent with `02_tech_stack.md` (libraries/patterns/API style).
    2.  [?UI] **Design Compliance**: Styles use Token/Preset visual patterns only; no hardcoded magic values.
    3.  [?Data] **Data Integrity**: Compliant with `data_snapshot.json`; field names/types match.
    4.  **SOTA**: Reject outdated patterns; adopt tech_stack best practices.
    5.  [?UI] **Accessibility**: Include necessary accessibility attributes.
    6.  [?I18n] **I18n**: No hardcoded strings; must use Key/dictionary reference.
    7.  **Performance**: Avoid unnecessary large dependencies/full imports/useless computation/memory leaks.
    8.  **Security**: No sensitive info leakage; inputs validated.
    9.  **Static Check Zero**: All static check issues resolved.
    10. **step_4 Gate**: Confirm all step_4 checks (Static + Test + Feature Verification) have passed.
    11. **Linkage Check**: Read the `featureRelations` array from `[[__DOCS_DIR__]]/global/map.json`; semantically compare the current feature against each `sources` field. If matched, output: `⚠️ Linkage: [aggregator] — [checkNote]`, reminding to confirm whether the aggregator needs to be updated after this implementation. Skip if `featureRelations` is empty.

    Detail issues can be Auto-Fixed with explanation; major risks marked `⚠️ Risk` with alternatives proposed.
</step_5_audit>

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
    2.  Output completed task list with patch links (Code Reference).
    3.  Provide next step suggestions and Git Commit Suggestion (Conventional Commits).

    **Checkpoint** (Confirm before Output): □ Terminal Gate all executed

    **Output**: Completion summary with completed tasks, exempt items (if any), Git Commit suggestion, Next Steps table.
</step_6_signoff>

</protocol_code>
