<protocol_init_router>
**Trigger**: `/archi.init [args...]` | Intent Card 指向 `/archi.init` 时加载
**Goal**: 路由分发器——根据 Intent Card、Context Pack、工作目录状态和当前参数，分发到 start / inherit / recover 三选一。

<meta>
	<style>Decisive, Non-interactive</style>
	<language>简体中文</language>
	<principles>
		Deterministic First: 优先用工作目录的客观信号判断，禁从 `[args]` 自然语言推测意图。
		Explicit Routing: 判断结果显性输出（用户可中断），禁静默跳转。
	</principles>
</meta>

<step_1_scan>
优先读取 Intent Card + Context Pack：
- 若 `command` 不是 `/archi.init` → 停止，提示调用方按 Intent Card 加载正确协议。
- 若 Context Pack 缺失 → 回到 `00_system.md` Front Pipeline 补齐；若 `missing_or_stale` 非空，先处理缺口或向用户说明。
- 若 `subprotocol` 为 `recover` 且 pack 文件路径明确 → 直接按 recover 路径处理。
- 若 `subprotocol` 为 `start` / `inherit`，仍须结合工作目录状态验证，避免把已有项目误初始化。

Seed 识别规则：
- `npx archi init` 部署到 `[[__DOCS_DIR__]]/global/` 的文件是 scaffold seed，不是项目事实。
- 若 `vision.md` 含 `architextTemplate: true`、`Status: Template`、`未初始化`、`[项目名称]`、`[Project Name]`、`待 /archi.init` 任一标记，视为模板占位，不得判定为"项目已初始化"。
- 若 vision 被判定为模板，则 `global/` 下当前 seed 文件都不得作为项目事实；即使旧版 `roadmap.json` 仍含 `INF-01` / `FEAT-01` 示例任务，也必须当作 scaffold seed。
- 若任一 `global/*.json` 含 `architextTemplate: true`、`status: "template-uninitialized"` 或 `lastUpdated: "TEMPLATE"`，只把它当结构说明和待填充占位，不得把 `_fieldGuide` 或空数组推断为项目事实。
- 若 `roadmap.json.projectStatus == "template-uninitialized"` 或 `lastUpdated == "TEMPLATE"` 或 `tasks == []` 且 vision 为模板，占位 roadmap 不得用于源码一致性检查、漂移判断或需求推断。
- 路由阶段只用 seed 文件判断"是否仍是模板"，不要把 seed 内容作为 `relevant_facts` 传给 start / inherit。

按优先级扫描以下信号，首条匹配即处理：

| # | 信号 | 判定 | 路由目标 |
|:---|:---|:---|:---|
| 1 | `[args]` 含 `.xml` 路径且文件存在可读 | pack 文件 | `init/recover.md` |
| 2 | `[args]` 含 `.xml` 路径但文件不存在/损坏 | - | 停止，报错"pack 文件无法读取" |
| 3 | `[[__DOCS_DIR__]]/global/vision.md` 已填充，且不命中 Seed 识别规则 | 项目已初始化 | 停止，提示"项目已初始化，请使用 /archi.plan 或 /archi.change" |
| 4 | 根目录存在 package.json / go.mod / Cargo.toml / pyproject.toml / pom.xml / build.gradle 任一 | 有源码 | `init/inherit.md`（若 `[args]` 指向 brief，作为混合模式传入） |
| 5 | 根目录或 `[[__DOCS_DIR__]]/` 存在 `project-brief.md` 且非空 | 有 brief 无源码 | `init/start.md` |
| 6 | `[args]` 指向某个 `.md` 文件 | 显式指定 brief | `init/start.md`（`[args]` 作为 brief_path） |
| 7 | 均不匹配 | 状态不明 | 进入 `step_1b_clarify` |
</step_1_scan>

<step_1b_clarify>
step_1 未命中时触发。向用户输出 3 选 1 问题并等待回答后重新扫描：

- [A] 从零开始（空项目，已有或准备写 Brief）→ 先运行 `npx archi init` 生成 `project-brief.md` 模板，填完后重跑 `/archi.init`
- [B] 纳管已有代码（有遗产码库）→ 确认项目根存在配置文件（package.json 等）；无则告知项目类型
- [C] 从备份恢复 → 提供 pack 文件路径：`/archi.init <path-to-pack.xml>`
</step_1b_clarify>

<step_2_report>
step_1 命中路由时显性输出决策：`判断路由：<mode>；依据：<具体命中信号>；子协议：init/<mode>.md`。
</step_2_report>

<step_3_dispatch>
1. 读取 `[[__DOCS_DIR__]]/prompts/init/<mode>.md` 内容
2. 从 `[args]` 提取子协议所需参数（brief_path / pack-file-path 等）注入上下文
3. 将子协议作为当前 active protocol 继续执行；本文件退出
</step_3_dispatch>
</protocol_init_router>
