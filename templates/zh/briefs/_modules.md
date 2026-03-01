<!-- @tech:ui -->
**CSS/UI 方案**: [例：TailwindCSS + Shadcn/UI / Ant Design / 原生 CSS]
<!-- @end -->

<!-- @tech:data -->
**数据库**: [例：PostgreSQL / MongoDB / SQLite]
**ORM / Query Builder**: [例：Prisma / Drizzle / TypeORM]
<!-- @end -->

<!-- @tech:api -->
**API 风格**: [例：RESTful / GraphQL / gRPC / tRPC]
<!-- @end -->

<!-- @tech:cli -->
**CLI 框架**: [例：cac / commander / clap (Rust) / cobra (Go)]
**分发方式**: [例：npm publish / GitHub Releases / 二进制]
<!-- @end -->

<!-- @tech:lib -->
**模块格式**: [例：ESM / CJS + ESM 双出]
**目标平台**: [例：浏览器 + Node.js / 仅 Node.js]
**分发渠道**: [例：npm / PyPI / crates.io]
<!-- @end -->

<!-- @style:ui -->
## 风格与调性

**审美方向** (选一个最接近的，不确定就留空让 AI 推荐):
<!-- 选一个填入，或写 custom 并在下方描述 -->
<!-- saas-dark    — 类似 Linear/Vercel/Raycast：深色背景、高对比、极简、锐利边缘 -->
<!-- saas-light   — 类似 Notion/Stripe/GitHub：白底、细边框、系统字体、呼吸感 -->
<!-- dashboard    — 类似 Grafana/Datadog：信息密集、卡片网格、数据优先 -->
<!-- marketing    — 类似 Loom/Framer：大标题、渐变、视觉冲击、叙事感 -->
<!-- mobile-app   — 类似 Telegram/Bear：圆角大、间距宽、触控友好 -->
<!-- editorial    — 类似 Medium/Substack：排版优先、衬线字体、阅读沉浸 -->
<!-- brutalist    — 类似 Craigslist/HN：功能极简、无装饰、原始感 -->
<!-- custom       — 在「自定义描述」中写你想要的风格 -->

**审美方向**: [例：saas-dark / saas-light / dashboard / marketing / mobile-app / editorial / brutalist / custom]
**自定义描述**: [仅 custom 时填写，例："类似 Spotify 的深色 + 绿色强调 + 卡片式布局"]

**信息密度**: [大留白/沉浸式 / 信息密集/仪表盘风格]
**动效偏好**: [轻微微交互 / 丰富动画 / 无动画]

### 视觉参考 (Visual Reference)

> 为 AI 提供审美输入，直接影响 `ui_concept.html` 的视觉质量。
> 以下任填一项即有效，填得越多 AI 越能还原你的期望风格。

**竞品/灵感截图**: [可粘贴图片 / Figma 链接 / URL]
**品牌色板**: [主色 Hex / 渐变描述 / 无（AI 基于审美方向生成）]
**字体偏好**: [例：JetBrains Mono + Space Grotesk / Playfair Display / 无偏好（AI 基于审美方向选择）]
**图标库**: [例：Lucide / Heroicons / Tabler / 无偏好]
**禁用风格**: [例：禁渐变背景 / 禁卡通插画 / 无限制]
<!-- @end -->

<!-- @style:cli -->
## 风格与调性

**输出风格**: [简洁单行 / 结构化彩色 / JSON 机器可读]
**交互模式**: [纯参数驱动 / 交互式提示 / 混合]
**错误展示**: [简洁提示 / 详细堆栈 / 分级(--verbose)]
<!-- @end -->

<!-- @style:api -->
## 风格与调性

**文档方案**: [OpenAPI/Swagger / GraphQL Schema / 手写文档]
**错误响应格式**: [RFC 7807 / 自定义 JSON / GraphQL errors]
**版本策略**: [URL 路径 /v1 / Header / 无版本控制]
<!-- @end -->

<!-- @tech:mobile -->
**移动端运行时**: [例：React Native 0.76 / Flutter 3 / Expo SDK 52]
**UI 组件库**: [例：RN Paper / NativeWind / NativeBase / 原生组件]
**导航方案**: [例：React Navigation 7 / Expo Router / Go Router]
**原生能力**: [例：摄像头、推送通知、生物识别——列出需要的]
**分发渠道**: [例：App Store + Play Store / Expo Go / TestFlight]
**OTA 热更新**: [例：Expo Updates / CodePush / 不需要]
<!-- @end -->

<!-- @tech:miniapp -->
**小程序平台**: [例：微信 / 支付宝 / 抖音 / uni-app（多端）]
**基础库版本**: [例：微信基础库 3.x / uni-app Vue3]
**UI 组件库**: [例：Vant Weapp / TDesign MiniProgram / 原生组件]
**云开发**: [例：微信云开发 / 不使用]
**分发**: [例：微信公众平台发布 / 审核周期约定]
<!-- @end -->

<!-- @style:miniapp -->
## 风格与调性

**视觉规范**: [遵循平台设计规范（微信 Weui / 支付宝 / 抖音）/ 自定义品牌风]
**色调倾向**: [品牌主色 / 跟随平台默认 / 深色模式（需平台支持）]
**组件风格**: [原生组件为主 / 定制组件 / 混合]
**动效偏好**: [系统默认页面切换 / 自定义过渡 / 无特殊要求]
<!-- @end -->

<!-- @tech:desktop -->
**桌面运行时**: [例：Tauri 2 / Electron 33]
**IPC 通信**: [例：Tauri invoke/command / Electron ipcMain+ipcRenderer]
**系统级能力**: [例：系统托盘、全局热键、文件关联、剪贴板——列出需要的]
**打包分发**: [例：tauri-bundler (.dmg/.msi/.deb) / electron-builder / GitHub Releases]
**自动更新**: [例：tauri-updater / electron-updater / 不需要]
<!-- @end -->

<!-- @tech:extension -->
**目标浏览器**: [例：Chrome + Edge / Firefox / 全平台]
**Manifest 版本**: [V3（推荐）/ V2（Firefox 需兼容）]
**扩展结构**: [例：仅 Popup / Popup + Content Script / Background + Content Script + Popup]
**权限声明**: [例：storage、tabs、activeTab——列出需要的]
**发布渠道**: [例：Chrome Web Store / Firefox Add-ons / 私有分发]
<!-- @end -->

<!-- @tech:realtime -->
**实时传输方案**: [例：Socket.io / 原生 WebSocket / SSE / WebRTC]
**实时框架/托管**: [例：Ably / Pusher / Liveblocks / 自建]
**房间/频道模型**: [例：按用户 ID 订阅 / 按文档 ID 房间 / 广播]
**（仅CRDT项目） 协作冲突解决**: [例：Yjs / Automerge / 不需要（仅广播）]
**离线支持**: [例：离线队列 + 重连同步 / 不需要]
<!-- @end -->

<!-- @tech:ai -->
**LLM 提供商**: [例：OpenAI GPT-4o / Anthropic Claude / Gemini / 本地 Ollama]
**AI 框架**: [例：Vercel AI SDK / LangChain / LlamaIndex / 无框架直调 API]
**Tool/Function Calling**: [例：需要（列出工具名称）/ 不需要]
**Memory 方案**: [例：向量数据库（pgvector/Pinecone）/ 滑动窗口历史 / 无]
**（仅MCP项目） MCP 协议**: [例：@modelcontextprotocol/sdk / 不需要]
**流式输出**: [例：SSE 流式 / 批量返回]
<!-- @end -->

<!-- @style:mobile -->
## 风格与调性

**视觉关键词**: [例：原生感、轻量、沉浸式]
**适配方案**: [例：响应式 dp/sp / 固定设计稿 375pt]
**深色模式**: [跟随系统 / 仅浅色 / 仅深色]
**动效偏好**: [系统原生动效 / 自定义过渡 / 无特殊要求]
**无障碍**: [例：VoiceOver / TalkBack 支持 / 无特殊要求]
<!-- @end -->

<!-- @style:desktop -->
## 风格与调性

**视觉风格**: [例：原生系统风（Fluent/HIG）/ 自定义品牌风]
**窗口管理**: [例：单主窗口 + 托盘 / 多窗口 / 全屏优先]
**深色模式**: [跟随系统 / 固定深色 / 固定浅色]
**菜单栏/系统托盘**: [例：菜单栏图标 + 快捷操作 / 仅托盘图标 / 不需要]
<!-- @end -->

<!-- @style:extension -->
## 风格与调性

**Popup 尺寸约定**: [例：320×480px / 400×600px / 自适应]
**视觉风格**: [例：极简卡片 / 与目标网站融合 / 独立品牌]
**Content Script 注入样式**: [例：悬浮按钮 / 侧边栏 / 高亮遮罩]
<!-- @end -->

<!-- @style:realtime -->
## 风格与调性

**协作感知 UI**: [例：实时光标、用户头像列表、打字指示器——列出需要的]
**冲突/同步状态展示**: [例：乐观更新 + 静默同步 / 明确显示"正在同步"]
**离线提示**: [例：顶部 Banner 提示 / 静默重连]
<!-- @end -->

<!-- @style:ai -->
## 风格与调性

**交互模式**: [对话型（聊天 UI）/ 工具型（命令+结果）/ 混合]
**流式输出展示**: [例：逐字打印效果 / 分段加载 / 批量返回]
**错误/降级提示**: [例：显示 fallback 模型 / 重试按钮 / 静默降级]
<!-- @end -->
