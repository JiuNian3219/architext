<!-- @tech:ui -->
**CSS/UI approach**: [e.g.: TailwindCSS + Shadcn/UI / Ant Design / plain CSS]
<!-- @end -->

<!-- @tech:data -->
**Database**: [e.g.: PostgreSQL / MongoDB / SQLite]
**ORM / Query Builder**: [e.g.: Prisma / Drizzle / TypeORM]

### Data Model Draft

> If you already know core data entities and relationships, describe them here. No need for full schema—list entity names and key fields.
> AI will generate detailed data model in `/archi.plan`; here just clarify "what data exists."
> Leave blank if not applicable; AI will derive from core tasks.

<!-- Format reference:
- **User**: email, name, role (admin/user), avatar
- **Post**: title, content, status (draft/published), author → User
- **Comment**: body, author → User, post → Post
- User 1:N Post, Post 1:N Comment
-->

<!-- @end -->

<!-- @tech:api -->
**API style**: [e.g.: RESTful / GraphQL / gRPC / tRPC]

### Existing API Endpoints

> If you have existing backend API (self-hosted or third-party), list core endpoints here. Or place full docs in `brief-assets/`.
> Leave blank if not applicable.

<!-- Format reference:
- `POST /auth/login` → returns JWT token
- `GET /users/:id` → user detail
- `POST /posts` → create post (auth required)
- Full docs: [API docs] ./brief-assets/api-spec.yaml
-->

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

**Aesthetic direction** (pick the closest match; leave blank for AI to recommend):
<!-- Pick one, or write "custom" and describe below -->
<!-- saas-dark    — like Linear/Vercel/Raycast: dark bg, high contrast, minimal, sharp edges -->
<!-- saas-light   — like Notion/Stripe/GitHub: white bg, thin borders, system fonts, breathing room -->
<!-- dashboard    — like Grafana/Datadog: info-dense, card grids, data-first -->
<!-- marketing    — like Loom/Framer: large headings, gradients, visual impact, narrative -->
<!-- mobile-app   — like Telegram/Bear: large radius, wide spacing, touch-friendly -->
<!-- editorial    — like Medium/Substack: typography-first, serif fonts, reading immersion -->
<!-- brutalist    — like Craigslist/HN: function-first, no decoration, raw -->
<!-- custom       — describe your desired style in "Custom description" below -->

**Aesthetic direction**: [e.g.: saas-dark / saas-light / dashboard / marketing / mobile-app / editorial / brutalist / custom]
**Custom description**: [only for "custom", e.g.: "Spotify-like dark + green accent + card-based layout"]

**Information density**: [generous whitespace/immersive / dense/dashboard-style]
**Motion preference**: [subtle micro-interactions / rich animation / no animation]

### Visual Reference

> Provides aesthetic input for AI—directly impacts `ui_concept.html` visual quality.
> Any field below is valid; the more you fill, the better AI can match your expected style.

**Competitor/inspiration screenshots**: [paste image / Figma link / URL]
**Brand palette**: [primary color Hex / gradient description / none (AI generates from aesthetic direction)]
**Font preference**: [e.g.: JetBrains Mono + Space Grotesk / Playfair Display / no preference (AI picks from aesthetic direction)]
**Icon library**: [e.g.: Lucide / Heroicons / Tabler / no preference]
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
**(CRDT projects only) Conflict resolution**: [e.g.: Yjs / Automerge / not needed (broadcast only)]
**Offline support**: [e.g.: offline queue + reconnect sync / not needed]
<!-- @end -->

<!-- @tech:ai -->
**LLM provider**: [e.g.: OpenAI GPT-4o / Anthropic Claude / Gemini / local Ollama]
**AI framework**: [e.g.: Vercel AI SDK / LangChain / LlamaIndex / direct API calls]
**Tool/Function Calling**: [e.g.: needed (list tool names) / not needed]
**Memory approach**: [e.g.: vector DB (pgvector/Pinecone) / sliding window history / none]
**(MCP projects only) MCP protocol**: [e.g.: @modelcontextprotocol/sdk / not needed]
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
