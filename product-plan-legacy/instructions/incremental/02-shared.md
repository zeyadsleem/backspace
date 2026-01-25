# Milestone 2: Shared Components

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)

**What you need to build:**
- Integration of the provided UI components
- Proper error handling and loading states

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- The components are props-based and ready to integrate

---

## Goal

Implement reusable UI components used across multiple sections of the application.

## Overview

The Shared Components section provides consistent patterns for common interactions like confirmations, empty states, loading states, and form fields. These components are used throughout the application.

**Key Functionality:**
- Delete confirmation dialogs for destructive actions
- Empty state displays for lists with no data
- Loading indicators (spinner, skeleton, dots)
- Form field wrappers with labels and error handling
- Page headers with breadcrumbs
- Search inputs with debounce
- Success confirmation dialogs

## Components

Copy the components from `product-plan/sections/shared/components/`:

| Component | Description |
|-----------|-------------|
| `DeleteConfirmDialog` | Modal for confirming destructive actions |
| `EmptyState` | Placeholder for empty lists |
| `LoadingState` | Loading indicators (spinner, skeleton, dots) |
| `FormField` | Form input wrapper with label/error |
| `PageHeader` | Page title with breadcrumbs and actions |
| `SearchInput` | Search input with debounce |
| `SuccessDialog` | Success confirmation modal |

## Callbacks

| Callback | Description |
|----------|-------------|
| `onConfirm` | Called when delete is confirmed |
| `onCancel` | Called when dialog is cancelled |
| `onAction` | Called when empty state action is clicked |
| `onChange` | Called when search value changes |
| `onSubmit` | Called when search is submitted |
| `onPrimaryAction` | Called for success dialog primary action |
| `onSecondaryAction` | Called for success dialog secondary action |

## Files to Reference

- `product-plan/sections/shared/README.md` — Component overview
- `product-plan/sections/shared/components/` — React components
- `product-plan/sections/shared/types.ts` — TypeScript interfaces

## Done When

- [ ] All shared components are integrated
- [ ] DeleteConfirmDialog shows with loading state
- [ ] EmptyState displays with different icons
- [ ] LoadingState shows spinner, skeleton, and dots variants
- [ ] FormField displays labels, errors, and helper text
- [ ] PageHeader shows breadcrumbs and actions
- [ ] SearchInput debounces input and clears
- [ ] SuccessDialog shows with primary/secondary actions
- [ ] All components support dark mode
- [ ] RTL layout works correctly
