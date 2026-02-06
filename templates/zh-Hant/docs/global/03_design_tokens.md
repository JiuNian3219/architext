---
description: Design System Tokens (Colors, Typography, Spacing).
---

# Design Tokens

> **Status:** [Drafting]
> **Role:** 視覺法律。嚴禁使用硬編碼的 Hex 值或像素值。

## 1. Primitive Palette (原始色板)
> **Definition**: 品牌的基礎色階 (Brand Scales)，不直接用於 UI，而是作為 Semantic Tokens 的引用源。

| Scale | 50 | 100 | 200 | 300 | 400 | 500 (Main) | 600 | 700 | 800 | 900 | 950 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Neutral** | #f8fafc | #f1f5f9 | #e2e8f0 | #cbd5e1 | #94a3b8 | #64748b | #475569 | #334155 | #1e293b | #0f172a | #020617 |
| **Brand** | *(AI)* | *(AI)* | ... | ... | ... | *(AI)* | ... | ... | ... | ... | ... |

## 2. Semantic Tokens (語義變量)
> **Definition**: UI 組件引用的邏輯名稱，支持 Light/Dark 模式自動切換。

### 2.1 Colors (色彩)
| Token | Light Value | Dark Value | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Background** | White | Neutral-950 | `bg-background` | 頁面背景 |
| **Surface** | Neutral-50 | Neutral-900 | `bg-card` | 卡片, 彈窗, 側邊欄 |
| **Primary** | Brand-600 | Brand-500 | `bg-primary` | 主按鈕, 激活狀態 |
| **Text-Main** | Neutral-900 | Neutral-50 | `text-foreground` | 正文, 標題 |
| **Text-Muted** | Neutral-500 | Neutral-400 | `text-muted-foreground` | 次要信息, 註釋 |
| **Border** | Neutral-200 | Neutral-800 | `border-border` | 邊框, 分割線 |
| **Destructive**| Red-600 | Red-500 | `bg-destructive` | 刪除, 錯誤提示 |

### 2.2 Typography (排版)
| Role | Font Family | Size (px/rem) | Weight | Line Height | Tailwind Class |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H1** | Sans | 36px / 2.25rem | 700 (Bold) | 1.2 | `text-4xl font-bold` |
| **H2** | Sans | 30px / 1.875rem| 600 (Semi) | 1.3 | `text-3xl font-semibold` |
| **Body** | Sans | 16px / 1rem | 400 (Reg) | 1.5 | `text-base` |
| **Small**| Sans | 14px / 0.875rem| 500 (Med) | 1.5 | `text-sm font-medium` |

## 3. Layout & Effects (佈局與特效)

### 3.1 Spacing Scale (間距)
*   `1` = `4px` (0.25rem)
*   `4` = `16px` (1rem)
*   `8` = `32px` (2rem)

### 3.2 Radius (圓角)
| Token | Value | Class | Usage |
| :--- | :--- | :--- | :--- |
| **Sm** | 4px | `rounded-sm` | Tags, Small Inputs |
| **Md** | 8px | `rounded-md` | Buttons, Cards |
| **Lg** | 12px | `rounded-lg` | Modals, Large Containers |
| **Full**| 9999px| `rounded-full`| Avatars, Pills |

### 3.3 Shadows (陰影)
| Token | Value | Class | Usage |
| :--- | :--- | :--- | :--- |
| **Sm** | 0 1px 2px ... | `shadow-sm` | Cards (Default) |
| **Md** | 0 4px 6px ... | `shadow` | Dropdowns, Popovers |

### 3.4 Animation (動效)
| Token | Value | Class | Usage |
| :--- | :--- | :--- | :--- |
| **Fast** | 150ms ease-out | `duration-150` | Hover effects |
| **Normal**| 300ms ease-in-out | `duration-300`| Modal open/close |

---

## 🤖 AI Maintenance Guide

**Role**: Design System Source of Truth (SSOT).

**Trigger**: 當 UI/UX 發生變更時。

**Action**:
1.  **Doc-First**: 永遠先修改此文件，定義新的 Token。
2.  **Sync**: 隨後更新 `tailwind.config.ts` 或 `global.css` 以匹配此文件的定義。
3.  **Refactor**: 如果發現代碼中存在 Hard-coded values (e.g. `w-[23px]`), 必須將其提煉為 Token 並更新此表。
