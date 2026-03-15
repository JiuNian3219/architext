---
name: archi-ui-wireframe
description: Generate UI concept designs and wireframes as multi-file screens/ directory. Do not auto-trigger.
---

# UI 概念设计

## 系统流程定位

```
/archi.ui → [本 Skill] → screens/ (多文件目录) → /archi.plan → ui.md (单任务范围)
/archi.ui (adopt模式) → [本 Skill] → screens/ (从代码逆向)
```

> **产出物**：`screens/` 目录（`index.html` 导航枢纽 + `S-XX.html` 独立屏幕 + `_shared.css` 共享样式）+ `ui_context.md`（AI 索引）

---

## 调用模式

| 模式 | 触发 | 范围 |
|:---|:---|:---|
| 初次生成 | `/archi.ui` | 全量，所有屏幕 |
| 逆向采用 | `/archi.ui`（代码已存在时自动检测） | 从代码路由/组件逆向生成 |
| 重新生成 | 用户手动 | 全量重写（全局重设计） |
| 追加/修改 | `/archi.scope/edit` 或 `/archi.ui`（增量模式） | 仅新增/修改指定屏幕 |
| 局部更新 | `/archi.plan` 发现偏差 | 仅更新对应屏幕 |

---

## 生成协议

### Step 1 — 读取上下文

**Load**: vision.md（平台/用户/北极星）、roadmap.json（UI 任务 → 屏幕映射）、
design_tokens.json（审美/品牌色）、tech_stack.md（平台/导航框架）。

### Step 2 — 规划屏幕清单

分配屏幕 ID（S-01, S-02...），映射到 Roadmap 任务。ID 永久不变。

| 屏幕 ID | 屏幕名 | 对应任务 | 状态列表 |
|:---|:---|:---|:---|
| S-01 | [名] | [任务ID] | default, loading, empty, error |

### Step 3 — Tokens 检查 + 引导

check `design_tokens.json`:
- `aestheticDirection.preset` 为空 → 引导选择（saas-dark/saas-light/dashboard/marketing/mobile-app/editorial/brutalist）
- `primitivePalette.brand` 为空 → 引导填入 Hex
- 其他空值 → AI 推断，非阻塞

### Step 4 — 生成多文件 HTML

**输出目录**：`[[__DOCS_DIR__]]/global/screens/`

#### 4.1 `_shared.css` — 共享样式

从 `design_tokens.json` 提取 CSS 变量 + 基础布局 + 控制栏样式。所有 `S-XX.html` 通过 `<link href="_shared.css">` 引用。

#### 4.2 `S-XX.html` — 独立屏幕文件

每个屏幕一个自包含 HTML 文件，结构：

```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>S-XX · [屏幕名]</title>
  <link rel="stylesheet" href="_shared.css">
</head>
<body>
  <header class="wf-topbar">
    <a href="index.html" class="wf-back">← 返回索引</a>
    <span>[项目名] — S-XX · [屏幕名]</span>
  </header>

  <main class="wf-content">
    <div class="wf-state active" data-state="default">...</div>
    <div class="wf-state" data-state="loading">...</div>
    <div class="wf-state" data-state="empty">...</div>
    <div class="wf-state" data-state="error">...</div>
  </main>

  <footer class="wf-ctrl-bar">
    <div class="wf-states"><!-- 状态切换按钮 --></div>
  </footer>

  <script>
    function showState(state) {
      document.querySelectorAll('.wf-state').forEach(el => el.classList.remove('active'));
      document.querySelector(`[data-state="${state}"]`).classList.add('active');
      document.querySelectorAll('.wf-states button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.state === state);
      });
    }
  </script>
</body>
</html>
```

#### 4.3 `index.html` — 导航枢纽

列出所有屏幕，每项链接到对应 `S-XX.html`：

```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>[项目名] — UI 概念设计</title>
  <link rel="stylesheet" href="_shared.css">
</head>
<body>
  <header class="wf-topbar">
    <span>[项目名] — UI 概念设计索引</span>
  </header>
  <main class="wf-index">
    <div class="wf-screen-card">
      <a href="S-01.html">S-01 · [屏幕名]</a>
      <p>[一句话描述]</p>
    </div>
    <!-- 更多屏幕卡片 -->
  </main>
</body>
</html>
```

**交互展示原则**（视觉反馈，非业务逻辑）：
- 按钮/链接/输入框画出，绑点击事件
- 点击触发**视觉反馈**（弹窗显隐、面板展开、状态切换），不触发**真实业务逻辑**
- **跨屏幕导航**：侧边栏、Tab、面包屑、卡片点击 → 链接到对应 `S-XX.html`
- **弹窗表单**：可聚焦、可点击，提交后不真处理数据
- **目标**：完整展示交互流程和各状态下的界面外观

**内置验证与自修复循环**（生成后自检，AI 修复直到全过）：

| 检查项 | 通过标准 | 失败修复动作 |
|:---|:---|:---|
| **可点击性** | 所有带 `onclick` 的元素必须有 `cursor: pointer` | 添加 CSS `cursor: pointer` |
| **data-el 完整性** | 所有可交互元素必须有 `data-el` | 补充 `data-el` 描述 |
| **状态覆盖** | 每个屏幕必须包含 default/loading/empty（如适用）| 补充缺失的状态 div |
| **跨文件链接有效性** | `index.html` 链接指向存在的 `S-XX.html`；每个 `S-XX.html` 含返回索引链接 | 修复链接路径 |
| **反模式红线** | 无紫色渐变、无 emoji、非纯黑白 | 替换为符合审美方向的配色 |
| **间距一致性** | 使用 CSS 变量，无硬编码魔法数字 | 替换为 `var(--space-*)` |

**修复循环**（内部执行）：
```
生成 HTML → 运行检查 → 有失败项？
  ├── 是 → 修复 → 重新生成 → 再次检查
  └── 否 → 通过
```

**检查方式**：扫描各 HTML 文件元素，核对检查项，输出到注释（`<!-- Check: 6/6 passed -->`），失败则修复。

[[INCLUDE: shared/ui-redlines.md]]

**内容填充**：
- 用真实业务名（来自 roadmap），禁 "标题" 占位
- 按钮写具体操作，禁 "[按钮]"
- 列表/表格至少 3-4 行真实感假数据
- 空状态写具体文案，禁 "暂无数据"

**自绘 SVG**（无图标库时）：stroke="currentColor"，stroke-width 1.5-2，fill="currentColor"，width="1em" height="1em"

### Step 5 — 生成 AI 索引

**输出**：`[[__DOCS_DIR__]]/global/ui_context.md`

```markdown
# UI Context
> 平台: [类型] | 生成: YYYY-MM-DD

## 屏幕索引
| ID | 名称 | 路由 | 文件 | 状态 |
|:---|:---|:---|:---|:---|
| S-01 | [名] | [路由] | screens/S-01.html | default, loading, empty, error |

## 导航关系
S-XX →（触发条件）→ S-YY

## 屏幕结构摘要
### S-XX · [屏幕名]
**布局**: [描述，如"左侧边栏 240px + 右内容区"]
**文件**: screens/S-XX.html
**状态**: default（核心操作）| loading（骨架屏）| empty | error
**关键区域**: [data-el 提取：顶部导航栏、主表单区、提交按钮、错误提示区]
```

### Step 6 — Output Gate

输出摘要：审美方向及参照产品、屏幕覆盖清单（共 N 个）、视觉规格、导航结构描述。

**用户确认**：回复 **OK** 完成；非 OK 进入 Refinement。

## 输出验证

□ `global/screens/index.html` 已生成且列出所有屏幕链接
□ `global/screens/_shared.css` 已生成且含 design_tokens CSS 变量
□ `global/screens/S-XX.html` 每个屏幕独立文件已生成
□ `global/ui_context.md` 已生成且屏幕索引含 `screens/S-XX.html` 路径

---

## Refinement（用户反馈调整）

用户回复含布局/视觉调整 → 局部更新对应 `screens/S-XX.html` + 同步 `ui_context.md` → 重新展示摘要等待确认。

---

## Incremental Update（局部更新）

输入屏幕 ID 列表 → 仅处理指定屏幕：保留已有文件，按当前视觉规格生成新增/更新的 `S-XX.html`；如有新状态，同步更新 `ui_context.md`。更新 `index.html` 导航列表。

输出：`MODIFIED: screens/S-XX.html`（逐文件标注）

---

## Adopt（逆向采用）

输入已有代码 + design_tokens.json → 提取：路由 → 屏幕清单，布局组件 → 导航结构，页面组件 → 核心区域和状态 → 按标准流程生成 `screens/` 目录 + ui_context.md。
