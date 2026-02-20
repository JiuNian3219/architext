---
description: UI Structure (ITP v3.0) for {FEATURE_NAME}.
glue: ui.preview.html — 視覺對照檔案，瀏覽器開啟檢視效果
---

# UI: {FEATURE_NAME}

> **Protocol:** ITP v3.0 | **Tokens:** `[[__DOCS_DIR__]]/global/design_tokens.json` | **Preview:** `ui.preview.html`

## 1. Visual Intent

<!-- [AI]: 描述視覺意圖，code 階段根據此處決定視覺表現 -->

| Aspect | Description |
|:---|:---|
| Mood | [e.g. Clean & Professional / Playful & Vibrant / Dark & Technical] |
| Visual Weight | [e.g. 頁面焦點在 CTA 按鈕；標題區佔視覺重量 30%] |
| Density | [e.g. Spacious — 大量留白，卡片間距 gap-6；或 Compact — 資訊密集，gap-2] |
| Key Presets | [e.g. card, button-primary, input — 引用 design_tokens.json componentPresets] |

## 2. Component Tree

<!-- [AI]: ITP 語法；須引用 componentPresets -->

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
