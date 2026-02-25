<!-- @tech:ui -->
**CSS/UI approach**: [e.g.: TailwindCSS + Shadcn/UI / Ant Design / plain CSS]
<!-- @end -->

<!-- @tech:data -->
**Database**: [e.g.: PostgreSQL / MongoDB / SQLite]
**ORM / Query Builder**: [e.g.: Prisma / Drizzle / TypeORM]
<!-- @end -->

<!-- @tech:api -->
**API style**: [e.g.: RESTful / GraphQL / gRPC / tRPC]
<!-- @end -->

<!-- @tech:cli -->
**CLI framework**: [e.g.: cac / commander / clap (Rust) / cobra (Go)]
**Distribution**: [e.g.: npm publish / GitHub Releases / binary]
<!-- @end -->

<!-- @tech:lib -->
**Module format**: [e.g.: ESM / CJS + ESM dual output]
**Target platforms**: [e.g.: browser + Node.js / Node.js only]
**Distribution channel**: [e.g.: npm / PyPI / crates.io]
<!-- @end -->

<!-- @style:ui -->
## Style & Tone

**Visual keywords**: [e.g.: minimal, professional, warm, tech-forward]
**Information density**: [generous whitespace/immersive / dense/dashboard-style]
**Theme preference**: [dark theme / light theme / follow system]
**Motion preference**: [subtle micro-interactions / rich animation / no animation]
**Illustration style**: [e.g.: none / line icons / colorful illustration / 3D render]
**Design references**: [screenshots or links, multiple allowed]

### Visual Reference

> Provides aesthetic input for AI — directly impacts `ui_concept.html` quality.
> Fill in any of the fields below; the more you provide, the closer AI can match your vision.

**Competitor/inspiration screenshots**: [paste image / Figma link / URL]
**Brand palette**: [primary color Hex / gradient description / none (AI generates from keywords)]
**Font preference**: [e.g.: Inter (modern) / Playfair Display (elegant) / system font / no preference]
**Icon library**: [e.g.: Lucide / Heroicons / Tabler / no preference]
**Key motion**: [e.g.: page-switch Fade, button Scale feedback, skeleton fade-in / no special requirement]
**Forbidden styles**: [e.g.: no gradient backgrounds / no cartoon illustration / no restriction]
<!-- @end -->

<!-- @style:cli -->
## Style & Tone

**Output style**: [concise single-line / structured colorful / JSON machine-readable]
**Interaction mode**: [pure argument-driven / interactive prompts / hybrid]
**Error display**: [concise message / detailed stack / tiered (--verbose)]
<!-- @end -->

<!-- @style:api -->
## Style & Tone

**Documentation approach**: [OpenAPI/Swagger / GraphQL Schema / hand-written docs]
**Error response format**: [RFC 7807 / custom JSON / GraphQL errors]
**Versioning strategy**: [URL path /v1 / Header / no versioning]
<!-- @end -->

<!-- @tech:mobile -->
**Mobile runtime**: [e.g.: React Native 0.76 / Flutter 3 / Expo SDK 52]
**UI component library**: [e.g.: RN Paper / NativeWind / NativeBase / native components]
**Navigation**: [e.g.: React Navigation 7 / Expo Router / Go Router]
**Native capabilities**: [e.g.: camera, push notifications, biometrics — list what's needed]
**Distribution**: [e.g.: App Store + Play Store / Expo Go / TestFlight]
**OTA updates**: [e.g.: Expo Updates / CodePush / not needed]
<!-- @end -->

<!-- @tech:miniapp -->
**Mini program platform**: [e.g.: WeChat / Alipay / Douyin / uni-app (multi-platform)]
**Base library version**: [e.g.: WeChat base library 3.x / uni-app Vue3]
**UI component library**: [e.g.: Vant Weapp / TDesign MiniProgram / native components]
**Cloud development**: [e.g.: WeChat CloudBase / not used]
**Publishing**: [e.g.: WeChat Public Platform / review cycle expectations]
<!-- @end -->

<!-- @style:miniapp -->
## Style & Tone

**Visual guidelines**: [Follow platform design spec (WeChat Weui / Alipay / Douyin) / custom brand style]
**Color direction**: [brand primary color / follow platform defaults / dark mode (if platform supports)]
**Component style**: [native components first / custom components / mixed]
**Motion preference**: [system default page transitions / custom transitions / no special requirement]
<!-- @end -->

<!-- @tech:desktop -->
**Desktop runtime**: [e.g.: Tauri 2 / Electron 33]
**IPC communication**: [e.g.: Tauri invoke/command / Electron ipcMain+ipcRenderer]
**System-level capabilities**: [e.g.: system tray, global hotkeys, file associations, clipboard — list what's needed]
**Packaging & distribution**: [e.g.: tauri-bundler (.dmg/.msi/.deb) / electron-builder / GitHub Releases]
**Auto-update**: [e.g.: tauri-updater / electron-updater / not needed]
<!-- @end -->

<!-- @tech:extension -->
**Target browsers**: [e.g.: Chrome + Edge / Firefox / all platforms]
**Manifest version**: [V3 (recommended) / V2 (Firefox compatibility)]
**Extension structure**: [e.g.: Popup only / Popup + Content Script / Background + Content Script + Popup]
**Permission declarations**: [e.g.: storage, tabs, activeTab — list what's needed]
**Publishing channel**: [e.g.: Chrome Web Store / Firefox Add-ons / private distribution]
<!-- @end -->

<!-- @tech:realtime -->
**Real-time transport**: [e.g.: Socket.io / native WebSocket / SSE / WebRTC]
**Real-time framework/hosting**: [e.g.: Ably / Pusher / Liveblocks / self-hosted]
**Room/channel model**: [e.g.: subscribe by user ID / room by document ID / broadcast]
**[?CRDT] Conflict resolution**: [e.g.: Yjs / Automerge / not needed (broadcast only)]
**Offline support**: [e.g.: offline queue + reconnect sync / not needed]
<!-- @end -->

<!-- @tech:ai -->
**LLM provider**: [e.g.: OpenAI GPT-4o / Anthropic Claude / Gemini / local Ollama]
**AI framework**: [e.g.: Vercel AI SDK / LangChain / LlamaIndex / direct API calls]
**Tool/Function Calling**: [e.g.: needed (list tool names) / not needed]
**Memory approach**: [e.g.: vector DB (pgvector/Pinecone) / sliding window history / none]
**[?MCP] MCP protocol**: [e.g.: @modelcontextprotocol/sdk / not needed]
**Streaming output**: [e.g.: SSE streaming / batch response]
<!-- @end -->

<!-- @style:mobile -->
## Style & Tone

**Visual keywords**: [e.g.: native feel, lightweight, immersive]
**Sizing approach**: [responsive dp/sp / fixed 375pt design base]
**Dark mode**: [follow system / light only / dark only]
**Motion preference**: [system native animations / custom transitions / no special requirement]
**Accessibility**: [e.g.: VoiceOver / TalkBack support / no special requirement]
<!-- @end -->

<!-- @style:desktop -->
## Style & Tone

**Visual style**: [e.g.: native OS style (Fluent/HIG) / custom brand style]
**Window management**: [e.g.: single main window + tray / multi-window / fullscreen-first]
**Dark mode**: [follow system / dark only / light only]
**Menu bar / system tray**: [e.g.: menu bar icon + quick actions / tray icon only / not needed]
<!-- @end -->

<!-- @style:extension -->
## Style & Tone

**Popup size convention**: [e.g.: 320×480px / 400×600px / adaptive]
**Visual style**: [e.g.: minimal card / blend with host page / independent brand]
**Content script injection style**: [e.g.: floating button / sidebar / highlight overlay]
<!-- @end -->

<!-- @style:realtime -->
## Style & Tone

**Collaboration awareness UI**: [e.g.: live cursors, user avatar list, typing indicators — list what's needed]
**Sync/conflict state display**: [e.g.: optimistic update + silent sync / explicit "syncing" indicator]
**Offline notification**: [e.g.: top banner / silent reconnect]
<!-- @end -->

<!-- @style:ai -->
## Style & Tone

**Interaction mode**: [conversational (chat UI) / tool-style (command + result) / hybrid]
**Streaming output display**: [e.g.: character-by-character typewriter / chunked loading / batch response]
**Error / fallback UX**: [e.g.: show fallback model name / retry button / silent degradation]
<!-- @end -->
