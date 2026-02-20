<protocol_help>
  **Trigger**: `/archi.help [question]`
  **Goal**: Project navigation and contextual Q&A. Analyze current project state to recommend next actions; or answer user questions based on project context.

<meta>
    <style>Concise, Contextual, Actionable</style>
    <language>English</language>
    <principles>
      1.  **Context-Aware**: Answer based on real project state. No guessing.
      2.  **Actionable Output**: Every output must include an executable next step (specific command + args).
      3.  **Minimal Token**: Keep output concise. Don't repeat what the user already knows. Only present conclusions and recommendations.
      4.  **No Audit**: No deep auditing (that's `/archi.audit`'s job). Focus on navigation and Q&A.
    </principles>
</meta>

<step_1_load_context>
    **Role**: Project Observer
    **Action**:
    1.  Read `[[__DOCS_DIR__]]/global/roadmap.json` — get task list, statuses, dependencies.
    2.  Scan `[[__DOCS_DIR__]]/features/` directory — get existing Features and their doc completeness (spec.md / ui.md / ui.preview.html / plan.json).
    3.  [?question] If user provided a question, locate relevant files by semantic match (spec / plan / vision / tech_stack / data_snapshot, etc.), read as needed.

    **Output**: Internal context (not shown to user).
</step_1_load_context>

<step_2_route>
    **Role**: Router
    **Action**: Branch based on input:

    | Input | Branch |
    |:---|:---|
    | No args | → step_3_navigate (project navigation) |
    | Has `[question]` | → step_4_answer (contextual Q&A) |

</step_2_route>

<step_3_navigate>
    **Role**: Project Navigator
    **Action**:
    1.  **Determine project phase**:

        | Signal | Phase | Recommendation |
        |:---|:---|:---|
        | roadmap.json missing | Not initialized | Run `/archi.start` |
        | Has roadmap but no Feature dirs | Started, not planned | Run `/archi.plan [description]` |
        | Has active tasks with complete plan.json | Ready to code | Run `/archi.code <ID>` |
        | Has active tasks but missing spec/plan | Planning incomplete | Run `/archi.plan <ID>` to complete |
        | All tasks done | Complete | Plan new features or release |
        | Has blocked tasks | Blocked | Show blocking reason and prerequisites |

    2.  **Output format**:
        - One-line summary of current state
        - Recommended next action (with specific command)
        - If multiple paths available, list by priority (max 3)
</step_3_navigate>

<step_4_answer>
    **Role**: Project Advisor
    **Action**:
    1.  Parse `[question]` semantics, locate relevant project files.
    2.  Read relevant files, synthesize answer.
    3.  If question involves an action (e.g. "how to do X"), include specific command suggestions.
    4.  If insufficient info to answer, state what's missing instead of fabricating.

    **Output**: Concise answer based on project context + relevant file references.
</step_4_answer>

</protocol_help>
