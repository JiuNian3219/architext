<protocol_fix>
  **Trigger**: `/archi.fix [id] <context>`
  **Goal**: 針對特定模組的 Bug (`[context]`) 進行診斷，並在不修改 Spec 的前提下**直接執行修復**。若未提供 `[id]`，AI 應嘗試自動定位相關功能模組。

<meta>
    <style>Diagnostic, Surgical, Spec-Compliant</style>
    <language>繁體中文</language>
    <principles>
      1.  **Spec Immutable**: 嚴禁修改 `spec.md` 或 `ui.md`（除非 Bug 本身是文件錯誤）。
      2.  **Reproduction**: 必須先構想複現步驟或測試案例。
      3.  **Root Cause**: 必須分析根本原因，而非僅僅修補表面。
      4.  **Test-Driven**: 修復計畫必須包含新增測試案例 (Unit/Integration)。
      5.  **Auto-Discovery**: 若使用者未指定 ID，優先通過 Context 語義搜尋定位 Feature。
    </principles>
</meta>

<step_1_diagnose>
    **Role**: 偵探 (Debugger)
    **Action**:
    1.  **Resolve Target**:
        - 若提供 `<id>`: 鎖定目標 `features/<ID>_<Slug>/`。
        - 若未提供 `<id>`: 分析 `[context]`，在 `features/` 目錄下搜尋最相關的功能模組。
          - ➡️ 找到唯一符合: 自動鎖定。
          - ➡️ 找到多個符合: 列出候選列表並詢問使用者。
          - ➡️ 無法定位: 報錯並請求使用者指定 ID。
    2.  讀取目標目錄下的所有文件 (`spec.md`, `ui.md`, `plan.md`) 與相關程式碼。
    3.  分析 `[context]` 描述，結合程式碼邏輯定位潛在故障點。
    4.  **Hypothesis**: 提出 1-3 個可能的根本原因假設。

    **Output**: 故障診斷報告 (Root Cause Analysis)。
    **Bridge**: "根因已鎖定 (Feature: <Name>)，正在制定外科手術式修復方案……"
</step_1_diagnose>

<step_2_plan_fix>
    **Role**: 醫生
    **Action**:
    - 更新 `[[__DOCS_DIR__]]/features/<ID>_<Slug>/plan.md`。
    - 追加 `### Bugfix: <Bug Title>` 章節。
    - **Tasks**:
      1.  Create Reproduction Test Case (Red).
      2.  Apply Fix (Green).
      3.  Regression Test.
    
    **Output**: 追加了修復任務的 `plan.md`。
</step_2_plan_fix>

<step_3_draft_patch>
    **Role**: 資深工程師
    **Action**:
    - 雖然不直接執行 (由 `/archi.code` 負責)，但在此步驟提供具體的 **Code Suggestion** 或 **Patch Preview**。
    - 展示具體的程式碼修改思路（Diff 形式）。

    **Output**: 修復程式碼預覽 (Preview)。
</step_3_draft_patch>

<step_3_execute_fix>
    **Role**: 外科醫生
    **Action**:
    - **Apply Fix**: 根據 Plan 直接修改程式碼。
    - **Constraint**: 僅修復 Bug，**禁止**藉機重構或修改無關程式碼。
    - **Error Handling**: 確保修復程式碼遵循 `code.md` 的錯誤處理規範 (禁止吞錯/禁止僅列印日誌後繼續)。
</step_3_execute_fix>

<step_4_verify>
    **Role**: 測試員
    **Action**:
    - **Protocol Check**: 執行與 `/archi.code` 相同的 **Validate** 步驟。
    - **Step 1: Build Check**: 建置專案。
    - **Step 2: Type Check**: 必須通過型別檢查。
    - **Step 3: Lint/Format**: 必須通過 Lint 和 Format。
    - **Step 4: Test**: 執行複現測試和回歸測試。
    
    **Rule**: 任何驗證失敗不得標記任務完成；需回復或修復至通過。
</step_4_verify>

<step_5_summary>
    **Action**: 匯總修復結果並輸出清晰的下一步指引。

    **Output Template**:
    ```markdown
    ## ✅ Bug Fixed

    **Feature**: `<ID>` — `<Name>` | **Bug**: `<Brief description>`

    ### 🐛 Root Cause
    [根本原因分析]

    ### ✅ Fix Applied
    * [修復內容簡述]
    * [新增測試案例簡述]

    ### 🧭 Next Steps
    | 場景 | 推薦操作 |
    |:---|:---|
    | **繼續開發** | `/archi.code <ID>` |
    | **發現新 Bug** | `/archi.fix <ID> [bug描述]` |
    | **需求變更** | `/archi.edit <ID> [變更描述]` |
    ```
</step_5_summary>

</protocol_fix>
