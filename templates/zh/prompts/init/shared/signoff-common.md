## Terminal Gate（禁止跳过）
执行 `npx archi task --check` + `npx archi render`，两者均须通过。

## Pre-signoff Checklist
Gate 通过后、输出前须逐项确认：

### 通用项
□ `vision.md` — 所有占位符已替换，无模板示例文字残留；代码推导内容（如有）已标注 `(AI 补全 — 建议用户审查)`
□ 规则文件 `tech_stack` — Section 1-9 完整填充
□ 规则文件 `tech_stack` Section 9 Project Conventions — 每项含 Strategy + Rationale
□ 规则文件 `90_custom_rules` — 规则性内容已归集
□ `roadmap.json` — 任务链已生成（有 brief_data → phase-1/2 由 archi-decompose-roadmap 分解；有 code_analysis → phase-0 每功能模块对应一条 LEG-xx status=done, tag=Legacy）
□ `map.json` — directoryMapping 已填充；来源于代码时 logicalTopology + criticalUserJourneys + featureRelations 均已填充
□ `dictionary.json` — 领域术语已提取
□ `error_codes.json` — 核心错误码已注册
□ `env_registry.json` — 环境变量已注册
□ Silent Audit Skill 已执行，所有 CRITICAL 问题已修复
[[WHEN: ui | □ `design_tokens.json` — 已生成 ]]
[[WHEN: ui | □ `ui_context.md` — 屏幕规划已生成（S-01, S-02...） ]]
[[WHEN: data | □ `data_snapshot.json` — 初始实体骨架已写入 ]]
[[WHEN: api | □ `api_snapshot.json` — 初始 API 端点已注册 ]]
[[WHEN: cli | □ `command_api.json` — 初始 CLI 命令已注册 ]]
[[WHEN: lib | □ `public_api.json` — 初始库导出已注册 ]]

## 写入后动作

Checklist 全部通过后运行 `npx archi task` 输出任务进度概览。