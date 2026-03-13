---
name: archi-ui-wireframe
description: Generate UI concept designs and wireframes.when creating or updating UI screens for web, mobile, or desktop applications. Do not auto-trigger.
---

# UI 概念设计

## 系统流程定位

```
/archi.start → [本 Skill] → ui_concept.html (全应用屏幕) → /archi.plan → ui.md (单任务范围)
/archi.inherit → [本 Skill adopt模式] → ui_concept.html (从代码逆向)
```

> **产出物**：`ui_concept.html`（全屏高保真预览，含状态切换）+ `ui_context.md`（AI 索引）

---

## 调用模式

| 模式 | 触发 | 范围 |
|:---|:---|:---|
| 初次生成 | `/archi.start` | 全量，所有屏幕 |
| 逆向采用 | `/archi.inherit` | 从代码路由/组件逆向生成 |
| 重新生成 | 用户手动 | 全量重写（全局重设计） |
| 追加/修改 | `/archi.scope/edit` | 仅新增/修改指定屏幕 |
| 局部更新 | `/archi.plan` 发现偏差 | 仅更新对应屏幕 |

---

## 生成协议

### Step 1 — 读取上下文

**Load**: vision.md（平台/用户/北极星）、roadmap.json（UI 任务 → 屏幕映射）、
design_tokens.json（审美/品牌色）、02_tech_stack.md（平台/导航框架）。

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

### Step 4 — 生成高保真 HTML

**输出**：`[[__DOCS_DIR__]]/global/ui_concept.html`

**结构**（从上到下）：
1. **顶栏** — 固定，显示项目名 + 当前屏幕名
2. **内容区** — 可滚动，渲染当前激活的屏幕
3. **控制栏** — 固定底部，分两部分：
   - **左侧 States**：当前屏幕状态切换（default/loading/empty/error）
   - **右侧 Screens**：项目所有屏幕列表（S-01/S-02...），点击切换

**HTML 结构**：
```html
<section id="S-01" class="wf-screen active">
  <div class="wf-state active" data-state="default">...</div>
  <div class="wf-state" data-state="loading">...</div>
</section>

<footer class="wf-ctrl-bar">
  <div><!-- States --></div>
  <div><!-- Screens --></div>
</footer>
```

**交互展示原则**（视觉反馈，非业务逻辑）：
- 按钮/链接/输入框画出，绑点击事件
- 点击触发**视觉反馈**（弹窗显隐、面板展开、状态切换），不触发**真实业务逻辑**
- **页面内导航**：侧边栏、Tab、面包屑点击 → `showScreen()`
- **详情跳转**：卡片、列表项点击 → `showScreen()`，展示"点击→跳转"流程
- **弹窗表单**：可聚焦、可点击，提交后不真处理数据
- **目标**：完整展示交互流程和各状态下的界面外观

**内置验证与自修复循环**（生成后自检，AI 修复直到全过）：

| 检查项 | 通过标准 | 失败修复动作 |
|:---|:---|:---|
| **可点击性** | 所有带 `onclick` 的元素必须有 `cursor: pointer` | 添加 CSS `cursor: pointer` |
| **data-el 完整性** | 所有可交互元素必须有 `data-el` | 补充 `data-el` 描述 |
| **状态覆盖** | 每个屏幕必须包含 default/loading/empty（如适用）| 补充缺失的状态 div |
| **导航连通性** | 侧边栏、卡片等点击须能切换到目标屏幕 | 添加/修复 `onclick="showScreen()"` |
| **反模式红线** | 无紫色渐变、无 emoji、非纯黑白 | 替换为符合审美方向的配色 |
| **间距一致性** | 使用 CSS 变量，无硬编码魔法数字 | 替换为 `var(--space-*)` |

**修复循环**（内部执行）：
```
生成 HTML → 运行检查 → 有失败项？
  ├── 是 → 修复 → 重新生成 → 再次检查
  └── 否 → 通过
```

**检查方式**：扫描 HTML 元素，核对检查项，输出到注释（`<!-- Check: 6/6 passed -->`），失败则修复。

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
| ID | 名称 | 路由 | 状态 |
|:---|:---|:---|:---|
| S-01 | [名] | [路由] | default, loading, empty, error |

## 导航关系
S-XX →（触发条件）→ S-YY

## 屏幕结构摘要
### S-XX · [屏幕名]
**布局**: [描述，如"左侧边栏 240px + 右内容区"]
**状态**: default（核心操作）| loading（骨架屏）| empty | error
**关键区域**: [data-el 提取：顶部导航栏、主表单区、提交按钮、错误提示区]
```

### Step 6 — Output Gate

输出摘要：审美方向及参照产品、屏幕覆盖清单（共 N 个）、视觉规格、导航结构描述。

**用户确认**：回复 **OK** 完成；非 OK 进入 Refinement。

## 输出验证

□ `global/ui_concept.html` 已生成且含所有屏幕 section
□ `global/ui_context.md` 已生成且含屏幕索引表

---

## Refinement（用户反馈调整）

用户回复含布局/视觉调整 → 局部更新 `ui_concept.html` + 同步 `ui_context.md` → 重新展示摘要等待确认。

---

## Incremental Update（局部更新）

输入屏幕 ID 列表 → 仅处理指定屏幕：保留已有内容，按当前视觉规格生成新增部分；如有新状态，同步更新 `ui_context.md`。

输出：`MODIFIED: ui_concept.html S-XX（局部更新）`

---

## Adopt（逆向采用）

输入已有代码 + design_tokens.json → 提取：路由 → 屏幕清单，布局组件 → 导航结构，页面组件 → 核心区域和状态 → 按标准流程生成 HTML + ui_context.md。
