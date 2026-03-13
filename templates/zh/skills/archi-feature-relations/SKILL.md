---
name: archi-feature-relations
description: Manage feature relations linkage in map.json. **Must run in isolated context/subagent.** Use when creating aggregator tasks or verifying task dependencies.
---

# featureRelations 联动处理器

## 系统流程定位

```
/archi.* step_N → Verify 阶段
    ↓
[本 Skill] 接收模式参数 → 处理 featureRelations → 返回结果
    ↓
主 Agent Signoff（确认联动提示）
```

> **Skill 的职责边界**：
> - 负责：featureRelations 的注册/检查/清理三种操作
> - 不负责：修改业务代码、修改 spec/plan 文档

---

## 模式与行为

### 模式 `register` (调用方: plan, inherit)

判断当前 Task 是否属于「聚合型 Task」，若是则在 `map.json` featureRelations 中追加记录。

**聚合型 Task 判定标准**:
- 核心职责是**列举、汇总或动态反映**其他一类 Task
- 代码特征: 遍历/枚举/动态加载同类模块（`for (const cmd of allCommands)`、`Object.values(registry)`、读取目录后动态 import）
- 描述特征: "汇总所有页面入口"、"注册所有路由"、"列出所有命令"

**Action**:
1. 分析 Task 的 spec/goal 描述
2. 判定是否为聚合型
3. 若是 → 追加 featureRelations 条目:
   ```json
   {
     "aggregator": "<Task ID 或文件路径>",
     "sources": "<来源范围描述>",
     "evidence": "<依据>",
     "checkNote": "此类 Task 新增或删除时，检查 <aggregator> 是否需要同步"
   }
   ```
4. 若非聚合型 → 输出 `NOT AGGREGATOR`，跳过

### 模式 `check` (调用方: scope, code)

将当前 Task 与 featureRelations 的 sources 字段做语义对比，输出联动提示。

**Action**:
1. 读取 `map.json` 的 `featureRelations` 数组
2. `featureRelations` 为空 → 输出 `NO RELATIONS`，跳过
3. 将本次任务/实现的功能与各条 `sources` 做语义对比
4. 命中时输出联动提示

### 模式 `cleanup` (调用方: remove)

删除被移除 Task 相关的 featureRelations 条目，检查影响范围。

**Action**:
1. 读取 `map.json` 的 `featureRelations` 数组
2. 查找 aggregator 或 sources 中引用了被移除 Task 的条目
3. 评估移除影响:
   - 被移除的是 aggregator → 删除整条记录
   - 被移除的是 source 之一 → 更新 sources 描述，提示检查 aggregator 是否需调整
4. 输出影响报告

---

## 输出格式

### register 模式

```
### Feature Relations: register

RESULT: AGGREGATOR REGISTERED
- aggregator: <ID>
- sources: <描述>
- evidence: <依据>
```

或: `RESULT: NOT AGGREGATOR — 本 Task 非聚合型，跳过`

### check 模式

```
### Feature Relations: check

HITS:
- [aggregator] — [checkNote]

NO HITS: [无命中的 relations]
```

或: `NO RELATIONS — featureRelations 为空`

### cleanup 模式

```
### Feature Relations: cleanup

REMOVED:
- [被删除的条目]

UPDATED:
- [sources 被更新的条目]

IMPACT: [影响说明]
```

---

> **中间产物**：此 Skill 为审查型子程序，产出结果后控制权交还调用方。

## 输出验证

□ `map.json` `featureRelations` 数组已更新（register/cleanup 模式）
□ 关联检查结果已输出（check 模式）
