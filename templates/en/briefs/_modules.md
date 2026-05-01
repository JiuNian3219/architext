<!-- @tech:ui -->
**CSS/UI Solution**: [E.g., TailwindCSS + Shadcn/UI / Ant Design / Native CSS]
<!-- @end -->

<!-- @tech:data -->
**Database**: [E.g., PostgreSQL / MongoDB / SQLite]
**ORM / Query Builder**: [E.g., Prisma / Drizzle / TypeORM]

### Data Model Draft

> If you already know core data entities and relationships, describe them here. No need to write complete Schema—just list entity names and key fields.
> AI will generate detailed data models in `/archi.plan` phase; here you only need to clarify "what data exists".
> Leave blank if none, AI will infer from core features.

<!-- Example format:
- **User**: email, name, role (admin/user), avatar
- **Post**: title, content, status (draft/published), author → User
- **Comment**: body, author → User, post → Post
- User 1:N Post, Post 1:N Comment
-->

<!-- @end -->

<!-- @tech:api -->
**API Style**: [E.g., RESTful / GraphQL / gRPC / tRPC]

### Existing API Endpoints

> If you have existing backend APIs (self-built or third-party), list core endpoints here. You can also put complete docs in `brief-assets/`.
> Leave blank if none.

<!-- Example format:
- `POST /auth/login` → Returns JWT token
- `GET /users/:id` → User details
- `POST /posts` → Create post (requires auth)
- Complete docs: [API Docs] ./brief-assets/api-spec.yaml
-->

<!-- @end -->

<!-- @tech:cli -->
**CLI Framework**: [E.g., cac / commander / clap (Rust) / cobra (Go)]
**Distribution Method**: [E.g., npm publish / GitHub Releases / Binary]
<!-- @end -->

<!-- @tech:lib -->
**Module Format**: [E.g., ESM / CJS + ESM dual output]
**Target Platform**: [E.g., Browser + Node.js / Node.js only]
**Distribution Channel**: [E.g., npm / PyPI / crates.io]
<!-- @end -->

<!-- @style:ui -->
## Style & Tone

**Aesthetic Direction** (Choose one closest, leave blank for AI recommendation):
<!-- Choose one, or write custom and describe below -->
<!-- saas-dark    — Similar to Linear/Vercel/Raycast: dark background, high contrast, minimalist, sharp edges -->
<!-- saas-light   — Similar to Notion/Stripe/GitHub: white background, thin borders, system fonts, breathing room -->
<!-- dashboard    — Similar to Grafana/Datadog: information-dense, card grids, data-first -->
<!-- marketing    — Similar to Loom/Framer: large titles, gradients, visual impact, narrative -->
<!-- mobile-app   — Similar to Telegram/Bear: large rounded corners, wide spacing, touch-friendly -->
<!-- editorial    — Similar to Medium/Substack: typography-first, serif fonts, reading immersion -->
<!-- brutalist    — Similar to Craigslist/HN: functionally minimalist, no decoration, raw feel -->
<!-- custom       — Write your desired style in "Custom Description" -->

**Aesthetic Direction**: [E.g., saas-dark / saas-light / dashboard / marketing / mobile-app / editorial / brutalist / custom]
**Custom Description**: [Only for custom, e.g., "Similar to Spotify's dark + green accent + card layout"]

**Information Density**: [Large whitespace/immersive / Information-dense/dashboard style]
**Animation Preference**: [Light micro-interactions / Rich animations / No animation]

### Visual Reference

> Provide aesthetic inputs for AI, directly affecting visual quality of prototypes in `screens/` directory.
> Any one of the following is valid; more inputs help AI better match your expected style.

**Competitor/Inspiration Screenshots**: [Paste images / Figma link / URL]
**Brand Palette**: [Primary color Hex / Gradient description / None (AI generates based on aesthetic direction)]
**Font Preference**: [E.g., JetBrains Mono + Space Grotesk / Playfair Display / No preference (AI selects based on aesthetic direction)]
**Icon Library**: [E.g., Lucide / Heroicons / Tabler / No preference]
**Forbidden Styles**: [E.g., No gradient backgrounds / No cartoon illustrations / No restrictions]
<!-- @end -->

<!-- @style:cli -->
## Style & Tone

**Output Style**: [Concise single line / Structured colorful / JSON machine-readable]
**Interaction Mode**: [Pure argument-driven / Interactive prompts / Hybrid]
**Error Display**: [Concise message / Detailed stack / Tiered (--verbose)]
<!-- @end -->

<!-- @style:api -->
## Style & Tone

**Documentation Solution**: [OpenAPI/Swagger / GraphQL Schema / Handwritten docs]
**Error Response Format**: [RFC 7807 / Custom JSON / GraphQL errors]
**Versioning Strategy**: [URL path /v1 / Header / No versioning]
<!-- @end -->

<!-- @tech:mobile -->
**Mobile Runtime**: [E.g., React Native 0.76 / Flutter 3 / Expo SDK 52]
**UI Component Library**: [E.g., RN Paper / NativeWind / NativeBase / Native components]
**Navigation Solution**: [E.g., React Navigation 7 / Expo Router / Go Router]
**Native Capabilities**: [E.g., Camera, push notifications, biometrics—list needed ones]
**Distribution Channels**: [E.g., App Store + Play Store / Expo Go / TestFlight]
**OTA Hot Update**: [E.g., Expo Updates / CodePush / Not needed]
<!-- @end -->

<!-- @tech:miniapp -->
**Mini Program Platform**: [E.g., WeChat / Alipay / Douyin / uni-app (multi-platform)]
**Base Library Version**: [E.g., WeChat base library 3.x / uni-app Vue3]
**UI Component Library**: [E.g., Vant Weapp / TDesign MiniProgram / Native components]
**Cloud Development**: [E.g., WeChat cloud development / Not using]
**Distribution**: [E.g., WeChat public platform release / Review cycle agreement]
<!-- @end -->

<!-- @style:miniapp -->
## Style & Tone

**Visual Guidelines**: [Follow platform design guidelines (WeChat WeUI / Alipay / Douyin) / Custom brand style]
**Color Tendency**: [Brand primary color / Follow platform defaults / Dark mode (requires platform support)]
**Component Style**: [Native components primary / Custom components / Mixed]
**Animation Preference**: [System default page transitions / Custom transitions / No special requirements]
<!-- @end -->

<!-- @tech:desktop -->
**Desktop Runtime**: [E.g., Tauri 2 / Electron 33]
**IPC Communication**: [E.g., Tauri invoke/command / Electron ipcMain+ipcRenderer]
**System-level Capabilities**: [E.g., System tray, global hotkeys, file association, clipboard—list needed ones]
**Packaging Distribution**: [E.g., tauri-bundler (.dmg/.msi/.deb) / electron-builder / GitHub Releases]
**Auto Update**: [E.g., tauri-updater / electron-updater / Not needed]
<!-- @end -->

<!-- @tech:extension -->
**Target Browser**: [E.g., Chrome + Edge / Firefox / All platforms]
**Manifest Version**: [V3 (recommended) / V2 (Firefox compatibility needed)]
**Extension Structure**: [E.g., Only Popup / Popup + Content Script / Background + Content Script + Popup]
**Permission Declarations**: [E.g., storage, tabs, activeTab—list needed ones]
**Publishing Channels**: [E.g., Chrome Web Store / Firefox Add-ons / Private distribution]
<!-- @end -->

<!-- @tech:realtime -->
**Real-time Transport Solution**: [E.g., Socket.io / Native WebSocket / SSE / WebRTC]
**Real-time Framework/Hosting**: [E.g., Ably / Pusher / Liveblocks / Self-hosted]
**Room/Channel Model**: [E.g., Subscribe by user ID / Room by document ID / Broadcast]
**(CRDT projects only) Collaboration Conflict Resolution**: [E.g., Yjs / Automerge / Not needed (broadcast only)]
**Offline Support**: [E.g., Offline queue + reconnect sync / Not needed]
<!-- @end -->

<!-- @tech:ai -->
**LLM Provider**: [E.g., OpenAI GPT-4o / Anthropic Claude / Gemini / Local Ollama]
**AI Framework**: [E.g., Vercel AI SDK / LangChain / LlamaIndex / No framework direct API call]
**Tool/Function Calling**: [E.g., Needed (list tool names) / Not needed]
**Memory Solution**: [E.g., Vector database (pgvector/Pinecone) / Sliding window history / None]
**(MCP projects only) MCP Protocol**: [E.g., @modelcontextprotocol/sdk / Not needed]
**Streaming Output**: [E.g., SSE streaming / Batch return]
<!-- @end -->

<!-- @style:mobile -->
## Style & Tone

**Visual Keywords**: [E.g., Native feel, lightweight, immersive]
**Adaptation Solution**: [E.g., Responsive dp/sp / Fixed design draft 375pt]
**Dark Mode**: [Follow system / Light only / Dark only]
**Animation Preference**: [System native animations / Custom transitions / No special requirements]
**Accessibility**: [E.g., VoiceOver / TalkBack support / No special requirements]
<!-- @end -->

<!-- @style:desktop -->
## Style & Tone

**Visual Style**: [E.g., Native system style (Fluent/HIG) / Custom brand style]
**Window Management**: [E.g., Single main window + tray / Multi-window / Fullscreen-first]
**Dark Mode**: [Follow system / Fixed dark / Fixed light]
**Menu Bar/System Tray**: [E.g., Menu bar icon + quick actions / Tray icon only / Not needed]
<!-- @end -->

<!-- @style:extension -->
## Style & Tone

**Popup Size Convention**: [E.g., 320×480px / 400×600px / Adaptive]
**Visual Style**: [E.g., Minimal card / Blend with target website / Independent brand]
**Content Script Injection Style**: [E.g., Floating button / Sidebar / Highlight overlay]
<!-- @end -->

<!-- @style:realtime -->
## Style & Tone

**Collaboration Awareness UI**: [E.g., Real-time cursors, user avatar list, typing indicators—list needed ones]
**Conflict/Sync Status Display**: [E.g., Optimistic update + silent sync / Explicit "syncing" display]
**Offline Prompt**: [E.g., Top banner prompt / Silent reconnect]
<!-- @end -->

<!-- @style:ai -->
## Style & Tone

**Interaction Mode**: [Conversational (chat UI) / Tool-type (command + result) / Hybrid]
**Streaming Output Display**: [E.g., Character-by-character print effect / Segment loading / Batch return]
**Error/Degradation Prompt**: [E.g., Show fallback model / Retry button / Silent degradation]
<!-- @end -->