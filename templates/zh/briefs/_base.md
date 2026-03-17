# Project Brief: [项目名称]

> 尽量填写，不确定的留空即可。完成后运行 `/archi.start project-brief.md`，AI 会通过选择题补全缺失信息。

---

## 项目概述

**项目名称**:
**一句话描述**: [项目是什么、为谁服务、解决什么问题]
**问题陈述**: [目标用户遇到的核心痛点？现有方案哪里不足？]

**目标用户**:
- **核心用户**: [角色/群体]
- **关键特征**: [技术水平、使用场景、行为习惯]

**成功指标**: [怎样算做成了？例：DAU 1000 / 被 100+ 项目采用 / P99 < 200ms]

---

## 功能需求

> 必须实现的核心能力，描述"做什么"而非"怎么做"。
> AI 会据此分解为具体的实现任务，此处只需明确业务目标。

-
-
-

---

## 业务流程

> 如果你的项目有明确的用户旅程或核心工作流，在此描述。
> 不需要画图——用文字描述步骤即可，AI 会据此理解系统行为。
> 没有的话留空，AI 会从核心功能中推导。

<!-- 写法参考：
### [流程名称]
1. 用户 [动作] → 系统 [响应]
2. 用户 [动作] → 系统 [响应]
3. ...
-->

---

## 已有设计决策

> 如果你对某些功能/页面/流程已有明确想法，在此描述。AI 在后续 plan 阶段会以此为准，不会推翻。
> 没有的话留空即可。
>
> 写法参考：
> - **[功能/页面名]**: 描述具体行为、流程、约束
> - 可附截图/草图（见下方"设计资产"）

---

## 技术栈

> 已确定的直接填写。不确定的留空或写"推荐"，AI 会基于项目特征推荐。

**项目特征**: [[__PROJECT_TYPE__]]
<!-- archi init 自动填入（逗号分隔的特征标签）；手动填写时从 ui/data/api/cli/lib/mobile/desktop/miniapp/extension/realtime/ai 中选择 -->
**语言/运行时**: [例：TypeScript + Node.js 22]
**核心框架**: [例：Next.js 15 / Fastify / Tauri]
**包管理器**: [例：pnpm / npm / yarn / cargo]
**构建工具**: [例：Vite / tsup / Webpack / esbuild / cargo / go build]
**Linter / Formatter**: [例：ESLint + Prettier / Biome / ruff / clippy + rustfmt]
<!-- @slot:tech -->
**部署目标**: [例：Vercel / Docker / npm publish / 二进制分发]
**关键第三方库**: [例：Zod, TanStack Query, Lucia Auth]

**技术红线** (禁用的技术/方案):
- [例：不用 jQuery；不用 CSS-in-JS]

---

## 工程规范

> 已有的工程约定。不确定的留空，AI 会基于技术栈推荐合理默认值。

**仓库形态**: [Monorepo (Turborepo/Nx/pnpm workspaces) / 单体仓库]
**架构模式**: [例：MFA / FSD / Clean Architecture / 分层架构 / 无偏好（AI 推荐）]
**目录结构**: [已有明确结构 → 简述关键目录 / 无（AI 基于架构模式生成）]
**分支策略**: [例：Trunk-based / Git Flow / GitHub Flow]
**Commit 规范**: [例：Conventional Commits (feat/fix/chore) / 自定义 → 简述]

**AI Git 工作流** (AI 执行 `/archi.code` 时的提交约定):
- **自动提交**: [是 - 每个 Task 完成后自动 git commit / 否 - 仅生成 commit message，用户手动提交]
- **提交粒度**: [Per Task - 每个 Task 一个 commit / Per Phase - 每个 Phase 一个 commit / 按需]
- **分支策略**: [直接在 main 分支工作 / 每个 Task 新建分支 `feat/{task-id}`]
- **自动推送**: [是 / 否]

**测试偏好**: [例：Vitest / Jest / pytest / 无特殊要求]

---

## 已有资源与上下文

> AI 需要知道哪些东西已经存在——避免重复造轮子或做出冲突决策。

**项目起点**: [全新项目 / 基于已有代码库（简述现状和技术债）]
**已有 API/后端**: [接口文档链接 / 简述可用端点 / 无（需从零搭建）]
**第三方服务**: [已确定使用的服务，例：Auth0, Stripe, AWS S3, Resend...]
**现有数据**: [已有数据库/数据源？格式？需要迁移？/ 无]

---

## 设计资产

> 为 AI 提供视觉/设计输入，直接影响项目的 UI 和架构决策质量。
> 两种方式提供文件：
> 1. **本地文件**: 将文件放入 `brief-assets/` 目录，按下方格式引用
> 2. **外部链接**: 直接填写 URL
>
> 引用格式: `- [语义标签] ./brief-assets/文件名`
>
> 写法参考:
> - [竞品参考-首页] ./brief-assets/linear-dashboard.png
> - [我的草图] ./brief-assets/sketch-v1.png
> - [品牌色板] ./brief-assets/brand-colors.pdf
> - [API 文档] ./brief-assets/api-spec.yaml
> - [数据库 Schema] ./brief-assets/schema.sql

**设计稿/截图**: [按上方格式引用本地文件 / Figma 链接 / 无（AI 自行设计）]
**品牌规范**: [已有 Logo/配色/字体 → 引用文件或描述 / 无]

---

<!-- @slot:style -->

## 边界与约束

**明确不做的事** (反目标):
- [例：本期不做国际化 / 不做移动端适配 / 不做付费功能]

**硬性约束**:
- **兼容性**: [例：Chrome 90+ / Node 18+ / iOS 15+]
- **性能**: [例：首屏 < 2s / API P99 < 500ms / 无特殊要求]
- **合规/无障碍**: [例：WCAG 2.1 AA / GDPR / 无]

---

## 参考与灵感

| 参考项目 | 参考维度 |
|:---|:---|
| [例：Linear] | [交互体验、功能管理逻辑] |
| | |

---

## 补充说明

> 任何上述未涵盖的信息：背景故事、特殊需求、已有决策的原因等。
