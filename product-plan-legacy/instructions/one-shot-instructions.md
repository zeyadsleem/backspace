# Backspace — Complete Implementation Instructions

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Test-Driven Development

Each section includes a `tests.md` file with detailed test-writing instructions. These are **framework-agnostic** — adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, RSpec, Minitest, PHPUnit, etc.).

**For each section:**
1. Read `product-plan/sections/[section-id]/tests.md`
2. Write failing tests for key user flows (success and failure paths)
3. Implement the feature to make tests pass
4. Refactor while keeping tests green

---

## Product Overview

**Backspace** is a comprehensive coworking space management system built with Tauri v2 for desktop. It manages customers, resources (seats/rooms/desks), sessions with real-time tracking, day-based subscriptions, inventory with dynamic pricing, invoicing, and reporting.

**Target Users:** Coworking space operators in Egypt

**Key Features:**
- Customer lifecycle management with Egyptian phone validation
- Resource scheduling with hourly rates
- Session tracking with real-time elapsed time and costs
- Day-based subscriptions (7/15/30 days)
- Inventory management with consumption tracking
- Invoice generation with partial payment support
- Comprehensive analytics and reporting

**Design System:**
- Primary: `amber` — buttons, links, accents
- Secondary: `emerald` — success states, subscriptions
- Neutral: `stone` — backgrounds, text, borders
- Typography: Noto Sans (heading/body), IBM Plex Mono (code)

---

# Milestone 1: Foundation

## Goal

Set up the foundational elements: design tokens, data model types, routing structure, and application shell.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

### 2. Data Model Types

Create TypeScript interfaces for your core entities:

- See `product-plan/data-model/types.ts` for interface definitions
- See `product-plan/data-model/README.md` for entity relationships

**Entities:** Customer, Resource, Session, Subscription, InventoryItem, InventoryConsumption, Invoice

### 3. Routing Structure

| Route | Section |
|-------|---------|
| `/` or `/dashboard` | Dashboard |
| `/customers` | Customers list |
| `/customers/:id` | Customer profile |
| `/resources` | Resources |
| `/sessions` | Sessions |
| `/subscriptions` | Subscriptions |
| `/inventory` | Inventory |
| `/invoices` | Invoices |
| `/reports` | Reports |
| `/settings` | Settings |

### 4. Application Shell

Copy the shell components from `product-plan/shell/components/`:

- `AppShell.tsx` — Main layout wrapper
- `MainNav.tsx` — Navigation component
- `UserMenu.tsx` — User menu with avatar

**Navigation Items:**

| Label | Route | Icon |
|-------|-------|------|
| Dashboard | /dashboard | Home |
| Customers | /customers | Users |
| Resources | /resources | Building |
| Sessions | /sessions | Clock |
| Subscriptions | /subscriptions | CreditCard |
| Inventory | /inventory | Package |
| Invoices | /invoices | FileText |
| Reports | /reports | BarChart |
| Settings | /settings | Settings |

## Done When

- [ ] Design tokens configured
- [ ] Data model types defined
- [ ] Routes exist for all sections
- [ ] Shell renders with navigation
- [ ] Light/dark mode toggle works
- [ ] RTL layout works when Arabic selected
- [ ] Responsive on mobile

---

# Milestone 2: Shared Components

## Goal

Implement reusable UI components used across multiple sections.

## Components

Copy from `product-plan/sections/shared/components/`:

| Component | Description |
|-----------|-------------|
| `DeleteConfirmDialog` | Modal for confirming destructive actions |
| `EmptyState` | Placeholder for empty lists |
| `LoadingState` | Loading indicators (spinner, skeleton, dots) |
| `FormField` | Form input wrapper with label/error |
| `PageHeader` | Page title with breadcrumbs and actions |
| `SearchInput` | Search input with debounce |
| `SuccessDialog` | Success confirmation modal |

## Done When

- [ ] All shared components integrated
- [ ] Components support dark mode
- [ ] RTL layout works correctly

---

# Milestone 3: Dashboard

## Goal

Implement the Dashboard — real-time business overview.

## Components

Copy from `product-plan/sections/dashboard/components/`:

- `Dashboard`, `MetricCard`, `LowStockBanner`, `QuickActions`, `RevenueChart`, `ActivityFeed`

## Key Data

```typescript
interface DashboardMetrics {
  todayRevenue: number
  sessionRevenue: number
  inventoryRevenue: number
  activeSessions: number
  newCustomers: number
  activeSubscriptions: number
  utilizationRate: number
}
```

## Done When

- [ ] Dashboard displays real-time metrics
- [ ] Low stock banner appears when items below threshold
- [ ] Quick actions navigate correctly
- [ ] Responsive on mobile

---

# Milestone 4: Customers

## Goal

Implement complete customer lifecycle management.

## Components

Copy from `product-plan/sections/customers/components/`:

- `CustomersList`, `CustomerRow`, `CustomerForm`, `CustomerDialog`, `CustomerProfile`

## Validation

**Egyptian Phone:** Format 01[0125]XXXXXXXX (11 digits)

## User Flows

1. **Create Customer:** Add → Fill form → Save → Appears in list
2. **View Profile:** Click row → See stats and history
3. **Edit Customer:** Edit button → Modify → Save
4. **Delete Customer:** Delete → Confirm → Removed

## Done When

- [ ] Customer list with search/filter
- [ ] Egyptian phone validation
- [ ] CRUD operations work
- [ ] Empty state when no customers

---

# Milestone 5: Resources

## Goal

Implement resource management for seats, rooms, and desks.

## Components

Copy from `product-plan/sections/resources/components/`:

- `ResourcesList`, `ResourceCard`, `ResourceForm`, `ResourceDialog`

## User Flows

1. **Create Resource:** Add → Enter details → Save
2. **Toggle Availability:** Click toggle → Status changes
3. **Delete Resource:** Delete → Confirm (blocked if active session)

## Done When

- [ ] Resource grid displays
- [ ] Filter by type works
- [ ] Availability toggle works
- [ ] Cannot delete with active session

---

# Milestone 6: Sessions

## Goal

Implement core session workflow with inventory consumption.

## Components

Copy from `product-plan/sections/sessions/components/`:

- `ActiveSessions`, `ActiveSessionCard`, `InventoryAddModal`, `StartSessionDialog`

## Business Logic

- **Subscribed customers:** Session cost = 0, only inventory billed
- **Visitors:** Session cost = duration × hourly rate
- **Real-time:** Elapsed time updates every second

## User Flows

1. **Start Session:** Select customer → Select resource → Start
2. **Add Inventory:** Click add → Select item/quantity → Stock deducts
3. **End Session:** End → See cost summary → Invoice generated

## Done When

- [ ] Start session works
- [ ] Real-time elapsed time
- [ ] Add inventory deducts stock
- [ ] End session generates invoice
- [ ] Subscription status affects pricing

---

# Milestone 7: Subscriptions

## Goal

Implement day-based subscription management.

## Components

Copy from `product-plan/sections/subscriptions/components/`:

- `SubscriptionsList`, `SubscriptionCard`, `SubscriptionForm`, `SubscriptionDialog`

## Plan Types

| Plan | Days |
|------|------|
| Weekly | 7 |
| Half-Monthly | 15 |
| Monthly | 30 |

## Done When

- [ ] Create subscription with auto end-date
- [ ] Days remaining shows correctly
- [ ] Deactivate works
- [ ] Session pricing respects subscription

---

# Milestone 8: Inventory

## Goal

Implement stock management with dynamic pricing.

## Components

Copy from `product-plan/sections/inventory/components/`:

- `InventoryList`, `InventoryItemCard`, `InventoryForm`, `InventoryDialog`, `LowStockAlert`

## Categories

- Beverage (Tea, Coffee, Soft drinks)
- Snack (Chips, Biscuits, Chocolate)
- Meal (Sandwiches, Toast)

## Done When

- [ ] Inventory grouped by category
- [ ] Quantity adjustment works
- [ ] Price update works
- [ ] Low stock alerts show

---

# Milestone 9: Invoices

## Goal

Implement billing and payment tracking.

## Components

Copy from `product-plan/sections/invoices/components/`:

- `InvoicesList`, `InvoiceRow`, `InvoiceForm`, `InvoiceDialog`, `PaymentForm`, `PaymentDialog`

## Status

| Status | Color | Description |
|--------|-------|-------------|
| Paid | Green | Fully paid |
| Unpaid | Red | No payment |
| Pending | Orange | Partial payment |

## Done When

- [ ] Invoice auto-generates from session
- [ ] Payment recording works
- [ ] Partial payments track balance
- [ ] Print layout works

---

# Milestone 10: Reports

## Goal

Implement analytics and operation history.

## Components

Copy from `product-plan/sections/reports/components/`:

- `ReportsPage`, `RevenueReport`, `UtilizationReport`, `OperationHistory`

## Report Types

- Revenue (daily/weekly/monthly with breakdown)
- Utilization (peak hours, occupancy)
- Operation History (filterable log)

## Done When

- [ ] Revenue report displays
- [ ] Date range picker works
- [ ] Export to CSV works

---

# Milestone 11: Settings

## Goal

Implement application configuration.

## Components

Copy from `product-plan/sections/settings/components/`:

- `SettingsPage`

## Settings Sections

- Company Information
- Regional Settings (Currency: EGP, Timezone)
- Appearance (Theme, Language)
- Data Management (Backup, Restore, Export)

## Done When

- [ ] Theme toggle works
- [ ] Language switch with RTL
- [ ] Backup/restore works
- [ ] Settings persist

---

## Files Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/data-model/` — Type definitions
- `product-plan/shell/` — Application shell
- `product-plan/sections/` — All section components

---

*Generated by Design OS*
