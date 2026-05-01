---
name: archi-intent-normalizer
description: Normalize a user request into an Architext Intent Card before command routing. Must run in isolated context/subagent when available. Auto-invoked by 00_system Front Pipeline.
---

## 调用方式

- **自动调用**: 是，由 `00_system.md` Front Pipeline 调用。
- **触发位置**: 用户请求进入协议路由前。
- **执行上下文**: 支持 subagent 时必须在独立子代理/独立上下文执行；无 subagent 时才按 `NO-SUBAGENT` / `NO-SKILL` fallback 内联执行。
- **边界**: 只产出结构化中间产物，不执行协议、不修改项目文件。

# Architext Intent Normalizer

## Purpose

把用户原话转换成结构化 `Intent Card`。本 Skill 只做语义理解和路由建议，**不读取大文件、不修改文件、不执行命令**。

## Inputs

- `user_message`: 用户当前消息全文。
- `recent_context`: 最近对话中仍影响意图判断的简短上下文。
- `explicit_command`: 若用户输入以 `/archi.` 开头，记录原命令；否则为 `null`。
- `known_state`: 调用方可提供的轻量状态，例如 roadmap id 列表、当前讨论文件、当前任务 id。

## Output Contract

只输出一个 JSON 代码块，不输出解释性正文。

```json
{
  "intent_card_version": 1,
  "raw_user_message": "<原话摘要，保留关键动词和对象>",
  "normalized_goal": "<一句话说明用户真正想达成什么>",
  "intent_type": "init | plan | change | code | review | remove | ui | ref | help | answer | unknown",
  "command": "/archi.init | /archi.plan | /archi.change | /archi.code | /archi.review | /archi.remove | /archi.ui | /archi.ref | /archi.help | none",
  "subprotocol": "start | inherit | recover | decompose | detail | fix | edit | revise | task | project | map | add | list | update | remove | none",
  "target": {
    "task_id": null,
    "files": [],
    "refs": [],
    "feature_area": null
  },
  "scope": "single-task | multi-task | global | project-setup | docs-only | code-only | read-only | unknown",
  "operation_kind": "read | write-docs | write-code | delete | overwrite | command-run | none",
  "requires_user_confirmation": false,
  "confidence": 0.0,
  "ambiguities": [],
  "routing_reason": ["<命中的语义信号>"],
  "recommended_next_action": "<下一步应加载的协议或应反问的问题>"
}
```

## Routing Rules

### Direct Answer

不是项目业务动作时，返回：
- `intent_type`: `answer`
- `command`: `none`
- `subprotocol`: `none`

适用：解释概念、讨论方案、要求总结、询问文件含义、只让审查不要修改。

### Init

项目初始化、纳管已有代码、恢复 pack：
- 新项目 / 从 brief 开始 → `/archi.init`, `start`
- 已有代码纳管 → `/archi.init`, `inherit`
- 恢复 pack / `.xml` 备份 → `/archi.init`, `recover`

### Plan

新需求、新功能、新任务、拆范围、细化已有 roadmap 任务：
- 没有明确现成 task id，或用户说“新建/新增/写新需求/拆一下” → `/archi.plan`, `decompose`
- 有明确 task id，且要补全 spec/plan 以便之后实现 → `/archi.plan`, `detail`

### Change

已纳管内容需要变化：
- 报错、bug、行为不符合既有 spec → `/archi.change`, `fix`
- 补需求、改行为、改 spec、调整单个任务边界 → `/archi.change`, `edit`
- 技术栈、架构、全局规范、跨任务方向变化 → `/archi.change`, `revise`

### Code

实现已规划且可执行的任务：
- “实现/开发/写代码/开始做 <ID>” → `/archi.code`
- 若没有 task id 或任务不存在，降级建议 `/archi.plan`

### Review

审查、检查、体检、同步 map：
- 单任务代码审查 → `/archi.review`, `task`
- 项目整体体检 → `/archi.review`, `project`
- 目录/map/架构地图同步 → `/archi.review`, `map`

### Remove

下线功能、删除 task 及相关代码文档 → `/archi.remove`。标记：
- `operation_kind`: `delete`
- `requires_user_confirmation`: `true`

### UI

生成或更新 `screens/` 概念设计 → `/archi.ui`。

### Ref

管理外部参考资料：
- 添加链接/文件/粘贴资料 → `/archi.ref`, `add`
- 查看引用列表 → `/archi.ref`, `list`
- 刷新某个引用 → `/archi.ref`, `update`, `operation_kind`: `overwrite`, `requires_user_confirmation`: `true`
- 删除某个引用 → `/archi.ref`, `remove`, `operation_kind`: `delete`, `requires_user_confirmation`: `true`

## Ambiguity Rules

遇到以下情况不要硬路由，`confidence` 不得高于 `0.6`，并在 `ambiguities` 中给出需要反问的问题：

- “改一下/优化一下/处理一下”但没有说明是 bug、需求变化还是实现细节。
- 同时出现 bug 修复和新增需求信号。
- 用户想“实现新功能”但没有 task id，也没有说明是否已有 roadmap。
- 用户说“审查/看看”但无法判断是单任务还是项目整体。
- 涉及删除、覆盖、安装依赖、跨任务全局变更，但目标不明确。

## Confidence Guide

- `0.9-1.0`: 显式命令或强动词 + 明确目标。
- `0.75-0.89`: 语义清楚，但缺少少量上下文，协议仍可继续加载后补齐。
- `0.5-0.74`: 有明显方向，但需要用户确认。
- `<0.5`: 不足以路由，应先提问。

## Hard Limits

- 不要把“新功能”路由到 `/archi.code`，除非存在明确可执行 task id。
- 不要把“bug”直接路由到 `/archi.code`，应优先 `/archi.change` 的 `fix`。
- 不要把“全局/架构/技术栈”路由到单任务 edit，除非用户明确限定只改某个 task 文档。
- 不要为了显得确定而丢弃歧义；歧义要进入 `ambiguities`。
