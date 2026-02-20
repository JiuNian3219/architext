---
description: UI Structure (ITP v3.0) for {FEATURE_NAME}.
glue: ui.preview.html — 可视化对照文件，浏览器打开查看效果
---

# UI: {FEATURE_NAME}

> **Protocol:** ITP v3.0 | **Tokens:** `[[__DOCS_DIR__]]/global/design_tokens.json` | **Preview:** `ui.preview.html`

## 1. Visual Intent

<!-- [AI]: 描述视觉意图，code 阶段根据此处决定视觉表现 -->

| Aspect | Description |
|:---|:---|
| Mood | [e.g. Clean & Professional / Playful & Vibrant / Dark & Technical] |
| Visual Weight | [e.g. 页面焦点在 CTA 按钮；标题区占视觉重量 30%] |
| Density | [e.g. Spacious — 大量留白，卡片间距 gap-6；或 Compact — 信息密集，gap-2] |
| Key Presets | [e.g. card, button-primary, input — 引用 design_tokens.json componentPresets] |

## 2. Component Tree

<!-- [AI]: ITP 语法；须引用 componentPresets -->

```text
Page{Name} [Col, Fill, Bg:Base]
  BoxHeader [Row, Between, P:4]
    TxtTitle [H2] (Text: {FEATURE_NAME})
    BoxActions [Row, Gap:2]
      #ActionButtons

  BoxContent [Col, Gap:4, P:4]
    #Children

  BoxFooter [Row, Between, P:4, Border-t]
    #FooterContent
```

## 3. Interactions

| Trigger | Target | Action |
|:---|:---|:---|
| #EntryPoint click | Page | Mount + fetch data |
| #Submit click | API | POST -> success: Toast / error: Toast |

## 4. States

| State | Render |
|:---|:---|
| `loading` | Skeleton x3 (Preset: skeleton) |
| `empty` | Illustration + Txt:Muted (Preset: emptyState) |
| `error` | Toast:Destructive + BtnRetry |
| `success` | Toast:Primary |

## 5. Responsive

| Breakpoint | Adaptation |
|:---|:---|
| < sm (640px) | Single-col, sidebar hidden |
| >= lg (1024px) | Sidebar visible, multi-col |
