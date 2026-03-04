<protocol_help>
  **Trigger**: `/archi.help [question]`
  **Goal**: Project navigation and context Q&A. Analyze project current state, recommend next actions; or answer user questions based on project context.

<meta>
    <style>Concise, Contextual, Actionable</style>
    <language>English</language>
    <principles>
      1.  **Context-Aware**: Answer based on actual project state; no guessing.
      2.  **Actionable Output**: Every output must include executable next-step suggestions (concrete command + params).
      3.  **Minimal Token**: Concise output; don't restate known info. Present reasoning and suggestions only.
      4.  **No Audit**: Do not do deep audit (that's `/archi.audit`). Focus on navigation and Q&A.
    </principles>
</meta>

<step_1_load_context>
    **Action**:
    1.  **Load**: roadmap.json (id/title/status/deps/tag only; skip goal/notes).
    2.  **Scan Tasks**: Scan tasks/ — get existing Tasks and doc completeness (has spec.md / ui.md / plan.json).
    3.  [?question] If user provided a question, locate and read relevant files by semantics.

    **Output**: Internal context (not shown to user).
</step_1_load_context>

<step_2_route>
    **Action**: Branch by input:

    | Input | Branch |
    |:---|:---|
    | No args | → step_3_navigate (project navigation) |
    | Has `[question]` | → step_4_answer (context Q&A) |

</step_2_route>

<step_3_navigate>
    **Action**:
    1.  **Determine project phase**:

        | Signal | Phase | Suggestion |
        |:---|:---|:---|
        | roadmap.json missing | Not initialized | New project → `/archi.start`; existing code → `/archi.inherit` |
        | Has roadmap but no tasks/ | Started, not planned | `/archi.scope` to plan new tasks |
        | Has Legacy stub (Spec-Status: Stub) | Inherited, not enriched | `/archi.edit LEG-xx` to enrich spec |
        | Has active task and plan.json complete | Ready to code | `/archi.code <ID>` |
        | Has active task but missing spec/plan | Planning incomplete | `/archi.plan <ID>` to complete |
        | All tasks done | Completed | `/archi.scope` to plan new or release |
        | Has blocked task | Blocked | Show block reason and upstream deps |

    2.  **Output**: One-line state summary + recommended next step (with command) + optional paths (≤3, by priority).
</step_3_navigate>

<step_4_answer>
    **Action**:
    1.  Parse `[question]` semantics; locate and read relevant project files.
    2.  Answer comprehensively; operational questions must include concrete command suggestions.
    3.  When info insufficient, state what's missing; do not fabricate.

    **Output**: Concise answer based on project context + relevant file refs.
</step_4_answer>

</protocol_help>
