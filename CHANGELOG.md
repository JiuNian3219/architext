# Changelog / 更新日志

本文件记录所有重要变更，格式遵循 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)，版本号遵循 [语义化版本](https://semver.org/spec/v2.0.0.html)。

All notable changes are documented here, following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased](https://github.com/JiuNian3219/architext/compare/v0.0.3...HEAD) / 待发布

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

