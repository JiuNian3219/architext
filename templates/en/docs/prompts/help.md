<protocol_help>
  **Trigger**: `/archi.help [lang]`
  **Goal**: Display the complete Architext command list, explain the DDAD (Document-Driven AI Development) workflow, and show the project directory structure.

<meta>
    <style>Clean, Structured, Manual-Style</style>
    <language>English</language>
    <principles>
      1.  **Lifecycle-Oriented**: Group by project lifecycle (Start->Define->Change->Execute), not simple alphabetical order.
      2.  **Logic Clarity**: Clearly explain core logic (e.g. why `/archi.plan` writes docs instead of code).
      3.  **Bilingual Support**: Output corresponding language based on `[lang]` (zh/zh-Hant/en), default is Chinese.
      4.  **Structure Awareness**: Show project directory structure to help users understand file organization.
    </principles>
</meta>

<step_1_render>
    **Role**: Technical Writer
    **Action**: Output the following Markdown manual.

    **Content**:

    # 📘 Architext Command Manual (v1.1)

    > **Core Philosophy**: **No Docs, No Code.**
    > All code changes must start with documentation (Define) and end with audit (Audit).

    ---

    ## 📁 Project Structure

    After initialization, Architext will create the following structure in the project:

    ```
    my-project/
    │
    ├── .cursor/rules/              # Cursor IDE rules directory
    │   ├── 00_system.mdc           # System Constitution - AI Identity & Thought Loop
    │   ├── 01_workflow.mdc         # Workflow Router - Command Recognition & Mode Switching
    │   ├── 02_tech_stack.mdc       # Tech Laws - Tech Stack Selection & Coding Standards
    │   ├── 90_custom_rules.mdc     # User House Rules - Team Custom Constraints
    │   └── 99_context_glue.mdc     # Context Bridge - Code & Docs Association
    │
    ├── .cursor/commands/           # Cursor IDE commands directory (Cursor only)
    │   ├── archi.start.md          # /archi.start command definition
    │   ├── archi.plan.md           # /archi.plan command definition
    │   ├── archi.code.md           # /archi.code command definition
    │   ├── archi.fix.md            # /archi.fix command definition
    │   ├── archi.edit.md           # /archi.edit command definition
    │   └── archi.help.md           # /archi.help command definition
    │
    ├── .trae/rules/                # Trae IDE rules directory (same as above, extension is .md)
    │   └── ...
    │
    ├── .architext/                 # Documentation Directory (default name, configurable)
    │   │
    │   ├── global/                 # Global Docs - Project Level Assets
    │   │   ├── 00_roadmap.md       # Roadmap - Task Dependencies & Progress Tracking
    │   │   ├── 00_vision.md        # Vision - North Star Metrics & Design Philosophy
    │   │   ├── 01_map.md           # Architecture Map - Directory Index & Logical Topology
    │   │   ├── 02_dictionary.md    # Dictionary - Business Terms & Component Registry
    │   │   ├── 03_design_tokens.md # Design System - Colors/Fonts/Spacing (if UI exists)
    │   │   ├── 04_data_snapshot.md # Data Snapshot - Database Schema Mirror (if Data layer exists)
    │   │   └── 05_error_codes.md   # Error Codes - Business Error Code Definition
    │   │   
    │   ├── prompts/                # Prompt Templates - Instruction Protocols for AI
    │   │   ├── start.md            # Project Kickoff Protocol
    │   │   ├── plan.md             # Feature Planning Protocol
    │   │   ├── code.md             # Code Implementation Protocol
    │   │   ├── edit.md             # Requirement Change Protocol
    │   │   ├── fix.md              # Bug Fix Protocol
    │   │   └── help.md             # Help Manual (this file)
    │   │
    │   ├── templates/              # Doc Templates
    │   │   ├── spec.template.md    # Feature Spec Template (Gherkin)
    │   │   ├── ui.template.md      # UI Design Template (ITP v3.0)
    │   │   └── plan.template.md    # Implementation Plan Template
    │   │
    │   └── features/               # Feature Docs - Organized by Module
    │       └── <ID>_<Name>/        # One folder per feature
    │           ├── 1.spec.md       # Feature Spec - Gherkin Scenarios
    │           ├── 2.ui.md         # UI Design - ITP Component Tree (if applicable)
    │           └── 3.plan.md       # Implementation Plan - Task List
    │
    └── xxx/                        # Business Code (Actual Project Code)
        └── ...
    ```

    **Note**:
    - **IDE Rules Directory**: Rules files are copied to the corresponding directory (`.cursor/rules/`, `.trae/rules/`, etc.) based on the selected IDE.
    - **IDE Commands Directory**: Cursor only. Command files are generated to `.cursor/commands/` directory, with filename format `archi.{command}.md`.
    - **Docs Directory**: Defaults to `.architext/`, configurable to other names via `architext.json`.
    - **Extension Diff**: Cursor rules files use `.mdc`, other IDEs use `.md`.

    ---

    ## 1. Initialization

    | Command | Args | Role (Brief) | Core Logic |
    | :--- | :--- | :--- | :--- |
    | **`/archi.start`** | `[context]` | **🔥 Project Cold Start**<br>Start a new project from scratch. | Interview Vision -> Confirm Style -> Confirm Tech Stack -> **Create Docs Skeleton**. |
    | **`/archi.inherit`** | `(none)` | **🏰 Legacy Takeover**<br>Take over an existing legacy project. | Full Code Scan -> Reverse Deduction -> **Fill Global Docs**. |
    | **`/archi.map`** | `(none)` | **🗺️ Refresh Map**<br>Refresh directory map. | Scan File System -> **Update 01_map.md**. |

    ---

    ## 2. Definition

    > **Rule**: **No code** is written in this phase, only Spec/UI/Plan docs in `.architext/features/` are generated.

    | Command | Args | Role (Brief) | Core Logic |
    | :--- | :--- | :--- | :--- |
    | **`/archi.plan`** | `[id \| context]` | **✨ Feature Planning**<br>Define new feature or refine existing one. | Smart Decision:<br>1. Has ID -> Read existing docs, deep refine.<br>2. No ID -> **Create New ID** -> Architecture Interview -> Generate Spec/UI/Plan. |
    | **`/archi.adopt`** | `[context]` | **📦 Adopt Legacy**<br>Adopt legacy code. | Fuzzy Search Code -> **Auto Draft ID** -> Reverse Generate Spec/UI. |

    ---

    ## 3. Evolution

    | Command | Args | Role (Brief) | Core Logic |
    | :--- | :--- | :--- | :--- |
    | **`/archi.edit`** | `<id> [context]` | **📝 Modify Spec/UI**<br>Modify **local** feature requirements. | Read Old Docs -> Inject New Req -> **Update Spec/UI** -> Append Plan. |
    | **`/archi.revise`** | `<target> [context]` | **🧠 Global Revision**<br>Modify **global** settings (e.g. Tech Stack). | Modify Vision/Tech/Roadmap -> **Broadcast Changes** (Notify related Features). |

    ---

    ## 4. Execution

    | Command | Args | Role (Brief) | Core Logic |
    | :--- | :--- | :--- | :--- |
    | **`/archi.code`** | `<id>` | **🔨 Write Code**<br>Translate docs to code. | Read Plan -> Generate/Modify Code -> **Static Check + Auto Audit**. |
    | **`/archi.fix`** | `[id] <context>` | **🚑 Bug Fix**<br>Fix Bug (Not requirement change). | Diagnose Error -> Record Plan -> **Fix Code** (Usually don't modify Spec). |

    ---

    ## 5. Maintenance

    | Command | Args | Role (Brief) | Core Logic |
    | :--- | :--- | :--- | :--- |
    | **`/archi.map`** | `(none)` | **🔄 Refresh Map**<br>Manually refresh architecture map. | Rescan Directory Tree -> Update `01_map.md` (File Topology). |
    | **`/archi.help`** | `[lang]` | **📖 Manual**<br>Show this manual. | Show command list, project structure & usage. |

    ---

    ## 💡 Quick Decision Guide

    | Scenario | Recommended Command |
    | :--- | :--- |
    | **New Project** from scratch | `/archi.start` |
    | **Legacy Project** takeover | `/archi.inherit` |
    | **New Feature** definition | `/archi.plan [Feature Description]` |
    | **Existing Feature** deep refine | `/archi.plan [Feature_ID]` |
    | **Legacy Code** documentation | `/archi.adopt` |
    | **Change Req** (Local) | `/archi.edit <id> [Change Description]` |
    | **Change Global** (Tech/Arch) | `/archi.revise <target> [Change Description]` |
    | **Write Code** implement feature | `/archi.code <id>` |
    | **Fix Bug** | `/archi.fix [id] <Bug Description>` |
    | **Refresh Map** | `/archi.map` |

    ---

    ## 🔄 Typical Workflow

    ```
    /archi.start [Project Description]     # Step 1: Project Init -> Generate Vision/Tech/Roadmap
           ↓
    /archi.plan [Feature Description]      # Step 2: Feature Planning -> Generate Spec/UI/Plan
           ↓
    /archi.code <Feature_ID>    # Step 3: Code Implementation -> Static Check + Audit
           ↓
    (Found Bug?)
           ↓
    /archi.fix [Feature_ID] <Bug Description>     # Step 4: Bug Fix (If needed)
           ↓
    (Requirement Change?)
           ↓
    /archi.edit [Feature_ID] <Change Description>    # Step 5: Req Change (If needed) -> Update Spec/UI/Plan
           ↓
    /archi.code <Feature_ID>    # Step 6: Continue Implementation
    ```

    ---

    > **🧭 Next Step**: 
    > - New Project? Run `/archi.start [Your Project Description]` to start initialization.
    > - Existing Project? Run `/archi.inherit` to take over existing codebase.
    > - Want to plan new feature? Run `/archi.plan [Feature Description]` to start architecture interview.

</step_1_render>

</protocol_help>
