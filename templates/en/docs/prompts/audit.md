<protocol_audit>
  **Trigger**: `/archi.audit [id]`
  **Goal**: Independent deep code review. With `<id>` review that task's code implementation; without `<id>` run project-wide health check. Do not modify code; output review report and fix work items only.

<meta>
    <style>Investigative, Thorough, Evidence-Based</style>
    <language>English</language>
    <principles>
      1.  **Read-Only**: Do not modify any code files. Review ≠ Fix.
      2.  **Evidence-Based**: Each finding must include file path, line number, code snippet.
      3.  **Actionable Output**: Each issue must include recommended fix command (`/archi.fix`, `/archi.edit`, etc.).
      4.  **Vision Anchored**: Always use `vision.md` as direction anchor; detect drift.
      5.  **Report Persistence**: Review results must be written to file — task-level → `tasks/<id>_*/audit.md` (overwrite); project-level → `audits/YYYY-MM-DD.md` (date archive).
    </principles>
</meta>

<step_1_resolve>
    **Mode Gate**:

    | Input | Mode | Next Steps |
    |:---|:---|:---|
    | `/archi.audit <id>` | Task-level deep review | step_2_task → step_3_report |
    | `/archi.audit` | Project-level health check | step_2_project → step_3_report |

    **Task-level — Resolve ID**:
    1.  Parse `<id>` from roadmap.json → Task Name, Slug, status.
    2.  **Status Gate** — only `active` or `done` may be reviewed:

        | Status | Handling |
        |:---|:---|
        | `active` / `done` | Pass |
        | `pending` | Reject — no code to review |
        | `blocked` | Reject — upstream deps incomplete |

    3.  **Load**: vision.md (direction anchor) + task docs (spec/plan/ui) + prior audit.md (for comparison) + project context (tech_stack/design_tokens/data_snapshot/ui_context/ui_concept). Read all code files for this task.

    **Project-level — Load Overview**:
    1.  Read vision.md, roadmap.json, map.json, 02_tech_stack.md.
    2.  Scan tasks/ directory structure.
    3.  Read project code entry points and key modules.

    **Output**: Review scope and context checklist.
</step_1_resolve>

<step_2_task>
    **Role**: Chief Auditor
    **Scope**: Task-level deep code review (only when `/archi.audit <id>`).

    Review dimension by dimension; each finding must include `file:line` + code snippet + severity:

    | # | Dimension | Review focus |
    |:---|:---|:---|
    | 1 | **Vision alignment** | Implementation direction conflicts or drift from `vision.md` |
    | 2 | **Spec completeness** | Code covers all scenarios and boundaries in `spec.md` |
    | 3 | **Plan truthfulness** | Tasks marked `done` actually implemented (prevent false completion) |
    | 4 | **Logic correctness** | Business logic errors, contradictions, missing branches, state machine defects |
    | 5 | **Bug hunting** | null/undefined, race conditions, resource leaks, infinite loops, off-by-one |
    | 6 | **Error handling** | Swallowing, silent failure, error propagation chain, user-visible feedback |
    | 7 | **Tech Stack compliance** | Per `02_tech_stack.md`: forbidden patterns, outdated API, hardcoding |
    | 8 | **Security** | Sensitive info leak, unvalidated input, injection risk, permission checks |
    | 9 | **Performance** | Unnecessary full imports, large loops, dead computation, memory leaks, N+1 queries |
    | 10 | (When this task involves UI) **Design compliance** | Token usage; no hardcoded magic values; visual consistency with `ui_concept.html` |
    | 11 | (When this task involves data) **Data consistency** | Field names/types match `data_snapshot.json` |
    | 12 | (i18n projects only) **I18n compliance** | No hardcoded strings; must use Key/dictionary refs |
    | 13 | **Orphan .gitkeep** | `.gitkeep` exists when dir has other files — remove |
    | 14 | **Spec-Code drift** | Interface/type/behavior match `spec.md`; manual changes synced to docs |
    | 15 | (When this task involves UI) **UI ref completeness** | `ui.md` `ref: ui_concept.html#S-XX` pointers still valid |

    **Output**: Finding list grouped by dimension; each with level, location, description.
</step_2_task>

<step_2_project>
    **Role**: Chief Auditor
    **Scope**: Project-level health check (only when `/archi.audit` no args).

    | # | Check | Description |
    |:---|:---|:---|
    | 1 | **Vision drift** | `roadmap.json` task directions align with `vision.md` |
    | 2 | **Architecture consistency** | `map.json` vs actual dir structure; drift or unregistered modules |
    | 3 | **Roadmap health** | Consistency + progress stats + long blocked + dep cycle detection |
    | 4 | **Doc completeness** | Each Task has spec.md + plan.json; orphan directories |
    | 5 | **Tech Stack global compliance** | Spot-check key entry points and modules |
    | 6 | **Cross-Task consistency** | Duplicate logic, naming conflicts, interface inconsistency |
    | 7 | **Orphan .gitkeep** | `.gitkeep` exists when dir has other files |

    After scan, recommend tasks for deep review (`done` but plan incomplete / large codebase no tests / long `active`).

    **Output**: Project health overview + deep review recommendation list.
</step_2_project>

<step_3_report>
    **Action**:

    **Issue Classification**:

    | Level | Meaning | Example |
    |:---|:---|:---|
    | `CRITICAL` | Must fix, blocks release | Logic error, security hole, data corruption risk |
    | `WARNING` | Should fix, risk exists | Missing error handling, performance hazard, Spec coverage gap |
    | `INFO` | Suggested optimization | Non-standard naming, missing comments, simplifiable code |

    **Issue Format** (each must include):
    ```
    [LEVEL] file:line — Dimension name
      Description: specific problem
      -> Recommended fix: /archi.fix <ID> <description> or /archi.edit <ID> <description>
    ```

    **Action Routing**:

    | Issue Type | Recommended Command |
    |:---|:---|
    | Bug | `/archi.fix <ID> <description>` |
    | Spec gap | `/archi.edit <ID> <supplement description>` |
    | Architecture-level | `/archi.revise <description>` |
    | Feature incomplete | `/archi.code <ID>` |
    | Minor | Address in next `/archi.code` |

    **Report Structure**: Review summary → Finding list (CRITICAL → WARNING → INFO) → Stats summary → Fix work items → Next Steps.

    **Write Report File**:
    - Task-level → `[[__DOCS_DIR__]]/tasks/<id>_<Slug>/audit.md` (overwrite)
    - Project-level → `[[__DOCS_DIR__]]/audits/YYYY-MM-DD.md` (date archive)

    **Output**: Full review report (to conversation and file).
</step_3_report>

</protocol_audit>
