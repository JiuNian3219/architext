---
name: archi-data-sync
description: Sync data governance files with main agent output. **Must run in isolated context/subagent.** Use when verifying data consistency between code and global data files.
---

# 数据治理同步执行器

## 系统流程定位

```
/archi.* step_N → Verify 阶段
    ↓
[本 Skill] 扫描产出 → 对比全局文件 → 增量同步 → 返回 Diff
    ↓
主 Agent Signoff（确认 Diff）
```

> **Skill 的职责边界**：
> - 负责：扫描主 Agent 产出中新增的业务实体/错误码/Schema，与全局数据文件对比，执行增量同步
> - 不负责：修改 `00_system.md` 本身（本 Skill 是规则的执行者，不是制定者）
> - 不负责：注册框架概念（Architext 框架自身概念禁注册到全局数据文件）

---

## 权威规则源

`00_system.md` 的「文件索引 → 全局数据资产」表格是数据治理的权威规则源。本 Skill 的所有行为须与该文件一致。

---

## 同步范围

| 全局文件 | 同步内容 | 触发条件 |
|:---|:---|:---|
| `map.json` | 新模块注册 (directoryMapping)、依赖关系 (logicalTopology)、影响关联 (featureRelations) | 创建新代码模块/目录时 |
| `dictionary.json` | 新业务实体 · 动作 · 共享工具 · 公共组件 | 产出中出现未登记的业务术语或工具 |
| `error_codes.json` | 新业务错误码 | 产出中出现未注册的错误场景 |
| `env_registry.json` | 新环境变量 | 产出中引入新 `process.env.X` |
| 仅ui项目: `design_tokens.json` | 样式变更 | 产出中有新的颜色/字体/间距/动效定义 |
| 仅ui项目: `ui_context.md` | 屏幕索引变更 | 产出中有新增/修改的屏幕 |
| 仅data项目: `data_snapshot.json` | Schema 变更 | 产出中有数据模型新增/修改 |
| 仅api项目: `api_snapshot.json` | 新端点 | 产出中有新 HTTP/RPC 端点 |
| 仅cli项目: `command_api.json` | 新命令 | 产出中有新 CLI 命令 |
| 仅lib项目: `public_api.json` | 新导出 API | 产出中有新公共导出 |

---

## 执行协议

1. **读取项目 features**: 读取项目根目录 `architext.json`，提取 `features` 字段（api/cli/lib/data/ui 等）
2. **读取全局数据文件**: 加载上表中与项目 features 匹配的全局文件
3. **扫描主 Agent 产出**: 根据文件类型识别对应变更：
   - **代码文件**: 新增模块 → map.json、新增类型/接口 → dictionary.json、新增错误处理 → error_codes.json、新增环境变量 → env_registry.json
   - **UI 代码**: 新增颜色/字体/组件 → design_tokens.json、新增路由/屏幕 → ui_context.md
   - **Data 代码**: 新增模型/字段 → data_snapshot.json
   - **API 代码**: 新增端点 → api_snapshot.json
   - **CLI 代码**: 新增命令 → command_api.json
   - **Lib 代码**: 新增导出 → public_api.json
4. **Boundary 检查**: 禁注册框架概念（scripts、scaffold、roadmap、plan 等），仅同步项目业务域内容
5. **查重**: 对比现有条目，避免重复注册
6. **增量同步**: 仅追加/修改已有条目，禁删除
7. **输出变更 Diff**

### 硬边界

- **禁直接追加写入** — 须先查现有内容边界再写，避免重复或冲突
- **禁注册框架概念** — 仅同步项目业务域内容
- **禁修改 `00_system.md`** — 本 Skill 是规则的执行者

### 输出格式

```
### Data Sync Results

ADDED:
- dictionary.json: entities += [新实体名]
- error_codes.json: businessErrors += [ERR_CODE]

MODIFIED:
- data_snapshot.json: models.User += [新字段]

NO CHANGE:
- [无需同步的文件]

**Summary**: X 文件变更 / Y 条新增 / Z 条修改
```

无需同步时输出: `### Data Sync Results — NO CHANGES`

---

> **中间产物**：此 Skill 为审查型子程序，产出变更 Diff 后控制权交还调用方。

## 输出验证

□ 目标全局 JSON 文件已更新（dictionary.json / error_codes.json / data_snapshot.json 等）
□ Diff 输出已生成，含 ADDED/MODIFIED/NO CHANGE 段
