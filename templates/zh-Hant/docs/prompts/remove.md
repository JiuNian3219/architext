<protocol_remove>
  **Trigger**: `/archi.remove <id>`
  **Goal**: 將指定 Feature 從專案中徹底下線——刪除檔案、程式碼、全域引用，確保零殘留。

<meta>
    <style>Surgical, Cautious, Thorough</style>
    <language>繁體中文</language>
    <principles>
      1.  **Dependency Safety**: 有其他任務依賴此 Feature 時，須先解除依賴才能繼續。
      2.  **Confirmation Gate**: 刪除操作不可逆，須向使用者展示完整影響並取得明確確認。
      3.  **Zero Residue**: 清理須覆蓋全部關聯層面（檔案/程式碼/全域資料/尋址條目）。
      4.  **No Side Effects**: 僅刪除目標 Feature 相關內容，禁觸碰無關檔案。
    </principles>
</meta>

<step_1_resolve>
    **Role**: 系統分析師
    **Action**:
    1.  **Resolve ID**: 從 `[[__DOCS_DIR__]]/global/roadmap.json` 解析 `<id>` → Feature Name、Slug、狀態。
    2.  **ID Not Found** → 報錯並列出可用任務 ID。
    3.  **Load Context**:
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/` — 全部檔案（spec.md, ui.md, plan.json 等）
        - `[[__DOCS_DIR__]]/global/roadmap.json` — 任務依賴關係
        - `[[__DOCS_DIR__]]/global/map.json` — 架構註冊
        - `99_context_glue.md` — 程式碼↔檔案關聯

    **Output**: 目標 Feature 基本資訊（ID、名稱、狀態、關聯檔案數）。
</step_1_resolve>

<step_2_impact>
    **Role**: 影響評估官
    **Action**: 逐層掃描，產生影響清單。

    ### 2.1 依賴檢查（阻塞級）

    掃描 `roadmap.json` 中所有任務的 `deps` 欄位，找出依賴 `<id>` 的任務。

    | 情況 | 處理 |
    |:---|:---|
    | 無下游依賴 | 通過，繼續 |
    | 有下游依賴且狀態為 `pending`/`blocked` | 列出受影響任務，詢問使用者：移除依賴關係後繼續，還是中止 |
    | 有下游依賴且狀態為 `active`/`done` | **阻塞** — 這些任務可能已使用該 Feature 的介面/元件。須先用 `/archi.edit` 解耦後再移除 |

    ### 2.2 程式碼檔案識別

    透過以下方式定位該 Feature 的程式碼檔案：
    1.  `99_context_glue.md` 中與 `<id>` 關聯的程式碼路徑。
    2.  `map.json` 中該 Feature 註冊的模組/目錄。
    3.  `plan.json` 中任務提及的檔案路徑。
    4.  掃描程式碼目錄，查找以 Slug 命名或在目錄結構中明確歸屬的檔案。

    ### 2.3 全域引用掃描

    | 檔案 | 掃描內容 |
    |:---|:---|
    | `roadmap.json` | 任務條目 + 其他任務 `deps` 中的引用 |
    | `map.json` | 模組註冊條目 |
    | `99_context_glue.md` | 關聯條目 |
    | `dictionary.json` | 該 Feature 獨佔的術語（僅標記，不自動刪） |
    | `error_codes.json` | 該 Feature 獨佔的錯誤碼（僅標記，不自動刪） |

    ### 2.4 跨 Feature 引用

    掃描其他 Feature 的 `spec.md`，檢查是否引用了被刪 Feature 的介面、元件或資料。發現引用則標註為 `[Breaking]`。

    **Output**: 向使用者輸出影響報告：
    ```
    ### 下線影響報告: <ID> <Name>

    **Feature 狀態**: [status]

    **將刪除的檔案**:
    - [[__DOCS_DIR__]]/features/<id>_<slug>/  (N 個檔案)

    **將刪除的程式碼**:
    | 檔案/目錄 | 來源 |
    |:---|:---|
    | src/xxx/xxx.ts | context_glue |
    | src/xxx/ | map.json |

    **全域引用清理**:
    - roadmap.json: 移除任務 <id>，清理 N 處 deps 引用
    - map.json: 移除 N 個模組條目
    - context_glue: 移除 N 條關聯

    **[?有]術語/錯誤碼殘留** (須人工確認):
    - dictionary.json: [term1], [term2]
    - error_codes.json: [ERR_XXX]

    **[?有]跨 Feature 引用 [Breaking]**:
    | 引用方 | 引用內容 | 建議 |
    |:---|:---|:---|
    | FEAT-005 spec.md | 呼叫了 <id> 的 UserAPI | 先 /archi.edit FEAT-005 解耦 |

    ---
    > 回覆 **OK** 確認執行；回覆 **中止** 取消操作。
    ```

    **Gate**: 使用者回覆 OK 後進入 step_3。有 `[Breaking]` 跨 Feature 引用時須再次警告。
</step_2_impact>

<step_3_execute>
    **Role**: 外科醫生
    **Action**: 按以下順序執行（順序不可調整）。

    | # | 操作 | 對象 |
    |:---|:---|:---|
    | 1 | 刪除程式碼檔案/目錄 | step_2 識別的程式碼路徑 |
    | 2 | 刪除 Feature 檔案目錄 | `[[__DOCS_DIR__]]/features/<id>_<slug>/` |
    | 3 | 更新 `roadmap.json` | 移除任務條目；清理其他任務 `deps` 中對 `<id>` 的引用 |
    | 4 | 更新 `map.json` | 移除該 Feature 註冊的模組條目 |
    | 5 | 更新 `99_context_glue.md` | 移除該 Feature 的關聯條目 |
    | 6 | [?有獨佔術語] 更新 `dictionary.json` | 移除或標註廢棄 |
    | 7 | [?有獨佔錯誤碼] 更新 `error_codes.json` | 移除或標註廢棄 |

    每步完成後記錄操作日誌（檔案路徑 + 操作型別）。
</step_3_execute>

<step_4_verify>
    **Role**: 驗證工程師
    **CLI 必執行**:
    1.  `npx archi task --check` — 驗證 Roadmap 一致性（無懸空依賴）。
    2.  `npx archi render` — 重新產生 Markdown 視圖。
    3.  運行專案建置命令 — 確認刪除程式碼後無編譯錯誤。

    | 檢查項 | 通過標準 |
    |:---|:---|
    | Roadmap 一致性 | `--check` 通過，無懸空依賴 |
    | 建置 | 零編譯錯誤 |
    | 殘留引用 | 程式碼中無對已刪模組的 import/require |

    建置失敗或發現殘留引用 → 定位並修復後重檢。
</step_4_verify>

<step_5_summary>
    **Output**: 下線完成摘要：
    - **已刪除**: 檔案 N 個、程式碼 N 個
    - **已清理**: roadmap / map / context_glue 中的引用
    - **建置狀態**: 通過/失敗
    - **[?有]須人工跟進**: 術語/錯誤碼/跨 Feature 引用殘留
    - **Git Commit Suggestion**: `feat(remove): decommission <ID> <Name>`
</step_5_summary>

</protocol_remove>
