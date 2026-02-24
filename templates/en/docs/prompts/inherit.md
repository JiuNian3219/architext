<protocol_inherit>
  **Trigger**: `/archi.inherit`
  **Phase**: Legacy Adoption
  **Goal**: Reverse-engineer an existing codebase to generate the Architext document skeleton, bringing the project under framework governance.

<meta>
    <style>Analytical, Systematic, Evidence-Based</style>
    <language>English</language>
    <principles>
      1.  **Code-Driven**: Code is the sole source of truth; do not speculate on features without evidence.
      2.  **AI-Native Perspective**: All analysis from AI Agent perspective. Focus: Context Locality, Type Safety, Module Boundaries.
      3.  **User Agency First**: AI analysis must be confirmed by the user. When code interpretation is ambiguous, ask the user; do not decide unilaterally.
      4.  **Minimal Token**: Prioritize config files and entry points; avoid scanning every line of code.
      5.  **Option Z Everywhere**: Supplementary questions must include `[Z] Custom`.
    </principles>
</meta>

<step_0_recon>
    **Role**: Intelligence Analyst
    **Action**:
    1. Read project root config files (auto-detect type):

       | Language/Ecosystem | Config Files |
       |:---|:---|
       | Node.js | package.json, tsconfig.json |
       | Rust | Cargo.toml |
       | Go | go.mod |
       | Python | pyproject.toml, requirements.txt |
       | Java | pom.xml, build.gradle |
       | Other | Use root directory config files |

    2. Read README.md (if exists).
    3. Scan directory structure (top-level + core source directories, two levels deep).
    4. Infer project feature tags (UI / Data / CLI / Lib / API — from directory structure, dependencies, and config).
    5. Identify entry points and core modules.

    **Output**: Internal summary (not shown to user), proceed to step_1.
</step_0_recon>

<step_1_analysis>
    **Role**: System Analyst
    **Scan Strategy**: Medium-depth scan — read each module's entry file and core business files, extract main flow chains. Do not traverse every file.

    **Action**:
    1. For each identified functional module:
       - Read entry file + 1-2 core business files
       - Extract main flows (user action → system processing → result)
       - Record associated file paths
    2. For shared/infrastructure code (utils, middleware, config):
       - Record directory and responsibility only; do not treat as functional modules
    3. Extract domain terminology and naming conventions from code.

    **Output**: Present structured analysis report to user:
    ```
    ### Codebase Analysis Report
    > **Project**: [Name] | **Type**: [UI/Data/CLI/Lib/API] | **Scale**: ~[file count] files, [dir count] directories

    **Tech Stack**:
    | Category | Selection |
    |:---|:---|
    | Language | ... |
    | Framework | ... |
    | Build | ... |
    | Testing | ... |
    | Deployment | ... |

    **Architecture Pattern**: [Inference] — [Evidence]

    **Functional Module Inventory**:
    | # | Module | Source Location | Responsibility | Key Flows |
    |:---|:---|:---|:---|:---|
    | 1 | [Name] | [Path] | [One sentence] | [Flow1], [Flow2] |

    **Shared Infrastructure**:
    | Directory | Responsibility |
    |:---|:---|
    | [Path] | [Description] |

    **Domain Terminology**: [Term list]

    **Uncertain Items** (if any):
    - [Ambiguous item]
    ```

    **Gate**: User confirms or corrects. Do not proceed to step_2 without confirmation.
</step_1_analysis>

<step_2_supplementary>
    **Role**: Product Consultant
    **Trigger**: Only when step_1 has items AI cannot determine. Skip if no ambiguity.

    **Action**: Ask ambiguous items in multiple-choice format.
    - 3-5 options per question + `[Z] Custom`; AI recommendation marked `[Recommended]`.
    - Total questions capped at 3.

    Common ambiguities:
    - Architecture pattern cannot be confirmed
    - Certain directory responsibilities unclear
    - Vision info (North Star Metric, design philosophy) cannot be inferred from code

    **Output Format**:
    ```
    ### Supplementary Confirmation

    **[Q1] Question Title**
    > Why this information is needed

    | ID | Option | Description |
    |:---|:---|:---|
    | A [Recommended] | ... | ... |
    | B | ... | ... |
    | Z | Custom | (Please describe) |

    ---
    **INPUT**: `Q1 answer | Q2 answer | ...`
    ```
</step_2_supplementary>

<step_3_constitution>
    **Role**: Chief Architect
    **Input**: Step 1 analysis report + Step 2 supplements (if any).
    **Action**: Generate project document skeleton in one pass.

    ### Information Routing Rules

    > Rule files (`02_tech_stack`, `90_custom_rules`, etc.) are already injected into context by the IDE — the AI knows their paths; write directly.

    | Information from Code | Target File |
    |:---|:---|
    | README project description, target users, feature list | `[[__DOCS_DIR__]]/global/vision.md` |
    | Dependency list, config files, code patterns | rule file `02_tech_stack` |
    | Directory structure, module dependencies, user journeys | `[[__DOCS_DIR__]]/global/map.json` |
    | Domain terminology, abbreviations, naming conventions | `[[__DOCS_DIR__]]/global/dictionary.json` |
    | eslint/prettier and existing standards | rule file `90_custom_rules` |
    | Error code definitions in code | `[[__DOCS_DIR__]]/global/error_codes.json` |
    | [?UI] CSS variables/theme config | `[[__DOCS_DIR__]]/global/design_tokens.json` |
    | [?Data] Schema/Migration files | `[[__DOCS_DIR__]]/global/data_snapshot.json` |

    ### 3.1 Vision (`[[__DOCS_DIR__]]/global/vision.md`)
    - Derive from README + project config
    - Items that cannot be derived: mark `(AI Inferred — user review recommended)`
    - Do not retain template placeholders

    ### 3.2 Tech Stack (rule file `02_tech_stack`)
    - Existing dependencies/config → write directly
    - Visible code conventions (naming, structure) → write to Coding Standards
    - Must populate complete Section 1-8

    ### 3.3 Custom Rules (rule file `90_custom_rules`)
    - Extract rules from eslint/prettier/editorconfig
    - Identify team conventions from code patterns (e.g., named export preference, async/await style)

    ### 3.4 Roadmap (`[[__DOCS_DIR__]]/global/roadmap.json`)

    **Structure**:
    ```json
    {
      "version": 1,
      "projectStatus": "active",
      "lastUpdated": "<date>",
      "phases": [
        {
          "id": "phase-0",
          "name": "Legacy",
          "tasks": [
            {
              "id": "LEG-01",
              "title": "<Module Name>",
              "status": "done",
              "goal": "<One-line summary>. See features/LEG-01_<Slug>/spec.md",
              "deps": [],
              "tag": "Legacy",
              "slug": "<Slug>"
            }
          ]
        },
        { "id": "phase-1", "name": "Infrastructure", "tasks": [] },
        { "id": "phase-2", "name": "Core Features", "tasks": [] }
      ]
    }
    ```

    **Rules**:
    - Functional modules → `phase-0: Legacy`, status `done`, tag `Legacy`, ID prefix `LEG-`
    - Shared/infrastructure code does not enter roadmap; only goes to map.json directoryMapping
    - phase-1/2 remain as empty skeletons
    - Dependencies between LEG tasks must be reflected in deps

    ### 3.5 Feature Stub Specs

    Create `[[__DOCS_DIR__]]/features/LEG-xx_<Slug>/spec.md` for each LEG task:

    ```markdown
    # LEG-xx: [Title]

    > **Spec-Status**: Stub
    > **Source**: Reverse-engineered from [source path]

    ## Overview
    [One paragraph description]

    ## Key Flows
    1. **[Flow Name]**: [A] → [B] → [C]
    2. **[Flow Name]**: [A] → [B] → [C]

    ## Associated Files
    - [Role]: `[Path]`
    - [Role]: `[Path]`
    ```

    > Stubs are a starting point, not the final state. Enrich later via `/archi.adopt` or `/archi.edit`.

    ### 3.6 map.json Population
    - `directoryMapping`: Each core directory → `{ "path", "layer", "responsibility", "publicAPI" }`
    - `logicalTopology`: Inter-module dependencies → `{ "from", "to", "type" }` (imports / calls / extends)
    - `criticalUserJourneys`: Core flows → `{ "name", "steps": ["module → module → ..."] }`
    - `featureRelations`: Scan code to identify "aggregator modules" and record them.
      **Recognition patterns**: A module that iterates/enumerates/dynamically loads modules of the same type (e.g., `for (const cmd of allCommands)`, `Object.values(registry)`, reading a directory then dynamic import), or is described as "aggregating/listing/registering all X".
      Record format: `{ "aggregator": "<ID or file path>", "sources": "<source range description>", "evidence": "<code basis>", "checkNote": "When features of this type are added or removed, check whether <aggregator> needs to be updated" }`

    ### 3.7 Other Global Documents (as needed)
    - `dictionary.json`: Extract domain terminology from code
    - [?UI] `design_tokens.json`: Extract from CSS variables/theme
    - [?Data] `data_snapshot.json`: Extract from schema/migration
    - `error_codes.json`: Extract from error definitions in code

    **Output**: Write all files, then run `npx archi render`.
</step_3_constitution>

<step_4_audit>
    **Role**: Chief Auditor
    **Checklist**:
    1.  **Vision Alignment**: Does vision.md match actual code functionality?
    2.  **Tech Stack Consistency**: Does rule file `02_tech_stack` match package.json/config?
    3.  **Map Coverage**: Does map.json cover all core directories?
    4.  **Roadmap Completeness**: Does phase-0 cover all identified functional modules?
    5.  **Stub Completeness**: Does every LEG-xx have a corresponding features/ directory and spec.md?
    6.  **Dictionary Consistency**: No ambiguous or duplicate terms?

    Silently fix issues; mark severe problems as `Risk Warning`.
</step_4_audit>

<step_5_signoff>
    **Action**:
    1.  Run `npx archi task` to display task overview.
    2.  Output summary.

    **Output**: Reverse-engineering summary containing:
    - **Project Overview**: Type, scale, number of core modules
    - **Legacy Features**: LEG-xx list (ID / Name / Source location)
    - **Generated Documents**: File list
    - **AI Inferred Items**: Mark confidence level (High/Medium/Low)
    - **Next Steps**:

    | Priority | Action | Description |
    |:---|:---|:---|
    | 1 | Review vision.md | Confirm AI-inferred vision description is accurate |
    | 2 | `/archi.adopt LEG-xx` | Enrich core module stubs into full specs |
    | 3 | `/archi.scope [file_path]` | Plan new features/major modules |
    | 4 | `/archi.plan <task ID>` | Deep-plan individual tasks |
</step_5_signoff>

</protocol_inherit>
