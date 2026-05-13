---
name: archi-feature-relations
description: Manage featureRelations change-coupling index in map.json. Must run in isolated context/subagent. Protocol-invoked only; do not auto-trigger from casual user requests.
disable-model-invocation: true
---

## 调用方式

- **自动调用**: 否，仅由 `/archi.*` 协议中的 `[[SUBAGENT]]` / `[[NO-SUBAGENT]]` 显式调用。
- **执行上下文**: 支持 subagent 时在独立上下文执行；无 subagent 时降级为内联 Skill。
- **边界**: 只返回结构化产物；后续写入、确认和签收由调用协议负责。

# featureRelations 变更联动处理器

## 核心概念

`featureRelations` 是变更联动索引：记录“改 source 时必须同步检查 targets”的稳定关系，避免代码或文档改不全。

条目结构：

```json
{
  "id": "FR-001",
  "source": "触发联动检查的路径、目录、glob、模块名或 map 条目",
  "targets": ["必须同步检查的路径、模块、文档或 map 条目"],
  "checkRule": "source 变更时必须执行的短检查规则",
  "evidence": "建立关系的简短依据，如 file:line、文档路径或 task ID"
}
```

## 识别范围

应记录：
- 代码到代码：registry、router、schema、adapter、generated index、public export。
- 代码到文档：API/CLI/配置/错误码变化需要同步 docs、examples、tests。
- 文档到文档：template、guide、prompt、skill、roadmap 约定之间的稳定同步关系。

不应记录：
- 一次性 task 内部步骤。
- 普通 import/call 关系；这类关系由 `logicalTopology` 表达。
- 长解释或完整上下文；只写短规则和可追溯证据。

## 模式

### register

当规划或实现引入新的稳定联动关系时，生成一条 `featureRelations` append 条目。

1. 分析 task/spec/plan/变更摘要中的新代码或文档产物。
2. 判断是否存在“改 A 必查 B”的长期关系。
3. 命中则输出 `updates: { action: "append", entry: { id, source, targets, checkRule, evidence } }`。
4. 未命中则输出 `NO STABLE COUPLING` + 简短理由。

### check

把本次实际修改的代码或文档路径，与已有 `featureRelations` 的 `source` 和 `targets` 做路径/语义匹配。

1. `feature_relations` 为空 -> 输出 `NO RELATIONS`。
2. 本次改动命中 `source` -> 输出必须检查的 `targets` 与 `checkRule`。
3. 本次改动命中 `targets` -> 输出反向提醒：确认 `source` 的约定是否仍成立。
4. 若发现新的稳定联动关系，输出 append 建议；否则只输出检查命中。

### cleanup

针对被删除或移动的代码/文档，清理相关 `featureRelations`。

1. `source` 被删除 -> `updates: { action: "remove", index }`。
2. `targets` 中部分项目被删除 -> `updates: { action: "update", index, newTargets }`。
3. 输出影响报告，提醒调用方确认替代路径或关系是否仍成立。

## 输出格式

```md
### Feature Relations: <mode>
RESULT: <主结果行>
HITS:
- <source> -> <targets>: <checkRule>
updates:
  - action: <append|update|remove>
    <字段>
```

RESULT 行：
- register: `RELATION REGISTERED` 或 `NO STABLE COUPLING — <原因>`
- check: `HITS: <n>` / `NO HITS` / `NO RELATIONS`
- cleanup: `REMOVED: <n>, UPDATED: <n>` / `NO AFFECTED RELATIONS`

## 输出验证

- [ ] append entry 只使用 `id/source/targets/checkRule/evidence`。
- [ ] `source` 和 `targets` 优先使用短路径、glob、模块名或 map 条目名。
- [ ] `checkRule` 是可执行检查，不是泛泛说明。
- [ ] 不复制长上下文，不写一次性步骤。
- [ ] 所有内部改动打包在 `updates` 数组中返回，skill 不直接写 `map.json`。
