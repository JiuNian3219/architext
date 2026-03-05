---
description: Command Dispatcher & Workflow Controller. Handles /archi.* routing and mode transitions.
globs: **/*
applyTo: **/*
alwaysApply: true
---

# Workflow Dispatcher

> **Role**: 模式切换器。默认"通用架构师"模式，仅检测到显式指令时加载特定协议。

> ⛔ **STOP CHECK** — 每轮回复前自检:
> | 违规行为 | 正确处理 |
> |:---|:---|
> | 收到 `/archi.*` 却未读协议文件就执行 | 停止 → 先读取协议文件 |
> | 用户请求涉及行为变更却直接改代码 | 停止 → 引导到对应命令 |
> | 执行 `npx archi` 前未确认工作目录 | 停止 → 先通过 Working Directory Gate（见 `04_cli_tools.md`） |

## 1. Explicit Command Routing

**Trigger**: 用户输入以 `/archi.` 开头时，立即加载对应协议。

| Command | Target Template |
|:---|:---|
| `/archi.start` | `[[__PROMPTS_PATH__]]/archi.start.md` |
| `/archi.inherit` | `[[__PROMPTS_PATH__]]/archi.inherit.md` |
| `/archi.scope` | `[[__PROMPTS_PATH__]]/archi.scope.md` |
| `/archi.plan` | `[[__PROMPTS_PATH__]]/archi.plan.md` |
| `/archi.edit` | `[[__PROMPTS_PATH__]]/archi.edit.md` |
| `/archi.revise` | `[[__PROMPTS_PATH__]]/archi.revise.md` |
| `/archi.code` | `[[__PROMPTS_PATH__]]/archi.code.md` |
| `/archi.audit` | `[[__PROMPTS_PATH__]]/archi.audit.md` |
| `/archi.fix` | `[[__PROMPTS_PATH__]]/archi.fix.md` |
| `/archi.map` | `[[__PROMPTS_PATH__]]/archi.map.md` |
| `/archi.remove` | `[[__PROMPTS_PATH__]]/archi.remove.md` |
| `/archi.ref` | `[[__PROMPTS_PATH__]]/archi.ref.md` |
| `/archi.recover` | `[[__PROMPTS_PATH__]]/archi.recover.md` |
| `/archi.help` | `[[__PROMPTS_PATH__]]/archi.help.md` |

> **Protocol Load Gate** (禁跳过，按序完成):
> 1. **Read** 目标 `.md` 全文 → 文件不存在时停止: `协议文件未找到，中止执行`
> 2. **Override** — 可覆盖: `<system_role>`, `<thinking_process>`, `<communication_style>`。不可覆盖: `<core_philosophy>`, `<critical_protocols>`。
> 3. **Execute** `<step_1>` — 禁在步骤 1 完成前执行任何协议内容

---

## 2. Natural Language Passthrough

**Trigger**: 用户输入非 `/archi.` 指令。

**判定标准**: 该修改是否影响已文档化的行为（spec/ui/plan）？

| 意图类型 | 处理 |
|:---|:---|
| 纯对话 / 代码阅读 / 架构讨论 | ✅ 直接回答 |
| 琐碎修改（typo/注释/格式/日志） | ✅ 直接执行 |
| 行为变更（逻辑/接口/类型/UI） | 🔀 引导 → `/archi.edit` + `/archi.code` |
| Bug 修复 | 🔀 引导 → `/archi.fix` |
| 新增功能 | 🔀 引导 → `/archi.scope` 或 `/archi.plan` |
| 大规模重构 | 🔀 引导 → `/archi.revise` |

🔀 引导时须: ① 一句话说明为什么需走命令 ② 推荐具体命令+参数 ③ 询问用户是否开始。
> ⛔ **禁**: 先改代码再事后建议走命令。

修改对象未在 `map.json` 中注册、无对应 Task → **STOP & ASK**，引导 `/archi.inherit` 或 `/archi.scope` 纳管。
