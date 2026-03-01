---
name: archi-decompose-roadmap
description: Architext 任务分解专家。五步分解法：先标定项目类型校准基建清单，再双视角提取业务 Task 和 Infra 任务，识别 Polish 打磨任务，NFR 横切关注点按权重决定注入或独立，建立真实依赖链并输出并行批次。任务通过 ID 前缀（INF/FEAT/POLISH/EDIT）编码类型，tag 字段承载业务领域标签。产出符合 Tier 1 Schema 的 roadmap.json 任务，作为 `/archi.plan` 的输入契约。
---

# Roadmap 任务分解

## 系统流程定位

```
Brief → [本 Skill] → roadmap.json 任务
                            ↓
                   /archi.plan <task-id>
                   读: vision.md + map.json + tech_stack.md
                   写: spec.md（行为规格/验收标准）
                       仅ui项目: ui.md（任务 UI 范围声明）
                       plan.json（可执行步骤 + 测试用例 checkbox）
                   也更新: map.json / dictionary.json / data_snapshot.json
                   仅ui项目: 视觉参考: [[__DOCS_DIR__]]/global/ui_context.md
                            ↓
                   /archi.code → 读 spec.md + ui.md + plan.json → 写代码
```

> **Skill 的职责边界**：
> - 负责：任务的 what（描述）、done 标准（goal）、依赖链、设计决策注入、Core 接口契约
> - 不负责：文件路径（map.json 管）、变量命名（dictionary.json 管）、测试用例（plan.json 管）、UI 组件结构（ui.md 管）
>
> **Schema 约束（Tier 1 严格）**：roadmap.json 由 CLI 的 Zod Schema 校验，**禁增删字段**。

## 调用模式

| 模式 | 触发来源 | 输入 | 限制 |
|:---|:---|:---|:---|
| 从零建立 | `/archi.start` | Brief 功能列表 | 禁生成 EDIT 任务 |
| 增量追加 | `/archi.scope` | Brief + 已有 Roadmap 上下文 | 禁改已有任务，ID 沿用水位 |

---

## 分解框架（五步）

### Step 0 · 项目类型标定

从 Brief 的技术栈 / 项目描述中识别项目类型，确定标准基建清单，防止 Step 2 反推遗漏框架性 Infra。

| 项目类型 | 脚手架须包含（除通用构建工具链外） |
|:---|:---|
| Web SPA / PWA | 路由骨架（如 React Router）+ 全局 App Shell（布局 / Provider / 主题注入） |
| 全栈 Web（SSR/SSG）| 路由约定（loader/action/页面）+ API Routes 层 + 全局布局 + Auth Session 管理（Cookie/JWT）；仅ui项目: 主题注入 |
| CLI 工具 | logger 模块 + AppError 处理层 + 命令注册入口 |
| API 服务（REST / GraphQL）| 路由层 + 中间件层 + DB 连接层 + 全局错误处理；仅GraphQL项目 Schema 定义层 + DataLoader |
| 移动端 App（原生/跨平台）| 导航骨架（React Navigation / Go Router）+ 平台适配层（iOS/Android 权限、原生模块）+ 环境配置（dev/staging/prod）|
| 小程序 | 页面路由配置 + 全局 app.js/ts + 请求封装层 |
| 浏览器扩展 | manifest.json（V2/V3）+ Background Service Worker + Content Script 注入层 + 消息总线（background ↔ content ↔ popup）+ Popup/Options 页入口 |
| 桌面端 App（单机）| 主进程入口（Electron main / Tauri main.rs）+ IPC 通信桥 + 系统级能力（托盘、热键）+ 原生文件系统封装 |
| Web + 桌面端（Hybrid）| Web 脚手架基础 + 桌面运行时集成（Tauri/Electron）+ 系统级能力（托盘、全局热键、系统通知）；**桌面集成须独立拆分为 INF 子任务**（OS 差异大、与 Web 技术栈完全不同，不适用 Step 2 的"同期执行合并"规则） |
| 库 / SDK / NPM 包 | 双产物配置（CJS + ESM）+ 公共 API 入口（barrel index.ts）+ 类型声明生成（.d.ts）+ Changelog / 版本工具链；**禁建业务 Task，仅 INF 层** |
| 实时 / 协作型 App | WebSocket 服务层 + 事件 Schema 定义（共享类型）+ 房间/会话管理基础；仅CRDT项目） 冲突解决层 |
| AI Agent / MCP 工具 | LLM 客户端抽象层（provider 无关）+ Prompt 模板管理 + Tool/Function Calling Schema + 对话状态 / Memory 管理；仅MCP项目） MCP 协议适配器 |

**操作（两个输出）**：
1. **注入 Step 2 INF-01**：将对应类型的脚手架清单写入 INF-01 描述。
2. **注入 Step 1 场景约束**：按项目类型限定场景句式，Step 1 提取业务场景时须遵守以下约束：

| 项目类型 | 场景句式模板 | 禁止出现的词汇 |
|:---|:---|:---|
| CLI 工具 | `用户可 [运行命令/传参] → [终端输出结果]` | 页面、路由、组件、UI |
| 库 / SDK | `调用方可 [调用 API X] → [返回 Y]` | 用户、界面、交互 |
| API 服务 | `客户端可 [HTTP METHOD /path] → [响应结构]` | 前端、页面、组件 |
| 小程序 | `用户可在 [页面名] [操作] → [微信端可见结果]` | 后端路由、REST |
| Web SPA / 全栈 / 移动端 / 桌面端 | `用户可 [动作] → [可感知结果]` | （无特殊限制）|

---

### Step 1 · PM 视角 → 业务 Task

从 Brief 功能描述提取用户场景，聚合为业务 Task。

1. 逐条功能转化为场景句式：`用户可 [动作] → [可感知结果]`
2. 共享同一核心流程的场景 → 合并为一个业务 Task
   > **注意**：「共享功能域/主题」≠「共享核心流程」。属于同一功能域（如"社区互动"）但各自有独立 UI 区域和实现域的场景，须按下方拆分信号独立成 Task，禁因主题相同而强行合并。"共享核心流程"仅指：场景在同一 UI 视图内完成、操作同一数据实体、共享同一状态流转。
3. 粒度校准（核心原则：**一任务 = 一次 `/archi.plan` 会话 = 一个 `tasks/<slug>/` 子目录**）：

    **行为视角（PM）**：

    | 信号 | 动作 |
    |:---|:---|
    | 描述含"和"（两个独立关注点） | 拆分 |
    | DoD 超过 4 条验收标准 | 拆分 |
    | 任务横跨 3 个以上独立 UI 区域或实现域 | 拆分 |
    | 一次 `/archi.plan` 难以在单一 spec.md 中完整描述行为 | 拆分 |
    | 两任务文件集合 >50% 重叠 | 合并 |

    > **注意**：若"A 完成后 B 才有意义"，这是顺序依赖关系，**禁合并**；在 Step 4 为 B 声明 `deps: [A]` 即可。

    **实现视角（工程，与行为视角独立判断，任一触发即拆分）**：

    | 信号 | 动作 | 示例 |
    |:---|:---|:---|
    | 任务内含 ≥2 个**实现域**，且各域可独立单元测试 | 拆分 | 纯计算层 + UI 渲染层 → 各自独立 |
    | 实现时需同时掌握 ≥3 个相互独立的技术关注点 | 拆分 | 字符渲染 + 状态机 + 动效 API → 三件事 |
    | 某一关注点有独立的边界复杂度（如 IME、Canvas、第三方图表 API） | 独立出该关注点 | 输入捕获 + IME 单独成任务 |

    > **为什么要加工程视角**：行为视角描述"用户看到什么"，工程视角描述"AI 实现时需同时掌握什么"。一个任务行为上内聚（同一页面），但工程上横跨多个不同域时，AI 在 `/archi.code` 阶段会因上下文过宽而顾此失彼。

    **粒度上限**：

    > 一个 Roadmap Task = **AI 可不再分解、直接产出一个内聚 spec.md** 的最小功能单元（HTN Primitive 可执行性原则）。

    *分解阶段代理指标（以 Brief 描述为依据直接判断）*：

    | 代理指标 | 上限 | 超出时的动作 |
    |:---|:---|:---|
    | 任务描述中独立用户操作流程数 | ≤ 3 条 | 拆分 |
    | 任务涉及的独立数据实体数（各有独立状态流转）| ≤ 2 个 | 拆分 |
    | 描述中"和/并/以及"连接的独立关注点数 | ≤ 1 处 | 拆分 |
    | 任务验收无法在不运行另一个业务 Task 的情况下独立完成 | — | 检查耦合，重划接口边界（INVEST-I）|

    > `/archi.plan` 执行中若预估 spec.md Scenario > 6 或 plan.json Phase > 4，须暂停并提示用户返回 `/archi.scope` 重新拆分，禁强行塞进单一任务。

**DoD 格式**（按任务类型）：

| 任务类型 | goal 格式 |
|:---|:---|
| `FEAT-xx` | `完成后，用户可 <可验证的用户行为>；边界：<明确不做的事>` |
| `INF-xx` | `完成后，<基础设施产出物描述>，通过 <验证命令> 验证；边界：<明确不做的事>` |
| `POLISH-xx` | `完成后，<质量指标> 从 <基线> 提升至 <目标>；边界：<明确不做的事>` |

> DoD 是 `/archi.plan` 生成 spec.md 验收标准和 plan.json 测试用例的基准。FEAT 任务须描述用户可感知结果；INF 任务须描述基础设施产出物和验证方式；POLISH 任务须描述可量化的质量目标。禁写实现细节（文件路径、函数名、测试命令由 plan 阶段决定）。

以下情况归属父任务，禁独立成条：**轻量**结果页 / 完成页、空状态页、确认弹窗。

> **豁免**：结果页含独立数据可视化组件（图表库）、复杂动效逻辑或独立业务计算时，**不适用**父任务归属规则，须独立成业务 Task。

---

### Step 2 · 架构师视角 → Infra 任务

从业务 Task 反推共享基础，禁预设基建。

对所有业务 Task 问：多个 Task 同时依赖 X 且 X 须在 Task 前存在 → X 是 Infra 任务。

| Infra 类型 | 判断标准 |
|:---|:---|
| 项目脚手架 / 全局 Schema / 类型定义 | 所有业务 Task 均依赖；须覆盖 Step 0 标定的项目类型清单 |
| 共享核心引擎（打字引擎、规则引擎等） | 满足以下**任一**条件：① 2 个以上业务 Task 直接调用；② 纯逻辑层、可独立单元测试、与 UI 完全解耦。ID 仍用 `INF-xx`（本质是基础设施），`tag` 可标注为业务域标签（如 `Core`、`Engine`） |
| 第三方集成层 | 多个业务 Task 复用同一外部服务 |

**共享引擎规划契约**：共享核心引擎类 INF 任务的 `description` 末尾须声明主要导出接口（函数签名或关键 interface 名称）。
下游 Task 的 `/archi.plan` 会话可直接对接该接口，无需读上游实现，保障跨任务规划的一致性与可预测性。

**Infra 任务粒度原则：避免微粒化，但禁止跨层堆积**：

- **禁微粒化**：无实质技术差异的同层配置项（如 ESLint + Prettier + TypeScript strict + commitlint）→ 合并，减少任务数、降低依赖链噪音。
- **禁跨层堆积**：每个独立的架构层各有独立技术细节，合并后 AI 上下文同样会失焦；且将多层堆入同一 INF 任务会把关键路径拉至最长，推迟所有业务 Task 的启动时机。

> **架构层参考**（每层有独立实现边界，原则上各自成任务）：
> 项目脚手架（构建 / 代码质量工具链）| 数据层（DB 连接 / ORM / 迁移）| 认证层（Auth 中间件 / Session / JWT）| API 路由层（路由注册 / 中间件链 / 全局错误处理）| 前端基础设施（主题 / Design Token / 全局布局）| 第三方服务集成（各服务独立成 INF 任务）

| 信号 | 动作 |
|:---|:---|
| 同一架构层内的关联配置项（如代码质量工具链各项、或路由骨架与全局错误中间件同属 API 路由层）| 合并 |
| 跨越独立架构层（如 DB 连接层 + Auth 中间件、或 API 路由 + 前端主题系统）| 拆分 |
| 技术栈完全不同（如本地存储层 vs 主题配置）| 拆分 |
| 含 OS 级系统 API（托盘、全局热键、文件关联等）| **强制拆分**（Step 0 强制规则，不受"同层合并"条件约束） |
| 某 Infra 产出物被 ≥2 个业务 Task 直接调用（接口型） | 独立成任务（须声明导出接口契约） |

**隐式标准功能扫描**：以下功能通常不在 Brief 中出现，须按归属分类主动补充（禁遗漏）：

*须补充为独立业务 Task（Phase 2，有用户可见行为）*：

| 检查项 | 触发条件 |
|:---|:---|
| 用户 Profile / 账号设置页 | 项目含 Auth（INF 层有认证中间件）|
| 账号安全 / 密码设置页 | 含 Auth 且用户可修改密码或绑定第三方账号 |
| 通知中心 / 消息列表页 | 含通知基础设施且通知有"已读/未读"状态 |

*须补充为 INF 任务（Phase 1，基础设施）*：

| 检查项 | 触发条件 |
|:---|:---|
| 通知基础设施（服务端推送/消息队列层）| ≥1 个 Task 口头提及"通知/提醒"但未建 INF Task |
| 搜索基础设施（PG FTS 索引 / 外部引擎部署）| ≥2 个业务 Task 各自描述"搜索"功能；须在此决策方案后以 INF Task 承载，下游 Task 依赖它 |
| 权限 / 角色管理层（RBAC）| 含 Auth 且有 ≥2 种用户角色（如 admin / user）|
| 文件存储集成层（S3 / OSS 封装）| ≥1 个 Task 涉及文件上传 / 下载 / 预览 |
| 邮件 / 短信发送集成 | Task 提及"发送邮件 / 验证码 / 短信通知" |
| 支付集成层 | Task 提及"支付 / 下单 / 结账 / 退款" |

---

### Step 3 · NFR 过滤与 Polish 任务识别

横切关注点按**工作量权重**决定处理方式：轻量级注入 goal，重量级独立成 `POLISH-xx` 任务。

> **"首个任务"定义**（用于 NFR 注入）：在依赖链中，`deps` 仅含 INF 层（无业务前置依赖）且最早涉及该 NFR 能力的任务。同层（同 Batch）有多个候选时，取 ID 最小的那个。

**判定标准**：

| 信号 | 处理 |
|:---|:---|
| 仅需业务 Task 内"顺手做"（如用 i18n key 替代硬编码） | **NFR 注入** — 写入首个相关任务 goal 末尾 `[NFR] <说明>` |
| 需独立基础设施搭建（如集成 next-intl、创建翻译文件体系） | **INF 任务** — 建 `INF-xx`，Phase 1 |
| 需跨功能专项工作，且验收可独立度量（如 Lighthouse ≥ 90、全面 a11y 审计） | **POLISH 任务** — 建 `POLISH-xx`，Phase 3 |

**按类型对照**：

| 类型 | 轻量级 → NFR 注入 | 重量级 → 独立任务 |
|:---|:---|:---|
| 国际化 | 业务 Task 内用 i18n key | 集成 i18n 框架 + 翻译文件结构 → `INF-xx`；全量翻译覆盖 + 语言切换 UI → `POLISH-xx` |
| 视觉主题（配置型） | 品牌色 Token 注入脚手架 | — |
| 视觉主题（功能型） | — | 深色/浅色切换 + OS 偏好检测 → `FEAT-xx`（有用户可见行为） |
| 动效风格 | 过渡时长约定注入首个含动效 Task | — |
| 性能优化 | 单个 Task 内的懒加载/缓存 | 跨功能专项优化（首屏 < 2s、包体积目标）→ `POLISH-xx` |
| 可访问性 | 单个 Task 内的 ARIA 属性 | 全面 a11y 审计 + 修复 → `POLISH-xx` |
| 打包分发 | — | 桌面端打包 + 自动更新配置 → `POLISH-xx` |

---

### Step 4 · 依赖与并行优化

- **真实依赖链**：禁所有业务 Task 统一只挂 `INF-01`，须反映真实业务关系。
- **业务实体依赖（优先于最小依赖）**：若功能 B 的核心操作主体由功能 A 产生（即 A 完成前 B 的数据实体不存在），则 B 须声明对 A 的依赖。此规则优先于最小依赖原则。示例：Usage Log 记录的主体是 Prompt，Prompt 由 FEAT-Prompt_Create 创建 → Usage Log Task 须依赖 Prompt Task，而不仅依赖 INF 层。
- **最小依赖原则**：能并行的任务不加多余依赖，最大化 Batch 并行度。

---

## 任务规则

1. **ID 前缀与任务类型**：

   ID 前缀是任务类型的**唯一标识**，`/archi.plan` 根据前缀选择 spec 验收格式。

   | ID 前缀 | 任务类型 | 含义 | Phase 归属 |
   |:---|:---|:---|:---|
   | `INF-xx` | Infrastructure | 基础设施：脚手架、Schema、工具链、第三方集成 | Phase 1 |
   | `FEAT-xx` | Feature | 业务功能：用户可感知的行为 | Phase 2 |
   | `POLISH-xx` | Quality | 质量打磨：性能优化、全面 i18n、a11y 审计、打包分发 | Phase 3 |
   | `EDIT-xx` | Edit | 修改已有功能（仅增量追加模式） | 与被修改任务同 Phase |

   沿用已有 Roadmap 编号水位，从各前缀最大值 +1 起；全新项目从 `INF-01` / `FEAT-01` 起。

2. **Phase 结构**：

   | Phase | ID | 名称 | 内容 |
   |:---|:---|:---|:---|
   | Phase 1 | `phase-infra` | Infrastructure | INF-xx 任务（脚手架、数据层、认证、API 骨架等） |
   | Phase 2 | `phase-core` | Core Features | FEAT-xx 任务（业务功能） |
   | Phase 3 | `phase-polish` | Polish & Launch | POLISH-xx 任务（质量优化、打包分发）；Brief 无打磨需求时省略此 Phase |

3. **tag 字段 = 业务领域标签**：

   `tag` 用于标注任务所属的**业务领域**（如 `Core`、`Community`、`Auth`、`Data`），自由文本，由 Brief 内容决定。

   > **注意**：`tag` 不决定任务类型 — 任务类型由 ID 前缀决定。例如 `FEAT-05`（`tag: Community`）的任务类型是 Feature 而非 Community。

4. **设计决策注入**：Brief 中已有设计决策 → 注入对应任务 `goal` 末尾：`[用户预设] <内容>`；同一条决策禁在多任务重复。`/archi.plan` 将其视为不可更改的硬约束，直接写入 spec.md，不再提问。

5. **EDIT 任务**：需修改已有功能 → 创建 `EDIT-xxx`，goal 注明修改范围；仅增量追加模式下使用。

6. **Slug 命名**：`slug` 即 `tasks/<slug>/` 文件夹名，须清晰表达任务内容，格式为 `Pascal_Snake_Case`（如 `Typing_Engine_Core`）。每个任务对应唯一一个 task 子目录，禁重名。

---

## Task JSON Schema（Tier 1 严格，禁增删字段）

```json
{
  "id": "FEAT-01",
  "title": "Task Title In English",
  "status": "pending | blocked",
  "description": "<1-2 句说明这个任务要构建什么、覆盖哪些范围。共享引擎类任务须在末尾声明主要导出接口>",
  "goal": "完成后，用户可 <可验证的用户行为>；边界：<明确不做的事>",
  "deps": ["INF-01"],
  "tag": "<业务领域标签，自由文本。如 Core, Community, Auth, Data, UI 等>",
  "slug": "Task_Title_Snake_Case"
}
```

> **ID 前缀 vs tag 职责分离**：
> - `id` 前缀（`INF-` / `FEAT-` / `POLISH-` / `EDIT-`）= 任务类型，决定 `/archi.plan` 的 spec 验收格式
> - `tag` = 业务领域标签，仅用于人类分类浏览，不影响 AI 行为

`deps` 为空或全部 `done` → `pending`；有未完成 deps → `blocked`

---

## 中间产物

> 此 Skill 为子程序：产出结构化数据后，控制权交还调用方。
> - `/archi.scope` → 调用方展示给用户确认，OK 后写入 `roadmap.json`
> - `/archi.start` → 调用方直接写入 `roadmap.json`

产出三部分数据：

**① 任务数据**（直接对应 `roadmap.json` 的 phases/tasks 结构）：

```json
{
  "phases": [
    {
      "id": "phase-infra",
      "name": "Infrastructure",
      "tasks": [
        { "id": "INF-01", "title": "...", "status": "pending", "description": "...", "goal": "...", "deps": [], "tag": "Infra", "slug": "..." }
      ]
    },
    {
      "id": "phase-core",
      "name": "Core Features",
      "tasks": [
        { "id": "FEAT-01", "title": "...", "status": "blocked", "description": "...", "goal": "...", "deps": ["INF-01"], "tag": "Core", "slug": "..." }
      ]
    },
    {
      "id": "phase-polish",
      "name": "Polish & Launch",
      "tasks": [
        { "id": "POLISH-01", "title": "...", "status": "blocked", "description": "...", "goal": "...", "deps": ["FEAT-01"], "tag": "Quality", "slug": "..." }
      ]
    }
  ]
}
```

**② NFR 归并清单**（须随任务数据一并返回给调用方；调用方写入 roadmap 时追加为 `nfr` 顶层字段；`/archi.plan` 的 `step_1_load` 须读取此清单）：

| NFR 名称 | 注入任务 ID | 约束内容摘要 | 影响范围（其他相关任务 ID）|
|:---|:---|:---|:---|
| （示例）i18n | FEAT-01 | 所有文案须通过 i18n key 引用，禁硬编码字符串 | FEAT-02, FEAT-03 |

**③ 并行执行批次**（DAG 拓扑层次图，同一 Layer 内任务可交给不同 AI 会话并行处理）：

```
Layer 0 ║ INF-01
Layer 1 ║ INF-02 · INF-03              ← 均依赖 INF-01
Layer 2 ║ FEAT-01 · FEAT-02            ← 各自依赖 INF-02 / INF-03
Layer 3 ║ FEAT-03                      ← 依赖 FEAT-01
Layer 4 ║ POLISH-01 · POLISH-02        ← 依赖相关 FEAT 任务
```
