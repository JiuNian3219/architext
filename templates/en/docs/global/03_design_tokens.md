---
description: Design System Tokens (Colors, Typography, Spacing).
---

# Design Tokens

> **Status:** [Drafting]
> **Role:** Visual Law. Strictly forbidden to use hardcoded Hex values or pixel values.

## 1. Primitive Palette
> **Definition**: Brand's base color scales. Not used directly in UI, but as reference source for Semantic Tokens.

| Scale | 50 | 100 | 200 | 300 | 400 | 500 (Main) | 600 | 700 | 800 | 900 | 950 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Neutral** | #f8fafc | #f1f5f9 | #e2e8f0 | #cbd5e1 | #94a3b8 | #64748b | #475569 | #334155 | #1e293b | #0f172a | #020617 |
| **Brand** | *(AI)* | *(AI)* | ... | ... | ... | *(AI)* | ... | ... | ... | ... | ... |

## 2. Semantic Tokens
> **Definition**: Logical names referenced by UI components, supporting automatic Light/Dark mode switching.

### 2.1 Colors
| Token | Light Value | Dark Value | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Background** | White | Neutral-950 | `bg-background` | Page Background |
| **Surface** | Neutral-50 | Neutral-900 | `bg-card` | Cards, Modals, Sidebar |
| **Primary** | Brand-600 | Brand-500 | `bg-primary` | Main Button, Active State |
| **Text-Main** | Neutral-900 | Neutral-50 | `text-foreground` | Body Text, Headings |
| **Text-Muted** | Neutral-500 | Neutral-400 | `text-muted-foreground` | Secondary Info, Notes |
| **Border** | Neutral-200 | Neutral-800 | `border-border` | Borders, Dividers |
| **Destructive**| Red-600 | Red-500 | `bg-destructive` | Deletion, Error Alerts |

### 2.2 Typography
| Role | Font Family | Size (px/rem) | Weight | Line Height | Tailwind Class |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H1** | Sans | 36px / 2.25rem | 700 (Bold) | 1.2 | `text-4xl font-bold` |
| **H2** | Sans | 30px / 1.875rem| 600 (Semi) | 1.3 | `text-3xl font-semibold` |
| **Body** | Sans | 16px / 1rem | 400 (Reg) | 1.5 | `text-base` |
| **Small**| Sans | 14px / 0.875rem| 500 (Med) | 1.5 | `text-sm font-medium` |

## 3. Layout & Effects

### 3.1 Spacing Scale
*   `1` = `4px` (0.25rem)
*   `4` = `16px` (1rem)
*   `8` = `32px` (2rem)

### 3.2 Radius
| Token | Value | Class | Usage |
| :--- | :--- | :--- | :--- |
| **Sm** | 4px | `rounded-sm` | Tags, Small Inputs |
| **Md** | 8px | `rounded-md` | Buttons, Cards |
| **Lg** | 12px | `rounded-lg` | Modals, Large Containers |
| **Full**| 9999px| `rounded-full`| Avatars, Pills |

### 3.3 Shadows
| Token | Value | Class | Usage |
| :--- | :--- | :--- | :--- |
| **Sm** | 0 1px 2px ... | `shadow-sm` | Cards (Default) |
| **Md** | 0 4px 6px ... | `shadow` | Dropdowns, Popovers |

### 3.4 Animation
| Token | Value | Class | Usage |
| :--- | :--- | :--- | :--- |
| **Fast** | 150ms ease-out | `duration-150` | Hover effects |
| **Normal**| 300ms ease-in-out | `duration-300`| Modal open/close |

---

## 🤖 AI Maintenance Guide

**Role**: Design System Source of Truth (SSOT).

**Trigger**: When UI/UX changes occur.

**Action**:
1.  **Doc-First**: Always modify this file first to define new Tokens.
2.  **Sync**: Then update `tailwind.config.ts` or `global.css` to match definitions here.
3.  **Refactor**: If hard-coded values (e.g. `w-[23px]`) are found in code, must extract them into Tokens and update this table.
