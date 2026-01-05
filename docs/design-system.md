# Design System

This document defines the single source of truth for all design decisions in the Backspace application. All new components must follow these rules to maintain consistency.

## Table of Contents

- [Colors](#colors)
- [Typography](#typography)
- [Spacing](#spacing)
- [Border Radius](#border-radius)
- [Component Patterns](#component-patterns)

---

## Colors

All colors are defined in `src/index.css` using OKLCH color space. Use CSS variables, not hard-coded values.

### Semantic Color Tokens

```css
/* Primary */
--primary: oklch(0.852 0.199 91.936);
--primary-foreground: oklch(0.421 0.095 57.708);

/* Secondary */
--secondary: oklch(0.967 0.001 286.375);
--secondary-foreground: oklch(0.21 0.006 285.885);

/* Neutral */
--background: oklch(1 0 0);
--foreground: oklch(0.145 0 0);
--muted: oklch(0.97 0 0);
--muted-foreground: oklch(0.556 0 0);
--border: oklch(0.922 0 0);
--input: oklch(0.922 0 0);
--ring: oklch(0.708 0 0);

/* Destructive */
--destructive: oklch(0.58 0.22 27);
```

### Status Colors (light mode)

```css
--color-blue: oklch(0.55 0.22 251);
--color-purple: oklch(0.55 0.22 301);
--color-emerald: oklch(0.55 0.22 142);
--color-orange: oklch(0.55 0.22 45);
--color-amber: oklch(0.55 0.22 70);

/* Background variants */
--color-blue-bg: oklch(0.96 0.02 251);
--color-purple-bg: oklch(0.96 0.02 301);
--color-emerald-bg: oklch(0.96 0.02 142);
--color-orange-bg: oklch(0.96 0.02 45);
--color-amber-bg: oklch(0.96 0.02 70);

/* Border variants */
--color-blue-border: oklch(0.88 0.04 251);
--color-purple-border: oklch(0.88 0.04 301);
--color-emerald-border: oklch(0.88 0.04 142);
--color-orange-border: oklch(0.88 0.04 45);
--color-amber-border: oklch(0.88 0.04 70);
```

## Typography

### Font Family

```css
--font-sans: "Noto Sans Variable", sans-serif;
```

### Typography Scale

| Tailwind Class | Font Size       | Usage                                 |
| -------------- | --------------- | ------------------------------------- |
| `text-xs`      | 0.75rem (12px)  | Table headers, badges, small labels   |
| `text-sm`      | 0.875rem (14px) | Card titles, button text, table cells |
| `text-base`    | 1rem (16px)     | Body text, subheaders                 |
| `text-lg`      | 1.125rem (18px) | Section headings                      |
| `text-xl`      | 1.25rem (20px)  | Page headings                         |
| `text-2xl`     | 1.5rem (24px)   | Page titles                           |
| `text-3xl`     | 1.875rem (30px) | Hero titles                           |

### Font Weight

| Tailwind Class   | Usage                        |
| ---------------- | ---------------------------- |
| `font-extrabold` | Card titles, section headers |
| `font-bold`      | Emphasized text, navigation  |
| `font-semibold`  | Labels, values               |
| `font-medium`    | Body text, descriptions      |
| `font-normal`    | Regular text                 |

````

---

## Spacing

### Spacing Scale

| Tailwind Class | Value          | Usage                     |
| -------------- | -------------- | ------------------------- |
| `gap-2`        | 0.5rem (8px)   | Icon with text            |
| `gap-3`        | 0.75rem (12px) | Card content, form fields |
| `gap-4`        | 1rem (16px)    | Cards, sections, layout   |
| `space-y-2`    | 0.5rem (8px)   | Form fields               |
| `space-y-3`    | 0.75rem (12px) | Related items             |
| `space-y-4`    | 1rem (16px)    | Sections, cards           |
| `space-y-6`    | 1.5rem (24px)  | Major sections            |

### Padding

| Element        | Padding                         |
| -------------- | ------------------------------- |
| Card content   | `p-4`                           |
| Card header    | `pb-3`                          |
| Dialog content | `p-4`                           |
| Page container | `p-6` (desktop), `p-4` (mobile) |
| Button         | `px-4 py-2` (default)           |
| Input          | `px-3 py-1`                     |


## Border Radius

### Radius Scale

```css
--radius-sm: calc(var(--radius) - 4px);   /* 0.25rem */
--radius-md: calc(var(--radius) - 2px);   /* 0.5rem */
--radius-lg: var(--radius);                 /* 0.75rem (12px) - DEFAULT */
--radius-xl: calc(var(--radius) + 4px);   /* 1rem */
--radius-2xl: calc(var(--radius) + 8px);  /* 1.5rem */
--radius-3xl: calc(var(--radius) + 12px); /* 2rem */
--radius-4xl: calc(var(--radius) + 16px); /* 2.5rem */
````

### Component Border Radius

| Component      | Radius   | Tailwind Class |
| -------------- | -------- | -------------- |
| Card (default) | 0.75rem  | `rounded-lg`   |
| Dialog         | 0.75rem  | `rounded-lg`   |
| Button         | 0.375rem | `rounded-md`   |
| Input          | 0.375rem | `rounded-md`   |
| Badge          | 9999px   | `rounded-4xl`  |
| Table cells    | 0        | `rounded-none` |
| Avatar         | 9999px   | `rounded-full` |

## Icons

### Icon Sizes

| Usage                    | Tailwind Class | Size |
| ------------------------ | -------------- | ---- |
| With text (button/label) | `h-4 w-4`      | 16px |
| Section header icon      | `h-4 w-4`      | 16px |
| Large icon (hero)        | `h-5 w-5`      | 20px |
| Extra large              | `h-6 w-6`      | 24px |

## Quick Reference

### Common Classes

- **Card**: `rounded-lg border shadow-sm`
- **Card Title**: `text-sm font-extrabold`
- **Button**: `h-9 px-4`
- **Input**: `h-9 px-3 py-1 rounded-md`
- **Table Header**: `text-xs font-bold uppercase tracking-wider text-muted-foreground`
- **Table Cell**: `text-sm font-medium py-3`
- **Badge**: `px-2 py-0.5 text-[10px] font-bold`
- **Icon**: `h-4 w-4`
- **Spacing**: `space-y-4`, `gap-4`

---

## Checklist for New Components

When creating a new component, verify it follows these rules:

- [ ] Uses CSS variables for colors (e.g., `bg-[var(--color-emerald-bg)]`)
- [ ] Uses `rounded-lg` for cards, `rounded-md` for buttons/inputs
- [ ] Uses `text-sm font-extrabold` for card titles
- [ ] Uses `text-xs font-bold uppercase` for table headers
- [ ] Uses `text-sm font-medium` for table cells
- [ ] Uses `h-9` for inputs and buttons
- [ ] Uses `h-4 w-4` for icons
- [ ] Uses `space-y-4` for card spacing
- [ ] Uses `gap-4` for grid layouts
- [ ] Uses `p-4` for card content
- [ ] Follows the component patterns above

---

## Resources

- **Colors**: `src/index.css` (lines 7-116)
- **Theme**: `components.json`
- **Base components**: `src/components/ui/`

---
