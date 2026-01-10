# Backspace — Product Overview

## Summary

Backspace is a comprehensive coworking space management system designed to simplify daily operations for coworking space owners and managers. Built as a modern desktop application using Tauri v2, it provides tools for customer management, resource scheduling, session tracking with real-time inventory consumption, inventory control, day-based subscription handling, and billing.

## Planned Sections

1. **Shared Components** — Reusable UI components including DeleteConfirmDialog, EmptyState, LoadingState, FormField, PageHeader, SearchInput, and SuccessDialog
2. **Dashboard** — Real-time business overview with revenue metrics, active sessions, and low stock alerts
3. **Customers** — Complete customer lifecycle management with Egyptian phone validation
4. **Resources** — Resource definition and scheduling for seats, rooms, and desks
5. **Sessions** — Core session workflow with mid-session inventory consumption
6. **Subscriptions** — Day-based subscription management (7/15/30 days)
7. **Inventory** — Stock management with dynamic pricing and alerts
8. **Invoices** — Invoice generation with itemized breakdown and payment tracking
9. **Reports** — Comprehensive analytics and operation history
10. **Settings** — Application configuration and data management

## Data Model

**Entities:**
- Customer — Coworking space users with contact info and balance
- Resource — Bookable space units (seats, rooms, desks)
- Session — Time-bounded usage periods
- Subscription — Day-based access plans
- Inventory — Consumable items (beverages, snacks, meals)
- InventoryConsumption — Records of items consumed during sessions
- Invoice — Billing documents with payment tracking

## Design System

**Colors:**
- Primary: `amber` — Used for buttons, links, key accents
- Secondary: `emerald` — Used for tags, highlights, success states
- Neutral: `stone` — Used for backgrounds, text, borders

**Typography:**
- Heading: Noto Sans
- Body: Noto Sans
- Mono: IBM Plex Mono

## Implementation Sequence

Build this product in milestones:

1. **Foundation** — Set up design tokens, data model types, routing, and application shell
2. **Shared Components** — Implement reusable UI components
3. **Dashboard** — Real-time business overview
4. **Customers** — Customer management with forms and profiles
5. **Resources** — Resource scheduling and availability
6. **Sessions** — Session tracking with inventory consumption
7. **Subscriptions** — Subscription plan management
8. **Inventory** — Stock management and alerts
9. **Invoices** — Billing and payment tracking
10. **Reports** — Analytics and operation history
11. **Settings** — Application configuration

Each milestone has a dedicated instruction document in `instructions/incremental/`.
