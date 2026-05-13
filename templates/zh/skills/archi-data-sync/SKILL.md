---
name: archi-data-sync
description: Sync data governance files with protocol outputs. Must run in isolated context/subagent. Protocol-invoked only; do not auto-trigger from casual user requests.
disable-model-invocation: true
---

## 调用方式

- **自动调用**: 否，不由模型根据 description 自行触发。
- **触发位置**: 仅由 `/archi.*` 协议中的 `[[SUBAGENT]]` / `[[NO-SUBAGENT]]` 显式调用。
- **执行上下文**: 支持 subagent 时必须在独立子代理/独立上下文执行；无 subagent 时才降级为内联 Skill。
- **边界**: 只返回协议要求的结构化产物，后续写入、确认和签收由调用协议负责。


# 数据治理同步执行器

## 同步矩阵

| 文件 | 同步内容 | 触发条件 |
|:---|:---|:---|
| `map.json` | `directoryMapping` / `logicalTopology` / `featureRelations` | 新增代码/文档模块、目录，或代码/文档变更产生稳定联动关系 |
| `dictionary.json` | 新业务实体 / 动作 / 共享工具 / 公共组件 | 产出出现未登记的业务术语或工具 |
| `error_codes.json` | 新业务错误码 | 产出出现未注册的错误场景 |
| `env_registry.json` | 新环境变量 | 产出引入新 `process.env.X` |
[[WHEN: ui | | ui | `design_tokens.json` | 新颜色 / 字体 / 间距 / 动效 | 产出出现新样式定义 | ]]
[[WHEN: ui | | ui | `ui_context.md` | 屏幕索引变更 | 产出新增 / 修改屏幕 | ]]
[[WHEN: data | | data | `data_snapshot.json` | Schema 新增 / 字段扩展 | 产出出现数据模型变更 | ]]
[[WHEN: api | | api | `api_snapshot.json` | 新 HTTP/RPC 端点 | 产出出现新端点 | ]]
[[WHEN: cli | | cli | `command_api.json` | 新 CLI 命令 | 产出出现新命令注册 | ]]
[[WHEN: lib | | lib | `public_api.json` | 新公共导出 | 产出出现新导出 API | ]]

## 执行协议

1. 按 `project_features` 加载对应的 `global_files`（固定四件 + feature 匹配项）
2. 扫描 `agent_output` 每项，按 `type` 分流到矩阵对应的结果桶里
3. 每项变更：
   - 对比现有条目查重；完全重复 → 跳过；部分重复 → 合并
   - 经「边界检查」：命中框架概念黑名单 → 跳过并在 Diff 中标 `SKIPPED (framework)`
   - 被移除的条目不删除，仅记录 MODIFIED
4. 汇总成 `writes`，每项含 `file` / `op`（`append` / `merge`）/ `path`（JSON 路径）/ `value`
5. 输出 Diff + `writes`

## 硬边界

- 禁注册框架概念：`scripts` / `scaffold` / `roadmap` / `plan` / `protocol` / `skill` / `architext.*` 等 Architext 自身概念不入项目全局文件
- 禁修改 `00_system.md`：本 skill 是规则执行者，非制定者
- 禁删除：仅追加 / 合并；移除的条目由 `/archi.remove` 的 cleanup 路径处理

## 输出格式

```
### Data Sync Results
ADDED:
- <file>: <path> += <value 摘要>
MODIFIED:
- <file>: <path> 扩展 <新增字段摘要>
SKIPPED:
- <file>: <path> — <跳过原因（duplicate / framework）>
Summary: <X> files changed / <Y> added / <Z> modified / <W> skipped
writes:
  - file: <file>
    op: <append|merge>
    path: <JSON 路径>
    value: <具体值>
```
无变更时仅输出：`### Data Sync Results — NO CHANGES`

## 输出验证

- [ ] Diff 块与 `writes` 数组条目一一对应，数量一致
- [ ] 每一项变更经过查重，无重复条目进 `writes`
- [ ] 框架概念条目全部进 `SKIPPED` 而非 `ADDED`
- [ ] `writes` 的 `op` 仅为 `append` / `merge`，无 `delete`
- [ ] feature 触发文件仅在 `project_features` 匹配时出现在 `writes`
- [ ] `00_system.md` 不在 `writes` 中
