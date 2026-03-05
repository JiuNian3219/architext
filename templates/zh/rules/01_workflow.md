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

## 2. Natural Language Dispatch

**Trigger**: 用户输入非 `/archi.` 指令且涉及业务变更。

### §2.0 不触发协议的场景（直接回答）

| 意图类型 | 处理 |
|:---|:---|
| 纯对话 / 代码阅读 / 架构讨论 | ✅ 直接回答 |
| 琐碎修改（typo/注释/格式/日志） | ✅ 直接执行 |

### §2.1 Pre-flight（涉及业务变更时触发）

1. 扫描 `roadmap.json` + `tasks/<ID>_*/` 目录，匹配用户意图对应的任务。
2. 按下表确定应加载的协议：

| 检查结果 | 加载协议 | 确认方式 |
|:---|:---|:---|
| roadmap 无匹配任务 | `scope.md` | 告知"我来帮你梳理需求"后直接开始 |
| 有任务·无 spec.md | `plan.md` | 告知"该任务还没规划，我来做"后直接开始 |
| 有 spec+plan·status=active | `code.md` | 直接开始（IDE 原生 plan mode 接管节奏） |
| status=done·用户要修改 | `edit.md` | 告知"我先更新文档再改代码"后开始 |
| 用户描述了异常行为 | `fix.md` | 直接开始诊断 |
| 影响 >1 个任务或全局资产 | `revise.md` | 先输出影响评估，等确认 |

3. 加载协议后按 §1 的 **Protocol Load Gate** 执行（读全文 → override → step_1）。

### §2.2 链条衔接

各协议 Signoff 的 Next Steps 已指向下一个协议。AI 须：
- 主动提示下一步（"spec 写好了，要开始实现吗？"）
- 用户确认后，直接加载下一个协议继续

| 衔接 | 串联方式 |
|:---|:---|
| scope → plan | 可连续执行（scope 完成后主动询问"要 plan 第一个任务吗？"） |
| plan → code | **须等用户确认**（spec 是最重要的 checkpoint） |
| code → audit | 协议内置（code.md step_5 已有 silent audit） |

> ⛔ **禁**: 在用户未确认时自动从 plan 串联到 code。

### §2.3 IDE 协作

利用 IDE 原生能力（plan mode / agent mode / checkpoint）驱动执行节奏。
协议定义"做什么、检查什么"，不对抗 IDE 的规划/执行能力。

### §2.4 未纳管代码

修改对象未在 `map.json` 中注册、无对应 Task → **STOP & ASK**，引导 `/archi.inherit` 或 `/archi.scope` 纳管。
