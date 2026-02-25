---
description: Command Dispatcher & Workflow Controller. Handles /archi.start, /archi.plan, and mode transitions between Discussion, Planning, and Implementation.
globs: **/*
applyTo: **/*
alwaysApply: true
---

# Workflow Dispatcher

> **Role**: 模式切换器。默认保持"通用架构师"模式，仅检测到显式指令时加载特定协议。

## 1. Explicit Command Routing

**Trigger**: 用户输入以 `/archi.` 开头时，立即加载对应协议模板。

| Command | Target Template | Action |
|:---|:---|:---|
| `/archi.start` | `[[__DOCS_DIR__]]/prompts/start.md` | Load CPO → Project Initiation |
| `/archi.inherit` | `[[__DOCS_DIR__]]/prompts/inherit.md` | Load Legacy Analyst → Reverse Engineering |
| `/archi.scope` | `[[__DOCS_DIR__]]/prompts/scope.md` | Load Strategist → Requirement Decomposition |
| `/archi.plan` | `[[__DOCS_DIR__]]/prompts/plan.md` | Load Planner → Deep Interview |
| `/archi.edit` | `[[__DOCS_DIR__]]/prompts/edit.md` | Load Editor → Spec Modification |
| `/archi.revise` | `[[__DOCS_DIR__]]/prompts/revise.md` | Load Chief Architect → Global Revision |
| `/archi.code` | `[[__DOCS_DIR__]]/prompts/code.md` | Load Developer → Coding & Auditing |
| `/archi.audit` | `[[__DOCS_DIR__]]/prompts/audit.md` | Load Chief Auditor → Deep Code Audit |
| `/archi.fix` | `[[__DOCS_DIR__]]/prompts/fix.md` | Load Debugger → Diagnosis |
| `/archi.map` | `[[__DOCS_DIR__]]/prompts/map.md` | Load Surveyor → Map Refresh |
| `/archi.remove` | `[[__DOCS_DIR__]]/prompts/remove.md` | Load Surgeon → Task Decommission |
| `/archi.help` | `[[__DOCS_DIR__]]/prompts/help.md` | Load Manual → Display Guide |

> **Mechanism**: 1) Read 目标 `.md` 全文 2) Override `00_system` 部分设定 3) Execute `<step_1>`。

---

## 2. Natural Language Passthrough

**Trigger**: 用户输入非 `/archi.` 指令文本。

### 2.1 Intent Detection

**Role**: 智能调度员。检测用户意图，按影响级别决定直接执行或引导到命令。

**判定标准**: 该修改是否影响已文档化的行为（spec.md 的接口/逻辑/场景、ui.md 的交互/结构、plan.json 的实施步骤）？

| 意图类型 | 处理 |
|:---|:---|
| 纯对话 / 代码阅读 / 架构讨论 | ✅ 直接回答，利用基底规则增强 |
| 琐碎修改（typo/注释/格式/日志） | ✅ 直接执行 |
| 行为变更（逻辑/接口/类型/UI） | 🔀 引导 → `/archi.edit` + `/archi.code` |
| Bug 修复 | 🔀 引导 → `/archi.fix` |
| 新增功能 | 🔀 引导 → `/archi.scope` 或 `/archi.plan` |
| 大规模重构 | 🔀 引导 → `/archi.revise` |

### 2.2 Guided Dispatch (引导规范)

🔀 引导时须:
1. 一句话说明为什么需走命令（关联到哪个文档会受影响）
2. 推荐具体命令 + 参数
3. 询问用户是否开始

禁: 先改代码再事后建议走命令。

### 2.3 未纳管代码

修改对象未在 `map.json` 中注册、无对应 Task:
- 告知用户该模块未纳管
- 建议 `/archi.inherit` 或 `/archi.scope` 纳入
- 用户确认"临时调整"后可直接修改

### 2.4 基底规则

所有场景（含引导和纯对话）均依赖以下基底规则:

| Layer | File | Role |
|:---|:---|:---|
| Core | `00_system.md` | 身份设定，核心原则 |
| Tech | `02_tech_stack.md` | 技术红线，编码规范 |
| Custom | `90_custom_rules.md` | 团队特殊约束 |
| Context | `99_context_glue.md` | 自动关联上下文文档 |

---

## 3. Mode Interaction

| 模式 | 触发 | 代码修改权限 | 文档同步 |
|:---|:---|:---|:---|
| **Command Mode** | `/archi.*` 指令 | 完整（按协议） | 命令内置 |
| **Chat Mode — 对话** | 自然语言提问/讨论 | 无（只读） | N/A |
| **Chat Mode — 琐碎** | 自然语言 + 不影响文档化行为 | 受限（typo/注释/格式） | 不需要 |
| **Chat Mode — 调度** | 自然语言 + 影响文档化行为 | 无（引导到命令） | 由命令保证 |

---

## 4. CLI Tools Registry

> Architext 还提供终端可执行的 CLI 命令。你应在合适时机主动调用，而非等用户手动执行。

### Working Directory Rule (Critical)

> 执行任何 `npx archi` 命令前，须确保终端在项目根目录（`[[__DOCS_DIR__]]/` 所在目录）。
> 不确定时先确认当前目录。禁在子目录直接运行。

### `npx archi task` — Roadmap 任务管理

| 子命令 | 用途 | 示例 |
|:---|:---|:---|
| `npx archi task` | 列出所有任务及进度 | `npx archi task` |
| `npx archi task <ID> --status <s>` | 更新任务状态 | `npx archi task INF-001 --status done` |
| `npx archi task --check` | 检查 Roadmap 一致性 | `npx archi task --check` |

**合法状态值**: `pending` / `active` / `done` / `blocked`

**何时使用**:

| 场景 | 动作 |
|:---|:---|
| `/archi.plan` 完成后 | `npx archi task <ID> --status active` |
| `/archi.code` 完成后 | `npx archi task <ID> --status done` |
| 发现任务被阻塞 | `npx archi task <ID> --status blocked` |
| 修改了 `roadmap.json` 后 | `npx archi task --check` |
| 需了解项目进度 | `npx archi task` |

> 完成 `/archi.code` 或 `/archi.plan` 时，须主动运行 `npx archi task <ID> --status <done|active>` 更新进度。

### `npx archi plan` — Plan 完成度检查

| 子命令 | 用途 | 示例 |
|:---|:---|:---|
| `npx archi plan <ID>` | 检查 Task 的 Plan 完成度 | `npx archi plan SUB-01` |

自动识别 Manual Verification 区域并排除在自动化统计外。

**何时使用**:

| 场景 | 动作 |
|:---|:---|
| `/archi.code` 签收前 | `npx archi plan <ID>` 确认全部 checkbox 已勾选 |
| 了解 Task 实施进展 | `npx archi plan <ID>` |

> 在 `/archi.code` 签收阶段，须先运行 `npx archi plan <ID>` 验证完成度。

### `npx archi render` — 渲染 JSON 数据为 Markdown 视图

| 子命令 | 用途 | 示例 |
|:---|:---|:---|
| `npx archi render` | 将所有 JSON 数据文件渲染为人类可读的 `.md` 视图 | `npx archi render` |

**何时使用**:

| 场景 | 动作 |
|:---|:---|
| AI 直接编辑了 `.json` 数据文件 | `npx archi render` |
| `/archi.start` 创建 roadmap 后 | `npx archi render` |
| `/archi.scope` 更新 roadmap 后 | `npx archi render` |
| `/archi.plan` 生成 plan.json 后 | `npx archi render` |

> 注意: `.md` 视图是自动生成的，禁直接编辑。修改须通过 `.json` 源文件进行。

**End of Dispatcher.**
