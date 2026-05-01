<protocol_help>
  **Trigger**: `/archi.help [question]`
  **Goal**: Project navigation and context Q&A. Analyze project current state, recommend next action; or answer user questions based on project context.

<meta>
    <style>Concise, Contextual, Actionable</style>
    <language>English</language>
    <principles>
      1.  **Context-Aware**: Answer based on project's real state, do not guess without evidence.
      2.  **Actionable Output**: Each output must include executable next step suggestions (specific command + parameters).
      3.  **Minimal Token**: Concise output, do not repeat information user already knows. Only present reasoning conclusions and suggestions.
      4.  **No Review**: Do not do deep review (that's `/archi.review`'s responsibility). Focus on navigation and Q&A.
    </principles>
</meta>

<step_1_load_context>
    **Action**:
    0.  **Context Pack Gate**: If `00_system.md` Front Pipeline has produced Context Pack, prioritize consuming it; if user question involves project files and Context Pack is missing, fill it first.
    1.  **Load**: roadmap.json (only id/title/status/deps/tag, skip goal/notes).
    2.  **Scan Tasks**: Scan tasks/ directory — Get existing Tasks and their document completeness (whether spec.md / ui.md / plan.json exist).
    3.  [?question] If user brought a question, locate relevant files by semantics and read as needed.

    **Output**: Internal context (not output to user).
</step_1_load_context>

<step_2_route>
    **Action**: Branch by input:

    | Input | Branch |
    |:---|:---|
    | No parameter | → step_3_navigate (project navigation) |
    | Has `[question]` | → step_4_answer (context Q&A) |

</step_2_route>

<step_3_navigate>
    **Action**:
    1.  **Determine project phase**:

        | Signal | Phase | Suggestion |
        |:---|:---|:---|
        | roadmap.json does not exist | Not initialized | New project → `/archi.init`; existing code → `/archi.init` |
        | Has roadmap but no Task directory | Started, not planned | `/archi.plan` to plan new tasks |
        | Has Legacy stub (Spec-Status: Stub) | Inherited, not filled | `/archi.change LEG-xx` to fill spec |
        | Has active task and plan.json complete | Can code | `/archi.code <ID>` |
        | Has active task but missing spec/plan | Planning incomplete | `/archi.plan <ID>` to complete |
        | All tasks done | Completed | `/archi.plan` to plan new tasks or release |
        | Has blocked tasks | Has blockers | Prompt block reason and prerequisite dependencies |

    2.  **Output**: One-sentence state summary + recommended next step (with command) + optional paths (≤3, by priority).
</step_3_navigate>

<step_4_answer>
    **Action**:
    1.  Parse `[question]` semantics, locate relevant project files and read.
    2.  Answer comprehensively; questions involving operations must include specific command suggestions.
    3.  If information insufficient to answer, clearly state what's missing, do not fabricate.

    **Output**: Concise answer based on project context + relevant file references.
</step_4_answer>

</protocol_help>