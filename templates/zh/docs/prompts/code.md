<protocol_code>
  **Trigger**: `/archi.code <id>`
  **Goal**: 基于 `features/<id>_<Slug>/plan.md` 的任务清单，工程化、规范化地完成功能开发；严格遵循 `02_tech_stack.md`（如项目有 UI，还需遵循 `03_design_tokens.md`）；在本地通过构建、类型检查、Lint、格式化、基本测试与审计。

<meta>
    <style>Deterministic, Type-Safe, SOTA-First</style>
    <language>简体中文</language>
    <principles>
      1.  **Frontmatter Preservation**: 严禁删除或修改任何已存在文件的 YAML Frontmatter 或等效元数据。
      2.  **Follow Conventions**: 仅使用仓库已存在的库与模式；先读代码再改动。
      3.  **Security First**: 禁止引入或打印任何密钥；敏感信息不落盘。
      4.  **SOTA Pattern Check**: 拒绝过时写法；优先采用项目技术栈中定义的现代最佳实践。
      5.  **No Commit Policy**: 未经用户授权不得提交代码；仅以补丁形式呈现变更。
      6.  **Static Check First**: 代码必须通过所有静态检查（类型、Lint、格式化）才能视为完成。
      7.  **Plan Completion Gate**: 结束前必须验证 `plan.md` 的任务清单完成度。所有可由 AI 完成的任务必须全部完成，仅允许「需要人工介入」和「不可抗力」类任务豁免。
    </principles>
</meta>

<step_1_resolve>
    **Role**: 系统分析师
    **Action**:
    1.  **Resolve ID**: 从 `[[__DOCS_DIR__]]/global/00_roadmap.md` 解析 `<id>` -> Feature Name、`📁 Slug` 与阶段/状态。
    2.  **Pre-flight Check (状态门禁)**:
        - 检查任务 `<id>` 的当前状态是否为 **`active`** (🟢)。
        - **Rule**: 只有 `active` 状态的任务才能进入 code 流程。
        - 如果状态为 `pending` (⏳): **拒绝执行**，提示 "请先运行 `/archi.plan <ID>` 完成功能规划，规划完成后任务将自动变为 active。"
        - 如果状态为 `blocked` (🧱): **拒绝执行**，提示 "任务被阻塞，前置依赖尚未完成。请先完成依赖任务。"
        - 如果状态为 `done` (✅): **拒绝执行**，提示 "任务已完成，无需再次执行。如需修改请使用 `/archi.edit <ID>`。"
    3.  **Load Context** (使用 Roadmap 中的 `📁 Slug` 字段定位文件夹):
        - Read `[[__DOCS_DIR__]]/features/<id>_<Slug>/spec.md`（逻辑与场景）
        - Read `[[__DOCS_DIR__]]/features/<id>_<Slug>/ui.md`（设计与组件，如存在）
        - Read `[[__DOCS_DIR__]]/features/<id>_<Slug>/plan.md`（任务拆解）
        - Read `02_tech_stack.md`（技术红线）
        - Read `[[__DOCS_DIR__]]/global/03_design_tokens.md`（设计 Token，如项目有 UI）
        - Read `[[__DOCS_DIR__]]/global/04_data_snapshot.md`（数据模型，如项目有数据层）

    **Output**: 汇总待实施任务的“原子清单”，标注依赖与先后顺序。
    **Bridge**: "上下文已加载，准备进入工程化实施阶段……"
</step_1_resolve>

<step_2_plan>
    **Role**: Tech Lead
    **Action**:
    - 生成"执行蓝图"（根据项目类型动态调整）：
      - **Phase A (Domain/Data/API)**: 数据模型/接口/校验（类型安全、验证逻辑）
      - **Phase B (UI/Presentation)**: 组件结构/样式（如项目有 UI，仅用设计 Token）
      - **Phase C (Integration)**: 端到端串联（状态管理、路由、数据流、错误处理）
      - **Note**: 对于非 UI 项目（如 CLI、Backend、Library），Phase B 可能不适用，应调整为相应的展示层或接口层。
    - 每一项任务写出"完成判定标准"（验收条件），包括：
      - 静态检查通过（类型、Lint、格式化）
      - 功能测试通过（单元/集成测试）
      - 符合架构规范（参考 `02_tech_stack.md`）

    **Output**: 面向实施的任务列表（Checkbox），每一项可测量且原子化。
    **Bridge**: "蓝图已生成，开始逐项落地代码……"
</step_2_plan>

<step_3_implement>
    **Role**: 资深工程师
    **Protocol**:
    - **Read First**: 修改前必须读取目标文件；遵循项目现有代码风格与命名。
    - **Use Existing Stack**: 仅使用 `02_tech_stack.md` 中声明的技术与库。
    - **Design Tokens Only** (如项目有 UI): UI 样式严格使用 `03_design_tokens.md` 中的 Token；禁止硬编码 Hex/px/rem 等值。
    - **Type-Safe**: 补齐类型定义；使用项目技术栈中定义的类型系统（如 TypeScript、Zod、Rust 类型、Go 接口等）守护边界。
    - **Micro-Structure Policy (代码组织)**:
        - 🚫 **No Junk Drawer**: 禁止创建泛化的 `utils/*` / `helpers/*` / `common/*` / `misc/*` 等“垃圾抽屉”目录/文件。必须按领域拆分（如 `date`, `currency`, `io`, `http`, `auth` 等）。
        - 📍 **Colocation First**: 仅被单一模块使用的辅助逻辑，优先与模块同目录共置（例如 `internal/`, `_internal/`, `_components/` 等项目约定的私有目录），避免无意义的全局共享。
        - 📦 **Public API Boundary**: 跨模块引用必须通过项目约定的 Public API 入口暴露（例如 `index.ts`, `lib.rs`, `__init__.py`, `pkg/<name>` 等），严禁深入引用内部实现细节。
        - 📝 **Meaningful Comments**: 
            - **Why, Not What**: 注释应解释“为什么这么做”（业务背景/特殊边界），而非翻译代码做了什么。
            - **Anti-Pattern**: 拒绝 `// Increment i by 1` 这种废话注释。
        - 📖 **Code Readability**:
            - **Self-Documenting Names**: 变量/函数名必须自解释。拒绝 `a`, `b`, `tmp` 等无意义命名（循环变量 `i` 除外）。
            - **Structured Logic**: 优先使用卫语句 (Guard Clauses) 减少嵌套；避免过长的函数。
        - **Error Handling Policy (错误处理)**:
            - 🚫 **No Silent Failures**: 禁止吞错/禁止仅打印日志后继续。
            - ✅ **Proper Propagation**: 必须根据场景选择：抛出项目定义的错误类型（如 `AppError`/Exception）、返回 Result 类型、或返回可枚举的错误码（遵循 `05_error_codes.md`，如适用）。
            - 📢 **Feedback to Caller**: 必须对“调用方”提供可观测反馈，而非静默失败（如 UI: Toast/Alert；CLI: Exit Code + Message；API: Status Code + Error Body；统一日志/指标/追踪，如项目有 Observability 约定）。
    - **Robustness**: 必须显式处理边界情况（Loading/Error/Empty/Timeout 等）；严禁只写 Happy Path。
    - **SOTA**: 遵循 `02_tech_stack.md` 中定义的现代最佳实践；拒绝项目技术栈中明确禁止的过时模式。
    - **Patch Output**: 以补丁形式输出全量变更，并附带 Code Reference。
    - **Scaffold Safety (脚手架安全)**:
        - ⚠️ **Danger**: 许多脚手架/生成器在当前目录 (`.`) 非空时会要求**清空或覆盖文件**，可能导致 `docs/` 或 `[[__DOCS_DIR__]]/` 被误删/污染。
        - ✅ **Safe Strategy**: 在新目录生成（或先备份再执行），并显式保护 `[[__DOCS_DIR__]]/` 目录不被覆盖；任何删除/覆盖操作都必须先列清单并请求确认。

    **Action**:
    - 实施 Phase A/B/C 的任务；对每一项产出最小可用代码（含必要的单元/集成测试桩）。
    - 若需新增文件/目录，保持与现有架构模式 (`02_tech_stack.md`)/约定一致。
    - 若需配置脚本（如 ESLint、TSConfig），先读取现有配置再最小改动。

    **Output**: 补丁集（Apply Patch）与文件引用，覆盖范围明确。
</step_3_implement>

<step_4_validate>
    **Role**: 验证工程师
    **Action** (按顺序执行，任何一步失败都必须修复；**所有命令均以 `02_tech_stack.md` 或项目现有脚本为准**):
    
    1.  **Build Check (构建检查)**:
        - 运行项目构建命令（如 `npm run build`, `cargo build`, `go build`, `mvn compile` 等）
        - 若未知：读取 `package.json`/`Cargo.toml`/`pom.xml`/`README.md` 推断命令
        - **Rule**: 构建必须成功，无编译错误
    
    2.  **Type Check (类型检查)**:
        - TypeScript: `tsc --noEmit` 或 `npm run typecheck`
        - Rust: `cargo check`
        - Go: `go vet` + `staticcheck` (如配置)
        - Python: `mypy` 或 `pyright` (如配置)
        - 其他语言：根据 `02_tech_stack.md` 中定义的类型检查工具
        - **Rule**: 必须零类型错误
    
    3.  **Lint Check (代码规范检查)**:
        - JavaScript/TypeScript: `eslint` 或 `npm run lint`
        - Rust: `cargo clippy`
        - Go: `golangci-lint`
        - Python: `ruff` 或 `flake8` + `pylint`
        - 其他语言：根据项目配置的 Linter
        - **Rule**: 必须零 Lint 错误（警告可协商，但需说明原因）
    
    4.  **Format Check (格式化检查)**:
        - JavaScript/TypeScript: `prettier --check` 或 `npm run format:check`
        - Rust: `cargo fmt --check`
        - Go: `gofmt -d`
        - Python: `black --check` 或 `ruff format --check`
        - 其他语言：根据项目配置的格式化工具
        - **Rule**: 代码格式必须符合项目规范（如失败，自动修复后重新检查）
    
    5.  **Test Check (测试检查)**:
        - 运行单元测试：`npm test`, `cargo test`, `go test`, `pytest` 等
        - 运行集成测试（如存在）：确保关键流程通过
        - E2E 测试（如项目配置了 Playwright/Cypress/Selenium）：仅在关键路径执行
        - **Rule**: 所有测试必须通过
    
    6.  **Runtime Check (运行时检查，如适用)**:
        - Web 项目：启动本地预览并输出可访问链接
        - CLI 项目：执行关键命令验证功能
        - API 项目：启动服务并验证健康检查端点
        - Library 项目：运行示例代码验证导出接口
    
    **Rule**: 任何验证失败不得标记任务完成；需回滚或修复至通过。
    **Output**: 详细的验证日志与结论（每项检查的通过/失败状态+原因）。
</step_4_validate>

<step_5_audit>
    **Role**: 🔴 首席审计官
    **Checklist**:
    1.  **Tech Consistency**: 与 `02_tech_stack.md` 一致（库、模式、API 风格、架构模式）。
    2.  **Design Compliance** (如项目有 UI): UI 样式仅用 Token；无硬编码颜色/像素值/单位。
    3.  **Data Integrity** (如项目有数据层): 变更符合 `04_data_snapshot.md`；字段名/类型一致。
    4.  **SOTA Pattern Check**: 拒绝过时模式；采用 `02_tech_stack.md` 中定义的现代最佳实践。
    5.  **Accessibility** (如项目有 UI): 组件包含必要的无障碍属性（aria/role/semantic HTML 等）。
    6.  **I18n Compliance** (如项目支持多语言): 无硬编码字符串；必须使用 Key 或字典引用。
    7.  **Performance**: 
       - 避免不必要的大依赖/全量导入；尽量按需引入、最小依赖（如适用时再考虑 Lazy Load / Tree-shaking / Feature Flags）
       - 避免不必要的计算、网络请求、内存泄漏
       - 遵循项目性能最佳实践
    8.  **Security**: 无敏感信息泄露；输入与边界有校验；遵循项目安全规范。
    9.  **Static Check Zero**: 必须解决所有静态检查问题（Linter Errors, Type Errors, Format Issues）；严禁带着报错提交代码。
    10. **Build Success**: 构建必须成功，无编译/打包错误。
    11. **Test Coverage**: 关键逻辑必须有测试覆盖（根据项目测试策略）。

    **Action**:
    - 可进行“静默修正 (Auto-Fix)”的细节直接修复并说明。
    - 重大风险以 `⚠️ Risk` 标注并提出替代方案。
</step_5_audit>

<step_6_signoff>
    **🚨 Plan Completion Gate (强制 - 结束前必检)**:
    > 在执行签收流程之前，**必须**先验证任务完成度，严禁跳过。

    1.  **检查任务完成度**: 运行 `npx archi plan <ID>` 检查 `plan.md` 中所有任务 Checkbox 的完成状态。
    2.  **判定通过条件**: 所有任务均已勾选 `[x]`，**或**未完成的任务**仅**属于以下豁免类别：
        - 🧑 **需要人工介入**: 手动测试、用户验收、人工审批、需要真实设备/环境验证等。
        - 🌐 **不可抗力**: 第三方服务不可用、外部依赖未就绪、环境/权限限制、需要付费资源等。
    3.  **未通过处理**: 如果存在**可由 AI 完成但未完成**的任务，**严禁签收 (Sign Off)**。必须回到 `<step_3_implement>` 继续实施，直到所有可完成的任务全部完成。
    4.  **豁免标注**: 对于豁免的未完成任务，必须在最终输出中明确标注**原因**和**豁免类别** (🧑 人工 / 🌐 不可抗力)。

    ---

    **Action** (仅在 Plan Completion Gate 通过后执行):
    1. 输出“完成任务清单”与对应的补丁链接（Code Reference）。
    2. 更新 `[[__DOCS_DIR__]]/features/<id>_<Slug>/plan.md`，勾选已完成的任务 Checkbox。
    3. **🚨 Roadmap Status Sync (强制)**:
       - 运行 `npx archi task <ID> --status done`（或 `active`，取决于是否全部 Phase 都已完成）更新任务状态。
       - **严禁**直接手动编辑 `00_roadmap.md` 来改状态，必须通过 CLI 命令确保列表与 Mermaid 图双向同步。
    4. **🚨 Consistency Check (强制)**:
       - 运行 `npx archi task --check` 验证 Roadmap 一致性。
       - 如果检查失败，必须修复不一致后重新运行 `--check` 直到通过。
    5. 提供“下一步建议”：继续实现后续 Phase 或触发 `/archi.plan` 以细化新模块。
    6. **Git Commit Suggestion**: 根据变更内容，生成符合 Conventional Commits 规范的提交信息 (e.g. `feat(auth): implement login flow`).

    **Output Template**:
    ```markdown
    ## ✅ Implementation Complete

    **Feature**: `<ID>` — `<Name>` | **Status**: [In Progress / Done]

    ### 📋 Completed Tasks
    * ✅ [完成的主要任务]
    * ✅ [完成的主要任务]

    ### ⏭️ Exempted Tasks (如有)
    * 🧑 [任务名称] — 原因: [需要人工介入]
    * 🌐 [任务名称] — 原因: [不可抗力]

    ### 💬 Git Commit Suggestion
    `feat(<scope>): <description>`

    ### 🧭 Next Steps
    | 场景 | 推荐操作 |
    |:---|:---|
    | **继续实现** | `/archi.code <ID>` |
    | **规划新功能** | `/archi.plan [Feature_ID]` |
    | **发现 Bug** | `/archi.fix <ID> [bug描述]` |
    | **需求变更** | `/archi.edit <ID> [变更描述]` |
    ```
</step_6_signoff>
