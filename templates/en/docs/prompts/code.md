<protocol_code>
  **Trigger**: `/archi.code <id>` | Auto-loaded by Workflow Dispatch on natural language trigger
  **Goal**: Complete feature development per `tasks/<id>_<Slug>/plan.json` task list; follow `02_tech_stack.md` (UI projects only: also follow `design_tokens.json`); pass build, types, Lint, format, tests and audit.

<meta>
    <style>Deterministic, Type-Safe, SOTA-First</style>
    <language>English</language>
    <principles>
      1.  **Frontmatter Preservation**: Do not change existing files' YAML Frontmatter.
      2.  **Follow Conventions**: Use only repo-existing libs and patterns; read before modify.
      3.  **Security First**: Do not introduce/print secrets; sensitive info must not be persisted.
      4.  **SOTA Pattern Check**: Reject outdated patterns; use tech_stack defined best practices.
      5.  **No Commit Policy**: Do not commit without authorization; present changes as patches.
      6.  **Static Check First**: Must pass all static checks (types/Lint/format).
      7.  **Plan Completion Gate**: Verify Plan completion before finish. All tasks AI can complete must be done; only exempt "manual intervention" and "force majeure".
      8.  **IDE-Native First**: Leverage IDE native capabilities to drive execution rhythm; this protocol defines quality standards and checkpoints, not fight IDE planning/execution mechanisms.
    </principles>
</meta>

<step_1_resolve>
    **Action**:
    1.  **Resolve ID**: Parse `<id>` from roadmap.json → Task Name, Slug, phase/status.
    2.  **Status Gate** — only `active` may enter code flow:

        | Status | Handling |
        |:---|:---|
        | `active` | Pass, continue |
        | `pending` | Reject — prompt to run `/archi.plan <ID>` first |
        | `blocked` | Reject — upstream deps incomplete |
        | `done` | Reject — already done; use `/archi.edit <ID>` for changes |

    3.  **Load**: task docs (spec/ui/design/plan) + project context (tech_stack/design_tokens/data_snapshot/ui_context/screens/) + refs (match by tags; load only matched files).

    **Output**: Atomic task list to implement with dependencies and order.
</step_1_resolve>

<step_2_plan>
    **Action**:
    Generate execution blueprint (adjust by project type):
    - **Phase A (Domain/Data/API)**: Data models / interfaces / validation
    - **Phase B (UI/Presentation)**: Component structure / styles (Design Tokens only); non-UI projects adjust to corresponding presentation layer
    - **Phase C (Integration)**: End-to-end wiring (state, routing, data flow, error handling)

    Each task must have completion criteria: static checks pass, tests pass, comply with tech_stack.

    **Output**: Atomic task list for implementation (Checkbox).
</step_2_plan>

<step_3_implement>
    **Protocol**:
    - **Read First**: Must read target file before modify; follow existing project code style.
    - **Use Existing Stack**: Use only tech and libs declared in `02_tech_stack.md`.
    - (When this task involves UI) [[INCLUDE: shared/ui-redlines.md]]
    - **Type-Safe**: Complete type definitions; use project type system to guard boundaries.
    - **Code Organization**: Follow `02_tech_stack.md` architecture and file placement.
    - **Comments**: Explain Why, not What.
    - **Naming**: Self-explanatory names; no meaningless names.
    - Complex tasks only: **Design Adherence**: When `design.md` exists, implementation must strictly follow its state machine/pipeline/protocol; params reference § 3 values; must satisfy all § 4 Invariants.
    - **Error Handling**: No swallowing/silent failure; propagate and give callers observable feedback.
    - **Robustness**: Explicitly handle boundaries (Loading/Error/Empty/Timeout); no Happy Path only.
    - **SOTA**: Follow tech_stack best practices; reject explicitly forbidden outdated patterns.
    - **Scaffold Safety**: Non-empty dirs must protect `[[__DOCS_DIR__]]/`.
    - **.gitkeep Cleanup**: Remove `.gitkeep` when adding files to dir.
    - **Patch Output**: Output changes as patches with Code Reference.
    - **Progress Tracking**: After each task, update `plan.json` corresponding `done: true` immediately; do not batch at signoff.

    **Action**: Implement phase A/B/C item by item; produce complete, production-ready code (including necessary tests).
</step_3_implement>

<step_4_validate>
    **Action** (on failure fix and re-run; commands per `02_tech_stack.md` Section 5):

    **Automated Check**: Run `[[__DOCS_DIR__]]/scripts/validate` (if exists); otherwise execute checklist:

    | Phase | Check | Requirement |
    |:---|:---|:---|
    | **Static** | Build | Zero compile errors |
    | | Type Check | Zero type errors |
    | | Lint | Zero Lint errors (warnings require reason) |
    | | Format | Compliant (auto-fix then re-check if fail) |
    | **Test** | Existing Tests | All pass; do not break old tests |
    | | New Coverage | Add tests for new/modified critical logic |

    **Task Verification (mandatory)**

    > Do not mark complete by code review only; must actually run target feature and verify.
    > **Prefer `notes.验证`**: First read current task `notes` end `Verify: [...]` and run e2e; fallback to table by type when no verify field.

    | Project Type | Verification Action | Pass Criteria |
    |:---|:---|:---|
    | When this task involves UI | Browser: operate target feature path | Render OK, interaction no errors |
    | When this task involves API | Call new/modified endpoint | Status and Body match spec |
    | When this task involves CLI | Execute target command (normal + edge params) | stdout expected, exit code correct |
    | When this task involves lib | Run sample code to verify exported API | No runtime error, return correct |
    | When this task involves mobile | Simulator/device: operate | UI OK, interaction responsive |
    | When this task involves desktop | Launch app and operate | Window OK, feature works |

    **Evidence**: Attach verification result (command output summary / screenshot / error log).
    **Fallback**: If verification keeps failing → `scripts/dev-reset` → `scripts/dev-up` → retry.

    **Output**: Each check ✅/❌ status and reason; Task Verification evidence.
</step_4_validate>

<step_5_verify>
    **Role**: Independent Reviewer

    **5A. Code quality review**:
    [[SUBAGENT: archi-silent-audit|mode: code-impl, context: Review step_3 implemented code (Tech/SOTA/Security/Performance + conditional dimensions)]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md`, follow mode: code-impl review dimension table)]]

    **5B. Linkage check**:
    [[SUBAGENT: archi-feature-relations|mode: check, context: Compare implemented feature with featureRelations sources semantically]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-feature-relations/SKILL.md`, follow mode: check logic)]]

    **5C. Data governance sync**:
    [[SUBAGENT: archi-data-sync|context: Scan new business entities/error codes/Schema from implementation; incrementally sync per 03_data_governance.md]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-data-sync/SKILL.md` and follow its protocol)]]

    [[INCLUDE: shared/verify-result-handling.md]]
</step_5_verify>

<step_6_signoff>
    **Terminal Gate** (do not skip):
    | Step | Command | Pass Condition |
    |:---|:---|:---|
    | 1 | `npx archi plan <ID>` | All complete or exempt only; if fail do not sign off, return to step_3 |
    | 2 | `npx archi task <ID> --status done` | Task status updated |
    | 3 | Standard check (task --check + render) | No ERROR + views generated |

    **Action** (after Gate passes):
    1.  Confirm `plan.json` each task `done` flag updated.
    2.  **Drift Warning**: Compare code changes with `spec.md` key points. If beyond spec coverage → mark `⚠️ Spec drift`, suggest `/archi.edit <ID>`.
    3.  Output completed task list and patch links.
    4.  Provide next steps and Git Commit Suggestion (Conventional Commits).

    **Pre-signoff Checklist** (confirm each item before Output):
    □ plan.json — every task done flag updated in real-time (not batch-updated at signoff)
    □ Step 4 — Build / type check / Lint / format all passed
    □ Step 4 — Task Verification executed for each project type with Evidence attached
    □ Step 5A Silent Audit — executed, all CRITICAL issues resolved
    □ Step 5B featureRelations check — executed
      - Check if modified files affect other linked files
    □ Step 5C data governance sync — executed:
      - dictionary.json + error_codes.json — required
      - (UI projects only) design_tokens.json + ui_context.md
      - (Data projects only) data_snapshot.json
      - (API projects only) api_snapshot.json + env_registry.json
      - (CLI projects only) command_api.json
      - (Lib projects only) public_api.json
    □ Terminal Gate — npx archi plan <ID> all complete (exempt items only)

    **Output**: Completion summary with completed tasks, exempt items (if any), Git Commit suggestion, Next Steps:

    | Priority | Action | Notes |
    |:---|:---|:---|
    | Recommended | `/archi.audit <ID>` | Independent review of implementation |
    | (If Spec drift) | `/archi.edit <ID>` | Update docs before continuing |
    | (If next pending task) | `/archi.plan <next pending ID>` | Plan the next task |
</step_6_signoff>

</protocol_code>
