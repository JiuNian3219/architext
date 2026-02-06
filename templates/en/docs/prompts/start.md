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
      4.  **Flexible Interaction**: 
          - Options support **Multi-select (A+B)**, **Hybrid** or **Custom**.
          - If user intent is unclear, **Proactively ask 2nd round questions** (Clarification Mode).
      5.  **Rich Context**: Each option must include: Brief, Use Case, Pros/Cons, Subsequent Impact.
      6.  **Proactive Analysis**: If user context is vague, AI must generate targeted options by analyzing implicit needs.
      7.  **Option Z Everywhere**: Extension menu and all decision items must include `[Z] Custom`.
      8.  **Pipeline Input**: Guide user to use `|` separator for efficient reply (e.g. `A B Z="MyIdea" | A | B`).
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
      - **[A] ...**
        - **Brief**: ...
        - **Use Case**: ...
        - **Pros**: ...
        - **Cons**: ...
        - **Impact**: ...
      - **[Z] Custom**
        - ...

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
    - **Each option must include complete decision info list**.

    ---

    **[Q1] Product DNA & Target Audience**
    > *Context*: What is the core value? Who is it for?
    
    - **[A] Pure Tool**: Extreme efficiency, no ads, no social, leave after use. *Use*: Efficiency tool, Dev tool. *Impact*: No user system, no backend (optional).
      > **Pros**: Focus on core, fast dev | **Cons**: Limited growth, no stickiness
    - **[B] Community / Social**: Emphasize connection, sharing and interaction. *Use*: Community, Collab Platform. *Impact*: User system, Notification, Feed needed.
      > **Pros**: Self-propagation, high stickiness | **Cons**: Operation pressure, hard cold start
    - **[C] Commercial / SaaS**: Pursue monetization efficiency, Subscription/Paid. *Use*: B2B/B2C SaaS. *Impact*: Payment integration, Subscription mgmt.
      > **Pros**: Promising revenue | **Cons**: High UX requirement
    - **[D] Content / Media**: Content distribution & consumption. *Use*: Blog, News, Streaming. *Impact*: CMS, CDN, SEO needed.
      > **Pros**: Traffic oriented | **Cons**: Copyright & Moderation cost
    - **[E] Enterprise / Internal**: Efficiency, Compliance & Control. *Use*: OA, ERP, Admin. *Impact*: RBAC, Audit Log, SSO.
      > **Pros**: Clear requirement | **Cons**: Complex sales, UX often ignored
    - **[F] Open Source / DevKit**: Dev ecosystem, Extensibility. *Use*: Framework, Plugin system. *Impact*: Docs, CI/CD, Contribution guide.
      > **Pros**: Tech influence | **Cons**: Long commercial path
    - **[Z] Custom**: (Please describe)

    **[Q2] Visual & Interaction Personality**
    > *Context*: User's first impression. Not just colors, but "Personality".
    
    - **[A] Minimalist / Clean**: Minimalist, lots of whitespace, restrained. *Use*: Efficiency tool, High-end brand. *Impact*: Restrained design.
    - **[B] Playful / Gamified**: Playful, high saturation, micro-interaction. *Use*: Consumer app, Learning, Game. *Impact*: Animation lib, Gamification.
    - **[C] Professional / Data-Dense**: Dense, calm, info-rich. *Use*: Dashboard, Trading terminal. *Impact*: High perf Grid, Chart lib.
    - **[D] Developer / Terminal**: Geeky, dark mode, monospace. *Use*: Dev tool. *Impact*: Syntax highlight, Keyboard first.
    - **[E] Brutalist / Neo**: Brutalist, high contrast, anti-design. *Use*: Trendy brand, Art. *Impact*: Unique UI lib.
    - **[F] Native / System**: Native style, blend in. *Use*: Utility App. *Impact*: Native components.
    - **[Z] Custom**: (Please describe)

    **[Q3] The "Iron Triangle" Trade-off**
    > *Context*: Resources are limited, pick your trade-off.
    
    - **[A] Velocity First (MVP)**: Speed first. Dirty code ok. *Impact*: Fullstack framework (Next.js/Rails), Monolith.
    - **[B] Performance First**: Extreme perf. Millisecond response. *Impact*: Rust/Go, WASM, Edge, Complex cache.
    - **[C] Stability / Quality First**: Zero Bug, High coverage. *Use*: Finance/Medical. *Impact*: Strong Type, TDD, Slow iteration.
    - **[D] Scalability First**: Prepare for million concurrency. *Use*: Growth expectation. *Impact*: Microservices, MQ, Complex Ops.
    - **[E] UX / Animation First**: Experience first. *Use*: Consumer product. *Impact*: Client rendering, Optimistic UI, Animation tuning.
    - **[F] Cost First**: Lowest cost. *Use*: Personal project. *Impact*: Serverless, Free tier, SQLite.
    - **[Z] Custom**: (Please describe)

    **[Q4] Scale & Infrastructure**
    > *Context*: Decides "what knife to kill the chicken".
    
    - **[A] Hobby / Prototype**: <1k Users. Single machine/Serverless. *Impact*: SQLite/JSON DB, Vercel deploy.
    - **[B] Startup / Growth**: 10k-100k Users. Standard Web Arch. *Impact*: Postgres/MySQL, Redis, Docker.
    - **[C] High Traffic**: 100k+ Users / High Concurrency. *Impact*: Read/Write split, Load Balancer, CDN.
    - **[D] Data Heavy**: Massive data storage/analytics. *Impact*: OLAP, Sharding.
    - **[E] Offline / Local**: Local run, occasional sync. *Impact*: Client DB, CRDT.
    - **[F] Enterprise Deployment**: Private deploy, Multi-env. *Impact*: K8s, Helm, Terraform.
    - **[Z] Custom**: (Please describe)

    ---
    
    **⌨️ INPUT (Pipeline Reply)**: 
    Please use `|` to separate **[Added Extensions]**, **[Q1 Choice]**, **[Q2 Choice]**, **[Q3 Choice]** and **[Q4 Choice]**.
    
    > **Format**: `ExtensionIDs (Space separated) | Q1 | Q2 | Q3 | Q4`
    > **Standard Example**: `A B D F | A | B | A | A`
    > **Custom Example**: `A C Z="Friend Leaderboard" | A | B | Z="Speed & Animation" | B`
    
    ---
    **Interaction Flow**:
    - **Clarification**: If user choice implies logical conflict (e.g. "E. Enterprise" + "A. MVP"), **Do NOT generate**, enter `Clarification Mode` to ask user intent.
    - **Bridge**: If clear, output: "✅ Strategic config received! Entering Tech Deep Dive..."
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
      - **Each option must include complete decision info list**.

    ---

    **Required Question Categories**:
    > **Note**: Q1-Q6 are generic dimensions, Q7-Q8 are domain specific dimensions generated by AI.

    **[Q1] Core Language & Runtime**
    - **[A] TypeScript/Node**: JS Eco, Fullstack. *Use*: Web, Node Service. *Impact*: npm eco.
      > **Pros**: Rich eco, Fullstack | **Cons**: Perf not top tier
    - **[B] TypeScript/Bun**: Modern JS Runtime. *Use*: High perf Node alternative. *Impact*: Bun exclusive API.
      > **Pros**: Faster, Built-in tools | **Cons**: Eco relatively new
    - **[C] Rust**: System Lang. *Use*: CLI, High perf service. *Impact*: Cargo eco.
      > **Pros**: Extreme perf, Safe | **Cons**: Steep learning curve
    - **[D] Go**: Simple Efficient. *Use*: Backend, CLI. *Impact*: Go Modules.
      > **Pros**: Simple, Good concurrency | **Cons**: Generics relatively new
    - **[E] Python**: Fast Dev. *Use*: AI/ML, Script, Backend. *Impact*: pip/conda.
      > **Pros**: Rich eco, Easy to learn | **Cons**: Perf relatively poor
    - **[F] Java/Kotlin**: Enterprise. *Use*: Large Backend, Android. *Impact*: Maven/Gradle.
      > **Pros**: Mature Stable | **Cons**: Heavy, Slow startup
    - **[Z] Custom**: (Please describe)

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
    - **[A] Vitest**: Modern Vite Test Framework. *Use*: Vite Project. *Impact*: Vitest config.
      > **Pros**: Fast, HMR support | **Cons**: Vite binding
    - **[B] Jest**: Mature Test Framework. *Use*: React, General JS. *Impact*: Jest config.
      > **Pros**: Rich eco | **Cons**: Heavy config
    - **[C] Pytest**: Python Test. *Use*: Python Project. *Impact*: pytest.ini.
      > **Pros**: Concise, Many plugins | **Cons**: Python only
    - **[D] Go Test**: Go Built-in Test. *Use*: Go Project. *Impact*: *_test.go.
      > **Pros**: No dependency, Standard | **Cons**: Basic features
    - **[E] Rust Test**: Cargo Built-in Test. *Use*: Rust Project. *Impact*: #[test].
      > **Pros**: No dependency, Integrated | **Cons**: Basic features
    - **[F] Playwright/Cypress**: E2E Test. *Use*: Web App. *Impact*: E2E config.
      > **Pros**: Real browser | **Cons**: Slow, Heavy resource
    - **[Z] Custom**: (Please describe)

    **[Q6] Infrastructure & Git**
    - **[A] GitHub Actions**: GitHub CI/CD. *Use*: GitHub hosted. *Impact*: .github/workflows.
      > **Pros**: Good integration, Free tier | **Cons**: GitHub binding
    - **[B] GitLab CI**: GitLab CI/CD. *Use*: GitLab/Self-hosted. *Impact*: .gitlab-ci.yml.
      > **Pros**: Good private deploy | **Cons**: Heavy config
    - **[C] Docker + K8s**: Container Orchestration. *Use*: Large scale deploy. *Impact*: Dockerfile, k8s config.
      > **Pros**: Scalable | **Cons**: Complex ops
    - **[D] Vercel/Netlify**: Serverless Deploy. *Use*: Frontend/Fullstack. *Impact*: vercel.json.
      > **Pros**: Minimal deploy | **Cons**: Vendor lock-in
    - **[E] Trunk-Based**: Trunk Based Dev. *Use*: Small team, Fast iteration. *Impact*: Branch strategy.
      > **Pros**: Simple, Reduce conflict | **Cons**: Good CI needed
    - **[F] Git Flow**: Branch Workflow. *Use*: Large team, Release rhythm. *Impact*: Branch naming convention.
      > **Pros**: Clear, Traceable | **Cons**: Complex branches
    - **[Z] Custom**: (Please describe)

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
    - **Update**: Simultaneously update `[[__DOCS_DIR__]]/global/00_vision.md`.
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