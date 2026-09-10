# Lumio Design System Specification

Extracted from the **Lumio SaaS Landing Page** project (`projects/13115250104160537282`), screen **"Vibrant Lumio Landing Page - Helvetica Edition"** (Screen ID: `086ad2bf6a7a46899af62b0682f2a951`, marked *Final* / *Favourite*).

---

## 1. Brand & Aesthetic Overview

- **Core Concept:** *Editorial Minimalism* / *Quiet Luxury*
- **Visual Character:** High-contrast typography, generous whitespace, warm neutral surfaces, subtle tonal shifts instead of heavy drop shadows, and clean architectural rhythm.
- **Tone:** Sophisticated, calm, authoritative, modern SaaS.

---

## 2. Color Palette

The Lumio palette uses warm paper/parchment neutrals combined with deep blacks and subtle gray-beige lines to achieve depth through tonal layering rather than aggressive borders.

### Primary Color Tokens

| Token Name | Hex Code | Preview / Role |
| :--- | :--- | :--- |
| `page-bg` | `#FAF9F5` | Main canvas / warm parchment background |
| `panel-bg` | `#F0EFEB` | Secondary panel background for structural sections |
| `soft-card` | `#E9E8E4` | Card background with slight elevation |
| `soft-card-2` | `#F4F3EF` | Alternate softer card surface |
| `white-card` | `#FFFDF8` | Highlighted card background (near pure warm white) |
| `white-soft` | `#FAF9F5` | Soft white accent matching page tone |
| `text` | `#1B1B1B` | Primary body and heading text color |
| `black` | `#181818` | Primary button fill, deep contrast elements, nav pill |
| `deep-black` | `#151515` | Highest-contrast dark backgrounds / footer sections |
| `muted` | `#8C8880` | Secondary metadata, captions, subtitle text |
| `muted-light` | `#BDBAB2` | De-emphasized borders, inactive states, placeholder text |
| `line` | `#D9D7D0` | Subtle horizontal dividers and delicate card borders |

### Material Design Theme System Tokens (Reference)

```css
--surface: #fdf8f8;
--surface-container: #f1edec;
--surface-container-high: #ebe7e6;
--surface-container-highest: #e5e2e1;
--on-surface: #1c1b1b;
--primary: #000000;
--on-primary: #ffffff;
--secondary: #615e58;
--outline: #747878;
--outline-variant: #c4c7c7;
```

---

## 3. Typography

The typographic hierarchy prioritizes architectural presence and legibility with tight letter tracking on headings and generous line height for body copy.

### Font Families

- **Primary Font:** `"Helvetica", "Arial", sans-serif` (or `"Inter", sans-serif` in baseline system)
- **Accent Headings:** `"Poppins", sans-serif` (weights 400..900)
- **Icons:** `Material Symbols Outlined` (variable weight and fill)

### Type Scale

| Level | Size | Weight | Line Height | Letter Spacing | Purpose / Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `82px` (5.125rem) | 700 (Bold) | `1.05` | `-0.04em` | Main hero headlines, focal points |
| **H1** | `48px` (3rem) | 700 (Bold) | `1.1` | `-0.03em` | Primary section headers |
| **H2** | `32px` (2rem) | 600 (SemiBold)| `1.2` | `-0.02em` | Subsection titles, feature headings |
| **H3** | `24px` (1.5rem) | 600 (SemiBold)| `1.3` | `-0.01em` | Card titles, callout headers |
| **Body Large** | `18px` (1.125rem) | 400 (Regular) | `1.6` | `0` | Lead paragraphs, intro descriptions |
| **Body Medium**| `15px` (0.9375rem)| 400 (Regular) | `1.6` | `0` | Standard body text, feature descriptions |
| **Label** | `12px` (0.75rem) | 600 (SemiBold)| `1.0` | `+0.05em` | Badges, tags, navigation links, eyebrow text |

---

## 4. Layout, Spacing & Border Radius

### Spacing Scale

- `unit`: `4px`
- `xs`: `8px`
- `sm`: `16px`
- `md`: `32px`
- `lg`: `64px`
- `xl`: `128px`
- `section`: `160px`
- `gutter`: `24px`
- `margin`: `40px`

### Border Radius Hierarchy

- `DEFAULT`: `0.125rem` (2px)
- `lg`: `0.25rem` (4px)
- `xl`: `0.5rem` (8px)
- `full`: `0.75rem` (12px)
- `3xl`: `2rem` (32px) - Used for primary container cards & bento boxes
- `4xl`: `3rem` (48px)
- `rounded-full`: `9999px` - Used for navigation bar pills, primary CTA buttons, and status tags

---

## 5. Signature UI Components

1. **Floating Capsule Navbar:**
   - Position: `fixed top-[24px]` centered horizontally
   - Appearance: `bg-[#000000]` with `backdrop-blur-xl`, `rounded-full`, thin border (`border-white/10`), shadow `shadow-xl`.
   - Links: Pill-shaped hover states, subtle muted text (`#FAF9F5/80` to pure `#FAF9F5`).

2. **Primary Actions (Buttons):**
   - High-contrast solid black (`bg-black` or `#181818`) with crisp white text (`text-white`).
   - Generous internal padding and full pill shape (`rounded-full`).

3. **Bento Card Structure:**
   - Multi-column card grids on `soft-card` (`#E9E8E4`) or `white-card` (`#FFFDF8`).
   - Micro-borders using `line` (`#D9D7D0`) to subtly delineate sections without visual noise.

4. **Infinite Logo Marquee:**
   - Continuous horizontal animation (`@keyframes scroll`) over warm background.
