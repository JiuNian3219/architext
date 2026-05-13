---
name: archi-context-fetch
description: Fetch minimal Architext documentation context after an Intent Card. Must run in isolated context/subagent when available. Auto-invoked by 00_system Front Pipeline.
---

## 调用方式

- **自动调用**: 是，由 `00_system.md` Front Pipeline 调用。
- **触发位置**: 用户请求进入协议路由前。
- **执行上下文**: 支持 subagent 时必须在独立子代理/独立上下文执行；无 subagent 时才按 `NO-SUBAGENT` / `NO-SKILL` fallback 内联执行。
- **边界**: 只产出结构化中间产物，不执行协议、不修改项目文件。

# Architext Context Fetch

## Purpose

根据 `Intent Card` 读取最小必要的 Architext 文档，产出结构化 `Context Pack`。本 Skill 是“资料员”，只负责找文件、摘事实、标缺口；**不读产品源码、不修改文件、不执行命令、不替协议做最终决策**。

## Inputs

- `intent_card`: archi-intent-normalizer 的输出。
- `protocol_hint`: 即将加载的协议，例如 `/archi.change` 或 `change/edit`。
- `known_state`: 调用方已知的轻量状态，例如项目 feature、task id、当前讨论文件。
- `available_files`: 可选。调用方已经发现的 Architext 文件列表。

## Output Contract

只输出一个 JSON 代码块，不输出解释性正文。

**Continuation Contract**: 本 Skill 的输出只是 Front Pipeline 的第 2 步。主 agent 收到 Context Pack 后，若 `missing_or_stale` 为空或仅含非阻塞提示，必须继续加载并执行 `next_context_action` / Intent Card 指向的协议；不得把 Context Pack 当作最终回复。

`risk_flags` 是后续协议 Gate 输入，不是 Front Pipeline 停止标记。只有 `missing_or_stale` 明确阻塞、需要澄清或安全 Gate 必须先展示时，才停下向用户说明。

```json
{
  "context_pack_version": 1,
  "for_intent": "change.edit",
  "target": {
    "task_id": null,
    "task_dir": null,
    "files": [],
    "refs": []
  },
  "must_read": [],
  "optional_read": [],
  "already_read": [],
  "relevant_facts": [
    {
      "source": "global/roadmap.json",
      "fact": "<可直接用于执行的事实>",
      "confidence": 0.0
    }
  ],
  "missing_or_stale": [],
  "risk_flags": [],
  "do_not_read": [],
  "next_context_action": "<继续加载协议 / 先反问 / 先补缺口>"
}
```

## Read Budget

1. 先读索引型文件，再读目标文件。
2. 大文件只摘与当前 Intent 相关的 section，并在 `source` 中保留路径或章节名。
3. `refs/` 只通过 `refs/index.json` 按 tags / source / id 命中；禁止全量扫描。
4. `screens/` 只返回相关屏幕文件路径和用途；禁止读取所有屏幕源码。
5. 产品源码不属于本 Skill 范围。需要源码时，在 Context Pack 中写入 `risk_flags` 或 `next_context_action`，交给后续协议读取。

## Global Guides

Global guide 只覆盖结构化 JSON 文件，不覆盖 `vision.md` / `tech_stack.md` 这类正文文档。

| Global file | Guide |
|:---|:---|
| `global/roadmap.json` | `global/guides/roadmap.md` |
| `global/map.json` | `global/guides/map.md` |
| `global/dictionary.json` | `global/guides/dictionary.md` |
| `global/error_codes.json` | `global/guides/error_codes.md` |
| `global/env_registry.json` | `global/guides/env_registry.md` |
| `global/lesson_memory.json` | `global/guides/lesson_memory.md` |
| `global/api_snapshot.json` | `global/guides/api_snapshot.md` |
| `global/command_api.json` | `global/guides/command_api.md` |
| `global/data_snapshot.json` | `global/guides/data_snapshot.md` |
| `global/design_tokens.json` | `global/guides/design_tokens.md` |
| `global/public_api.json` | `global/guides/public_api.md` |

规则：
- 后续协议要写某个 global JSON 时，对应 guide 必须进入 `must_read`。
- 只读 global JSON 时，对应 guide 进入 `optional_read`。
- `roadmap.json` / `map.json` / `dictionary.json` / `lesson_memory.json` 易漂移，读取时 guide 也进入 `must_read`。
- guide 只用于字段结构和不变量，不代替 global 文件内容。

## Baseline Reads

`init` 是特殊 intent：它的目标是创建或恢复全局文档，不能把 `npx archi init` 刚部署的 seed 文件当成项目事实。

当 `intent_card.command == "/archi.init"` 或 `for_intent` 以 `init` 开头时：
- 不执行下方 Baseline Reads。
- `must_read` 只包含路由必要信息：Intent Card、`[args]` 指向的 pack/brief、根目录轻量文件清单（例如 package.json/go.mod/Cargo.toml 是否存在）、`project-brief.md` 是否存在。
- 如果需要判断是否已初始化，只读取 `global/vision.md` / `global/*.json` 的模板标记；不要摘录正文或 `_fieldGuide` 为 `relevant_facts`。
- 若 `vision.md` 含 `architextTemplate: true` / `Status: Template` / `未初始化` / `[项目名称]`，把 `global/vision.md` 以及当前 `global/` seed 文件（包括旧版含 `INF-01` / `FEAT-01` 示例任务的 `roadmap.json`）放进 `do_not_read`，原因写为 `scaffold_seed_not_project_fact`。
- 若任一 `global/*.json` 含 `architextTemplate: true` / `status: "template-uninitialized"` / `lastUpdated == "TEMPLATE"`，也把该文件放进 `do_not_read`。
- 禁止输出基于 seed roadmap / seed vision / seed json 的漂移、源码不一致、"看不懂原文"等判断。

除 init 外，所有非普通问答 intent 至少考虑：

- `global/roadmap.json`：匹配 task id、状态、依赖。
- `global/map.json`：定位模块、featureRelations、目录映射。
- `global/tech_stack.md`：技术约束、测试/构建命令、禁用模式。
- `global/vision.md`：方向、边界、目标用户。
- `global/lesson_memory.json`：历史可复用教训，含错误、用户纠错、误判与流程失误。

普通解释、总结、讨论方案，且不涉及项目文件时，可返回空 Context Pack。

## Intent-Specific Reads

### plan.decompose

- `global/roadmap.json`
- 若目标 task 含 `sourceRef` → 将对应 `global/requirements/REQ-*.md` 加入 `must_read`
- `global/vision.md`
- `global/map.json`
- `scope-brief.md` 或 Intent Card 指向的 brief 文件
- UI 项目加 `global/ui_context.md`

### plan.detail

- `global/roadmap.json`
- `global/vision.md`
- `global/tech_stack.md`
- `global/map.json`
- 目标 task 目录下的 `spec.md` / `plan.json` / `ui.md` / `design.md`，存在才读
- 按 feature 加载对应 global snapshot

### change.fix

- 目标 task 的 `spec.md` / `plan.json` / 最近 `review.md`
- `global/lesson_memory.json`
- `global/tech_stack.md`
- `global/map.json`
- 只返回需要后续协议读取的源码路径候选，不读取源码

### change.edit

- 目标 task 的 `spec.md` / `plan.json` / `ui.md`
- `global/vision.md`
- `global/tech_stack.md`
- `global/dictionary.json`
- `global/error_codes.json`
- 按 feature 加载对应 global snapshot

### change.revise

- `global/vision.md`
- `global/tech_stack.md`
- `global/roadmap.json`
- `global/map.json`
- `global/dictionary.json`
- `global/error_codes.json`
- `global/env_registry.json`
- 按 feature 加载对应 global snapshot
- 受影响 task 的 spec/plan 路径清单；仅精读高相关 task

### code

- 目标 task 的 `spec.md` / `plan.json` / `ui.md` / `design.md`
- `global/tech_stack.md`
- `global/map.json`
- `global/dictionary.json`
- `global/error_codes.json`
- `global/env_registry.json`
- 按 feature 加载对应 global snapshot
- `refs/index.json`，仅返回命中 tags 的 refs

### review

- task review：目标 task 文档 + `global/map.json` + `global/tech_stack.md`
- project review：global 索引文件 + roadmap 概览 + map 概览
- map review：`global/map.json` + roadmap 概览；源码目录扫描由 review/map 协议执行

### remove

- `global/roadmap.json`
- `global/map.json`
- 目标 task 目录
- `global/dictionary.json`
- `global/error_codes.json`
- 按 feature 加载可能含引用的 global snapshot
- 必须设置 `risk_flags`：`delete_requires_confirmation`

### ui

- `global/design_tokens.json`
- `global/ui_context.md`
- `global/roadmap.json`
- 目标 task 的 `ui.md` / `spec.md`
- `screens/index.html` 仅作为导航参照；具体屏幕按目标读取

### ref

- `refs/index.json`
- add：不读 refs 全量；检查 id 冲突
- update/remove：只读目标 ref 文件
- update/remove 必须设置 `risk_flags`：`overwrite_requires_confirmation` 或 `delete_requires_confirmation`

### help

- `global/roadmap.json`
- `global/map.json`
- `global/lesson_memory.json`
- 根据用户问题按需追加文件

## Feature-Specific Snapshots

仅当项目启用对应 feature 时才读取：

- ui: `global/design_tokens.json`, `global/ui_context.md`, `screens/`
- data: `global/data_snapshot.json`
- api: `global/api_snapshot.json`
- cli: `global/command_api.json`
- lib: `global/public_api.json`

## Missing Or Stale

以下情况写入 `missing_or_stale`：

- Intent Card 指向的 task id 不存在。
- task 状态不允许执行目标协议。
- 目标 task 缺少协议必需文件。
- feature 启用但对应 global snapshot 缺失。
- `map.json` 找不到目标模块或映射明显过期。
- `refs/index.json` 指向的 ref 文件不存在。

## Risk Flags

按需写入：

- `needs_user_clarification`
- `delete_requires_confirmation`
- `overwrite_requires_confirmation`
- `dependency_install_requires_confirmation`
- `global_revision`
- `task_blocked`
- `spec_missing`
- `map_stale`
- `lesson_memory_match`

## Hard Limits

- 不要为了“完整”而读取所有 global 文件、所有 task、所有 refs 或所有 screens。
- 不要把 Context Pack 当成协议输出；它只是执行前上下文。
- 不要在 Context Pack 中给出代码修改方案。
- 不要吞掉缺口；缺口必须进入 `missing_or_stale`。
