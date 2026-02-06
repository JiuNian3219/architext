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

**End of Dispatcher.**
