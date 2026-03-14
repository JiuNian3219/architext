<protocol_ui>
  **Trigger**: `/archi.ui` | 自然语言触发时由 Workflow Dispatch 自动加载
  **Goal**: 生成或增量更新多文件 UI 概念设计（`screens/` 目录）。

<meta>
    <style>Visual, Systematic, Incremental</style>
    <language>简体中文</language>
    <principles>
      1.  **Auto-Detect**: 无子命令，自动检测 `screens/` 目录状态决定全量生成或增量更新。
      2.  **Multi-File**: 每个屏幕独立 `S-XX.html`，共享样式 `_shared.css`，`index.html` 作导航枢纽。
      3.  **Token-Driven**: 视觉样式严格来自 `design_tokens.json`，禁硬编码。
      4.  **IDE-Native First**: 利用 IDE 原生能力驱动执行节奏，本协议定义质量标准和检查点，不对抗 IDE 的规划/执行机制。
    </principles>
</meta>

<step_1_load>
    **Action**:
    1.  **Pre-flight**: 检查 `architext.json` → `features` 是否含 `ui`。不含 → 拒绝（"本项目未启用 UI 特征"）。
    2.  **Load**: 读取项目上下文 + UI 相关 JSON（design_tokens、ui_context），详见 00_system.md 数据治理规则。
    3.  **Mode Detection**:

        | 条件 | 模式 | 行为 |
        |:---|:---|:---|
        | `screens/` 目录不存在 | **全量生成** | 从 roadmap 提取全部 UI 屏幕 → step_2 |
        | `screens/` 存在 | **增量更新** | 对比 roadmap + ui_context.md，识别新增/变更屏幕 → step_2 |

    **Output**: 模式判定结果 + 上下文摘要。进入 step_2_plan。
</step_1_load>

<step_2_plan>
    **Action**:

    **全量模式**: 从 roadmap 任务中提取所有涉及 UI 的屏幕，分配屏幕 ID（S-01, S-02...）。
    **增量模式**: 对比现有 `screens/` 与 roadmap，识别差异：

    | 差异类型 | 处理 |
    |:---|:---|
    | 新增屏幕（roadmap 有任务但无对应 S-XX） | 分配新 ID，加入生成清单 |
    | 屏幕变更（已有屏幕的任务有需求变化） | 加入更新清单 |
    | 无变化 | 跳过 |

    **Tokens 检查**: 检查 `design_tokens.json`:
    - `aestheticDirection.preset` 为空 → 引导选择
    - `primitivePalette.brand` 为空 → 引导填入 Hex
    - 其他空值 → AI 推断，非阻塞

    **Output**: 屏幕规划清单（ID / 名称 / 对应任务 / 状态列表 / 操作：新增/更新/跳过）。

    **Gate**: 用户回复 **OK** 后进入 step_3_generate；未确认禁生成文件。
</step_2_plan>

<step_2_5_refinement>
    **Trigger**: 用户回复非 OK，含修正、增删屏幕或调整映射。
    **Action**: 融入反馈，刷新屏幕规划清单重新输出，等待再次确认。

    用户回复 OK → 进入 step_3_generate。
</step_2_5_refinement>

<step_3_generate>
    **Action**: 调用 Skill 执行实际生成。

    [[SKILL: archi-ui-wireframe|按 skill 的协议，基于确认的屏幕规划清单生成多文件 UI 概念设计。全量模式生成所有屏幕；增量模式仅生成新增/变更屏幕。]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md` 并遵循其协议执行）]]

    **产出物**:
    - `[[__DOCS_DIR__]]/global/screens/_shared.css` — CSS 变量（来自 design_tokens）+ 基础布局 + 控制栏样式
    - `[[__DOCS_DIR__]]/global/screens/S-XX.html` — 每个屏幕独立文件
    - `[[__DOCS_DIR__]]/global/screens/index.html` — 导航枢纽，列出所有屏幕
    - `[[__DOCS_DIR__]]/global/ui_context.md` — AI 屏幕索引（路由引用 `screens/S-XX.html`）

    **Output**: 生成文件清单 + 变更摘要。进入 step_4_verify。
</step_3_generate>

<step_4_verify>
    **Role**: 独立审查官

    **验证清单**:

    | 检查项 | 通过标准 |
    |:---|:---|
    | 文件完整性 | `screens/` 含 `index.html` + `_shared.css` + 全部 `S-XX.html` |
    | 跨文件链接 | `index.html` 中所有 `S-XX.html` 链接有效；每个 `S-XX.html` 含返回索引链接 |
    | CSS 引用 | 每个 `S-XX.html` 引用 `_shared.css`；CSS 变量来自 design_tokens |
    | 状态覆盖 | 每个屏幕含 default + 适用状态（loading/empty/error） |
    | ui_context.md | 屏幕索引路由引用 `screens/S-XX.html` 路径 |
    | （增量模式）已有屏幕 | 未修改的屏幕文件未被覆盖 |

    有失败项 → 修复后重检。全部通过 → 进入 step_5_signoff。
</step_4_verify>

<step_5_signoff>
    **Pre-signoff Checklist** (输出前须逐项确认):
    □ `screens/` 目录结构完整（index.html + _shared.css + S-XX.html）
    □ `ui_context.md` 已生成/更新，路径引用正确
    □ Step 4 验证全部通过
    □ （增量模式）仅目标屏幕被修改，其余文件未变

    **Output**: UI 概念设计摘要，含：
    - **模式**: 全量生成 / 增量更新
    - **屏幕覆盖**: 共 N 个屏幕（新增 X / 更新 Y / 保留 Z）
    - **审美方向**: preset + 品牌色
    - **文件清单**: 生成/修改的文件列表

    **用户确认**: 回复 **OK** 完成；非 OK 进入 Refinement（调用 Skill 局部更新）。

    **Next Steps**:

    | 优先级 | 动作 | 说明 |
    |:---|:---|:---|
    | 推荐 | 在浏览器打开 `screens/index.html` | 确认布局和视觉效果 |
    | 1 | `/archi.plan <第一个 pending 任务 ID>` | 开始规划任务 |
</step_5_signoff>

</protocol_ui>
