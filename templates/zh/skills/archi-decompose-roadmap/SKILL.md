---
name: archi-decompose-roadmap
description: Decompose project requirements into roadmap tasks. Use when initializing a project or scoping new features.
---

# Roadmap 任务分解

## 系统流程定位

```
Brief → [本 Skill] → roadmap.json → /archi.plan → spec/ui/plan → /archi.code
```

**Skill 边界**：
- 负责：任务 what、done 标准（goal）、依赖链、设计决策注入
- 不负责：文件路径（map.json）、变量命名（dictionary.json）、测试用例（plan.json）、UI 结构（ui.md）

**Schema 约束（Tier 1）**：roadmap.json 由 CLI Zod 校验，禁增删字段。

## 调用模式

| 模式 | 来源 | 输入 | 限制 |
|:---|:---|:---|:---|
| 从零建立 | `/archi.start` | Brief 功能列表 | 禁生成 EDIT 任务 |
| 增量追加 | `/archi.scope` | Brief + 已有 Roadmap | 禁改已有任务，ID 沿用水位 |

## 分解框架（五步）

### Step 0 · 项目类型标定

识别项目类型，确定基建清单，防止 Step 2 遗漏框架性 Infra。

| 项目类型 | 脚手架须包含 |
|:---|:---|
| Web SPA / PWA | 路由骨架 + App Shell（布局 / Provider / 主题注入）|
| 全栈 Web（SSR/SSG）| 路由约定 + API Routes + 全局布局 + Auth Session；仅ui项目: 主题注入 |
| CLI 工具 | logger + AppError + 命令注册入口 |
| API 服务 | 路由层 + 中间件 + DB 连接 + 全局错误处理；仅GraphQL项目: Schema + DataLoader |
| 移动端 App | 导航骨架 + 平台适配层 + 环境配置 |
| 小程序 | 页面路由配置 + app.js/ts + 请求封装层 |
| 浏览器扩展 | manifest + Background SW + Content Script + 消息总线 |
| 桌面端 App | 主进程入口 + IPC 桥 + 系统级能力 |
| Web + 桌面端（Hybrid）| Web 基础 + 桌面运行时；**桌面集成须独立为 INF 子任务**（OS 差异大）|
| 库 / SDK | 双产物（CJS+ESM）+ barrel index + 类型声明 + Changelog；**禁建业务 Task** |
| 实时 / 协作型 | WebSocket 服务层 + 事件 Schema + 房间管理；仅CRDT项目: 冲突解决层 |
| AI Agent / MCP | LLM 客户端抽象 + Prompt 模板 + Tool Schema + Memory；仅MCP项目: MCP 适配器 |

**操作**：
1. 将对应类型清单写入 INF-01 描述
2. 按项目类型限定 Step 1 场景句式约束：

| 项目类型 | 场景句式模板 | 禁止词汇 |
|:---|:---|:---|
| CLI | `用户可 [运行命令/传参] → [终端输出结果]` | 页面、路由、组件、UI |
| 库 / SDK | `调用方可 [调用 API X] → [返回 Y]` | 用户、界面、交互 |
| API 服务 | `客户端可 [HTTP METHOD /path] → [响应结构]` | 前端、页面、组件 |
| 小程序 | `用户可在 [页面名] [操作] → [微信端可见结果]` | 后端路由、REST |
| Web/移动端/桌面端 | `用户可 [动作] → [可感知结果]` | — |

### Step 1 · PM 视角 → 业务 Task

从 Brief 提取场景，转化为句式：`用户可 [动作] → [可感知结果]`

**合并条件**：共享同一核心流程（同一 UI 视图、同一数据实体、共享状态流转）
> 「共享功能域/主题」≠「共享核心流程」。同一功能域但各自有独立 UI 和实现域的场景，须拆分。

**拆分信号**：
| 信号 | 动作 |
|:---|:---|
| 描述含"和"（两个独立关注点）| 拆分 |
| DoD 超过 4 条验收标准 | 拆分 |
| 横跨 3 个以上独立 UI 区域或实现域 | 拆分 |
| 一次 `/archi.plan` 难以在单一 spec.md 描述 | 拆分 |
| 两任务文件集合 >50% 重叠 | 合并 |

> 若"A 完成后 B 才有意义"，这是依赖关系，**禁合并**；在 Step 4 为 B 声明 `deps: [A]`。

**双视角判定**（独立判断，任一触发即拆分）：

| 视角 | 信号 | 动作 | 示例 |
|:---|:---|:---|:---|
| 行为（PM）| 描述含"和"、DoD >4 条、跨 3+ UI 区域 | 拆分 | 用户管理 + 订单管理 → 各自独立 |
| 工程 | 任务内含 ≥2 **实现域**，各域可独立单测 | 拆分 | 纯计算层 + UI 渲染层 → 各自独立 |
| 工程 | 实现时需同时掌握 ≥3 个独立技术关注点 | 拆分 | 字符渲染 + 状态机 + 动效 API → 三件事 |
| 工程 | 某关注点有独立边界复杂度 | 独立出该关注点 | 输入捕获 + IME 单独成任务 |

> 行为视角描述"用户看到什么"；工程视角描述"AI 实现时需同时掌握什么"。任务行为上内聚但工程上横跨多域时，AI 在 `/archi.code` 会因上下文过宽而失焦。

**粒度上限**：

> Roadmap Task = **AI 可不再分解、直接产出一个内聚 spec.md** 的最小功能单元（HTN Primitive 可执行性）。

| 代理指标 | 上限 | 超出动作 |
|:---|:---|:---|
| 独立用户操作流程数 | ≤ 3 | 拆分 |
| 独立数据实体数（各有状态流转）| ≤ 2 | 拆分 |
| "和/并/以及"连接的关注点 | ≤ 1 | 拆分 |
| 验收无法在不运行另一业务 Task 的情况下独立完成 | — | 检查耦合，重划接口边界（INVEST-I）|

> `/archi.plan` 预估 spec.md Scenario > 6 或 plan.json Phase > 4，须暂停并提示返回 `/archi.scope` 重新拆分。

**DoD 格式**：
| 类型 | goal 格式 |
|:---|:---|
| `FEAT-xx` | `完成后，用户可 <可验证的用户行为>；边界：<明确不做的事>` |
| `INF-xx` | `完成后，<基础设施产出物>，通过 <验证命令> 验证；边界：<不做的事>` |
| `POLISH-xx` | `完成后，<质量指标> 从 <基线> 提升至 <目标>；边界：<不做的事>` |

> DoD 是 `/archi.plan` 生成 spec.md 验收标准和 plan.json 测试用例的基准。禁写实现细节（文件路径、函数名由 plan 阶段决定）。

豁免（归属父任务）：轻量结果页 / 完成页 / 空状态 / 确认弹窗（不含独立数据可视化或复杂动效时）
> **例外**：结果页含独立数据可视化组件（图表库）、复杂动效逻辑或独立业务计算时，须独立成 Task。

### Step 2 · 架构师视角 → Infra 任务

反推共享基础：多个 Task 同时依赖 X 且 X 须在 Task 前存在 → X 是 Infra。

| Infra 类型 | 判断标准 |
|:---|:---|
| 项目脚手架 / 全局 Schema | 所有业务 Task 依赖；须覆盖 Step 0 清单 |
| 共享核心引擎 | 满足**任一**：① 2+ 业务 Task 直接调用；② 纯逻辑、可独立单测、与 UI 解耦。`tag` 可标注 `Core`/`Engine` |
| 第三方集成层 | 多个业务 Task 复用同一外部服务 |

**共享引擎规划契约**：共享核心引擎 INF 任务的 `description` 末尾须声明主要导出接口（函数签名或关键 interface 名称）。下游 Task 的 `/archi.plan` 可直接对接该接口，无需读上游实现。

**Infra 任务粒度原则：避免微粒化，但禁止跨层堆积**：
- **禁微粒化**：同层配置项（如 ESLint + Prettier + TS strict）→ 合并
- **禁跨层堆积**：每层独立成任务；跨层堆积会拉长关键路径、推迟业务 Task 启动

> **架构层参考**（每层独立实现边界）：项目脚手架 | 数据层 | 认证层 | API 路由层 | 前端基础设施 | 第三方集成

| 信号 | 动作 |
|:---|:---|
| 同架构层内关联配置项 | 合并 |
| 跨独立架构层（如 DB + Auth）| 拆分 |
| 技术栈完全不同 | 拆分 |
| 含 OS 级 API（托盘、热键）| **强制拆分**（Step 0 规则）|
| 被 ≥2 业务 Task 直接调用 | 独立成任务（须声明导出接口）|

**隐式标准功能扫描**（Brief 常遗漏，须主动补充）：

| 检查项 | 触发条件 | 归属 |
|:---|:---|:---|
| 用户 Profile / 账号设置页 | 含 Auth | FEAT-xx（Phase 2）|
| 账号安全 / 密码设置页 | 含 Auth 且可修改密码/绑定第三方 | FEAT-xx（Phase 2）|
| 通知中心 / 消息列表页 | 含通知基础设施且有已读/未读状态 | FEAT-xx（Phase 2）|
| 通知基础设施 | Task 口头提及"通知"但未建 INF | INF-xx（Phase 1）|
| 搜索基础设施 | 2+ 业务 Task 描述"搜索" | INF-xx（Phase 1）|
| RBAC 权限管理 | 含 Auth 且有 2+ 种角色 | INF-xx（Phase 1）|
| 文件存储集成（S3/OSS）| Task 涉及文件上传/下载/预览 | INF-xx（Phase 1）|
| 邮件/短信/支付集成 | Task 提及对应功能 | INF-xx（Phase 1）|

### Step 3 · NFR 过滤与 Polish 识别

横切关注点按**工作量权重**决定处理方式。

> **"首个任务"定义**（用于 NFR 注入）：依赖链中 `deps` 仅含 INF 层（无业务前置依赖）且最早涉及该 NFR 的任务。同层多个候选时取 ID 最小。

**判定标准**：
| 信号 | 处理 |
|:---|:---|
| 仅需"顺手做"（如用 i18n key）| **NFR 注入** — 写入首个相关任务 goal：`[NFR] <说明>` |
| 需独立基础设施（如集成 i18n 框架）| **INF 任务** — Phase 1 |
| 可独立度量（如 Lighthouse ≥ 90）| **POLISH 任务** — Phase 3 |

| 类型 | 轻量级 → NFR 注入 | 重量级 → 独立任务 |
|:---|:---|:---|
| 国际化 | 业务 Task 内用 i18n key | 集成框架 → `INF-xx`；全量翻译 → `POLISH-xx` |
| 视觉主题（配置型）| 品牌色 Token 注入脚手架 | — |
| 视觉主题（功能型）| — | 深色/浅色切换 + OS 偏好检测 → `FEAT-xx` |
| 动效风格 | 过渡时长约定注入首个含动效 Task | — |
| 性能优化 | 单个 Task 内懒加载/缓存 | 首屏 < 2s、包体积 → `POLISH-xx` |
| 可访问性 | 单个 Task 内 ARIA 属性 | 全面 a11y 审计 → `POLISH-xx` |
| 打包分发 | — | 桌面端打包 + 自动更新 → `POLISH-xx` |

### Step 4 · 依赖与并行优化

- **真实依赖链**：禁所有业务 Task 只挂 `INF-01`，须反映真实业务关系
- **业务实体依赖（优先于最小依赖）**：若 B 的核心操作主体由 A 产生，则 B 须依赖 A。例：Usage Log 记录 Prompt，Prompt 由 FEAT-Prompt_Create 创建 → Usage Log Task 依赖 Prompt Task
- **最小依赖原则**：能并行的不加多余依赖，最大化 Batch 并行度

## 任务规则

1. **ID 前缀**：`INF-xx`（基础设施）| `FEAT-xx`（业务功能）| `POLISH-xx`（质量打磨）| `EDIT-xx`（修改，仅增量模式）

2. **Phase 结构**：
| Phase | ID | 内容 |
|:---|:---|:---|
| Phase 1 | `phase-infra` | INF-xx（脚手架、数据层、认证、API 骨架）|
| Phase 2 | `phase-core` | FEAT-xx（业务功能）|
| Phase 3 | `phase-polish` | POLISH-xx（质量优化）；Brief 无打磨需求时省略 |

3. **tag 字段**：业务领域标签（如 Core, Auth, Data），不决定任务类型

4. **设计决策注入**：Brief 已有决策 → 注入对应任务 goal 末尾：`[用户预设] <内容>`；同一条决策禁在多任务重复

5. **Slug**：`Pascal_Snake_Case`，对应 `tasks/<slug>/` 文件夹名

## Task JSON Schema（Tier 1，禁增删字段）

```json
{
  "id": "FEAT-01",
  "title": "Task Title",
  "status": "pending | blocked",
  "description": "1-2 句说明。共享引擎类任务须在末尾声明主要导出接口",
  "goal": "完成后，用户可 <行为>；边界：<不做的事>",
  "deps": ["INF-01"],
  "tag": "业务领域标签",
  "slug": "Task_Slug"
}
```

`deps` 全部 `done` → `pending`；有未完成 `deps` → `blocked`

## 产出物

**① 任务数据**：`roadmap.json` `phases[].tasks[]` 结构

**② NFR 归并清单**（roadmap `nfr` 顶层字段）：
| NFR | 注入任务 | 约束摘要 | 影响范围 |
|:---|:---|:---|:---|
| i18n | FEAT-01 | 文案须 i18n key | FEAT-02, FEAT-03 |

**③ 并行批次**（DAG 拓扑层次）：
```
Layer 0 ║ INF-01
Layer 1 ║ INF-02 · INF-03
Layer 2 ║ FEAT-01 · FEAT-02
Layer 3 ║ FEAT-03
Layer 4 ║ POLISH-01 · POLISH-02
```
