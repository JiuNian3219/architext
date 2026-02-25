<!-- @tech:ui -->
**CSS/UI 方案**: [例：TailwindCSS + Shadcn/UI / Ant Design / 原生 CSS]
<!-- @end -->

<!-- @tech:data -->
**資料庫**: [例：PostgreSQL / MongoDB / SQLite]
**ORM / Query Builder**: [例：Prisma / Drizzle / TypeORM]
<!-- @end -->

<!-- @tech:api -->
**API 風格**: [例：RESTful / GraphQL / gRPC / tRPC]
<!-- @end -->

<!-- @tech:cli -->
**CLI 框架**: [例：cac / commander / clap (Rust) / cobra (Go)]
**分發方式**: [例：npm publish / GitHub Releases / 二進位]
<!-- @end -->

<!-- @tech:lib -->
**模組格式**: [例：ESM / CJS + ESM 雙出]
**目標平台**: [例：瀏覽器 + Node.js / 僅 Node.js]
**分發渠道**: [例：npm / PyPI / crates.io]
<!-- @end -->

<!-- @style:ui -->
## 風格與調性

**視覺關鍵字**: [例：極簡、專業、溫暖、科技感]
**資訊密度**: [大留白/沉浸式 / 資訊密集/儀表板風格]
**色調傾向**: [深色主題 / 淺色主題 / 跟隨系統]
**動效偏好**: [輕微微互動 / 豐富動畫 / 無動畫]
**圖示風格**: [例：無插圖 / 線性圖示 / 彩色插畫 / 3D 渲染]
**參考設計**: [截圖或連結，可多個]

### 視覺參考 (Visual Reference)

> 為 AI 提供足夠的審美輸入，直接影響 `ui_concept.html` 的視覺品質。
> 以下任填一項即有效，填得越多 AI 越能還原你的期望風格。

**競品/靈感截圖**: [可貼上圖片 / Figma 連結 / URL]
**品牌色板**: [主色 Hex / 漸層描述 / 無（AI 基於關鍵字生成）]
**字體偏好**: [例：Inter（現代）/ Playfair Display（優雅）/ 系統字體 / 無偏好]
**圖示庫**: [例：Lucide / Heroicons / Tabler / 無偏好]
**關鍵動效**: [例：頁面切換 Fade、按鈕 Scale 回饋、骨架屏漸出 / 無特殊要求]
**禁用風格**: [例：禁漸層背景 / 禁卡通插畫 / 無限制]
<!-- @end -->

<!-- @style:cli -->
## 風格與調性

**輸出風格**: [簡潔單行 / 結構化彩色 / JSON 機器可讀]
**互動模式**: [純參數驅動 / 互動式提示 / 混合]
**錯誤展示**: [簡潔提示 / 詳細堆疊 / 分級(--verbose)]
<!-- @end -->

<!-- @style:api -->
## 風格與調性

**文檔方案**: [OpenAPI/Swagger / GraphQL Schema / 手寫文檔]
**錯誤回應格式**: [RFC 7807 / 自訂 JSON / GraphQL errors]
**版本策略**: [URL 路徑 /v1 / Header / 無版本控制]
<!-- @end -->

<!-- @tech:mobile -->
**行動端執行時**: [例：React Native 0.76 / Flutter 3 / Expo SDK 52]
**UI 元件庫**: [例：RN Paper / NativeWind / NativeBase / 原生元件]
**導航方案**: [例：React Navigation 7 / Expo Router / Go Router]
**原生能力**: [例：相機、推播通知、生物辨識——列出需要的]
**發佈渠道**: [例：App Store + Play Store / Expo Go / TestFlight]
**OTA 熱更新**: [例：Expo Updates / CodePush / 不需要]
<!-- @end -->

<!-- @tech:miniapp -->
**小程式平台**: [例：微信 / 支付寶 / 抖音 / uni-app（多端）]
**基礎庫版本**: [例：微信基礎庫 3.x / uni-app Vue3]
**UI 元件庫**: [例：Vant Weapp / TDesign MiniProgram / 原生元件]
**雲端開發**: [例：微信雲端開發 / 不使用]
**發佈**: [例：微信公眾平台發佈 / 審核週期約定]
<!-- @end -->

<!-- @style:miniapp -->
## 風格與調性

**視覺規範**: [遵循平台設計規範（微信 Weui / 支付寶 / 抖音）/ 自訂品牌風]
**色調傾向**: [品牌主色 / 跟隨平台預設 / 深色模式（需平台支援）]
**元件風格**: [原生元件為主 / 自訂元件 / 混合]
**動效偏好**: [系統預設頁面切換 / 自訂過渡 / 無特殊要求]
<!-- @end -->

<!-- @tech:desktop -->
**桌面執行時**: [例：Tauri 2 / Electron 33]
**IPC 通訊**: [例：Tauri invoke/command / Electron ipcMain+ipcRenderer]
**系統級能力**: [例：系統匣、全域快速鍵、檔案關聯、剪貼簿——列出需要的]
**打包發佈**: [例：tauri-bundler (.dmg/.msi/.deb) / electron-builder / GitHub Releases]
**自動更新**: [例：tauri-updater / electron-updater / 不需要]
<!-- @end -->

<!-- @tech:extension -->
**目標瀏覽器**: [例：Chrome + Edge / Firefox / 全平台]
**Manifest 版本**: [V3（推薦）/ V2（Firefox 需相容）]
**擴充功能結構**: [例：僅 Popup / Popup + Content Script / Background + Content Script + Popup]
**權限宣告**: [例：storage、tabs、activeTab——列出需要的]
**發佈渠道**: [例：Chrome Web Store / Firefox Add-ons / 私有分發]
<!-- @end -->

<!-- @tech:realtime -->
**即時傳輸方案**: [例：Socket.io / 原生 WebSocket / SSE / WebRTC]
**即時框架/託管**: [例：Ably / Pusher / Liveblocks / 自建]
**房間/頻道模型**: [例：按使用者 ID 訂閱 / 按文件 ID 房間 / 廣播]
**[?CRDT] 協作衝突解決**: [例：Yjs / Automerge / 不需要（僅廣播）]
**離線支援**: [例：離線佇列 + 重連同步 / 不需要]
<!-- @end -->

<!-- @tech:ai -->
**LLM 提供商**: [例：OpenAI GPT-4o / Anthropic Claude / Gemini / 本地 Ollama]
**AI 框架**: [例：Vercel AI SDK / LangChain / LlamaIndex / 無框架直調 API]
**Tool/Function Calling**: [例：需要（列出工具名稱）/ 不需要]
**Memory 方案**: [例：向量資料庫（pgvector/Pinecone）/ 滑動視窗歷史 / 無]
**[?MCP] MCP 協定**: [例：@modelcontextprotocol/sdk / 不需要]
**串流輸出**: [例：SSE 串流 / 批量回傳]
<!-- @end -->

<!-- @style:mobile -->
## 風格與調性

**視覺關鍵字**: [例：原生感、輕量、沉浸式]
**適配方案**: [例：響應式 dp/sp / 固定設計稿 375pt]
**深色模式**: [跟隨系統 / 僅淺色 / 僅深色]
**動效偏好**: [系統原生動效 / 自訂過渡 / 無特殊要求]
**無障礙**: [例：VoiceOver / TalkBack 支援 / 無特殊要求]
<!-- @end -->

<!-- @style:desktop -->
## 風格與調性

**視覺風格**: [例：原生系統風（Fluent/HIG）/ 自訂品牌風]
**視窗管理**: [例：單主視窗 + 系統匣 / 多視窗 / 全螢幕優先]
**深色模式**: [跟隨系統 / 固定深色 / 固定淺色]
**選單列/系統匣**: [例：選單列圖示 + 快速操作 / 僅系統匣圖示 / 不需要]
<!-- @end -->

<!-- @style:extension -->
## 風格與調性

**Popup 尺寸約定**: [例：320×480px / 400×600px / 自適應]
**視覺風格**: [例：極簡卡片 / 與目標網站融合 / 獨立品牌]
**Content Script 注入樣式**: [例：懸浮按鈕 / 側邊欄 / 高亮遮罩]
<!-- @end -->

<!-- @style:realtime -->
## 風格與調性

**協作感知 UI**: [例：即時游標、使用者頭像列表、輸入指示器——列出需要的]
**衝突/同步狀態展示**: [例：樂觀更新 + 靜默同步 / 明確顯示「正在同步」]
**離線提示**: [例：頂部 Banner 提示 / 靜默重連]
<!-- @end -->

<!-- @style:ai -->
## 風格與調性

**互動模式**: [對話型（聊天 UI）/ 工具型（命令+結果）/ 混合]
**串流輸出展示**: [例：逐字打印效果 / 分段載入 / 批量回傳]
**錯誤/降級提示**: [例：顯示 fallback 模型 / 重試按鈕 / 靜默降級]
<!-- @end -->
