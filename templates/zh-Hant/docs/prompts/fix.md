<protocol_fix>
  **Trigger**: `/archi.fix [id] <context>`
  **Goal**: 針對 Bug 進行診斷並直接執行修復。若未提供 `[id]`，自動定位相關功能模組。

<meta>
    <style>Diagnostic, Surgical, Spec-Compliant</style>
    <language>繁體中文</language>
    <principles>
      1.  **Spec Immutable**: 禁改 `spec.md` / `ui.md`（除非 Bug 本身是文件錯誤）。
      2.  **Reproduction**: 須先構想複現步驟或測試案例。
      3.  **Root Cause**: 須分析根因，而非修補表面。
      4.  **Test-Driven**: 修復計畫須含新增測試案例。
      5.  **Auto-Discovery**: 若未指定 ID，透過 Context 語意搜尋定位 Feature。
    </principles>
</meta>

<step_1_diagnose>
    **Role**: 故障分析師
    **Action**:
    1.  **Resolve Target**:
        - 有 `<id>`: 鎖定 `features/<ID>_<Slug>/`。
        - 無 `<id>`: 分析 `[context]` 搜尋最相關模組。
          唯一匹配 → 自動鎖定 | 多個匹配 → 列出候選詢問 | 無法定位 → 報錯請求指定 ID。
    2.  讀取目標目錄下所有文件 (`spec.md`, `ui.md`, `plan.md`) 與相關程式碼。
    3.  分析 `[context]`，結合程式碼邏輯定位潛在故障點。
    4.  **Hypothesis**: 提出 1-3 個根因假設。

    **Output**: 故障診斷報告 (Root Cause Analysis)。
</step_1_diagnose>

<step_2_plan_fix>
    **Role**: Tech Lead
    **Action**:
    - 更新 `[[__DOCS_DIR__]]/features/<ID>_<Slug>/plan.md`，追加 `### Bugfix: <Bug Title>` 章節。
    - Tasks: 1) 建立複現測試(Red) 2) 修復(Green) 3) 迴歸測試。

    **Output**: 追加了修復任務的 plan.md。
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
    **Action**: 執行與 `/archi.code` 相同的驗證流程:

    | 檢查項 | 要求 |
    |:---|:---|
    | **Build** | 建置成功 |
    | **Type Check** | 零型別錯誤 |
    | **Lint/Format** | 通過 Lint 和 Format |
    | **Test** | 複現測試 + 迴歸測試通過 |

    任何失敗須修復至通過。
</step_4_verify>

<step_5_summary>
    **Output**: Bug 修復摘要，含 Root Cause 分析、修復內容、新增測試、Next Steps 表格。
</step_5_summary>

</protocol_fix>
