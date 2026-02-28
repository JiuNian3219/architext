<protocol_revise>
  **Trigger**: `/archi.revise [context]`
  **Goal**: 執行專案級全域變更（技術堆疊、架構、願景等），分析影響範圍，經使用者確認後修改全域資產並級聯更新受影響的 Task 檔案。

<constraints_cursor>
    **Mode Lock**: 本協議須在 **Agent Mode (Normal Mode)** 下執行。禁切換到 Plan Mode 或其他唯讀模式。
</constraints_cursor>

<meta>
    <style>Strategic, Analytical, Cautious, Traceable</style>
    <language>繁體中文</language>
    <principles>
      1.  **User Gate**: 全域變更須經使用者逐項確認後才執行。禁擅自修改。
      2.  **Impact First**: 先輸出完整影響分析，後執行修改。
      3.  **Doc Cascade**: 全域資產變更後，須按 edit 標準同步更新受影響的 Task 檔案。
      4.  **Traceability**: 每項變更須可追溯 — 說明變更理由和影響範圍。
    </principles>
</meta>

<step_1_load>
    **Role**: 系統分析師
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
    2.  **Scan Task Index**: 掃描 `[[__DOCS_DIR__]]/tasks/` 目錄，建立 Task 索引（ID、名稱、狀態）。
    3.  **Intent Analysis**: 根據使用者 `[context]`，初步定位受影響的全域資產類別。

    **Output**: 變更意圖摘要 — 列出初步判斷涉及的全域檔案，進入 step_2。
</step_1_load>

<step_2_interview>
    **Role**: 首席架構師
    **Action**:
    根據使用者描述和已載入上下文，釐清變更邊界:

    | 釐清維度 | 說明 |
    |:---|:---|
    | 變更範圍 | 精確定位哪些全域檔案、哪些規則受影響 |
    | 變更動機 | 為什麼要做此變更，期望達到什麼結果 |
    | 排除清單 | 是否有不應被影響的 Task |

    - 上下文足夠清晰時 → 合併到 step_3 直接輸出影響分析。
    - 存在歧義或多種可行方向時 → 向使用者提問確認（A/B/C/D 選項）。
</step_2_interview>

<step_3_impact>
    **Role**: 影響分析師
    **Constraint**: **純輸出，禁修改任何檔案**。此步驟為「變更影響評估書」。

    **Output Format**:
    ```
    ## 變更影響評估: [變更主題]

    ### 1. 全域資產變更清單
    | 檔案 | 變更內容 | 類型 |
    |:---|:---|:---|
    | vision.md | [具體改什麼，或"無需變更"] | 修改/無變更 |
    | 02_tech_stack.md | [...] | ... |
    | roadmap.json | [...] | ... |
    | map.json | [...] | ... |
    | dictionary.json | [...] | ... |
    | data_snapshot.json | [...] | ... |
    | design_tokens.json | [...] | ... |
    | error_codes.json | [...] | ... |

    ### 2. 受影響 Task 清單
    | Task ID | 名稱 | 影響點 | 程度 |
    |:---|:---|:---|:---|
    | INF-001 | [名稱] | [spec/ui/plan 的哪些部分受影響] | 高/中/低 |

    ### 3. 需使用者決策的項目（如有）
    - [?] [不確定項描述 + 選項]
    - [?] ...

    ---
    > 回覆 **OK** 確認全部；或標注需調整的部分。
    ```

    **Gate**: 等待使用者確認。未確認禁進入 step_4。
</step_3_impact>

<step_3_5_refinement>
    **Role**: 諮詢顧問
    **Trigger**: 使用者回覆非 OK，含修正、否決或追加意見。
    **Action**: 不執行修改。融入使用者回饋，重新整理影響評估書輸出，等待再次確認。
</step_3_5_refinement>

<step_4_execute>
    **Role**: 執行工程師
    **Action**:

    **Safety Checkpoint** (執行前須完成):
    1. 檢查 Git 工作區狀態（建議執行 `git status`）。
    2. 如有未提交變更 → 提示使用者先 commit 或 stash，再繼續執行。
    3. 工作區乾淨後，告知使用者：如需回滾，可執行 `git checkout -- .` 恢復至變更前狀態。

    **Phase 1 — 修改全域資產**:
    按使用者確認的清單修改全域檔案。每個檔案修改後輸出變更摘要。

    **[?UI] Phase 1.5 — 設計系統變更檢查**:
    若 `design_tokens.json` 有以下變更，須在 Phase 2 完成後執行對應操作：

    | 變更範圍 | 影響 | 處理方式 |
    |:---|:---|:---|
    | `primitivePalette.brand` / `semanticTokens.colors` | 品牌色/語義色變化 | 通知使用者：需重跑 `archi-ui-wireframe` Phase 2（全量重著色） |
    | `semanticTokens.typography` | 字體變化 | 通知使用者：需重跑 Phase 2 |
    | `motion.preference` / `motion.patterns` | 動效變化 | 通知使用者：需重跑 Phase 2 |
    | `illustration.iconLibrary` | 圖示庫變化 | 通知使用者：需重跑 Phase 2 |
    | `layout` (radius/spacing/shadow) | 元件尺寸/圓角變化 | 通知使用者：需重跑 Phase 2 |

    > 如上述欄位未變動（如僅改 `mode.default`），無需重跑 Phase 2。

    **Phase 2 — 級聯更新 Task 檔案**:
    對每個受影響的 Task，按 `/archi.edit` 標準執行:
    1.  更新 `spec.md`（邏輯/規則因全域變更而需調整的部分）。
    2.  [?UI] 更新 `ui.md`（範圍/互動因全域變更而需調整的部分）；如畫面結構受影響，[[SKILL: archi-ui-wireframe|執行 skill（局部更新模式）同步更新 `ui_concept.html` + `ui_context.md`]][[NO-SKILL: （Skill 未安裝：請閱讀 `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md` 並遵循其協議執行）]]。
    3.  在 `plan.json` 的 `phases` 中追加新 Phase: `Phase X: Global Revision — [變更主題] (<Date>)`，列出落地任務。

    **Output**: 每個檔案的變更摘要（全域 + Task）。
</step_4_execute>

<step_5_summary>
    **Role**: 審計官
    **Checklist**:
    1.  全域資產間一致性（vision ↔ tech_stack ↔ roadmap ↔ map）。
    2.  Task 檔案與更新後的全域資產對齊。
    3.  無孤立引用（dictionary/map 中舊術語/路徑是否已清理）。

    **Terminal Gate** (禁止跳過，須在輸出總結前全部完成):
    | 步驟 | 命令 | 通過條件 |
    |:---|:---|:---|
    | 1 | `npx archi task --check` | 無 ERROR 級問題 |
    | 2 | `npx archi render` | `.md` 視圖生成完成 |

    **Action** (Gate 通過後):
    1.  輸出變更總結。

    **Output**:
    ```
    ## Global Revision Summary: [變更主題]

    **全域資產變更**: [已修改檔案列表]
    **Task 更新**: [已更新 Task 列表 + 各自影響摘要]
    **審計結果**: [通過/有風險項]

    ### Next Steps
    | 優先級 | 動作 | 說明 |
    |:---|:---|:---|
    | ... | ... | ... |
    ```
</step_5_summary>

</protocol_revise>
