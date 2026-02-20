<protocol_revise>
  **Trigger**: `/archi.revise [context]`
  **Goal**: 执行项目级全局变更（技术栈、架构、愿景等），分析影响范围，经用户确认后修改全局资产并级联更新受影响的 Feature 文档。

<constraints_cursor>
    **Mode Lock**: 本协议须在 **Agent Mode (Normal Mode)** 下执行。禁切换到 Plan Mode 或其他只读模式。
</constraints_cursor>

<meta>
    <style>Strategic, Analytical, Cautious, Traceable</style>
    <language>简体中文</language>
    <principles>
      1.  **User Gate**: 全局变更须经用户逐项确认后才执行。禁擅自修改。
      2.  **Impact First**: 先输出完整影响分析，后执行修改。
      3.  **Doc Cascade**: 全局资产变更后，须按 edit 标准同步更新受影响的 Feature 文档。
      4.  **Traceability**: 每项变更须可追溯 — 说明变更理由和影响范围。
    </principles>
</meta>

<step_1_load>
    **Role**: 系统分析师
    **Action**:
    1.  **Read Global Assets**:
        - `[[__DOCS_DIR__]]/global/vision.md`
        - `[[__DOCS_DIR__]]/global/roadmap.json`
        - `[[__DOCS_DIR__]]/global/map.json`
        - `[[__DOCS_DIR__]]/global/dictionary.json`
        - `[[__DOCS_DIR__]]/global/error_codes.json`
        - `02_tech_stack.md`
        - [?UI] `[[__DOCS_DIR__]]/global/design_tokens.json`
        - [?Data] `[[__DOCS_DIR__]]/global/data_snapshot.json`
    2.  **Scan Feature Index**: 扫描 `[[__DOCS_DIR__]]/features/` 目录，建立 Feature 索引（ID、名称、状态）。
    3.  **Intent Analysis**: 根据用户 `[context]`，初步定位受影响的全局资产类别。

    **Output**: 变更意图摘要 — 列出初步判断涉及的全局文件，进入 step_2。
</step_1_load>

<step_2_interview>
    **Role**: 首席架构师
    **Action**:
    根据用户描述和已加载上下文，澄清变更边界:

    | 澄清维度 | 说明 |
    |:---|:---|
    | 变更范围 | 精确定位哪些全局文件、哪些规则受影响 |
    | 变更动机 | 为什么要做此变更，期望达到什么结果 |
    | 排除清单 | 是否有不应被影响的 Feature |

    - 上下文足够清晰时 → 合并到 step_3 直接输出影响分析。
    - 存在歧义或多种可行方向时 → 向用户提问确认（A/B/C/D 选项）。
</step_2_interview>

<step_3_impact>
    **Role**: 影响分析师
    **Constraint**: **纯输出，禁修改任何文件**。此步骤为「变更影响评估书」。

    **Output Format**:
    ```
    ## 变更影响评估: [变更主题]

    ### 1. 全局资产变更清单
    | 文件 | 变更内容 | 类型 |
    |:---|:---|:---|
    | vision.md | [具体改什么，或"无需变更"] | 修改/无变更 |
    | 02_tech_stack.md | [...] | ... |
    | roadmap.json | [...] | ... |
    | map.json | [...] | ... |
    | dictionary.json | [...] | ... |
    | data_snapshot.json | [...] | ... |
    | design_tokens.json | [...] | ... |
    | error_codes.json | [...] | ... |

    ### 2. 受影响 Feature 清单
    | Feature ID | 名称 | 影响点 | 程度 |
    |:---|:---|:---|:---|
    | INF-001 | [名称] | [spec/ui/plan 的哪些部分受影响] | 高/中/低 |

    ### 3. 需用户决策的项目（如有）
    - [?] [不确定项描述 + 选项]
    - [?] ...

    ---
    > 回复 **OK** 确认全部；或标注需调整的部分。
    ```

    **Gate**: 等待用户确认。未确认禁进入 step_4。
</step_3_impact>

<step_3_5_refinement>
    **Role**: 咨询顾问
    **Trigger**: 用户回复非 OK，含修正、否决或追加意见。
    **Action**: 不执行修改。融入用户反馈，刷新影响评估书重新输出，等待再次确认。
</step_3_5_refinement>

<step_4_execute>
    **Role**: 执行工程师
    **Action**:

    **Phase 1 — 修改全局资产**:
    按用户确认的清单修改全局文件。每个文件修改后输出变更摘要。

    **Phase 2 — 级联更新 Feature 文档**:
    对每个受影响的 Feature，按 `/archi.edit` 标准执行:
    1.  更新 `spec.md`（逻辑/规则因全局变更而需调整的部分）。
    2.  [?UI] 更新 `ui.md` 和 `ui.preview.html`（结构/交互因全局变更而需调整的部分）。
    3.  在 `plan.json` 的 `phases` 中追加新 Phase: `Phase X: Global Revision — [变更主题] (<Date>)`，列出落地任务。

    **Phase 3 — 渲染视图**:
    运行 `npx archi render` 更新所有 Markdown 视图。

    **Output**: 每个文件的变更摘要（全局 + Feature）。
</step_4_execute>

<step_5_summary>
    **Role**: 审计官
    **Checklist**:
    1.  全局资产间一致性（vision ↔ tech_stack ↔ roadmap ↔ map）。
    2.  Feature 文档与更新后的全局资产对齐。
    3.  无孤立引用（dictionary/map 中旧术语/路径是否已清理）。

    **Action**:
    1.  运行 `npx archi task --check` 验证 Roadmap 一致性。
    2.  输出变更总结。

    **Output**:
    ```
    ## Global Revision Summary: [变更主题]

    **全局资产变更**: [已修改文件列表]
    **Feature 更新**: [已更新 Feature 列表 + 各自影响摘要]
    **审计结果**: [通过/有风险项]

    ### Next Steps
    | 优先级 | 动作 | 说明 |
    |:---|:---|:---|
    | ... | ... | ... |
    ```
</step_5_summary>

</protocol_revise>
