# 🏛️ Architext

**定位**: 基于提示词工程（Prompt Engineering）的 AI 原生架构协议。
**核心口号**: "No Docs, No Code." (无文档，不代码)
**目标**: 将 LLM（如 Claude/GPT-4）从"随意的代码生成器"升级为"严谨的世界级架构师"。

---

## 0. 核心差异

|  | AI 全权代理模式 (Trae Solo / Bolt / v0) | Architext |
|:---|:---|:---|
| **核心假设** | AI 知道用户要什么 | 用户知道自己要什么，但还没想清楚 |
| **AI 的角色** | 全权代理人 | 产品顾问 + 严格执行者 |
| **用户的角色** | 验收者（做完了才知道是什么） | 决策者（动手前就看清全貌） |
| **信息流向** | AI → 用户（"你看这行不行"） | 用户 → AI（"我要的是这个"） |
| **产品定义权** | AI 隐式决定功能逻辑 | 用户显式定义，AI 严格执行 |

> 其他工具让 AI 替你做决定，Architext 帮你自己做决定。

---

## 1. 核心哲学 (Core Philosophy)

*   **DDAD (Document-Driven AI Development)**:
    *   **No Docs, No Code**: 代码只是文档的下游产物。
    *   一切变更必须先修改文档（Spec/UI/Plan），通过审计后，才能生成代码。
*   **User Agency (用户主权)**:
    *   AI 的职责是**挖掘和澄清**用户的真实意图，而非替代用户做决策。
    *   用户在写代码之前就能看到完整的功能逻辑、数据流、交互模式——确认"这就是我要的"之后才进入开发。
    *   技术选型、功能取舍、优先级排序——所有关键决策的最终决定权在用户手中。
*   **Meta-Framework (元框架)**:
    *   **Architecture Agnostic (架构无关)**: Architext 不绑定特定架构。
    *   支持 MFA (Modular Feature Architecture), FSD, DDD, Clean Architecture 等任意架构模式。
    *   通过 `map.json` 定义层级，通过 `00_system` 强制执行该架构的边界规则。
*   **Agent Skill Adoption (技能适配)**:
    *   **Skills > Tools**: 明确区分 **Tools** (原子能力，如 `read_file`) 与 **Skills** (专家级 Know-How，如 `debug-workflow`, `feature-implementer`)。
    *   鼓励 AI 优先调用封装好的 **Agent Skills** 来解决复杂问题，获取标准化的“思维链”和“操作流”，而非仅依赖底层的工具调用。
    *   能用 Skill 解决的，就不要用原始 Prompt 瞎猜。
*   **Silent Audit (静默审计)**:
    *   AI 在输出代码前，必须在思维链中运行"自我审计循环"（检查依赖、检查 Token、检查架构边界）。

---

## 2. 架构解剖 (Anatomy)

Architext 由 **CLI 工具** 和 **项目内配置 (.architext)** 两部分组成。

### 📁 项目目录结构 (Project Structure)

初始化后，项目目录结构如下：

```
my-project/
├── .cursor/rules/              # Cursor IDE 规则目录（如选择 Cursor）
│   ├── 00_system.mdc
│   ├── 01_workflow.mdc
│   ├── 02_tech_stack.mdc
│   ├── 03_data_governance.mdc
│   ├── 90_custom_rules.mdc
│   └── 99_context_glue.mdc
│
├── .trae/rules/                # Trae IDE 规则目录（如选择 Trae）
│   ├── 00_system.md
│   ├── 01_workflow.md
│   ├── 02_tech_stack.md
│   ├── 03_data_governance.md
│   ├── 90_custom_rules.md
│   └── 99_context_glue.md
│
├── .architext/                 # 文档目录（默认，可通过配置修改）
│   ├── global/                 # 全局文档（JSON 为数据源，.md 由 render 命令生成）
│   │   ├── vision.md        # 项目愿景与核心目标（纲领性文档，Markdown 格式）
│   │   ├── roadmap.json        # 项目进度与任务依赖（Single Source of Truth）
│   │   ├── map.json            # 架构地图与目录索引
│   │   ├── dictionary.json     # 统一术语表
│   │   ├── design_tokens.json  # 设计系统 Token（如项目有 UI）
│   │   ├── data_snapshot.json  # 数据模型快照（如项目有数据层）
│   │   └── error_codes.json    # 错误码契约
│   │
│   ├── prompts/                # Prompt 模板（供 AI 读取）
│   │   ├── code.md
│   │   ├── plan.md
│   │   ├── start.md
│   │   └── ...
│   │
│   ├── templates/              # 文档模板
│   │   ├── spec.template.md    # 功能规格模板
│   │   ├── ui.template.md      # UI 设计模板
│   │   └── plan.template.json  # 实施计划 JSON 模板
│   │
│   └── features/               # 功能文档（按功能模块组织）
│       └── INF-001_feature-name/
│           ├── spec.md         # 功能规格（Gherkin）
│           ├── ui.md           # UI 设计（如适用）
│           └── plan.json       # 实施计划（JSON 格式）
│
└── xxx/                        # 业务代码（项目实际代码）
    └── ...
```

**说明**：
- **IDE Rules 目录**：根据选择的 IDE，rules 文件会被复制到对应的目录（`.cursor/rules/`, `.trae/rules/` 等）
- **文档目录**：默认使用 `.architext/`，可通过 `architext.json` 配置为其他名称（如 `docs/`）
- **Rules 文件扩展名**：Cursor 使用 `.mdc`，其他 IDE 使用 `.md`
- **单一事实来源**：规则文件由 `templates/*/rules/` 统一复制到各 IDE 目录，确保一致性

### A. 规则矩阵 (The Brain)
这是注入给 AI 的"世界观"和"法律"，通常通过 IDE 规则（如 `.trae/rules`）加载。

| 文件 | 角色 | 核心职责 |
| :--- | :--- | :--- |
| `00_system.md` | **宪法** | 定义架构师身份、思维循环 (Audit Loop)、工具策略 (Skill Strategy)。 |
| `01_workflow.md` | **路由** | 识别用户意图，加载对应的 Prompt 模板 (Mode Switcher)。 |
| `02_tech_stack.md` | **法律** | 定义技术选型红线、命名规范（适配当前架构）。 |
| `03_data_governance.md` | **管家** | 全局 JSON 数据文件的读写治理规则（读写时机、格式约束）。 |
| `90_custom_rules.md` | **家规** | 用户自定义的团队习惯与黑名单（高优先级）。 |
| `99_context_glue.md` | **导航仪** | **注册制寻址**：关联代码与文档，防止失忆。 |

### B. 上下文容器 (.architext / docs)
维持项目一致性的全局资产，通常存储在 `.architext/` 或 `docs/global/` 中。
JSON 文件为 Single Source of Truth，对应的 `.md` 文件由 `npx archi render` 自动生成。

*   `roadmap.json`: 项目进度全景图（DAG 依赖管理）。
*   `vision.md`: 项目愿景、北极星指标、设计哲学（AI 规划与决策的定调依据，因叙事性内容不适合 JSON 故保持 Markdown）。
*   `map.json`: 架构地图（定义架构拓扑）。
*   `dictionary.json`: 统一术语表。
*   `design_tokens.json`: 视觉物理量。
*   `data_snapshot.json`: 数据库 Schema 镜像。
*   `error_codes.json`: 错误码契约。

---

## 3. 工作流生命周期 (Workflow Lifecycle)

通过 AI 对话框交互，AI 自动读取 IDE 规则并触发相应流程（支持 `/archi.*` 指令或自然语言）：

### 🚀 Initialization (启动)
*   `/archi.start`: **Project Initiation**
    *   **Context Setup**: 确立技术栈 -> 生成 Roadmap 与全局文档骨架。
    *   **Architecture Choice**: 选择适合的架构模板（如 MFA, FSD 或 Custom）。

### 📝 Definition (定义 - 纯文档阶段)
*   `/archi.plan`: **Deep Planning**
    *   深度架构访谈 -> 同步全局资产。
    *   产出 `Spec` (逻辑), `UI` (视觉), `Plan` (步骤)。
*   `/archi.edit`: **Spec Modification**
    *   局部变更（先改 Spec 后改代码）。

### ⚡ Execution (执行 - 代码阶段)
*   `/archi.code`: **Implementation**
    *   读取 Plan -> 调用 Agent Skill -> 编写代码 -> 运行审计。
*   `/archi.fix`: **Debugging**
    *   诊断 Bug -> 查阅 Error Code -> 修复代码。
*   `/archi.help`: **Manual**
    *   显示帮助指南。


### 🔧 User CLI 工具命令
*   `npx archi init`: 初始化项目骨架。
*   `npx archi update`: 更新项目骨架。
*   `npx archi doctor`: 检查项目健康状况。
*   `npx archi uninstall`: 卸载项目。
*   `npx archi help`: 显示帮助指南。
*   `npx archi version`: 显示项目版本。

### 🔧 AI CLI 工具命令
*   `npx archi task [list|check|<id> <status>]`: 查看/校验/更新 Roadmap 任务状态（直接操作 `roadmap.json`）。
*   `npx archi plan <feature-id>`: 检查指定 Feature 的 Plan 完成度（读取 `plan.json`）。
*   `npx archi render`: 将 JSON 数据文件生成对应的 Markdown 可读视图。

---

## 4. 核心机制 (Core Mechanism)

1.  **Chat-Driven (对话驱动)**: 用户在 Chat 中提出需求。
2.  **Rule Activation (规则激活)**: AI 读取 IDE Rules (`01_workflow`)，识别当前意图。
3.  **Prompt Loading (提示词加载)**: AI 自动寻找并使用对应的 Prompt 模板（如 `templates/plan.md`）进行引导。
4.  **Context Anchoring (上下文锚定)**: 通过 `.architext` 中的全局文档锁定项目状态。

---

## 5. 核心优势 (Why This Works)

1.  **Universality (通用性)**: 不局限于前端或全栈，适用于任何类型的软件项目 (CLI, Embedded, Backend)。
2.  **Anti-Hallucination (防幻觉)**: 强制 AI 依赖 Skill 和真实文档。
3.  **Controllability (可控性)**: "No Docs, No Code" 确保在写代码前，人类已审核过设计方案。
4.  **Non-Invasive (无侵入)**: 核心逻辑通过 IDE 规则注入，不污染业务代码。

> **这就是 Architext**：一套让 AI 真正像资深架构师一样工作的元框架协议。
