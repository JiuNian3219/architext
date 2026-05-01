---
name: archi-feature-relations
description: Manage featureRelations linkage in map.json. Must run in isolated context/subagent. Protocol-invoked only; do not auto-trigger from casual user requests.
disable-model-invocation: true
---

## 调用方式

- **自动调用**: 否，不由模型根据 description 自行触发。
- **触发位置**: 仅由 `/archi.*` 协议中的 `[[SUBAGENT]]` / `[[NO-SUBAGENT]]` 显式调用。
- **执行上下文**: 支持 subagent 时必须在独立子代理/独立上下文执行；无 subagent 时才降级为内联 Skill。
- **边界**: 只返回协议要求的结构化产物，后续写入、确认和签收由调用协议负责。


# featureRelations 联动处理器

## 核心概念

**聚合型 Task**：核心职责是列举 / 汇总 / 动态反映另一类 Task 产出的 Task。新增或删除来源类 Task 时，聚合型 Task 可能需要同步。

**聚合型判定必要条件**（全满足才是）：
1. 代码层面呼应：遍历 / 枚举 / 动态加载同类模块（`for (const cmd of allCommands)`、`Object.values(registry)`、读目录后动态 import）
2. 描述层面呼应：「汇总所有 X」「注册所有 X」「列出所有 X」「动态生成 X 列表」

只符合描述层面但实际代码是硬编码列表 → 非聚合型。

## 模式

### register

判定当前 Task 是否聚合型，是则生成一条 featureRelations 追加条目。

1. 分析 `task_context.spec` + `goal` + `description`
2. 对照聚合型必要条件全满足 → 聚合型；否则非聚合型
3. 聚合型 → 输出 `updates: { action: "append", entry: { aggregator, sources, evidence, checkNote } }`
   - `aggregator`：Task ID
   - `sources`：来源范围描述，优先用模式匹配而非枚举（例：「所有 `/archi.*` 命令协议」 而非 「/archi.init, /archi.plan, ...」）
   - `evidence`：从 spec/goal 抽取的原句，证明判定依据
   - `checkNote`：「<sources> 新增或删除时，检查 <aggregator> 是否需同步」
4. 非聚合型 → 输出 `NOT AGGREGATOR` + 判定理由（没命中哪个必要条件）

### check

将当前 Task 要实现的功能与已有 featureRelations 的 `sources` 语义对比，输出命中的联动提示。

1. `feature_relations` 为空 → 输出 `NO RELATIONS`
2. 逐条对比 `task_context.implementedFeatures` 与 `sources`，语义属于 `sources` 范围则命中
3. 命中 → 输出 `aggregator` + `checkNote`；未命中的列出 `aggregator` 供审核

### cleanup

针对被移除的 Task，清理相关 featureRelations 条目。

1. 遍历 `feature_relations`，按引用位置分类：
   - `aggregator == removedTaskId` → `updates: { action: "remove", index }`
   - `sources` 描述引用该 Task → `updates: { action: "update", index, newSources }` + `impact: "检查 <aggregator> 是否需调整"`
2. 输出影响报告

## 输出格式

```
### Feature Relations: <mode>
RESULT: <mode 主结果行>
<字段块，按 mode 填充>
updates:
  - action: <append|update|remove>
    <字段>
```

**按 mode 的 RESULT 行**：
- register：`AGGREGATOR REGISTERED` 或 `NOT AGGREGATOR — <未命中的必要条件>`
- check：`HITS: <n>` 或 `NO HITS` 或 `NO RELATIONS`
- cleanup：`REMOVED: <n>, UPDATED: <n>` 或 `NO AFFECTED RELATIONS`

**字段块**：
- register当输出 `AGGREGATOR REGISTERED` 时：`aggregator` / `sources` / `evidence` / `checkNote`
- check 当 `HITS ≥ 1` 时：每条命中一行 `- <aggregator>: <checkNote>`
- cleanup：`REMOVED:` 列表 + `UPDATED:` 列表 + `IMPACT:` 说明

## 输出验证

- [ ] register 产出的 entry 四字段（aggregator/sources/evidence/checkNote）齐备
- [ ] `sources` 用模式描述而非具体 ID 枚举（避免来源集删增时要改此处）
- [ ] check 命中判定基于语义对比而非关键词匹配
- [ ] cleanup 区分 `remove`（aggregator 被删）与 `update`（source 被删）两种 action
- [ ] 所有内部改动打包在 `updates` 数组中返回，skill 不直接写 map.json