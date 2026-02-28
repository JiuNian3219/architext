<protocol_edit>
  **Trigger**: `/archi.edit <id> [context]`
  **Goal**: 基于新需求/修改意见，更新已纳管模块的 Spec/UI 文档，并追加开发计划。

<meta>
    <style>Collaborative, Iterative, Traceable</style>
    <language>简体中文</language>
    <principles>
      1.  **Doc First**: 须先改文档 (Spec/UI)，再生成 Plan。禁跳过文档直接改代码计划。
      2.  **Incremental**: 仅追加新 Task 到 Plan，保留已完成历史（除非需回滚）。
      3.  **Conflict Check**: 检查新需求是否与 tech_stack / design_tokens 冲突。
      4.  **Frontmatter Preservation**: 禁破坏现有文档 Metadata。
    </principles>
</meta>

<step_1_load>
    **Role**: 产品经理
    **Action**:
    - 读取 `[[__DOCS_DIR__]]/tasks/<ID>_<Slug>/` 下的 spec.md、ui.md、plan.json。
    - [?UI] 读取 `[[__DOCS_DIR__]]/global/ui_context.md`（定位本功能对应的屏幕范围及导航关系）。
    - 检测 spec.md 中的 `Spec-Status` 字段：
      - `Full` → 正常流程，进入 step_2。
      - `Stub` → 进入 step_1_5_enrich。
    - [?重大 UX 变更] 快速搜索同类产品最佳实践。
</step_1_load>

<step_1_5_enrich>
    **Role**: 逆向工程师
    **Trigger**: spec.md 中 `Spec-Status: Stub`（由 `/archi.inherit` 生成的轻量快照）。

    **Action**:
    1. 告知用户："该功能仅有轻量快照，须先补全完整 spec 才能执行修改。"
    2. 从 stub 的"关联文件"section 提取源码路径。
    3. 逐一读取关联文件，中度扫描（入口 + 核心逻辑）。
    4. 基于代码分析，将 stub 补全为完整 spec：
       - 保留原有概述和关键流程
       - 补充 Gherkin Scenarios（覆盖正常流程 + 异常路径）
       - 补充接口/类型定义（如该功能是其他功能的上游）
    5. 更新 `Spec-Status: Stub → Full`。
    6. [?UI] 如模块有 UI → 同步生成或更新 `ui.md`（范围声明）；如须新增屏幕，[[SKILL: archi-ui-wireframe|调用 skill 或提示用户运行]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md` 并提示用户按该文档执行）]]（Skill 会同步更新 `ui_concept.html` + `ui_context.md`）。
    7. 生成 `plan.json`（全部 task 为 done，记录已实现内容）。
    8. 向用户输出补全后的 spec 摘要。

    **Gate**: 用户确认补全内容正确后，继续 step_2_refine_docs。
    **异常**: 关联文件不存在/已移动 → 提示用户更新路径。
</step_1_5_enrich>

<step_2_refine_docs>
    **Role**: 需求分析师 & 设计师
    **Action**:
    - 根据 `[context]` 修改 spec.md（逻辑/规则变更）和 ui.md（结构/交互变更）。
    - [?UI 修改] [[SKILL: archi-ui-wireframe|按 skill 的协议，按以下规则同步更新 `ui_concept.html` + `ui_context.md`（Skill 作为唯一写者）]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md` 并遵循其协议执行）]]：

      | 变更类型 | 判定标准 | 处理方式 |
      |:---|:---|:---|
      | 无屏幕影响 | 仅逻辑/数据变更，无视觉差异 | 仅改 spec.md，`ui_concept.html` / `ui_context.md` 不动 |
      | 轻微 UI 调整 | 新增/修改状态、弹窗、局部区域，不改整体布局 | 调用 skill（修改屏幕模式）更新两个文件，输出 `MODIFIED: S-XX` |
      | 屏幕结构变更 | 布局重构、新增独立屏幕、导航路径变化 | 调用 skill（修改屏幕模式）更新两个文件，输出 `MODIFIED: S-XX`；若已完成 Phase 2 着色，同步重新着色 |
      | 功能缩减 | 屏幕/区域整体移除 | 调用 skill（删除屏幕模式）更新两个文件，输出 `REMOVED: S-XX` |

    - 需求模糊时向用户提问 (A/B/C/D 选项) 确认细节。

    **Output**: 更新后的 Spec、UI 文档及 `ui_concept.html` / `ui_context.md` 变更摘要。
</step_2_refine_docs>

<step_3_update_plan>
    **Role**: Tech Lead
    **Action**:
    - 在 `plan.json` 的 `phases` 数组中追加新 Phase 对象。
    - 列出具体 Tasks (API update, UI tweak, Test update)；每项须可验证。
    - **状态转换**: 若当前任务 status=`done`，追加 Phase 后须将状态重置为 `active`（否则后续 `/archi.code` 将被 Status Gate 拒绝）。

    **Terminal Gate** (禁止跳过，须在 step_4 输出前全部完成):
    | 步骤 | 命令 | 通过条件 |
    |:---|:---|:---|
    | 1 | `npx archi render` | `.md` 视图生成完成 |
    | 2 | [当前 status=done] `npx archi task <ID> --status active` | 任务状态已重置为 active |

    **Output**: 追加了新任务的 plan.json；若执行了状态转换，输出 `MODIFIED: roadmap.json <ID>.status done→active`。
</step_3_update_plan>

<step_4_summary>
    **Action** (Gate 须在 step_3 完成):
    **Output**: Task 更新摘要，含 Spec/UI/Plan 变更概要和 Next Steps 表格。推荐运行 `/archi.code <ID>`。
</step_4_summary>

</protocol_edit>
