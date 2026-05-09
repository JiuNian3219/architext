# Changelog / 更新日志

本文件记录所有重要变更，格式遵循 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)，版本号遵循 [语义化版本](https://semver.org/spec/v2.0.0.html)。

All notable changes are documented here, following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased](https://github.com/JiuNian3219/architext/compare/v0.0.7...HEAD) / 待发布

---

## [0.0.7](https://github.com/JiuNian3219/architext/compare/v0.0.6...v0.0.7) - 2026-05-09

### Added / 新增

- 新增 Continuation 机制，避免协议执行中的中间产物被误当作最终回复。
- 新增任务状态校准指引与配套 Skill 资产，强化 plan/detail 与 code 阶段的状态门控。
- 扩展测试覆盖，补充 brief 解析、能力标记解析、IDE 集成、渲染器与 roadmap 行为等场景。

### Changed / 变更

- 重写公开工作流文档，使其贴合当前 `init` / `plan` / `code` / `review` 生命周期。
- 重组模板资产目录，从旧的 `docs/` 布局调整为部署态的 `global`、`prompts`、`shared`、`skills` 与 `templates` 结构。
- 优化 prompt 与 rule 表述，增强任务拆分、代码生成、审查和下一步推荐逻辑。

### Fixed / 修复

- 通过刷新 lockfile 修复依赖元数据。
- 修复任务推荐逻辑，避免未补齐 spec / plan 或尚未规划完成的任务过早进入 code 阶段。
- 修复 roadmap、渲染器和 scaffold 的若干边界场景，并用新增测试覆盖回归。

---

## [0.0.6](https://github.com/JiuNian3219/architext/releases/tag/v0.0.6) - 2026-03-17

### Added / 新增

- `/archi.script` 命令 — 生成自动化脚本 / Added `/archi.script` command for generating automation scripts
- `error_memory.json` — 错误记忆库，记录关键词签名与历史解决方案 / Added `error_memory.json` for error pattern tracking
- 桌面通知功能 — 支持 IDE 事件通知 / Added desktop notification support
- AI Git 工作流相关条目 / Added AI Git workflow entries
- IDE 通知配置检查功能 / Added IDE notification configuration check
- UI 概念设计支持多文件生成 / Enhanced UI wireframe with multi-file generation

### Changed / 变更

- 系统文档重构 — 合并分散规则至 00_system.md / Refactored system docs, merged scattered rules into 00_system.md
- 双层架构与资产体系增强 / Enhanced dual-layer architecture and asset system
- 网站部署和页面更新 — SEO 优化 / Updated website deployment and pages with SEO optimization
- 数据治理与文件同步流程优化 / Optimized data governance and file sync flow
- 技能文档精简与一致性提升 / Streamlined skills documentation

### Fixed / 修复

- 修复 file-model 测试 — 添加缺失的 script prompt 和全局种子文件 / Fixed file-model tests by adding missing script prompts
- 修复 IDE 和 Claude 通知集成不生效问题 / Fixed IDE and Claude notification integration
- 修复能力标记解析器 — 命令功能检测 / Fixed capability marker parser for command detection
- 修复模板表述 — 避免功能被误解为任务 / Fixed template wording to prevent feature-task confusion

---

## [0.0.5](https://github.com/JiuNian3219/architext/releases/tag/v0.0.5) - 2026-03-06

### Added / 新增

- `FileModel` 注册表，实现声明式文件管理，替代分散的路径硬编码 / Introduced FileModel registry for declarative file management
- `archi init` 支持 `--yes` 和 `--brief` flag，实现非交互式初始化 / Added `--yes` and `--brief` flags for non-interactive init
- Brief 附件资产目录支持（`_modules.md` 等附件模块）/ Added Brief attachment asset directory support
- Skill 类型声明（`type: specialist` / `type: reviewer`）/ Added Skill type classification in frontmatter

### Changed / 变更

- 重构 `init`、`uninstall`、`update` 命令，基于 FileModel 驱动，逻辑更一致 / Refactored commands to be driven by FileModel
- 拆分 `scaffold.ts` 为 `brief.ts` 和 `ide-integrations.ts`，拆分 `index.ts` 为 `collector.ts` 和 `serializer.ts` / Decomposed large source files for clarity
- 精简 14 个中文协议文件，总行数从 2474 压缩至 1852（-25%）/ Compressed 14 zh protocol files by 25%
- `01_workflow.md` 改造为 Chat Mode：高频命令（plan/code/edit/fix/scope）支持自然语言触发，AI 自动加载协议执行 / Workflow now supports natural-language intent detection for high-frequency commands
- 两阶段协议生成合并为统一协议，减少用户操作步骤 / Merged two-phase protocol generation into single flow
- 更新触发器描述，支持自然语言触发 / Updated trigger descriptions to support natural language
- 补充 `01_workflow` 中 `ref` 与 `recover` 命令路由 / Added routing for `ref` and `recover` commands

### Fixed / 修复

- 修正 `inherit` 协议表述，避免误导用户认为会覆盖既有 `.architext` 数据 / Fixed `inherit` wording to prevent misunderstanding about overwriting existing data
- 补全 zh prompts 到 en 的完整翻译 / Completed full translation of zh prompts to en

---

## [0.0.4](https://github.com/JiuNian3219/architext/releases/tag/v0.0.4) - 2026-03-01

### Added / 新增

- `archi pack` + `/archi.recover` — 用户数据备份与恢复流程 / User data backup and restore flow
- `/archi.ref` — 外部知识引用管理命令 / External knowledge reference management command
- `design.md` 技术方案设计模板与 `archi-design-patterns` Skill / Design template and archi-design-patterns Skill
- 项目初始化流程支持可选生成 `project-brief.md` / Init flow supports optional `project-brief.md` generation
- 子代理审查层与内容切片机制 / Sub-agent review layer and content slicing mechanism
- 维度积木 spec 骨架、WBS 分解与任务类型体系 / Spec skeleton, WBS decomposition and task type system
- OpenCode、Claude Code 作为目标 IDE 支持 / OpenCode and Claude Code as target IDE options
- 网站 Iterate 区块，Workflow 简化为 start → plan → code → audit 四阶段 / Website Iterate section, simplified Workflow to four stages

### Changed / 变更

- 移除 zh-Hant 支持，简化为 zh + en 双语 / Removed zh-Hant, simplified to zh + en
- 项目类型重构为特征标签体系 / Project type refactored to feature tag system
- 移除 terminal-gate-base、status-gate 共享片段，内联至各协议 / Inlined shared gate snippets into protocols

### Fixed / 修复

- 更新 prompts 时解析 `[[SKILL:...]]` / `[[NO-SKILL:...]]` 能力标记 / Parse capability refs when updating prompts
- 统一 templates 中 Skill 调用格式 / Unified Skill invocation format in templates
- 在 `02_tech_stack` 中为 ITP 固定协议添加分区标记 / Added section markers for ITP fixed protocols
- 明确协议可覆盖 `00_system` 的范围 / Clarified protocol override scope for `00_system`
- 在 `00_system` 中定义跨文件规则优先级链 / Defined cross-file rule priority chain

---

## [0.0.3](https://github.com/JiuNian3219/architext/releases/tag/v0.0.3) - 2026-02-27

### Fixed / 修复

- `archi init` 冲突检测现在展示全部冲突文件，移除之前的 5 条显示上限 / `archi init` conflict detection now shows all conflicting files, removing the previous 5-item display limit
- `archi uninstall` 补全 Skills 文件（`.cursor/skills/archi-*/` 等）的删除逻辑，之前这些文件不会被清理 / `archi uninstall` now correctly removes Skills directories (e.g. `.cursor/skills/archi-*/`), which were previously left behind
- `archi uninstall` 删除文件后自动清理空目录（rules、commands、skills 及编辑器根目录），解决目录残留问题 / `archi uninstall` now removes empty directories (rules, commands, skills, and editor root dirs) after file deletion
- 官网落地页版本号改为构建时从 npm 注册表拉取，始终显示已发布版本，不再依赖本地 package.json / Website landing page version is now fetched from npm registry at build time, always showing the published version instead of local package.json

---

## [0.0.2](https://github.com/JiuNian3219/architext/releases/tag/v0.0.2) - 2026-02-27

> 首个正式上线版本（0.0.1 因发布流程问题未能正常上线）
> First properly released version (0.0.1 failed to publish due to a release process issue)

### Added / 新增

- Architext CLI 初始发布 / Initial release of Architext CLI
- `archi init` — 部署框架文件（规则、Prompt、Skills），交互式选择 IDE（支持 Cursor、Windsurf、Trae、VS Code）/ Deploy framework files (rules, prompts, skills) with interactive IDE selection (Cursor, Windsurf, Trae, VS Code)
- `archi update` — 将已部署的框架文件更新至最新版本 / Update deployed framework files to the latest version
- `archi doctor` — 项目健康检查 / Project health check
- `archi render` — 将 JSON 数据文件生成可读 Markdown 视图 / Generate Markdown views from JSON data files
- `archi task` — 查看、校验并更新 Roadmap 任务状态 / View, validate and update Roadmap task status
- `archi template` — 获取模板文件到项目根目录 / Fetch template files to project root
- 三语模板支持：简体中文（zh）、繁体中文（zh-Hant）、英文（en）/ Tri-language template support
- 完整 `/archi.*` Prompt 协议套件：`start`、`inherit`、`scope`、`plan`、`code`、`edit`、`revise`、`audit`、`fix`、`map`、`remove`、`help`
- Agent Skills：`archi-decompose-roadmap`、`archi-interview-protocol`、`archi-plan-options`、`archi-ui-wireframe`
- 全局上下文资产：`roadmap.json`、`vision.md`、`map.json`、`dictionary.json`、`design_tokens.json`、`data_snapshot.json`、`error_codes.json`
- IDE 规则文件：`00_system`、`01_workflow`、`02_tech_stack`、`03_data_governance`、`04_cli_tools`、`90_custom_rules`、`99_context_glue`
- 双语文档支持（英文 + 简体中文）/ Bilingual documentation (English + Simplified Chinese)
- GitHub 社区文件：贡献指南、Issue 模板、PR 模板 / GitHub community files: CONTRIBUTING, issue templates, PR template
- GitHub Actions CI 与自动发布流程 / GitHub Actions CI and automated release workflow
- 架构参考文档 `docs/internals.md` / Architecture reference document `docs/internals.md`

### Fixed / 修复

- 修复 npm 页面 README 链接无法跳转 / Fix README links not working on npm package page
- 修正 CONTRIBUTING 中的仓库地址 / Fix repository URL in CONTRIBUTING

---

## [0.0.1](https://github.com/JiuNian3219/architext/releases/tag/v0.0.1) - 2026-02-26

### Added / 新增

- Architext CLI 初始发布 / Initial release of Architext CLI
- `archi init` — 部署框架文件（规则、Prompt、Skills），交互式选择 IDE（支持 Cursor、Windsurf、Trae、VS Code）/ Deploy framework files (rules, prompts, skills) with interactive IDE selection (Cursor, Windsurf, Trae, VS Code)
- `archi update` — 将已部署的框架文件更新至最新版本 / Update deployed framework files to the latest version
- `archi doctor` — 项目健康检查 / Project health check
- `archi render` — 将 JSON 数据文件生成可读 Markdown 视图 / Generate Markdown views from JSON data files
- `archi task` — 查看、校验并更新 Roadmap 任务状态 / View, validate and update Roadmap task status
- `archi template` — 获取模板文件到项目根目录 / Fetch template files to project root
- 三语模板支持：简体中文（zh）、繁体中文（zh-Hant）、英文（en）/ Tri-language template support
- 完整 `/archi.*` Prompt 协议套件：`start`、`inherit`、`scope`、`plan`、`code`、`edit`、`revise`、`audit`、`fix`、`map`、`remove`、`help`
- Agent Skills：`archi-decompose-roadmap`、`archi-interview-protocol`、`archi-plan-options`、`archi-ui-wireframe`
- 全局上下文资产：`roadmap.json`、`vision.md`、`map.json`、`dictionary.json`、`design_tokens.json`、`data_snapshot.json`、`error_codes.json`
- IDE 规则文件：`00_system`、`01_workflow`、`02_tech_stack`、`03_data_governance`、`04_cli_tools`、`90_custom_rules`、`99_context_glue`
- 双语文档支持（英文 + 简体中文）/ Bilingual documentation (English + Simplified Chinese)
- GitHub 社区文件：贡献指南、Issue 模板、PR 模板 / GitHub community files: CONTRIBUTING, issue templates, PR template
- GitHub Actions CI 与自动发布流程 / GitHub Actions CI and automated release workflow
