# 调用契约

[[SUBAGENT: archi-data-sync | context: 扫描本次变更引入的新业务实体/错误码/Schema/端点/命令/导出，按 00_system.md 数据治理规则增量同步全局 JSON]]
[[NO-SUBAGENT: archi-data-sync | context: 扫描本次变更引入的新业务实体/错误码/Schema/端点/命令/导出，按 00_system.md 数据治理规则增量同步全局 JSON]]
[[NO-SKILL: （请阅读 [[__DOCS_DIR__]]/skills/archi-data-sync/SKILL.md，并在当前上下文按其协议执行同步）]]

# 调用时机

| 子协议 | 调用位置 |
|---|---|
| fix | step_5_data_sync — 修复代码后、Verify 之前 |
| edit | step_5_data_sync — 文档与 plan 更新后、Verify 之前 |
| revise | step_5_data_sync — Phase 1（全局资产）+ Phase 2（Task 级联）执行后、Verify 之前 |

# 数据治理覆盖范围（archi-data-sync skill 内部）

- map.json — directoryMapping / logicalTopology / featureRelations
- dictionary.json — 新增/重命名实体、术语、组件
- error_codes.json — 新增/调整错误码契约
- env_registry.json — 新增/移除环境变量
[[WHEN: ui | - design_tokens.json — 新颜色/字体/间距/动效 ]]
[[WHEN: ui | - ui_context.md — 屏幕索引变更 ]]
[[WHEN: data | - data_snapshot.json — Schema 模型变更 ]]
[[WHEN: api | - api_snapshot.json — 端点契约变更 ]]
[[WHEN: cli | - command_api.json — CLI 命令变更 ]]
[[WHEN: lib | - public_api.json — 库导出变更 ]]

# 输出契约

- 同步完成后输出每个被修改 JSON 的 MODIFIED: <file> — <增删改摘要>。
- 无变更时输出 INFO: data-sync 扫描通过，无需更新。
