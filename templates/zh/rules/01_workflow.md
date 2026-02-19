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
| `/archi.plan` | `[[__DOCS_DIR__]]/prompts/plan.md` | Load Planner → Deep Interview |
| `/archi.adopt` | `[[__DOCS_DIR__]]/prompts/adopt.md` | Load Adoption Protocol → Map Registration |
| `/archi.edit` | `[[__DOCS_DIR__]]/prompts/edit.md` | Load Editor → Spec Modification |
| `/archi.revise` | `[[__DOCS_DIR__]]/prompts/revise.md` | Load Chief Architect → Global Revision |
| `/archi.code` | `[[__DOCS_DIR__]]/prompts/code.md` | Load Developer → Coding & Auditing |
| `/archi.audit` | `[[__DOCS_DIR__]]/prompts/audit.md` | Load Chief Auditor → Deep Code Audit |
| `/archi.fix` | `[[__DOCS_DIR__]]/prompts/fix.md` | Load Debugger → Diagnosis |
| `/archi.map` | `[[__DOCS_DIR__]]/prompts/map.md` | Load Surveyor → Map Refresh |
| `/archi.help` | `[[__DOCS_DIR__]]/prompts/help.md` | Load Manual → Display Guide |

> **Mechanism**: 1) Read 目标 `.md` 全文 2) Override `00_system` 部分设定 3) Execute `<step_1>`。

---

## 2. Natural Language Passthrough

**Trigger**: 用户输入非 `/archi.` 指令文本。

**Action**: 不触发 Router，不加载 prompts/。保持 "General Architect" 模式，依赖以下基底规则响应:

| Layer | File | Role |
|:---|:---|:---|
| Core | `00_system.md` | 身份设定，核心原则 |
| Tech | `02_tech_stack.md` | 技术红线，编码规范 |
| Custom | `90_custom_rules.md` | 团队特殊约束 |
| Context | `99_context_glue.md` | 自动关联上下文文档 |

---

## 3. Mode Interaction

- **Command Mode** (`/archi.*`): 高强度流程化，按模板步骤执行。
- **Chat Mode** (自然语言): 自由辅助，利用规则文件回答问题、辅助开发。

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
| `npx archi plan <ID>` | 检查 Feature 的 Plan 完成度 | `npx archi plan SUB-01` |

自动识别 Manual Verification 区域并排除在自动化统计外。

**何时使用**:

| 场景 | 动作 |
|:---|:---|
| `/archi.code` 签收前 | `npx archi plan <ID>` 确认全部 checkbox 已勾选 |
| 了解 Feature 实施进展 | `npx archi plan <ID>` |

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
| `/archi.plan` 生成 plan.json 后 | `npx archi render` |

> 注意: `.md` 视图是自动生成的，禁直接编辑。修改须通过 `.json` 源文件进行。

**End of Dispatcher.**
