---
description: UI Structure (ITP v3.0) for {FEATURE_NAME}.
glue: ui.preview.html — Visual reference file, open in browser to preview
---

# UI: {FEATURE_NAME}

> **Protocol:** ITP v3.0 | **Tokens:** `[[__DOCS_DIR__]]/global/design_tokens.json` | **Preview:** `ui.preview.html`

## 1. Visual Intent

<!-- [AI]: Describe visual intent; code phase uses this to determine visual presentation -->

| Aspect | Description |
|:---|:---|
| Mood | [e.g. Clean & Professional / Playful & Vibrant / Dark & Technical] |
| Visual Weight | [e.g. Page focal point on CTA button; header area takes 30% visual weight] |
| Density | [e.g. Spacious — generous whitespace, card spacing gap-6; or Compact — info-dense, gap-2] |
| Key Presets | [e.g. card, button-primary, input — ref design_tokens.json componentPresets] |

## 2. Component Tree

<!-- [AI]: ITP syntax; must reference componentPresets -->

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
