# Contributing to Architext / 贡献指南

[English](#contributing-english) · [简体中文](#contributing-chinese)

---

<a name="contributing-english"></a>

## Contributing (English)

Thank you for your interest in contributing to Architext! This document covers everything you need to get started.

### Prerequisites

- **Node.js** >= 18
- **npm** or **pnpm**
- A code editor with TypeScript support (Cursor recommended)

### Development Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/JiuNian3219/architext.git
cd architext

# 2. Install dependencies
npm install
# or
pnpm install

# 3. Build the project
npm run build

# 4. Link locally for testing
npm link
archi --version
```

### Development Workflow

```bash
# Run in dev mode (no build required)
npm run dev -- init

# Build
npm run build

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Lint and format check
npm run lint
```

### Project Structure

```
src/
├── index.ts          # Entry point, CLI definition (cac)
├── commands/         # One folder per command
│   └── <name>/
│       └── index.ts  # Command handler, named export <name>Command
├── core/             # Config, error handling, logger
└── utils/            # Shared helpers and constants

templates/            # Prompt and rule templates (core product asset)
├── zh/               # Simplified Chinese templates
└── en/               # English templates
```

### Commit Convention

This project uses **Conventional Commits** (Angular preset). Your commits must follow this format:

```
<type>(<scope>): <subject>

feat(init): add Windsurf IDE support
fix(render): handle empty roadmap edge case
docs(readme): update quick start section
chore(deps): upgrade vitest to v4
```

| Type | When to use |
|:---|:---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `chore` | Tooling, dependencies, config |

Commits that don't follow this format will be **rejected by the pre-commit hook**.

### Submitting a Pull Request

1. Create a branch from `main`: `git checkout -b feat/your-feature-name`
2. Make your changes
3. Ensure all tests pass: `npm run test:run`
4. Ensure lint passes: `npm run lint`
5. Push and open a PR against `main`
6. Fill in the PR template

### Working on Templates

Templates in `templates/` are the **core product asset** — they directly affect what users generate in their projects. Please follow these rules:

- **Bilingual sync**: If you modify any file under `templates/zh/`, you **must** also update the corresponding file in `templates/en/`. The structure (XML tags, table columns, step count) must be identical across both.
- **No breaking changes to protocol structure** without discussion in an issue first.
- Keep the `<meta>`, `<step_1_load>`, and `<step_N_signoff>` blocks in every protocol file — they are mandatory.

### Architecture Reference

If you want to understand the internal mechanics — how each command reads/writes assets, Gate logic, Chat Mode behavior, and the complete read/write matrix — read [`docs/internals.md`](docs/internals.md). It's the most complete technical reference for the system.

### Reporting Issues

Please use the issue templates:
- **Bug**: Something isn't working as expected
- **Feature Request**: An idea for a new feature or improvement

---

<a name="contributing-chinese"></a>

## 贡献指南（简体中文）

感谢你对 Architext 的关注！本文档涵盖所有你需要了解的上手信息。

### 环境要求

- **Node.js** >= 18
- **npm** 或 **pnpm**
- 支持 TypeScript 的编辑器（推荐 Cursor）

### 开发环境搭建

```bash
# 1. Fork 并克隆仓库
git clone https://github.com/JiuNian3219/architext.git
cd architext

# 2. 安装依赖
npm install
# 或
pnpm install

# 3. 构建项目
npm run build

# 4. 本地链接以便测试
npm link
archi --version
```

### 开发命令

```bash
# 开发模式运行（无需提前构建）
npm run dev -- init

# 构建
npm run build

# 运行测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 代码检查与格式校验
npm run lint
```

### 目录结构

```
src/
├── index.ts          # 入口文件，CLI 定义（cac）
├── commands/         # 每个命令一个文件夹
│   └── <name>/
│       └── index.ts  # 命令处理器，具名导出 <name>Command
├── core/             # 配置、错误处理、日志
└── utils/            # 共享工具函数与常量

templates/            # Prompt 与规则模板（核心产品资产）
├── zh/               # 简体中文模板
└── en/               # 英文模板
```

### Commit 规范

本项目使用 **Conventional Commits**（Angular 预设）。提交信息须遵循以下格式：

```
<类型>(<范围>): <描述>

feat(init): 新增 Windsurf IDE 支持
fix(render): 处理 roadmap 为空的边界情况
docs(readme): 更新快速开始章节
chore(deps): 升级 vitest 至 v4
```

| 类型 | 使用场景 |
|:---|:---|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 仅文档变更 |
| `refactor` | 重构（不修复 Bug，不新增功能） |
| `test` | 新增或更新测试 |
| `chore` | 工具链、依赖、配置变更 |

不符合规范的提交会被 **pre-commit hook 拒绝**。

### 提交 Pull Request

1. 从 `main` 创建分支：`git checkout -b feat/your-feature-name`
2. 完成修改
3. 确保测试通过：`npm run test:run`
4. 确保 lint 通过：`npm run lint`
5. Push 并向 `main` 发起 PR
6. 填写 PR 模板

### 修改模板文件

`templates/` 目录下的文件是**核心产品资产**，会直接影响用户项目的生成结果。请遵循以下规则：

- **双语同步**：修改 `templates/zh/` 下的任何文件时，**必须**同步更新 `templates/en/` 中的对应文件。两个版本的结构（XML 标签、表格列数、步骤数量）必须完全一致，仅内容语言不同。
- **禁止在未经讨论的情况下破坏性修改协议结构**，请先在 Issue 中讨论。
- 每个协议文件中的 `<meta>`、`<step_1_load>`、`<step_N_signoff>` 三个区块为**强制项**，不可删除。

### 架构参考文档

如果你想深入理解内部机制——每个命令的资产读写关系、Gate 逻辑、Chat Mode 行为、完整读写矩阵——请阅读 [`docs/internals.md`](docs/internals.md)，这是系统最完整的技术参考。

### 提交 Issue

请使用 Issue 模板：
- **Bug 报告**：功能未按预期工作
- **功能请求**：新功能或改进建议
