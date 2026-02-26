---
name: archi-decompose-roadmap
description: Architext 任务分解专家。五步分解法：先标定项目类型校准基建清单，再双视角提取业务 Task 和 Infra 任务，NFR 横切关注点归并入 goal（不独立成任务），建立真实依赖链并输出并行批次。产出符合 Tier 1 Schema 的 roadmap.json 任务，作为 `/archi.plan` 的输入契约。用于任何需要生成或追加 Roadmap 任务的场景。
---

# Roadmap 任务分解

## 系统流程定位

```
Brief → [本 Skill] → roadmap.json 任务
                            ↓
                   /archi.plan <task-id>
                   读: vision.md + map.json + tech_stack.md
                   写: spec.md（行为规格/验收标准）
                       ui.md（任务 UI 范围声明）[?UI]
                       plan.json（可执行步骤 + 测试用例 checkbox）
                   也更新: map.json / dictionary.json / data_snapshot.json
                   视觉参考: [[__DOCS_DIR__]]/global/ui_context.md [?UI]
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
| 全栈 Web（SSR/SSG）| 路由约定（loader/action/页面）+ API Routes 层 + 全局布局 + Auth Session 管理（Cookie/JWT）；[?UI] 主题注入 |
| CLI 工具 | logger 模块 + AppError 处理层 + 命令注册入口 |
| API 服务（REST / GraphQL）| 路由层 + 中间件层 + DB 连接层 + 全局错误处理；[?GraphQL] Schema 定义层 + DataLoader |
| 移动端 App（原生/跨平台）| 导航骨架（React Navigation / Go Router）+ 平台适配层（iOS/Android 权限、原生模块）+ 环境配置（dev/staging/prod）|
| 小程序 | 页面路由配置 + 全局 app.js/ts + 请求封装层 |
| 浏览器扩展 | manifest.json（V2/V3）+ Background Service Worker + Content Script 注入层 + 消息总线（background ↔ content ↔ popup）+ Popup/Options 页入口 |
| 桌面端 App（单机）| 主进程入口（Electron main / Tauri main.rs）+ IPC 通信桥 + 系统级能力（托盘、热键）+ 原生文件系统封装 |
| Web + 桌面端（Hybrid）| Web 脚手架基础 + 桌面运行时集成（Tauri/Electron）+ 系统级能力（托盘、全局热键、系统通知）；**桌面集成须独立拆分为 INF 子任务**（OS 差异大、与 Web 技术栈完全不同，不适用 Step 2 的"同期执行合并"规则） |
| 库 / SDK / NPM 包 | 双产物配置（CJS + ESM）+ 公共 API 入口（barrel index.ts）+ 类型声明生成（.d.ts）+ Changelog / 版本工具链；**禁建业务 Task，仅 INF 层** |
| 实时 / 协作型 App | WebSocket 服务层 + 事件 Schema 定义（共享类型）+ 房间/会话管理基础；[?CRDT] 冲突解决层 |
| AI Agent / MCP 工具 | LLM 客户端抽象层（provider 无关）+ Prompt 模板管理 + Tool/Function Calling Schema + 对话状态 / Memory 管理；[?MCP] MCP 协议适配器 |

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

**DoD 格式**：`完成后，用户可 <可验证的用户行为>；边界：<明确不做的事>`

> DoD 是 `/archi.plan` 生成 spec.md 验收标准和 plan.json 测试用例的基准。须精准描述用户可感知结果，禁写实现细节（文件路径、函数名、测试命令由 plan 阶段决定）。

以下情况归属父任务，禁独立成条：**轻量**结果页 / 完成页、空状态页、确认弹窗。

> **豁免**：结果页含独立数据可视化组件（图表库）、复杂动效逻辑或独立业务计算时，**不适用**父任务归属规则，须独立成业务 Task。

---

### Step 2 · 架构师视角 → Infra 任务

从业务 Task 反推共享基础，禁预设基建。

对所有业务 Task 问：多个 Task 同时依赖 X 且 X 须在 Task 前存在 → X 是 Infra 任务。

| Infra 类型 | 判断标准 |
|:---|:---|
| 项目脚手架 / 全局 Schema / 类型定义 | 所有业务 Task 均依赖；须覆盖 Step 0 标定的项目类型清单 |
| 共享核心引擎（打字引擎、规则引擎等） | 满足以下**任一**条件：① 2 个以上业务 Task 直接调用；② 纯逻辑层、可独立单元测试、与 UI 完全解耦。`tag: Core` |
| 第三方集成层 | 多个业务 Task 复用同一外部服务 |

**Core 任务规划契约**：`tag: Core` 任务的 `description` 末尾须声明主要导出接口（函数签名或关键 interface 名称）。
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

### Step 3 · NFR 过滤

以下类型**禁独立成任务**：注入首个实现该能力的任务 `goal` 末尾（`[NFR] <说明>`）；其余受影响任务仅在 NFR 清单中标注。`/archi.plan` 执行时会将 NFR 注入对应的 spec.md 约束章节。

> **"首个任务"定义**：在依赖链中，`deps` 仅含 INF 层（无业务前置依赖）且最早涉及该 NFR 能力的任务。同层（同 Batch）有多个候选时，取 ID 最小的那个。

| 类型 | 常见形式 | 注意 |
|:---|:---|:---|
| 国际化 | i18n、多语言、翻译文案 | — |
| 视觉主题（配置型） | 品牌色 Token、Tailwind 主题色、CSS 变量定义 | NFR，注入脚手架任务 |
| 视觉主题（功能型） | 深色/浅色切换按钮、OS 偏好检测、主题持久化 | **非 NFR**，须建立独立业务 Task（有用户可见行为） |
| 动效风格规范 | 页面切换方式、过渡时长约定 | NFR，注入首个含动效的 Task goal |
| 性能优化 | 懒加载、虚拟列表、缓存策略 | — |
| 可访问性 | A11y、键盘导航、屏幕阅读器 | — |

---

### Step 4 · 依赖与并行优化

- **真实依赖链**：禁所有业务 Task 统一只挂 `INF-01`，须反映真实业务关系。
- **业务实体依赖（优先于最小依赖）**：若功能 B 的核心操作主体由功能 A 产生（即 A 完成前 B 的数据实体不存在），则 B 须声明对 A 的依赖。此规则优先于最小依赖原则。示例：Usage Log 记录的主体是 Prompt，Prompt 由 FEAT-Prompt_Create 创建 → Usage Log Task 须依赖 Prompt Task，而不仅依赖 INF 层。
- **最小依赖原则**：能并行的任务不加多余依赖，最大化 Batch 并行度。

---

## 任务规则

1. **ID 生成**：沿用已有 Roadmap 编号水位，从各前缀最大值 +1 起；全新项目从 `INF-01` / `FEAT-01` 起。

2. **Phase 归属**：

   | 任务类型 | Phase |
   |:---|:---|
   | 项目脚手架、Schema、全局类型 | Phase 1 (Infrastructure) |
   | 共享核心引擎（Step 2 识别） | Phase 1 (Infrastructure) |
   | 业务 Task | Phase 2 (Core Features) |
   | EDIT-xxx（修改已有功能） | 与被修改任务同 Phase |

3. **设计决策注入**：Brief 中已有设计决策 → 注入对应任务 `goal` 末尾：`[用户预设] <内容>`；同一条决策禁在多任务重复。`/archi.plan` 将其视为不可更改的硬约束，直接写入 spec.md，不再提问。

4. **EDIT 任务**：需修改已有功能 → 创建 `EDIT-xxx`（`tag: Edit`），goal 注明修改范围；仅增量追加模式下使用。

5. **Slug 命名**：`slug` 即 `tasks/<slug>/` 文件夹名，须清晰表达任务内容，格式为 `Pascal_Snake_Case`（如 `Typing_Engine_Core`）。每个任务对应唯一一个 task 子目录，禁重名。

---

## Task JSON Schema（Tier 1 严格，禁增删字段）

```json
{
  "id": "FEAT-01",
  "title": "Task Title In English",
  "status": "pending | blocked",
  "description": "<1-2 句说明这个任务要构建什么、覆盖哪些范围。Core 任务须在末尾声明主要导出接口>",
  "goal": "完成后，用户可 <可验证的用户行为>；边界：<明确不做的事>",
  "deps": ["INF-01"],
  "tag": "Infra | Core | Feature | Edit",
  "slug": "Task_Title_Snake_Case"
}
```

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
      "id": "phase-1",
      "name": "Infrastructure",
      "tasks": [
        { "id": "INF-01", "title": "...", "status": "pending", "description": "...", "goal": "...", "deps": [], "tag": "Infra", "slug": "..." }
      ]
    },
    {
      "id": "phase-2",
      "name": "Core Features",
      "tasks": [
        { "id": "FEAT-01", "title": "...", "status": "blocked", "description": "...", "goal": "...", "deps": ["INF-01"], "tag": "Feature", "slug": "..." }
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
```
