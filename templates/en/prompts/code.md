<protocol_code>
  **Trigger**: `/archi.code <id>` | Automatically loaded by Workflow Dispatch when triggered by natural language
  **Goal**: Based on `tasks/<id>_<Slug>/plan.json` task list, complete feature development; follow `tech_stack.md`[[WHEN: ui | and `design_tokens.json` ]]; pass build, type check, lint, formatting, tests and review.

<meta>
    <style>Deterministic, Type-Safe, SOTA-First</style>
    <language>English</language>
    <principles>
      1.  **Frontmatter Preservation**: Do not modify existing files' YAML Frontmatter.
      2.  **Follow Conventions**: Only use libraries and patterns already in the repository; read before modifying.
      3.  **Security First**: Do not introduce/print secrets; sensitive information must not be written to disk.
      4.  **SOTA Pattern Check**: Reject outdated patterns; adopt best practices defined in tech_stack.
      5.  **No Commit Policy**: Do not commit without authorization; present changes as patches.
      6.  **Static Check First**: Must pass all static checks (type/lint/formatting).
      7.  **Plan Completion Gate**: Verify Plan completion before ending. AI-completable tasks must all be done; only exempt "manual intervention" and "force majeure" categories.
      8.  **IDE-Native First**: Leverage IDE native capabilities to drive execution rhythm; this protocol defines quality standards and checkpoints, not opposing IDE's planning/execution mechanisms.
    </principles>
</meta>

<step_1_resolve>
    **Action**:
    0.  **Context Pack Gate**: Prioritize consuming Context Pack produced by `00_system.md` Front Pipeline; if missing, fill it first. If `missing_or_stale` is non-empty, handle gaps first or explain to user.
    1.  **Resolve ID**: Parse `<id>` from Context Pack / roadmap.json → Task Name, Slug, phase/status.
    2.  **Status Gate** — Only `active` can directly enter code flow. If status appears blocked, reconcile first so stale status is not mistaken for unfinished work:

[[SUBAGENT: archi-task-state-reconcile | When `<ID>` is `pending` or `blocked`, or its deps are not done, run mode=`target_active` to check whether target detail is ready / deps are merely stale. Return only JSON report; do not mutate status.]]
[[NO-SUBAGENT: archi-task-state-reconcile | When `<ID>` is `pending` or `blocked`, or its deps are not done, read `[[__DOCS_DIR__]]/skills/archi-task-state-reconcile/SKILL.md` and execute mode=`target_active` inline. Return only JSON report; do not mutate status.]]
[[NO-SKILL: When `<ID>` is `pending` or `blocked`, or its deps are not done, manually check `roadmap.json`, `tasks/<ID>_*/spec.md`, `tasks/<ID>_*/plan.json`, `npx archi plan <ID>`, and `npx archi task --check`. If evidence shows stale status, run the recommended `npx archi task <ID> --status active/done` before retrying; refuse only when evidence is insufficient.]]

        **Reconcile Handling**:
        - `status_stale_active` → run the report's recommended command (usually `npx archi task <ID> --status active`), then re-run Status Gate.
        - deps returning `status_stale_done` → run the recommended command for each dep (usually `npx archi task <DEP_ID> --status done`), then re-run Status Gate.
        - `needs_plan` → refuse code and prompt `/archi.plan <ID>` first.
        - `actually_incomplete` / `blocked` → refuse code with evidence.
        - `inconclusive` → do not guess; explain that manual confirmation or checks are needed.

        | Status | Handling |
        |:---|:---|
        | `active` | Pass, continue |
        | `pending` | Run Reconcile first; if still pending, reject — prompt to run `/archi.plan <ID>` first |
        | `blocked` | Run Reconcile first; if still blocked, reject — prerequisite dependencies not completed |
        | `done` | Reject — already completed; use `/archi.change <ID>` if modification needed |

    3.  **Load**: task docs (spec[[WHEN: ui | /ui ]]/design/plan) + project context (tech_stack[[WHEN: ui | /design_tokens/ui_context/screens]][[WHEN: data | /data_snapshot]][[WHEN: api | /api_snapshot]][[WHEN: cli | /command_api]][[WHEN: lib | /public_api]]) + refs (match by tags, only read hit files).

    **Output**: Atomic task list to implement, marked with dependencies and order.
</step_1_resolve>

<step_2_plan>
    **Action**:
    Generate execution blueprint (dynamically adjusted by project type):
    - **Phase A (Domain/Data/API)**: Data models/interfaces/validation
    - **Phase B (UI/Presentation)**: Component structure/styles (use Design Token only); non-UI projects adjust to corresponding presentation layer
    - **Phase C (Integration)**: End-to-end connection (state management, routing, data flow, error handling)

    Write completion criteria for each task: pass static checks, pass tests, comply with tech_stack specifications.

    **Output**: Atomic task list for implementation (Checkbox).
</step_2_plan>

<step_3_implement>
[[INCLUDE: shared/test-quality.md]]

    **Protocol**:
    - **Read First**: Must read target file before modifying; follow project's existing code style.
    - **Use Existing Stack**: Only use technologies and libraries declared in `tech_stack.md`.
[[WHEN: ui |     - **UI Redlines**:
[[INCLUDE: shared/ui-redlines.md]]
    - **Screens Reference Only**: `[[__DOCS_DIR__]]/global/screens/` is only for visual/interaction reference; do not copy its HTML/CSS/JS to project source code; must re-implement using project's own language, framework, component system and style solution.
]]
    - **Type-Safe**: Complete type definitions; use project tech stack's type system to guard boundaries.
    - **Code Organization**: Follow `tech_stack.md` architecture patterns and file placement strategy.
    - **Comments**: Explain Why not What.
    - **Naming**: Self-explanatory naming; reject meaningless names.
    - Complex tasks only: **Design Adherence**: When `design.md` exists, implementation must strictly follow its state machine/pipeline/protocol; reference values from § 3; must satisfy all Invariants in § 4.
    - **Error Handling**: Do not swallow errors/silent failures; must properly propagate and give caller observable feedback.
    - **Robustness**: Explicitly handle edge cases (Loading/Error/Empty/Timeout); do not only write Happy Path.
    - **SOTA**: Follow tech_stack best practices; reject explicitly prohibited outdated patterns.
    - **Scaffold Safety**: Non-empty directories must protect `[[__DOCS_DIR__]]/`.
    - **.gitkeep Cleanup**: Delete `.gitkeep` when adding files to directories.
    - **Patch Output**: Output changes as patches with Code Reference.
    - **Progress Tracking**: After completing each task, immediately update `plan.json` corresponding `done: true`; do not batch update at signoff.

    **Action**: Implement item by item following Phase A/B/C; produce complete, engineered code (including necessary tests).
</step_3_implement>

<step_4_validate>
    **Action** (If failed, must fix and re-run; commands based on `tech_stack.md` Section 5; if not declared, infer from project package/config):

    | Phase | Check Item | Requirement |
    |:---|:---|:---|
    | **Static** | Build | Zero compilation errors |
    | | Type Check | Zero type errors |
    | | Lint | Zero lint errors (warnings must explain reason) |
    | | Format | Comply with format specification (if failed, auto-fix and re-check) |
    | **Test** | Existing Tests | All pass; do not break old tests |
    | | New Coverage | Add tests for new/modified critical logic |

    **Task Verification (Mandatory)**

    > Do not mark complete only by code review; must actually run target function and verify.
    > **Prioritize reading `notes.verification`**: First read current task `notes` trailing `verification: [...]` section for e2e; if no verification field, fallback by project type table below.

    | Project Type | Verification Action | Pass Standard |
    |:---|:---|:---|
[[WHEN: ui |     | When task involves ui | Browser operation on target function path | Renders normally, interaction without errors | ]]
[[WHEN: api |     | When task involves api | Call new/modified endpoint | Status code and Body match spec | ]]
[[WHEN: cli |     | When task involves cli | Execute target command (normal + edge params) | stdout matches expectation, exit code correct | ]]
[[WHEN: lib |     | When task involves lib | Run example code verifying export API | No runtime errors, return values correct | ]]
[[WHEN: mobile |     | When task involves mobile | Simulator/device operation | UI normal, interaction responsive | ]]
[[WHEN: desktop |     | When task involves desktop | Launch app operation | Window normal, function usable | ]

    **Evidence**: Must attach verification results (command output summary/screenshot/error log).
    **Output**: Each check item ✅/❌ status and reason; Task Verification evidence.
</step_4_validate>

<step_5_verify>

    **5A. Code Quality Review**:
[[SUBAGENT: archi-silent-audit|mode: code-impl, context: Review code implemented in step_3 (Tech/SOTA/Security/Performance + conditional dimensions)]]
[[NO-SUBAGENT: archi-silent-audit|mode: code-impl, context: Review code implemented in step_3 (Tech/SOTA/Security/Performance + conditional dimensions)]]
[[NO-SKILL: (Read `[[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md`, and check item by item in current context per mode: code-impl review dimension table)]]

    **5B. Linkage Check**:
[[SUBAGENT: archi-feature-relations|mode: check, context: Match changed code/doc paths against featureRelations source/targets by path and semantics, output required sync checks]]
[[NO-SUBAGENT: archi-feature-relations|mode: check, context: Match changed code/doc paths against featureRelations source/targets by path and semantics, output required sync checks]]
[[NO-SKILL: (Read `[[__DOCS_DIR__]]/skills/archi-feature-relations/SKILL.md`, and execute in current context per mode: check logic)]]

    **5C. Data Governance Sync**:
[[SUBAGENT: archi-data-sync|context: Scan code/doc changes for new business entities/error codes/Schema and stable featureRelations coupling, incrementally sync per 00_system.md rules]]
[[NO-SUBAGENT: archi-data-sync|context: Scan code/doc changes for new business entities/error codes/Schema and stable featureRelations coupling, incrementally sync per 00_system.md rules]]
[[NO-SKILL: (Read `[[__DOCS_DIR__]]/skills/archi-data-sync/SKILL.md`, and execute sync in current context per its protocol)]]

    [[INCLUDE: shared/verify-result-handling.md]]
</step_5_verify>

<step_6_signoff>
    **Terminal Gate** (Do not skip):
    | Step | Command | Pass Condition |
    |:---|:---|:---|
    | 1 | `npx archi plan <ID>` | All completed or only exempt items; if not passed, do not sign off, return to step_3 |
    | 2 | `npx archi task --check` | No ERROR |
    | 3 | `npx archi render` | View generation successful |
    | 4 | `npx archi task <ID> --status done` | Task status updated |

    **Action** (After Gate passes):
    1.  Confirm `plan.json` each task `done` markers all updated.
    2.  **Drift Warning**: Compare code changes with `spec.md` key points. Found beyond spec coverage scope → mark `⚠️ Spec Drift`, suggest `/archi.change <ID>`.
    3.  Output completed task list and patch links.
    4.  Provide next step suggestions.

    **Pre-signoff Checklist** (Must verify item by item before Output):
    □ plan.json — Each task done marker updated in real-time (not batch operation at signoff)
    □ Step 4 — Build/type check/lint/formatting all passed
    □ Step 4 — Each project type's Task Verification executed with Evidence attached
    □ Step 5A Silent Audit — Executed, all CRITICAL issues fixed
    □ Step 5B featureRelations linkage check — Executed
      - Whether code/doc changes hit source/targets and linked targets were checked
    □ Step 5C Data governance sync — Executed
      - dictionary.json + error_codes.json + env_registry.json — Must check
[[WHEN: ui |       - design_tokens.json + ui_context.md ]]
[[WHEN: data |       - data_snapshot.json ]]
[[WHEN: api |       - api_snapshot.json ]]
[[WHEN: cli |       - command_api.json ]]
[[WHEN: lib |       - public_api.json ]]
    □ Terminal Gate — npx archi plan <ID> all completed (except exempt items)
    □ Terminal Gate — npx archi task --check no ERROR
    □ Terminal Gate — npx archi render successful
    □ Terminal Gate — npx archi task <ID> --status done executed

    **Next-Step Gate**:
    - After current `<ID>` is complete, the primary recommendation is always `/archi.review <ID>` to review the implementation just finished.
    - When checking subsequent roadmap tasks, distinguish "needs planning" from "ready to implement":
      - Only exists in `roadmap.json`, status is `pending`, or missing `tasks/<NEXT_ID>_*/spec.md` / `plan.json` -> recommend only `/archi.plan <NEXT_ID>`.
      - Recommend `/archi.code <NEXT_ID>` only when the subsequent task is `active`, `spec.md` / `plan.json` exist, and `npx archi plan <NEXT_ID>` passes.
    - Never turn "next pending task" into `/archi.code <NEXT_ID>`; a task without detail docs cannot enter code.

    **Output**: Completion summary, including completed tasks, exempt items (if any), Next Steps:

    | Priority | Action | Description |
    |:---|:---|:---|
    | Recommended | `/archi.review <ID>` | Independent review of implementation |
    | (When Spec Drift) | `/archi.change <ID>` | Update docs before continuing |
    | (When subsequent task is not planned yet) | `/archi.plan <next pending ID>` | Generate spec / plan for that task first |
    | (When subsequent task is active and docs complete) | `/archi.code <next active ID>` | Continue implementing an already planned task |
</step_6_signoff>

</protocol_code>
