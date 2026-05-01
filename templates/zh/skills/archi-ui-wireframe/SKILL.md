---
name: archi-ui-wireframe
description: Generate UI concept designs as screens/ reference artifacts. Protocol-invoked only; do not auto-trigger.
disable-model-invocation: true
---

## 调用方式

- **自动调用**: 否，不由模型根据 description 自行触发。
- **触发位置**: 仅由 `/archi.ui` 或 plan/change 的 UI 局部更新步骤显式调用。
- **执行上下文**: 可由 Skill 工具或当前上下文执行；写入 `screens/` 前必须遵守调用协议的 Gate。
- **边界**: 只生成 UI 概念稿和参照文件，不生成生产源码。


# UI 概念设计

## 核心原则

- 交互展示：画出按钮 / 表单 / 弹窗并绑点击，点击只触发视觉反馈（状态切换 / 面板展开 / 弹窗显隐），不跳真实业务逻辑
- 内容填充：用 roadmap 里的真实业务名；禁「标题」「[按钮]」占位；列表 / 表格 ≥ 3-4 行真实感假数据；空状态写具体文案禁「暂无数据」
- 调色板纪律：仅使用 `design_tokens.json` 推导出的 CSS 变量，禁硬编码魔法数字
- 产物边界：`screens/` 是概念设计与验收参照，不是生产代码；不得指示后续实现直接复制 HTML/CSS/JS，必须要求用项目自身语言、框架和样式体系重写
- 禁反模式：紫色渐变 / emoji / 非纯黑白
[[INCLUDE: shared/ui-redlines.md]]

## Step 1 — 读取上下文

从 `context_files` 提取：
- vision.md → 平台 / 用户 / 北极星
- roadmap.json → UI 任务 → 屏幕映射
- design_tokens.json → 审美 / 品牌色 / 饰面变量
- tech_stack.md → 平台 / 导航框架
- 当前 `ui_context.md` → 已有屏幕 ID 和名称（`adopt` / `incremental` 复用）

`adopt` 模式额外：从 `adopt_codebase` 提取 「路由 → 屏幕清单」、「布局组件 → 导航结构」、「页面组件 → 核心区域与状态」。

## Step 2 — 规划屏幕清单

分配屏幕 ID（S-01, S-02 ...，永久不变）映射到 Roadmap 任务。`incremental` 仅处理 `scope_screens`。

| 屏幕 ID | 屏幕名 | 对应任务 | 状态列表 |
|:---|:---|:---|:---|
| S-01 | <名> | <任务ID> | default, loading, empty, error |

## Step 3 — Tokens 检查与引导

检查 `design_tokens.json`：
- `aestheticDirection.preset` 为空 → 引导用户选择（saas-dark / saas-light / dashboard / marketing / mobile-app / editorial / brutalist）
- `primitivePalette.brand` 为空 → 引导填入 Hex
- 其他空值 → AI 推断，非阻塞

`incremental` 跳过本 step（复用现有 tokens）。

## Step 4 — 生成多文件 HTML

**输出目录**：`[[__DOCS_DIR__]]/global/screens/`

> 注意：该目录下文件只用于浏览器预览和设计对齐。后续 `/archi.code` 实现 UI 时，禁止直接复用 `_shared.css` 或 `S-XX.html` 的代码。

**文件清单**：

| 文件 | 职责 |
|:---|:---|
| `_shared.css` | 从 `design_tokens.json` 折出的 CSS 变量 + 基础布局 + 底部控制面板样式 |
| `S-XX.html` | 各屏幕独立自包含页面，通过 `<link href="_shared.css">` 引入共享样式 |
| `index.html` | 导航枢纽，列出所有屏幕卡片并链接到对应 `S-XX.html` |

**底部控制面板规格**（所有 `S-XX.html` 必须含）：fixed 定位底部；浮动长条按钮 60×16px 位于面板顶部中央，▲/▼ 切换；三列布局：← 索引跳转 ｜ 页面说明 ｜ 状态按钮；收起时内容区 `display:none`，按钮保持可见。

**示例规格——`S-XX.html`**（表明必须包含哪些节点与脚本，非物理文件模板）：

```html
<body>
  <header class="wf-topbar">...</header>
  <main class="wf-content">...状态切换 div...</main>
  <aside class="wf-panel" id="wfPanel">
    <button class="wf-panel-toggle" id="toggleBtn" onclick="togglePanel()">▼</button>
    <div class="wf-panel-content">
      <span>跳转</span> <a href="index.html">← 索引</a>
      <span>页面</span> <span>[说明]</span>
      <span>状态</span> <div class="wf-states">...</div>
    </div>
  </aside>
  <script>
    function togglePanel() {
      var panel = document.getElementById('wfPanel');
      var btn = document.getElementById('toggleBtn');
      panel.classList.toggle('collapsed');
      btn.textContent = panel.classList.contains('collapsed') ? '▲' : '▼';
    }
  </script>
</body>
```

**示例规格——`index.html`**：

```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>[项目名] — UI 概念设计</title>
  <link rel="stylesheet" href="_shared.css">
</head>
<body>
  <header class="wf-topbar"><span>[项目名] — UI 概念设计索引</span></header>
  <main class="wf-index">
    <div class="wf-screen-card">
      <a href="S-01.html">S-01 · [屏幕名]</a>
      <p>[一句话描述]</p>
    </div>
  </main>
</body>
</html>
```

**自绘 SVG**（无图标库时）：`stroke="currentColor"` · `stroke-width` 1.5-2 · `fill="currentColor"` · `width="1em"` `height="1em"`。

### 内置验证与自修复循环

生成 → 检查 → 失败则修复重试，直到 6/6 通过；最终输出在 HTML 注释标 `<!-- Check: 6/6 passed -->`。

| 检查项 | 通过标准 | 失败修复 |
|:---|:---|:---|
| 可点击性 | 带 `onclick` 元素均有 `cursor: pointer` | 补 CSS |
| `data-el` 完整性 | 可交互元素均有 `data-el` | 补描述 |
| 状态覆盖 | 每屏含 default / loading / empty（如适用）| 补状态 div |
| 跨文件链接有效性 | `index.html` 链接指向存在的 `S-XX.html`；每 `S-XX.html` 含返回索引链接 | 修路径 |
| 反模式红线 | 无紫色渐变 / emoji / 非纯黑白 | 换为符合审美方向的配色 |
| 间距一致性 | 使用 CSS 变量无魔法数字 | 换 `var(--space-*)` |

## Step 5 — 更新 AI 索引

`ui_context.md` 已由 `/archi.start` 初始化屏幕 ID 和名称。本 step 更新屏幕结构摘要和文件路径。

[[INCLUDE: shared/ui-context-format.md]]

## Step 6 — Output Gate

输出摘要：审美方向及参照产品 · 屏幕覆盖清单（N 个）· 视觉规格 · 导航结构描述。

用户确认：
- 回复 **OK** → 完成
- 非 OK（含布局 / 视觉调整反馈）→ 局部重生对应 `S-XX.html` + 同步 `ui_context.md` + `index.html` → 重示摘要等待下一轮

## 输出验证

- [ ] `global/screens/index.html` 已生成且列出所有屏幕链接
- [ ] `global/screens/_shared.css` 已生成且含 design_tokens CSS 变量
- [ ] 每个 `global/screens/S-XX.html` 独立文件已生成（`incremental` 仅 `scope_screens` 中的）
- [ ] `global/ui_context.md` 屏幕结构摘要已更新，含文件路径和关键区域
- [ ] 所有 `S-XX.html` 都含 `<!-- Check: 6/6 passed -->` 注释
