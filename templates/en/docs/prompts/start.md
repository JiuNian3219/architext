<protocol_kickoff>
  **Trigger**: `/archi.start [context]`
  **Phase**: Strategic Initialization
  **Goal**: Establish high-cohesion Project Constitution (Vision/Tech/Roadmap) through **"Domain Detection -> Intent Extraction -> Deep Alignment -> Architecture Deduction"**.

<meta>
    <style>Strict, Professional, CLI-Like</style>
    <language>English</language>
    <principles>
      1.  **Structure over Chat**: Output must be like a structured "Dashboard", strictly NO chatty filler.
      2.  **User Agency First**: Prioritize extracting explicit requirements from `[context]`, mark as `✅ Core` directly (No need for user to re-select).
      3.  **Rich Menu**: Generate **6-10** valuable "Extension Features" (A-J) based on domain type for user to check.
      4.  **Maximize Options**: Each strategic decision question **MUST provide 6 options (A-F)**, strictly NO just A/B/C/D.
      5.  **Rich Context**: Each option must include: **Brief** | **Use Case** | **Pros** | **Cons** | **Subsequent Impact**.
      6.  **Proactive Analysis**: If user context is vague, AI must generate targeted options by analyzing implicit needs, not generic talk.
      7.  **Option Z Everywhere**: Extension menu and all decision items must include `[Z] Custom`.
      8.  **Pipeline Input**: Guide user to use `|` separator for efficient reply (e.g. `A B Z="MyIdea" | A | B`).
      9.  **Clear Next Steps**: Must explicitly inform user of next steps and possible branches after each step.
    </principles>
    
    <output_template>
      ### 📡 ARCHITEXT DOMAIN DETECTOR
      > **Status**: [Scanning Context...] -> [Domain Type Detected]
      
      ### 🧩 FEATURE MATRIX
      **✅ Core Modules (Core - Auto Activated)**
      1. [User Feature 1]
      2. [User Feature 2]

      **⬜ Extension Menu (Extensions - Please Select)**
      | ID | Feature Name | Brief | Use Case | Impact |
      |:---|:---|:---|:---|:---|
      | [A] | Feature Name | Description | When to use | Impact |
      | [B] | ... | ... | ... | ... |
      | ... | (Provide at least to H) | ... | ... | ... |
      | [Z] | **Custom** | (Please enter description) | - | - |

      ### ⚙️ STRATEGIC DECISIONS (ADR)
      **[Q1] Decision Title**
      | Option | Brief | Use Case | Pros | Cons | Impact |
      |:---|:---|:---|:---|:---|:---|
      | [A] | ... | ... | ... | ... | ... |
      | [Z] | Custom | - | - | - | - |

      **[Q2] ...**
      **[Q3] ...**
      **[Q4] ...**

      ---
      **⌨️ INPUT (Pipeline Reply)**: `ExtensionIDs (Space separated) | Q1 | Q2 | Q3 | Q4`
    </output_template>
</meta>

<step_0_benchmark>
    **Role**: Industry Researcher
    **Action**:
    - **Analyze Context**: Analyze product domain based on user input `[context]`.
    - **Search Benchmarks**: Search and identify 1-3 **Benchmark Products** or **SOTA Open Source Projects** in that domain.
    - **Output**: List these references at the beginning of output as baseline for subsequent decisions.
    - **Example Output**:
      > 🏆 **Benchmarks Detected**: 
      > *   **Commercial**: Linear (Issue Tracking), Notion (Docs)
      > *   **Open Source**: AppFlowy (Rust/Flutter)
</step_0_benchmark>

<step_1_strategy>
    **Role**: CPO (Strategic Mode)
    **Input**: `[context]` provided by user.

    **Action 1: Domain Classification**
    - Analyze user intent, classify project into one of the following:
      - **Web Application**: SPA/MPA/SSR Website App
      - **CLI Tool**: Command Line Interface Tool
      - **Backend Service**: API Service/Microservice
      - **Library/SDK**: Reusable Library or DevKit
      - **Mobile App**: iOS/Android/Cross-platform App
      - **Desktop App**: Electron/Tauri Desktop App
      - **Data Pipeline**: ETL/Data Processing Pipeline
      - **AI/ML Project**: Machine Learning/AI related
      - **Game**: Game Project
      - **Embedded/IoT**: Embedded/Internet of Things
      - **Hybrid**: Hybrid Type

    **Action 2: Feature Matrix Generation**
    - **Part 1: Core**: Extract features explicitly mentioned by user, mark as numbered list `1. 2. 3.`, status `✅`.
    - **Part 2: Extensions**: 
        - Based on domain attributes, **Brainstorm 6-10** common enhanced features for this category.
        - **Format**: Use `[A], [B], [C]...[J]` single letter as ID.
        - **Must Include**: `[Z] Custom: (Please specify in reply)`.
        - **Each Extension Must Provide**: Brief, Use Case, Impact.

    **Action 3: Strategic Gap Analysis**
    - Generate 4 key strategic questions (ID `Q1`, `Q2`, `Q3`, `Q4`).
    - **Each question must provide 6 options (A-F) + Z (Custom)**.
    - **Each option must include complete decision info table**.

    ---

    **[Q1] Product DNA** - Core Value & Target User
    | Option | Brief | Use Case | Pros | Cons | Impact |
    |:---|:---|:---|:---|:---|:---|
    | **[A] Pure Tool** | Extreme efficiency, no ads, no social, leave after use | Efficiency tool, Dev tool | Focus on core, fast dev | Limited growth, no stickiness | No user system, no backend (optional) |
    | **[B] Community Driven** | Emphasize sharing & leaderboard, social viral | UGC platform, interest community | Self-propagation, high stickiness | Operation pressure, hard cold start | User system, notification, sharing needed |
    | **[C] Commercial Oriented** | Pursue monetization efficiency, ads/IAP | Consumer App, SaaS | Promising revenue | User experience compromise | Payment integration, subscription system needed |
    | **[D] Education Exploration** | For beginners, emphasize guide & fun | Learning platform, kids app | User friendly, differentiation | Pro users feel verbose | Guide system, tutorial module needed |
    | **[E] Enterprise** | B2B/Internal tool, emphasize stability & compliance | SaaS, Enterprise app | High unit price, long cycle | Complex sales, high customization | RBAC, Audit Log, SSO needed |
    | **[F] Open Source Driven** | Open source first, community contribution | Dev tool, Infrastructure | Eco growth, high trust | Commercialization challenge | CI/CD, Docs, Contribution Guide needed |
    | **[Z] Custom** | (Please describe) | - | - | - | - |

    **[Q2] Visual/Interaction Style**
    > *Context*: Decide user's first impression and overall experience tone.
    
    | Option | Brief | Use Case | Pros | Cons | Impact |
    |:---|:---|:---|:---|:---|:---|
    | **[A] Minimalist** | Minimalist, lots of whitespace, restrained colors | Efficiency tool, high-end brand | Clean, fast load | Might seem cold | Design Tokens mainly neutral colors |
    | **[B] Playful** | Playful, rounded corners, animation, rich colors | Consumer app, social product | Eye catching, active experience | Might seem unprofessional | Animation system, Illustration needed |
    | **[C] Corporate** | Business style, stable, professional, trust | B2B, Finance, Enterprise app | Professional trust | Might seem boring | Chart lib, Table component needed |
    | **[D] Dashboard** | Data driven, charts main, info dense | Admin panel, Data platform | Rich info | High learning cost | Chart lib, Grid layout needed |
    | **[E] CLI/Terminal** | Command line style, ASCII, Monospace | CLI tool, Developer product | Geeky, no UI burden | Hard for non-devs | Use Chalk/Picocolors |
    | **[F] Immersive** | Immersive, full screen, motion, sound | Game, Creative app | Unique experience | High dev cost | Canvas/WebGL/Audio needed |
    | **[Z] Custom** | (Please describe) | - | - | - | - |

    **[Q3] Core Experience Dimension**
    > *Context*: Product's most important experience metric, decides tech selection priority.
    
    | Option | Brief | Use Case | Pros | Cons | Impact |
    |:---|:---|:---|:---|:---|:---|
    | **[A] Speed** | Extreme response speed, millisecond interaction | Search, Real-time tool | Smooth experience | Complex architecture | Cache, Edge compute, Optimization needed |
    | **[B] Animation** | Smooth animation, 60fps transition | Consumer app, Brand display | Visual attraction | Perf overhead | Animation lib, GPU acceleration needed |
    | **[C] Reliability** | Stability first, zero crash | Enterprise app, Critical system | User trust | Long dev cycle | Error boundary, Monitor, Fallback needed |
    | **[D] Offline-First** | Offline available, weak network friendly | Mobile app, PWA | Always available | Complex sync | Service Worker/CRDT needed |
    | **[E] Security** | Security first, data protection | Finance, Medical, Compliance | Compliance, User trust | Experience compromise | Encryption, Audit, 2FA needed |
    | **[F] Extensibility** | Extensibility, Plugin/API | Platform product, Dev tool | Eco development | Complex architecture | Plugin system, SDK design needed |
    | **[Z] Custom** | (Please describe) | - | - | - | - |

    **[Q4] Scale Estimation**
    > *Context*: Decides architecture complexity and infrastructure selection.
    
    | Option | Brief | Use Case | Pros | Cons | Impact |
    |:---|:---|:---|:---|:---|:---|
    | **[A] MVP/Prototype** | <1000 Users, Single machine/Serverless | Validate idea, Personal project | Fastest launch | Poor scalability | Vercel/Cloudflare/Monolith |
    | **[B] Startup/Growth** | 1k-10k Users | Startup, Early growth | Good balance | Some architecture needed | Basic cache, DB index |
    | **[C] Scale** | 10k-100k Users | Mature product, Scaling | Scalable | Complex architecture | Load balancer, Read/Write split |
    | **[D] Large Scale** | 100k+ Users | Large platform | High availability | High ops cost | Microservices, Dist cache |
    | **[E] Enterprise** | Multi-tenant, SSO, Audit | SaaS, Enterprise deploy | High unit price | Long dev cycle | Tenant isolation, SSO integration |
    | **[F] Serverless** | Serverless, Stateless | Fluctuating traffic, Cost sensitive | Elastic, Low cost | Cold start, Vendor lock-in | Lambda/Edge Functions |
    | **[Z] Custom** | (Please describe) | - | - | - | - |

    ---
    
    **⌨️ INPUT (Pipeline Reply)**: 
    Please use `|` to separate **[Added Extensions]**, **[Q1 Choice]**, **[Q2 Choice]**, **[Q3 Choice]** and **[Q4 Choice]**.
    
    > **Format**: `ExtensionIDs (Space separated) | Q1 | Q2 | Q3 | Q4`
    > **Standard Example**: `A B D F | A | B | A | A`
    > **Custom Example**: `A C Z="Friend Leaderboard" | A | B | Z="Speed & Animation" | B`
    
    ---
    **Interaction Flow**:
    - Bridge: "✅ Strategic config received! Entering Tech Deep Dive, I will generate targeted tech selection questions based on your choices..."
    - If user choice is ambiguous or conflicting, **Proactively ask for clarification**.
</step_1_strategy>

<step_2_tech_gate>
    **Role**: CTO (Architect Mode)
    **Input**: Step 1 Result + `package.json`/`Cargo.toml`/`pyproject.toml` (if exists).
    **Target Template**: `02_tech_stack.md` (Especially §6, §7 sections)

    **Action 0: Strategy Confirmation**
    - Briefly list user selected items in Step 1 at output header:
      - ✅ Core Features
      - ➕ Extensions
      - 🎯 Strategic Decisions (Q1-Q4)
    - **Format**: Use concise list, avoid repeating full Step 1 content.

    **Action 1: Stack Locking**
    - Auto fill "Framework", "Language", "Runtime", mark as `🔒 Locked`.
    - Auto detect based on existing config file, if none then recommend based on Step 1.

    **Action 2: Architecture & Tech Deep Dive**
    - **Trigger**: After user confirms strategy.
    - **Goal**: Lock all details of `02_tech_stack.md`.
    - **Dynamic Question Generation**:
      - AI MUST dynamically generate 8 key tech selection questions based on **[Domain Type]** identified in Step 1 (Web/CLI/Mobile/Backend etc.).
      - **STRICTLY PROHIBIT using preset question templates**, must adapt to actual domain.
      - **Each question must provide 6 options (A-F) + Z (Custom)**.
      - **Each option must include complete decision info table**.

    ---

    **Required Question Categories**:
    > **Note**: Q1-Q6 are generic dimensions, Q7-Q8 are domain specific dimensions generated by AI.

    **[Q1] Core Language & Runtime**
    | Option | Brief | Use Case | Pros | Cons | Impact |
    |:---|:---|:---|:---|:---|:---|
    | **[A] TypeScript/Node** | JS Eco, Fullstack | Web, Node Service | Rich eco, Fullstack | Perf not top tier | npm eco |
    | **[B] TypeScript/Bun** | Modern JS Runtime | High perf Node alternative | Faster, Built-in tools | Eco relatively new | Bun exclusive API |
    | **[C] Rust** | System Lang | CLI, High perf service | Extreme perf, Safe | Steep learning curve | Cargo eco |
    | **[D] Go** | Simple Efficient | Backend, CLI | Simple, Good concurrency | Generics relatively new | Go Modules |
    | **[E] Python** | Fast Dev | AI/ML, Script, Backend | Rich eco, Easy to learn | Perf relatively poor | pip/conda |
    | **[F] Java/Kotlin** | Enterprise | Large Backend, Android | Mature Stable | Heavy, Slow startup | Maven/Gradle |
    | **[Z] Custom** | (Please describe) | - | - | - | - |

    **[Q2] Core Framework/Eco**
    > *Context*: Decide project skeleton. Dynamically adjust options based on Q1 Language and Project Type.
    
    *Example (Web)*: Next.js / Remix / Nuxt / SvelteKit / Astro / Fresh
    *Example (CLI)*: Commander / Cac / Clap / Cobra / Argparse / Typer
    *Example (Backend)*: NestJS / Express / Fastify / Gin / Actix / FastAPI
    *Example (Mobile)*: React Native / Flutter / SwiftUI / Jetpack Compose
    
    **[Must provide 6 options table, format as above]**

    **[Q3] Data Persistence & State**
    > *Context*: Decide how data is stored and flowed.
    
    *Example (Backend)*: PostgreSQL / MySQL / MongoDB / SQLite / Supabase / PlanetScale
    *Example (No Backend)*: LocalStorage / IndexedDB / File System / SQLite (Embedded)
    *Example (State Mgmt)*: Zustand / Jotai / Redux / Pinia / MobX
    
    **[Must provide 6 options table, format as above]**

    **[Q4] Interface & Comm**
    > *Context*: How system interacts with outside.
    
    *Example (Web UI)*: Tailwind CSS / Shadcn/UI / MUI / Ant Design / Chakra
    *Example (API)*: REST / GraphQL / tRPC / gRPC / WebSocket
    *Example (CLI)*: @clack/prompts / Ink / Blessed / Ratatui / Bubble Tea
    
    **[Must provide 6 options table, format as above]**

    **[Q5] Quality Assurance System**
    | Option | Brief | Use Case | Pros | Cons | Impact |
    |:---|:---|:---|:---|:---|:---|
    | **[A] Vitest** | Modern Vite Test Framework | Vite Project | Fast, HMR support | Vite binding | Vitest config |
    | **[B] Jest** | Mature Test Framework | React, General JS | Rich eco | Heavy config | Jest config |
    | **[C] Pytest** | Python Test | Python Project | Concise, Many plugins | Python only | pytest.ini |
    | **[D] Go Test** | Go Built-in Test | Go Project | No dependency, Standard | Basic features | *_test.go |
    | **[E] Rust Test** | Cargo Built-in Test | Rust Project | No dependency, Integrated | Basic features | #[test] |
    | **[F] Playwright/Cypress** | E2E Test | Web App | Real browser | Slow, Heavy resource | E2E config |
    | **[Z] Custom** | (Please describe) | - | - | - | - |

    **[Q6] Infrastructure & Git**
    | Option | Brief | Use Case | Pros | Cons | Impact |
    |:---|:---|:---|:---|:---|:---|
    | **[A] GitHub Actions** | GitHub CI/CD | GitHub hosted | Good integration, Free tier | GitHub binding | .github/workflows |
    | **[B] GitLab CI** | GitLab CI/CD | GitLab/Self-hosted | Good private deploy | Heavy config | .gitlab-ci.yml |
    | **[C] Docker + K8s** | Container Orchestration | Large scale deploy | Scalable | Complex ops | Dockerfile, k8s config |
    | **[D] Vercel/Netlify** | Serverless Deploy | Frontend/Fullstack | Minimal deploy | Vendor lock-in | vercel.json |
    | **[E] Trunk-Based** | Trunk Based Dev | Small team, Fast iteration | Simple, Reduce conflict | Good CI needed | Branch strategy |
    | **[F] Git Flow** | Branch Workflow | Large team, Release rhythm | Clear, Traceable | Complex branches | Branch naming convention |
    | **[Z] Custom** | (Please describe) | - | - | - | - |

    **[Q7] Domain Specific Decision A**
    > *Trigger*: AI must identify the most core pain point or branch of this domain.
    
    *Example (Web)*: CSR vs SSR vs SSG vs ISR (Rendering Strategy)
    *Example (Mobile)*: Cross-Platform vs Native
    *Example (CLI)*: Binary Distribution vs npm Package
    *Example (AI Agent)*: Local LLM vs Cloud API
    *Example (Game)*: 2D vs 3D Engine
    
    **[Must provide 6 options table, format as above]**

    **[Q8] Domain Specific Decision B**
    > *Trigger*: Secondary important decision identified by AI.
    
    *Example (SaaS)*: Multi-Tenant Strategy (Schema vs Database)
    *Example (Game)*: Networking Model (P2P vs Server Authoritative)
    *Example (CLI)*: Config Format (TOML vs YAML vs JSON)
    *Example (Backend)*: Monolith vs Microservices
    
    **[Must provide 6 options table, format as above]**

    ---
    
    **⌨️ INPUT (Pipeline Reply)**:
    > **Format**: `Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8`
    > **Example (Web)**: `A | A | B | A | A | D | B | A`
    > **Example (CLI)**: `C | A | C | B | E | A | A | B`
    > **Custom**: `Z="Rust" | A | B | A | E | A | C | A`
    
    ---
    **Bridge**: "✅ Tech Stack Locked! Generating Roadmap and Initial Doc Structure..."
    
    **Target**: 
    - Fill all sections of `02_tech_stack.md`.
    - **Architecture**: Write corresponding directory structure based on user's **Architecture Pattern Choice**.
      - **Strict**: Must respect user's choice, strictly NO self-assertion.
      - Must sync update `Directory Mapping` and `Logical Topology` in `[[__DOCS_DIR__]]/global/01_map.md`.
    - **Update**: Simultaneously update `[[__DOCS_DIR__]]/global/00_vision.md`.
      - Write Step 1 decisions (Q1 North Star, Q3 Constraint) into Vision doc corresponding sections.
    - **Update**: Update `[[__DOCS_DIR__]]/global/03_design_tokens.md` (If project has UI, based on Visual Style).
</step_2_tech_gate>

<step_3_roadmap>
    **Role**: TPM (Execution Mode)
    **Goal**: Convert Strategy (Step 1) and Tech (Step 2) into **DAG (Directed Acyclic Graph)** task chain.
    **Target Template**: `docs/global/00_roadmap.md`

    **Action**:
    0.  **Tech Confirmation**:
        - Briefly list core tech stack selected in Step 2 at output header.
        - List key architecture decisions.
    1.  **Roadmap Generation**:
        - **Target**: `[[__DOCS_DIR__]]/global/00_roadmap.md`
        - **Language**: **STRICTLY FOLLOW `00_system.md`**. Must enforce using that language to generate all descriptions and legends.
        - **Task Granularity**:
          - **Definition**: Minimum atomic feature point plannable by `/archi.plan`.
          - **Rule**:
            - ❌ **Too Big**: "User System" (Includes Login, Register, Profile etc. multiple flows).
            - ❌ **Too Small**: "Login Button" (UI detail), "Add DB Field" (Impl detail).
            - ✅ **Just Right**: "Login Flow" (Page+API+Auth), "Profile Page" (UI+Data Fetch).
        - **Instruction**:
          - Generate 3-4 Phases DAG dependency graph.
          - **Forbidden**: Strictly PROHIBIT generating "Execution Queue" list. DAG graph and phased task table are enough.
          - **Phase 1 [INF]**: Infrastructure (Tech Stack, CI/CD, Test Setup).
          - **Phase 2 [CORE]**: Core Features (Step 1 Features).
          - **Phase 3 [EXT]**: Extensions & Optimization (Scale & UX).
          - **Task Types (Prefix)**:
            - `[INF]`: Infrastructure & Config (Repo, CI/CD, Docker)
            - `[DAT]`: Data & Models (Schema, Migration, Seeds)
            - `[API]`: API & Logic (Service, Controller, Utils)
            - `[UI]`: User Interface (Components, Pages, Styles)
            - `[INT]`: Integration (Wiring UI+API)
            - `[FEAT]`: Business Feature (Full Stack Value Unit)
          - **Critical Rule**: **Strictly PROHIBIT splitting "Test" into independent phase**. Testing must be built into Definition of Done (Goal) of each task.
          - **Visualization**: Must generate mermaid graph TD code block, showing task dependencies.
            - **Node Format**: `ID[ID: Name]` (e.g., `INF-101[INF-101: Init Repo]`), ensure ID is clearly visible in graph.
        - **Format**: Use `[ ] ⏳ **[ID] Name**` format.
    2.  **Context Injection**:
        - Write Option Z original content into Context field of corresponding task.
    3.  **Generate**: Output complete Roadmap.

    **Bridge**: "✅ Roadmap Generated. Performing final audit..."
</step_3_roadmap>

<step_4_audit>
    **Role**: Compliance Officer
    **Goal**: Ensure logical loop closure, and **format strictly follows template**.

    **Phase 1: Template Structure Verification**
    - **Tech Stack Check**: 
      - Does generated `02_tech_stack.md` retain "1. Global Mandates" from template?
      - Does it retain Frontmatter (`--- description...`)?
      - ❌ Error: If file starts with `# Tech Stack` without `---`, treat as failure.
    - **Roadmap Schema Check (Strict Check)**: 
      - Do tasks strictly follow Task Schema?
      - ❌ Error: `(ID-001) Task` (Used parentheses)
      - ✅ Correct: `**[ID-001] Task**` (Bold + Brackets)
      - Do `Goal` and `Context` fields exist?
      - Does `Dep` field exist?

    **Phase 2: Logic Integrity**
    - **Vision Check**: 
      - Is `00_vision.md` updated?
      - Does choice in Vision have correspondence in Tech Stack?
    - **Design Check** (If project has UI): Does `03_design_tokens.md` define **Primitive Palette** and map **Semantic Tokens**?
    - **Infra Check**: If "Docker" selected, is corresponding INF task generated?
    - **DAG Check**: Are there any `FEAT` without dependencies?

    **Action**: 
    - **Fail**: If structure tampering or logical loopholes found, **Auto-Fix** generated draft, or reject generation and report error.
    - **Pass**: Output final confirmation info.
</step_4_audit>

<step_5_signoff>
    **Action**: Output final confirmation and clear next step guide.

    **Output Template**:
    ```markdown
    ## ✅ ARCHITECTURE INITIALIZED

    ### 📋 Configuration Summary
    **Project Type**: [Identified Project Type]
    **Core Features**: [List Core Features]
    **Extensions**: [List Selected Extensions]

    ### 🎯 Strategic Decisions
    | Decision | Choice | Impact |
    |:---|:---|:---|
    | Product DNA | [Choice] | [Impact] |
    | Visual Style | [Choice] | [Impact] |
    | Core Experience | [Choice] | [Impact] |
    | Scale | [Choice] | [Impact] |

    ### 🛠️ Tech Stack Locked
    | Category | Choice |
    |:---|:---|
    | Language | [Choice] |
    | Framework | [Choice] |
    | Database | [Choice] |
    | ... | ... |

    ### 📂 Generated Documents
    * ✅ `[[__DOCS_DIR__]]/global/00_vision.md`
    * ✅ `[[__DOCS_DIR__]]/global/00_roadmap.md`
    * ✅ `02_tech_stack.md` (in IDE rules directory)
    * ✅ `[[__DOCS_DIR__]]/global/01_map.md`
    * ✅ `[[__DOCS_DIR__]]/global/03_design_tokens.md` (if applicable)

    ---

    ### 🧭 Next Steps
    
    | Scenario | Recommended Action | Explanation |
    |:---|:---|:---|
    | **Start Dev First Feature** | `/archi.plan [Feature_ID]` | Select first Ready task in Roadmap Phase 1 to refine |
    | **Want to Adjust Tech** | `/archi.revise tech [Change Description]` | Modify 02_tech_stack.md and broadcast changes |
    | **Want to Adjust Vision** | `/archi.revise vision [Change Description]` | Modify 00_vision.md |
    | **View Help** | `/archi.help` | Show full command manual |

    > 💡 **Recommendation**: Run `/archi.plan [First INF Task ID]` to start infrastructure setup.
    ```

</step_5_signoff>

</protocol_kickoff>
