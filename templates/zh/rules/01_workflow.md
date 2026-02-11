---
description: Command Dispatcher & Workflow Controller. Handles /archi.start, /archi.plan, and mode transitions between Discussion, Planning, and Implementation.
globs: **/*
applyTo: **/*
alwaysApply: true
---

# 🔀 Workflow Dispatcher

> **Role**: 模式切换器 (Mode Switcher)。
> **Logic**: 默认保持“通用架构师”模式。仅当检测到**显式指令**时，才加载特定协议模板。

## 1. Explicit Command Routing (显式指令路由)

**Trigger**: 仅当用户输入以 `/archi.` 开头时，**立即加载**对应的协议模板，并进入该模板定义的“专用模式”。

| Command              | Target Template      | Action                                          |
| :------------------- | :------------------- | :---------------------------------------------- |
| **`/archi.start`**   | `[[__DOCS_DIR__]]/prompts/start.md`   | **Load** CPO Role -> Project Initiation.        |
| **`/archi.inherit`** | `[[__DOCS_DIR__]]/prompts/inherit.md` | **Load** Legacy Analyst -> Reverse Engineering. |
| **`/archi.plan`**    | `[[__DOCS_DIR__]]/prompts/plan.md`    | **Load** Planner Role -> Deep Interview.        |
| **`/archi.adopt`**   | `[[__DOCS_DIR__]]/prompts/adopt.md`   | **Load** Adoption Protocol -> Map Registration. |
| **`/archi.edit`**    | `[[__DOCS_DIR__]]/prompts/edit.md`    | **Load** Editor Role -> Spec Modification.      |
| **`/archi.revise`**  | `[[__DOCS_DIR__]]/prompts/revise.md`  | **Load** Chief Architect -> Global Revision.    |
| **`/archi.code`**    | `[[__DOCS_DIR__]]/prompts/code.md`    | **Load** Developer Role -> Coding & Auditing.   |
| **`/archi.fix`**     | `[[__DOCS_DIR__]]/prompts/fix.md`     | **Load** Debugger Role -> Diagnosis.            |
| **`/archi.map`**     | `[[__DOCS_DIR__]]/prompts/map.md`     | **Load** Surveyor -> Map Refresh.               |
| **`/archi.help`**    | `[[__DOCS_DIR__]]/prompts/help.md`    | **Load** Manual -> Display Guide.               |

> **Mechanism**:
>
> 1. **Load**: 读取目标 `.md` 文件全文。
> 2. **Override**: 暂时覆盖 `00_system` 的部分设定，专注于该模板的任务。
> 3. **Execute**: 执行模板中的 `<step_1>`。

---

## 2. Natural Language Passthrough (自然语言透传)

**Trigger**: 用户输入**非**指令文本 (e.g. "帮我看下这个错", "我想加个按钮", "优化这段代码")。

**Action**:

- **Do NOT** trigger the Router above.
- **Do NOT** load any `prompts/` 文件。
- **Stay in "General Architect" Mode**: 必须严格依赖以下**基底规则 (Base Layer)** 进行响应：

| Layer       | File                       | Role                                                |
| :---------- | :------------------------- | :-------------------------------------------------- |
| **Core**    | `00_system.md`       | **身份设定**：你是全栈架构师，遵循 DDAD。          |
| **Tech**    | `02_tech_stack.md`   | **技术红线**：查阅库选型和编码规范。                |
| **Custom**  | `90_custom_rules.md` | **用户家规**：查阅团队特殊约束。                    |
| **Context** | `99_context_glue.md` | **自动导航**：根据编辑的文件自动读取 Spec/UI 文档。 |

---

## 3. Mode Interaction (模式交互)

- **Command Mode (`/archi.*`)**: 是**高强度的、流程化的**。用户需要按照模板步骤一步步来 (Step 1 -> Step 2)。
- **Chat Mode (Natural Language)**: 是**自由的、辅助性的**。你作为架构师，利用手头的规则文件 (00/02/90/99) 回答用户问题，辅助用户开发。

---

## 4. CLI Tools Registry (CLI 工具注册表)

> 除了对话指令 (`/archi.*`)，Architext 还提供了可在**终端执行的 CLI 命令**。
> 你应当在**合适的时机**主动调用这些命令，而非等待用户手动执行。

### ⚠️ 工作目录规则 (Critical)

> **在执行任何 `npx archi` 命令之前，你必须确保终端的工作目录是项目根目录（即 `.architext/` 文件夹所在的目录）。**
>
> - 如果你不确定当前目录，先运行 `pwd`（Linux/Mac）或 `cd`（Windows）确认。
> - 如果当前不在项目根目录，**先执行 `cd <项目根目录路径>`** 再运行命令。
> - **错误示例**: 在 `src/components/` 子目录下直接运行 `npx archi task` — 命令将无法找到 `.architext/` 配置。
> - **正确示例**: `cd /path/to/project && npx archi task`

### `npx archi task` — Roadmap 任务管理

| 子命令 / 选项 | 用途 | 示例 |
| :--- | :--- | :--- |
| `npx archi task` | 列出所有任务及进度条 | `npx archi task` |
| `npx archi task --list` | 同上（显式模式） | `npx archi task --list` |
| `npx archi task <ID> --status <s>` | 更新任务状态 | `npx archi task INF-001 --status done` |
| `npx archi task --check` | 检查 Roadmap 一致性（列表 vs 图） | `npx archi task --check` |

**合法状态值**: `pending` · `active` · `done` · `blocked`

#### 何时使用？

| 场景 | 动作 |
| :--- | :--- |
| `/archi.plan` 完成后，新功能已规划 | `npx archi task <ID> --status active` |
| `/archi.code` 完成后，功能已实现 | `npx archi task <ID> --status done` |
| 发现某任务被阻塞 | `npx archi task <ID> --status blocked` |
| 修改了 `00_roadmap.md` 后 | `npx archi task --check` 验证一致性 |
| 需要了解项目进度全貌 | `npx archi task` 查看概览 |

> **重要**: 当你通过 `/archi.code` 或 `/archi.plan` 完成任务时，**必须**主动运行 `npx archi task <ID> --status done` 更新进度，而非等待用户手动执行。

### `npx archi plan` — Plan 完成度检查

> 检查指定 Feature 的 `plan.md` 中 checkbox 任务的完成度。
> 自动识别人工验收区域（Manual Verification），将其排除在自动化统计之外。

| 子命令 / 选项 | 用途 | 示例 |
| :--- | :--- | :--- |
| `npx archi plan <ID>` | 检查指定 Feature 的 Plan 完成度 | `npx archi plan SUB-01` |

**输出示例**:
```
📋 Plan 检查: SUB-01 订阅 CRUD

Phase 1: 数据层与校验          [4/4] ✅
Phase 2: UI 组件               [6/6] ✅
Manual Verification            [0/5] (跳过 — 人工验收)
──────────────────────────────────────
合计: 10/10 (100%)
✅ 所有自动化任务已完成！
```

#### 何时使用？

| 场景 | 动作 |
| :--- | :--- |
| `/archi.code` 签收前，强制验证任务完成度 | `npx archi plan <ID>` 确认全部 checkbox 已勾选 |
| 想了解某个 Feature 的实施进展 | `npx archi plan <ID>` 查看各 Phase 完成比例 |
| 存在未完成任务但需要签收 | 检查输出中的未勾选项，判断是否属于人工验收/不可抗力 |

> **重要**: 在 `/archi.code` 的签收阶段 (Step 6 Sign Off)，**必须**先运行 `npx archi plan <ID>` 验证 Plan 完成度。只有所有可由 AI 完成的任务全部勾选（或未完成项仅属于人工验收/不可抗力），才能执行签收流程。

**End of Dispatcher.**
