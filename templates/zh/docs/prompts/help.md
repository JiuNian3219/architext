<protocol_help>
  **Trigger**: `/archi.help [lang]`
  **Goal**: 显示 Architext 指令清单，解释 DDAD 操作流，展示项目目录结构。

<meta>
    <style>Clean, Structured, Manual-Style</style>
    <language>简体中文</language>
    <principles>
      1.  **Lifecycle-Oriented**: 按项目生命周期分组（启动→定义→变更→执行）。
      2.  **Bilingual Support**: 根据 `[lang]` (zh/zh-Hant/en) 输出对应语言，默认中文。
    </principles>
</meta>

<step_1_render>
    **Action**: 输出以下手册。

    # Architext Command Manual (v1.1)

    > **Core Philosophy**: **No Docs, No Code.**
    > 所有代码变更始于文档 (Define)，终于审计 (Audit)。

    ---

    ## Project Structure

    ```
    my-project/
    │
    ├── .cursor/rules/              # Cursor IDE 规则目录
    │   ├── 00_system.mdc           # 系统宪法 - AI 身份与思维循环
    │   ├── 01_workflow.mdc         # 工作流路由 - 指令识别与模式切换
    │   ├── 02_tech_stack.mdc       # 技术法律 - 技术选型与编码规范
    │   ├── 90_custom_rules.mdc     # 用户家规 - 团队自定义约束
    │   └── 99_context_glue.mdc     # 上下文桥梁 - 代码与文档关联
    │
    ├── .cursor/commands/           # Cursor IDE 命令目录 (仅 Cursor)
    │   ├── archi.start.md          # /archi.start 命令定义
    │   ├── archi.plan.md           # /archi.plan 命令定义
    │   ├── archi.code.md           # /archi.code 命令定义
    │   ├── archi.fix.md            # /archi.fix 命令定义
    │   ├── archi.edit.md           # /archi.edit 命令定义
    │   └── archi.help.md           # /archi.help 命令定义
    │
    ├── .trae/rules/                # Trae IDE 规则目录 (同上，扩展名为 .md)
    │   └── ...
    │
    ├── .architext/                 # 文档目录 (默认名称，可配置)
    │   │
    │   ├── global/                 # 全局文档 - 项目级资产
    │   │   ├── 00_roadmap.md       # 项目路线图 - 任务依赖与进度追踪
    │   │   ├── 00_vision.md        # 项目愿景 - 北极星指标与设计哲学
    │   │   ├── 01_map.md           # 架构地图 - 目录索引与逻辑拓扑
    │   │   ├── 02_dictionary.md    # 术语字典 - 业务术语与组件注册
    │   │   ├── 03_design_tokens.md # 设计系统 - 颜色/字体/间距变量 (如有 UI)
    │   │   ├── 04_data_snapshot.md # 数据快照 - 数据库 Schema 镜像 (如有数据层)
    │   │   └── 05_error_codes.md   # 错误码契约 - 业务错误码定义
    │   │
    │   ├── prompts/                # Prompt 模板 - 供 AI 读取的指令协议
    │   │   ├── start.md            # 项目启动协议
    │   │   ├── plan.md             # 功能规划协议
    │   │   ├── code.md             # 代码实现协议
    │   │   ├── edit.md             # 需求变更协议
    │   │   ├── fix.md              # Bug 修复协议
    │   │   └── help.md             # 帮助手册 (本文件)
    │   │
    │   ├── templates/              # 文档模板
    │   │   ├── spec.template.md    # 功能规格模板 (Gherkin)
    │   │   ├── ui.template.md      # UI 设计模板 (ITP v3.0)
    │   │   └── plan.template.md    # 实施计划模板
    │   │
    │   └── features/               # 功能文档 - 按模块组织
    │       └── <ID>_<Slug>/        # 每个功能一个文件夹
    │           ├── spec.md         # 功能规格 - Gherkin 场景
    │           ├── ui.md           # UI 设计 - ITP 组件树 (如适用)
    │           └── plan.md         # 实施计划 - 任务清单
    │
    └── xxx/                        # 业务代码 (项目实际代码)
        └── ...
    ```

    **说明**:
    - **IDE Rules 目录**: 根据选择的 IDE，规则文件会被复制到对应目录 (`.cursor/rules/`, `.trae/rules/` 等)
    - **IDE Commands 目录**: 仅 Cursor 支持，命令文件会被生成到 `.cursor/commands/` 目录，文件名格式为 `archi.{命令名}.md`
    - **文档目录**: 默认使用 `.architext/`，可通过 `architext.json` 配置为其他名称
    - **扩展名差异**: Cursor 规则文件使用 `.mdc`，其他 IDE 使用 `.md`

    ---

    ## 1. Initialization (项目启动)

    | Command | Args | Role (简述) | Core Logic (核心逻辑) |
    | :--- | :--- | :--- | :--- |
    | **`/archi.start`** | `[context]` | ** Project Cold Start**<br>新项目冷启动。 | 访谈愿景 -> 确认风格 -> 确认技术栈 -> **创建 Docs 骨架**。 |
    | **`/archi.inherit`** | `(none)` | ** Legacy Takeover**<br>接管现有的旧项目。 | 全量扫描代码 -> 逆向推导 -> **填充 Global Docs**。 |
    | **`/archi.map`** | `(none)` | ** Refresh Map**<br>刷新目录地图。 | 扫描文件系统 -> **更新 01_map.md**。 |

    ---

    ## 2. Definition (需求定义)

    > **Rule**: 此阶段**不写代码**，只生成 `.architext/features/` 下的 Spec/UI/Plan 文档。

    | Command | Args | Role (简述) | Core Logic (核心逻辑) |
    | :--- | :--- | :--- | :--- |
    | **`/archi.plan`** | `[id \| context]` | ** Feature Planning**<br>定义新功能或细化已有功能。 | 智能判断：<br>1. 有 ID -> 读取已有文档，深度细化。<br>2. 无 ID -> **建新 ID** -> 架构访谈 -> 生成 Spec/UI/Plan。 |
    | **`/archi.adopt`** | `[context]` | ** Adopt Legacy**<br>纳管旧代码。 | 模糊搜索代码 -> **自动拟定 ID** -> 逆向生成 Spec/UI。 |

    ---

    ## 3. Evolution (变更管理)

    | Command | Args | Role (简述) | Core Logic (核心逻辑) |
    | :--- | :--- | :--- | :--- |
    | **`/archi.edit`** | `<id> [context]` | ** Modify Spec/UI**<br>修改**局部**功能的需求。 | 读取旧文档 -> 注入新需求 -> **更新 Spec/UI** -> 追加 Plan。 |
    | **`/archi.revise`** | `<target> [context]` | ** Global Revision**<br>修改**全局**设定 (如技术栈)。 | 修改 Vision/Tech/Roadmap -> **广播变更** (通知相关 Feature)。 |

    ---

    ## 4. Execution (执行与修复)

    | Command | Args | Role (简述) | Core Logic (核心逻辑) |
    | :--- | :--- | :--- | :--- |
    | **`/archi.code`** | `<id>` | ** Write Code**<br>将文档翻译为代码。 | 读取 Plan -> 生成/修改代码 -> **静态检查 + 自动审计**。 |
    | **`/archi.fix`** | `[id] <context>` | ** Bug Fix**<br>修复 Bug (非需求变更)。 | 诊断错误 -> 记录 Plan -> **修复代码** (通常不修改 Spec)。 |

    ---

    ## 5. Maintenance (维护与治理)

    | Command | Args | Role (简述) | Core Logic (核心逻辑) |
    | :--- | :--- | :--- | :--- |
    | **`/archi.map`** | `(none)` | ** Refresh Map**<br>手动刷新架构地图。 | 重新扫描目录树 -> 更新 `01_map.md` (文件拓扑)。 |
    | **`/archi.help`** | `[lang]` | ** Manual**<br>显示本说明书。 | 显示指令列表、项目结构与用法。 |

    ---

    ## Quick Decision Guide (快速决策)

    | 场景 | 推荐指令 |
    | :--- | :--- |
    | **新项目**从零开始 | `/archi.start` |
    | **老项目**接管维护 | `/archi.inherit` |
    | **新功能**需求定义 | `/archi.plan [功能描述]` |
    | **已有功能**深度细化 | `/archi.plan [Feature_ID]` |
    | **给老代码**补文档 | `/archi.adopt` |
    | **改需求**（局部） | `/archi.edit <id> [变更描述]` |
    | **改全局**（技术栈/架构） | `/archi.revise <target> [变更描述]` |
    | **写代码**实现功能 | `/archi.code <id>` |
    | **修 Bug** | `/archi.fix [id] <bug 描述>` |
    | **刷新地图** | `/archi.map` |

    ---

    ## Typical Workflow (典型工作流)

    ```
    /archi.start [项目描述]     # Step 1: 项目初始化 -> 生成 Vision/Tech/Roadmap
           ↓
    /archi.plan [功能描述]      # Step 2: 功能规划 -> 生成 Spec/UI/Plan
           ↓
    /archi.code <Feature_ID>    # Step 3: 代码实现 -> 静态检查 + 审计
           ↓
    (发现 Bug?)
           ↓
    /archi.fix [Feature_ID] <bug 描述>     # Step 4: Bug 修复 (如需)
           ↓
    (需求变更?)
           ↓
    /archi.edit [Feature_ID] <需求变更描述>    # Step 5: 需求变更 (如需) -> 更新 Spec/UI/Plan
           ↓
    /archi.code <Feature_ID>    # Step 6: 继续实现变更
    ```

    ---

    > ** Next Step**: 
    > - 新项目？运行 `/archi.start [你的项目描述]` 开始初始化。
    > - 已有项目？运行 `/archi.inherit` 接管现有代码库。
    > - 想规划新功能？运行 `/archi.plan [功能描述]` 开始架构访谈。

</step_1_render>

</protocol_help>
