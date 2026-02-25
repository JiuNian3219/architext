<protocol_map>
  **Trigger**: `/archi.map`
  **Goal**: 掃描專案實際目錄結構，與 `map.json` 比對，識別新增/過期/變動，經使用者確認後更新架構地圖。

<meta>
    <style>Systematic, Precise, Architecture-Aware</style>
    <language>繁體中文</language>
    <principles>
      1.  **Scan vs Map**: 以實際檔案系統為 Ground Truth，map.json 為舊快照。
      2.  **Smart Granularity**: 預設目錄級；單檔案承載多職責時須細化到檔案級。
      3.  **Architecture Inference**: 新條目的層級歸類須參考現有 map 模式 + `02_tech_stack.md`。
      4.  **Batch Confirm**: 所有變更一次性展示，使用者批量確認。
    </principles>
</meta>

<step_1_scan>
    **Role**: 測量員
    **Action**:
    1.  **Read Map**: 讀取 `[[__DOCS_DIR__]]/global/map.json` — 當前架構地圖。
    2.  **Read Tech Stack**: 讀取 `02_tech_stack.md` — 目錄結構約定、架構模式。
    3.  **Scan Directory Tree**: 掃描專案目錄結構。
        - **排除**: `.git/`, `node_modules/`, `dist/`, `build/`, `[[__DOCS_DIR__]]/`, 及 `.gitignore` 中聲明的路徑。
        - **深度**: 跟隨 map.json 現有條目的粒度模式。如現有條目含檔案級 → 掃描時也到檔案級。

    **Output**: 內部資料（實際目錄樹 + 現有 map 結構），不輸出給使用者。
</step_1_scan>

<step_2_diff>
    **Role**: 比對分析師
    **Action**: 將實際目錄樹與 map.json 逐條比對，歸類為三種差異。

    | 差異型別 | 判定條件 | 處理 |
    |:---|:---|:---|
    | **新增** (New) | 實際存在但 map 中無記錄 | 須歸類後登記 |
    | **過期** (Stale) | map 中有記錄但實際已不存在 | 直接移除 |
    | **疑似重新命名** (Renamed) | map 中的路徑不存在，但有一個新路徑結構/內容高度相似 | 標記為重新命名候選 |

    ### 檔案級檢測

    對新增目錄中的檔案做快速掃描（讀取匯出/宣告），識別**單檔案多職責**的情況：
    - 一個檔案匯出多個不相關的 class/function/module
    - 一個入口檔案聚合註冊了多個子模組（如路由註冊、Store 註冊）
    - 一個檔案同時服務多個 Feature

    發現此類檔案 → 粒度細化到檔案級，在 map 中單獨登記並描述其包含的職責。

    **Output**: 差異列表（內部），進入 step_3。
</step_2_diff>

<step_3_classify>
    **Role**: 首席架構師
    **Action**: 對新增條目做架構歸類。

    ### 歸類策略

    1.  **模式匹配**: 參考 map.json 中同層級已有條目的歸類。如 `src/services/auth/` 屬於 "Service Layer"，則 `src/services/payment/` 大概率也屬於 "Service Layer"。
    2.  **Tech Stack 約定**: `02_tech_stack.md` 中定義的目錄結構規則（如 "commands/ 下為 Feature Layer"）。
    3.  **內容推斷**: 讀取檔案內容（import 關係、匯出型別），判斷其架構角色。
    4.  **無法確定**: 標記為 `[?]`，交由使用者在確認階段指定。

    對每個新增條目填充：
    - `path`: 目錄或檔案路徑
    - `layer`: 架構層級
    - `description`: 一句話描述職責
    - `[?檔案級]` `contains`: 該檔案包含的子職責列表

    **Output**: 已歸類的新增條目列表（內部），進入 step_4。
</step_3_classify>

<step_4_propose>
    **Role**: 諮詢顧問
    **Action**: 向使用者展示完整變更清單。

    **Output**:
    ```
    ### 架構地圖變更提案

    **掃描範圍**: [專案根目錄]
    **當前 map 條目數**: N | **變更後**: M

    ---

    #### 過期條目 (將移除)
    | 路徑 | 原層級 |
    |:---|:---|
    | src/legacy/old-module/ | Service Layer |

    #### 新增條目 (將登記)
    | 路徑 | 層級 | 描述 | 粒度 |
    |:---|:---|:---|:---|
    | src/services/payment/ | Service Layer | 支付服務模組 | 目錄 |
    | src/utils/validators.ts | Shared Layer | 表單校驗 + 資料校驗 + API 參數校驗 | 檔案 |
    | src/routes/api.ts [?] | [待指定] | 聚合註冊多條 API 路由 | 檔案 |

    #### 疑似重新命名
    | 原路徑 | 新路徑 | 置信度 |
    |:---|:---|:---|
    | src/helpers/ | src/utils/ | 高 (檔案內容匹配) |

    ---
    > 回覆 **OK** 確認全部；或指定修改：
    > - "src/routes/api.ts 屬於 App Layer"
    > - "src/helpers/ 不是重新命名，保留原條目"
    > - "新增 src/config/ 為 Config Layer"
    ```

    **Gate**: 使用者確認後進入 step_5。
</step_4_propose>

<step_5_apply>
    **Role**: 系統管理員
    **Action**:
    1.  按使用者確認的變更清單更新 `[[__DOCS_DIR__]]/global/map.json`：
        - 移除過期條目
        - 添加新增條目（含層級、描述）
        - 處理重新命名（更新路徑，保留其他中繼資料）
    2.  更新 `lastUpdated` 欄位。

    **Terminal Gate** (禁止跳過，須在輸出總結前全部完成):
    | 步驟 | 命令 | 通過條件 |
    |:---|:---|:---|
    | 1 | `npx archi render` | `.md` 視圖生成完成 |

    **Output**: 更新摘要：
    - **移除**: N 條過期條目
    - **新增**: N 條（含 M 條檔案級）
    - **重新命名**: N 條
    - **當前 map 總條目數**: X
</step_5_apply>

</protocol_map>
