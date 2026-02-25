<protocol_fix>
  **Trigger**: `/archi.fix [id] <context>`
  **Goal**: 針對 Bug 進行診斷並直接執行修復。若未提供 `[id]`，自動定位相關功能模組。

<meta>
    <style>Diagnostic, Surgical, Spec-Compliant</style>
    <language>繁體中文</language>
    <principles>
      1.  **Spec Immutable**: 禁改 `spec.md` / `ui.md`（除非 Bug 本身是檔案錯誤）。
      2.  **Reproduction**: 須先構想複現步驟或測試案例。
      3.  **Root Cause**: 須分析根因，而非修補表面。
      4.  **Test-Driven**: 修復計畫須含新增測試案例。
      5.  **Auto-Discovery**: 若未指定 ID，透過 Context 語意搜尋定位 Task。
    </principles>
</meta>

<step_1_diagnose>
    **Role**: 故障分析師
    **Action**:
    1.  **Resolve Target**:
        - 有 `<id>`: 鎖定 `tasks/<ID>_<Slug>/`。
        - 無 `<id>`: 分析 `[context]` 搜尋最相關模組。
          唯一匹配 → 自動鎖定 | 多個匹配 → 列出候選詢問 | 無法定位 → 報錯請求指定 ID。
    2.  讀取目標目錄下所有檔案 (`spec.md`, `ui.md`, `plan.json`) 與相關程式碼。
    3.  讀取 `02_tech_stack.md`（確保修復方式不違反技術紅線）和 `[[__DOCS_DIR__]]/global/vision.md`（確保修復方向不偏離專案願景）。
    4.  分析 `[context]`，結合程式碼邏輯定位潛在故障點。
    5.  **Hypothesis**: 提出 1-3 個根因假設。

    **Output**: 故障診斷報告 (Root Cause Analysis)。
</step_1_diagnose>

<step_2_plan_fix>
    **Role**: Tech Lead
    **Action**:
    - 更新 `[[__DOCS_DIR__]]/tasks/<ID>_<Slug>/plan.json`，在 `phases` 陣列中追加 phase 物件，`name` 為 `Bugfix: <Bug Title>`。
    - Tasks: 1) 建立複現測試(Red) 2) 修復(Green) 3) 迴歸測試。

    **Terminal Gate** (禁止跳過，須在 step_5 輸出前全部完成):
    | 步驟 | 命令 | 通過條件 |
    |:---|:---|:---|
    | 1 | `npx archi render` | `.md` 視圖生成完成 |

    **Output**: 追加了修復任務的 plan.json。
</step_2_plan_fix>

<step_3_execute_fix>
    **Role**: 資深工程師 (Surgical Fix — 僅改 Bug，禁擴散)
    **Action**:
    - 根據 Plan 直接修改程式碼。
    - 僅修復 Bug，禁藉機重構或改無關程式碼。
    - 錯誤處理遵循 `code.md` 規範（禁吞錯/禁靜默失敗）。
</step_3_execute_fix>

<step_4_verify>
    **Role**: QA 工程師
    **Terminal Gate** (禁止跳過，須在 step_5 輸出前全部完成):
    | 步驟 | 命令 | 通過條件 |
    |:---|:---|:---|
    | 1 | 運行建置命令 | 建置成功 |
    | 2 | 運行型別檢查 | 零型別錯誤 |
    | 3 | 運行 Lint/Format | 通過 |
    | 4 | 運行測試 | 複現測試 + 迴歸測試通過 |

    任何失敗須修復至通過。
</step_4_verify>

<step_4_5_plan_update>
    **Role**: Tech Lead
    **Action**:
    1. 更新 `plan.json`：將 Bugfix Phase 中已完成的 tasks 的 `done` 設為 `true`。
    2. [當前 status=`done` 且 Bugfix Phase 全部通過] → 保持 `done` 不變。
    3. [Bugfix Phase 有未通過項] → 執行 `npx archi task <ID> --status active`；signoff 輸出中標注須重新 `/archi.code` 完成剩餘修復。

    **Output**: `MODIFIED: plan.json Bugfix Phase done 標記`（如狀態變更，附 `MODIFIED: roadmap.json <ID>.status`）。
</step_4_5_plan_update>

<step_5_summary>
    **Output**: Bug 修復摘要，含 Root Cause 分析、修復內容、新增測試，以及 Next Steps 表格：

    | 優先級 | 動作 | 說明 |
    |:---|:---|:---|
    | 推薦 | `/archi.audit <ID>` | 重新審查，確認修復完整且無新引入問題 |
    | 可選 | `/archi.code <ID>` | 如有 Bugfix Phase 未完成項，繼續實作 |
</step_5_summary>

</protocol_fix>
