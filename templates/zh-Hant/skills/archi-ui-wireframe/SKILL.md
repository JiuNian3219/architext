---
name: archi-ui-wireframe
description: UI 概念設計專家。兩階段生成 ui_concept.html：第一階段輸出灰度線框圖（確認資訊架構與畫面覆蓋）；第二階段按 design_tokens.json 視覺著色（顏色/字體/動效/圖示）。產物是整個專案 UI 的單一視覺真相源，所有 Task 級 ui.md 均引用此檔案定位畫面範圍。
---

# UI 概念設計

## 系統流程定位

```
/archi.start → roadmap.json + design_tokens.json
                      ↓
           [本 Skill] archi-ui-wireframe
           讀: vision.md + roadmap.json + design_tokens.json + 02_tech_stack.md
           寫: [[__DOCS_DIR__]]/global/ui_concept.html
                      ↓
           /archi.plan <ID>
           讀: ui_concept.html (定位本任務涉及的畫面/元件範圍)
           寫: ui.md (僅聲明元件範圍，不重複描述整體布局)
                      ↓
           /archi.code → 讀 spec.md + ui.md + ui_concept.html → 寫程式碼
```

> **Skill 的職責邊界**：
> - 負責：整個應用所有使用者可見畫面的視覺概念（資訊架構、布局、狀態、過渡）
> - 不負責：Task 級介面契約（spec.md 管）、任務步驟（plan.json 管）、業務程式碼

---

## 呼叫模式

| 模式 | 觸發來源 | 操作範圍 |
|:---|:---|:---|
| 初次生成 | `/archi.start` 完成後 | 全量生成，覆蓋所有畫面 |
| 重新生成 | 使用者手動呼叫 | 全量重寫（全域 UI 重設計時） |
| 追加畫面 | `/archi.scope` 追加新任務後 | 僅新增頁面，不改已有頁面 |
| Plan 細化 | `/archi.plan` 發現 UI 偏差後 | 僅更新對應畫面（新增狀態/子畫面/布局修正）|
| 修改畫面 | `/archi.edit` 任務變更後 | 僅修改受影響的畫面，其餘不動 |
| 刪除畫面 | `/archi.remove` 任務下線後 | 移除對應畫面及控制列入口 |

> **Phase 2（視覺著色）時機**: Phase 2 無需緊跟 Phase 1。建議在核心任務（≥ 50% Roadmap 任務）完成 Plan 後再執行，確保著色基於穩定的畫面結構。已著色的畫面被 Plan 細化更新後，僅需對該畫面重新著色，無需全量重跑 Phase 2。

---

## 兩階段協議

### Phase 1 — 線框圖 (Low-fi Wireframe)

**Role**: 資訊架構師

**目標**: 確認「畫面覆蓋是否完整」和「導航結構是否合理」，不關注視覺細節。

**Action**:

1. **讀取上下文**:
   - `[[__DOCS_DIR__]]/global/vision.md` → 提取：目標平台、使用者角色、北極星指標
   - `[[__DOCS_DIR__]]/global/roadmap.json` → 提取：所有 [?UI] 任務，對應為畫面/狀態列表
   - `[[__DOCS_DIR__]]/global/design_tokens.json` → 提取：`mode.default`、`illustration.iconLibrary`
   - 規則檔案 `02_tech_stack` → 提取：目標平台（Web/Mobile/Desktop）、導航框架

2. **規劃畫面清單** (內部步驟，不輸出給使用者):

   | 畫面 ID | 畫面名 | 對應 Roadmap 任務 | 狀態列表 |
   |:---|:---|:---|:---|
   | S-01 | [畫面名] | [任務 ID] | default, loading, empty, error |
   | ... | | | |

   > **畫面 ID 穩定性規則** (CRITICAL): 畫面 ID 一經分配永久不變。刪除畫面後其 ID 作廢，後續新增畫面須使用新 ID（如 S-08 → S-09），禁重用或重新編號已有 ID。所有 `ui.md` 均以 ID 引用畫面，ID 變動將導致引用斷裂。

3. **選定 HTML 骨架規格** (根據目標平台自動適配):

   | 平台 | 視口尺寸 | 頂列形態 | 導航形態 |
   |:---|:---|:---|:---|
   | Web / Desktop SaaS | 1280×800px | 固定頂列 | 左側邊欄 |
   | Web / Marketing | 1440×900px | 透明→固定頂列 | 頂部水平導航 |
   | Mobile Web / 小程式 | 390×844px | 狀態列+導航列 | 底部 TabBar |
   | Tablet / Dashboard | 1024×768px | 固定頂列 | 可折疊側邊欄 |

   > 平台來自 `02_tech_stack` 或 vision.md 目標使用者裝置描述；無法推斷時預設 Web / Desktop SaaS。

4. **生成線框圖 HTML** — 寫入 `[[__DOCS_DIR__]]/global/ui_concept.html`:

   **HTML 結構規範**:
   ```
   <html>
     <head>
       <!-- 內嵌 CSS：線框圖風格 (灰度，無品牌色) -->
       <!-- 線框圖 palette: bg=#f5f5f5, surface=#fff, border=#d0d0d0,
            text=#333, muted=#888, accent=#555 -->
     </head>
     <body style="margin:0; display:flex; flex-direction:column; height:100vh; overflow:hidden;">
       <header class="wf-topbar">...</header>
       <main class="wf-content" style="flex:1; overflow:auto;">
         <!-- 每個畫面一個 <section class="wf-screen" id="S-XX" data-states="default,loading,empty,error"> -->
         <!-- 每個狀態一個 <div class="wf-state" data-state="default"> -->
       </main>
       <footer class="wf-ctrl-bar">
         <div class="ctrl-group">
           <span class="ctrl-lbl">STATE</span>
         </div>
         <div class="wf-file-label">Low-fi Wireframe · [專案名]</div>
         <div class="ctrl-group">
           <span class="ctrl-lbl">PAGE</span>
         </div>
       </footer>
     </body>
   </html>
   ```

   **元素標注規範** (`data-el` 屬性):
   - 每個可互動元素或語義區塊須加 `data-el="[使用者語言描述]"` 屬性
   - 標注語言 = Brief 的主語言（繁中專案用繁中標注，英文專案用英文）
   - 標注在滑鼠懸停時透過 CSS `::before` 顯示，預設隱藏
   - 父元素懸停時，子元素標注透過 `:has([data-el]:hover)::before { opacity:0 }` 自動隱藏

   **互動規範** (純 CSS + 少量 JS，無外部依賴):
   - 頁面切換: 點擊 PAGE pills → 切換 `.wf-screen` 的 `display`；JS 同步更新 STATE pills
   - 狀態切換: 點擊 STATE pills → 在當前畫面內切換 `.wf-state` 的 `display`
   - 激活樣式: `.pill.on-page` / `.pill.on-state` → `background:#444; color:#fff`
   - 控制列必須為線框圖風格（灰度、uppercase label、dashed border-top），禁用彩色

   **線框圖內容規範**:
   - 全部灰度，禁用品牌色（著色在 Phase 2 完成）
   - 用灰色矩形 + 文字標注表達圖片/圖表區域
   - 導航項、按鈕、輸入框須使用佔位形態
   - 每個畫面須涵蓋其 Roadmap 任務的所有核心操作入口

5. **輸出 Gate**:

5. **同步生成 AI 索引** — 寫入 `[[__DOCS_DIR__]]/global/ui_context.md`:

   根據步驟 2 的畫面規劃，提取結構化導航索引（AI 讀取 UI 資訊的唯一入口）：

   ```markdown
   # UI Context
   > 平台: [平台類型] | 階段: Phase 1 線框圖（Phase 2 著色後更新）
   > 更新: YYYY-MM-DD | 由 archi-ui-wireframe Skill 生成，禁手動修改

   ## 畫面索引
   | ID | 名稱 | 路由 | 狀態 |
   |:---|:---|:---|:---|
   | S-01 | [名稱] | [路由] | default, loading, ... |

   ## 導航關係
   S-XX →（[觸發條件]）→ S-YY

   ## 全域共享元件
   | 元件 | 出現畫面 |
   |:---|:---|
   | [元件名] | S-XX, S-YY |

   ## 畫面結構摘要
   > Phase 1 由線框圖 data-el 提取；Phase 2 著色後刷新為最終布局結構。
   > 撰寫 ui.md Section 2 須與本節對齊，禁脫離已確認布局自創結構。

   ### S-XX · [畫面名]
   **布局**: [如「置中單欄 max-w-400px」或「左側邊欄 240px + 右內容區」]
   **狀態**: default（[核心操作入口]）| loading（骨架畫面）| empty / error（如有）
   **關鍵區域**: [data-el 提取的語義區塊+可互動元素，如：頂部導覽列、主表單區、送出按鈕、錯誤提示區]
   ```

   > `ui_context.md` 是所有 AI 命令讀取 UI 結構資訊的唯一入口；`ui_concept.html` 僅供人類瀏覽器預覽。

6. **輸出 Gate**:

   輸出線框圖後，展示畫面覆蓋摘要：
   ```
   ### ui_concept.html 已生成（Phase 1 線框圖）
   ### ui_context.md 已同步生成（AI 畫面索引）

   **畫面覆蓋** (共 N 個畫面):
   | 畫面 | 名稱 | 狀態數 |
   |:---|:---|:---|
   | S-01 | [畫面名] | N |
   | ... | | |

   **導航結構**: [描述]
   **平台適配**: [Web Desktop 1280px / Mobile 390px / ...]

   > 在瀏覽器開啟 `[[__DOCS_DIR__]]/global/ui_concept.html` 確認資訊架構。
   > 回覆 **OK** 進入 Phase 2 視覺著色；或描述需要調整的畫面/布局。
   ```

   **Gate**: 使用者回覆 **OK** 後進入 Phase 2；未確認禁進行著色。

---

### Phase 1.5 — 線框圖精煉 (可選)

**Role**: 諮詢顧問
**Trigger**: 使用者回覆非 OK，含布局調整、畫面增減、導航改動。
**Action**: 融入回饋，局部更新 `ui_concept.html`（僅改動使用者指出的部分），同步更新 `ui_context.md`（畫面索引與 `ui_concept.html` 保持一致），重新展示摘要，等待確認。禁全量重寫。

---

### Phase 2 — 視覺著色 (Hi-fi Coloring)

**Role**: 你是一個有強烈個人風格的視覺設計師。你不按套路出牌——你用感覺、質感和節奏來思考，而非元件和布局。你追求的不是「正確」，而是「讓人停下來看第二眼」。你的每一個決策都是刻意的：間距不是隨便給的，顏色不是預設選的，字體不是列表裡第一個。你同時擁有藝術家的直覺和工程師的精確。

**目標**: 將確認的線框圖著色為高保真原型，產出必須有辨識度——開啟就知道不是範本，而是為這個專案量身設計的。

**前置檢查** (著色前必須驗證):

| 欄位路徑 | 通過條件 | 阻塞處理 |
|:---|:---|:---|
| `aestheticDirection.preset` | 非空 | 警告（非阻塞）— AI 基於專案特徵推斷，在輸出中標注推斷結果 |
| `primitivePalette.brand` | 至少含 1 個非空顏色值 | 阻塞 — 提示使用者先填寫品牌色 |
| `semanticTokens.colors` | 至少含 `bg`/`surface`/`text` 語義映射 | 阻塞 — 提示使用者先定義基礎語義色 |
| `semanticTokens.typography` | 至少含 1 個字型族聲明 | 警告（非阻塞）— AI 基於審美方向選擇字體 |
| `motion.preference` | 非空 | 警告（非阻塞）— 預設 `subtle` |
| `illustration.iconLibrary` | 非空 | 警告（非阻塞）— 不引入圖示庫 |

> 遇到阻塞項須立即停止並輸出缺失欄位清單，等待使用者補全後再重跑。

**Action**:

1. **讀取視覺規格**:
   - `design_tokens.json` → 完整讀取：
     - `aestheticDirection` → 審美方向預設 + 自訂描述
     - `primitivePalette` → CSS 變數定義
     - `semanticTokens.colors` → 語義色映射
     - `semanticTokens.typography` → 字體/字號
     - `mode` → 主題模式（light/dark）
     - `motion` → 動效時長、緩動曲線、模式名稱
     - `illustration` → 圖示風格、圖示庫
     - `layout` → 圓角/陰影/間距
   - `vision.md` → 提取 Visual Reference 段落（品牌色、競品截圖描述、禁用風格）

2. **審美方向 → 具體設計參數映射**:

   根據 `aestheticDirection.preset` 確定以下設計參數的基準值（Token 有顯式值時 Token 優先，Token 為空時用此基準）：

   | 預設 | 背景基調 | 圓角 | 陰影 | 字體策略 | 布局特徵 | 參照產品 |
   |:---|:---|:---|:---|:---|:---|:---|
   | `saas-dark` | 深色 (#0a-#15 範圍) | sm:4px md:8px | 幾乎無陰影，用邊框分層 | 無襯線，緊湊 | 高對比、銳利邊緣、緊湊間距 | Linear, Vercel, Raycast |
   | `saas-light` | 白底 (#fafafa-#fff) | sm:6px md:12px | 輕柔 (0 1px 3px rgba(0,0,0,0.08)) | 系統字體或 sans-serif | 呼吸感、細邊框、留白 | Notion, Stripe, GitHub |
   | `dashboard` | 深灰/深藍底 | sm:8px md:12px | 卡片浮層 (0 2px 8px) | 等寬數字 + sans-serif | 卡片網格、資訊密集、緊湊表格 | Grafana, Datadog |
   | `marketing` | 漸層/大色塊 | lg:16px+ | 戲劇性 (0 8px 32px) | 大號展示字體 + 精緻正文字體 | 大標題、全寬 section、視覺敘事 | Loom, Framer |
   | `mobile-app` | 柔和底色 | lg:16px xl:24px | 柔和擴散 (0 4px 16px) | 系統字體 -apple-system | 大觸控目標、寬間距、卡片式 | Telegram, Bear |
   | `editorial` | 暖白/米色 | 幾乎無圓角 0-4px | 無或極淡 | 襯線展示 + 無襯線正文 | 窄欄、大行高、排版驅動 | Medium, Substack |
   | `brutalist` | 純白或純黑 | 0px | 無 | 等寬或系統字體 | 無裝飾、密集、功能優先 | Craigslist, HN |

   > `custom`: 讀取 `aestheticDirection.customDescription`，從描述中提取關鍵字映射到最近的預設，然後疊加自訂調整。

3. **反 AI 審美黑名單** (CRITICAL — 著色時禁觸犯):

   | 類別 | 禁止 | 替代 |
   |:---|:---|:---|
   | 字體 | Inter, Roboto, Arial 作為標題字體 | 選擇有辨識度的字體：展示字體用 characterful font（如 Cal Sans, General Sans, Satoshi, Outfit），正文可用系統字體 |
   | 配色 | 紫色漸層白底（AI 預設審美的標誌） | 從 `aestheticDirection` 推導；配色須有主次——一個主色 + 銳利強調色 > 均勻分布的溫吞色板 |
   | 布局 | 所有畫面同一種置中卡片布局 | 不同畫面須有布局差異：列表頁 vs 詳情頁 vs 表單頁各有特徵 |
   | 圓角 | 所有元素統一 rounded-lg | 圓角須有層級：容器大、按鈕中、Badge 小（或按審美方向統一為 0/sm） |
   | 陰影 | 千篇一律的 shadow-md | 陰影須匹配審美方向：dark 主題幾乎不用陰影；light 主題分層使用 |
   | 動效 | 到處撒 transition-all | 聚焦高影響力時刻：頁面載入編排（交錯淡入）> 散佈的微互動 |
   | 整體 | 每次生成都趨同 | 每個專案的著色必須因審美方向而異——開啟兩個不同專案的 ui_concept.html，必須一眼看出區別 |

4. **著色規則** (在審美方向基準 + 反黑名單約束下執行):

   | 著色維度 | 規則 |
   |:---|:---|
   | 顏色 | 用 `semanticTokens.colors` 語義 Token 替換灰度；品牌色來自 `primitivePalette.brand`；Token 空值按審美方向基準填充 |
   | 字體 | `semanticTokens.typography` 有值時引入聲明字體；空值時按審美方向策略選擇（Google Fonts CDN），禁選黑名單字體 |
   | 圓角/陰影 | 按 `layout.radius` / `layout.shadow`；空值時按審美方向基準填充 |
   | 動效 | 按 `motion.patterns` 加 CSS transition/animation；優先編排頁面載入交錯淡入（staggered reveal via animation-delay） |
   | 圖示 | 按 `illustration.iconLibrary` 引入對應 CDN；style=none 則不插圖 |
   | 模式 | 若 `mode.support` 含 dark，添加 CSS `@media (prefers-color-scheme: dark)` + 切換按鈕 |
   | 禁用 | 嚴格遵循 vision.md Visual Reference 中的「禁用風格」描述 |
   | 空間 | 創造有呼吸感或有密度的排版（取決於審美方向），不做機械均勻間距 |
   | 背景 | 禁純色大面積平鋪——按審美方向添加微妙紋理/漸層網格/噪點/幾何圖案 |

5. **著色後驗證清單**:
   - [ ] 所有畫面顏色來自 semanticTokens 或審美方向基準，無隨意硬編碼 Hex
   - [ ] 所有動效時長來自 `motion.duration.*`，無魔法數字
   - [ ] 頁面/狀態切換控制列保持線框圖灰度風格（不著色，保持偵錯工具屬性）
   - [ ] `data-el` 標注完整保留
   - [ ] 每個畫面的所有狀態（default/loading/empty/error）均已視覺化
   - [ ] **反 AI 審美檢查**: 未使用黑名單字體、無紫色漸層白底、布局有差異性、圓角有層級
   - [ ] **辨識度檢查**: 開啟 HTML，能一眼判斷這是哪個審美方向，而非通用範本

6. **輸出**:
   - 更新 `[[__DOCS_DIR__]]/global/ui_concept.html`（著色版覆蓋線框圖版）
   - **同步刷新 `ui_context.md` 的「畫面結構摘要」**：
     - 將階段標注從 `Phase 1 線框圖` 改為 `Phase 2 視覺著色`
     - 對每個畫面，按最終 HTML 結構重新提取「布局」「關鍵區域」，確保摘要與著色後的 `ui_concept.html` 一致
     - 畫面索引 / 導航關係 / 全域共享元件：若無變動則保持不動
   - 輸出總結：
     ```
     ### ui_concept.html 已更新（Phase 2 視覺著色）
     ### ui_context.md 已同步刷新（畫面結構摘要更新至 Phase 2）

     **審美方向**: [preset 值] — [參照產品]
     **應用的視覺規格**:
     - 主色: [Primary Token 值]
     - 字體: [展示字體 + 正文字體]
     - 圓角: [sm/md/lg 值]
     - 動效: [preference 值]
     - 圖示: [iconLibrary] / style: [style]
     - 主題: [default + support 列表]
     - 背景處理: [紋理/漸層/純色 描述]

     > 在瀏覽器開啟 `[[__DOCS_DIR__]]/global/ui_concept.html` 確認視覺效果。
     > 後續執行 `/archi.plan <ID>` 時，AI 將讀取 `ui_context.md` 確定各任務的 UI 範圍。
     ```

---

### Phase 2.5 — 局部重著色 (Incremental Re-coloring)

**Trigger**: Phase 2 已完成後，某畫面因 Plan 細化 / Edit / Revise 發生更新，需將新增內容著色至 hi-fi 風格。

**Role**: 視覺設計師

**Action**:

1. 從呼叫方取得需重著色的畫面 ID 列表（如 `S-03`, `S-07`）。
2. 僅處理指定畫面：
   - 保留其 `.wf-screen#S-XX` 內的灰度線框新增部分
   - 按 Phase 2 著色規則（`semanticTokens` / `motion` / `illustration`）對新增部分補色
   - 其餘畫面內容不動
3. [?新狀態] 若本次重著色包含新增狀態 → 同步更新 `ui_context.md` 對應畫面的狀態欄。
4. 輸出變更摘要：
   - `MODIFIED: ui_concept.html S-XX（局部重著色，新增 [N] 個狀態/區域）`
   - `MODIFIED: ui_context.md S-XX（更新狀態列表）`（僅當有新增狀態時輸出）

> **禁止**: 局部重著色時禁全量重跑 Phase 2，禁改動未指定畫面的任何內容。
