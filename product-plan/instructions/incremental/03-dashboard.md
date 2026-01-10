# Milestone 3: Dashboard

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation), Milestone 2 (Shared) complete

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for TDD approach

**What you need to build:**
- Backend API endpoints for dashboard data
- Real-time data fetching
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states

---

## Goal

Implement the Dashboard — a real-time business overview displaying key metrics and alerts.

## Overview

The Dashboard provides space operators with an at-a-glance view of their business. It shows today's revenue split by sessions and inventory, active sessions count, new customers, subscription status, and low stock alerts.

**Key Functionality:**
- View today's revenue (sessions vs inventory breakdown)
- Monitor active sessions count
- Track new customers today
- See active subscriptions count
- View resource utilization rate
- Receive low stock alerts
- Quick actions for common tasks

## Components

Copy the components from `product-plan/sections/dashboard/components/`:

| Component | Description |
|-----------|-------------|
| `Dashboard` | Main dashboard layout |
| `MetricCard` | Individual metric display |
| `LowStockBanner` | Alert banner for low stock items |
| `QuickActions` | Quick action buttons |
| `RevenueChart` | Revenue visualization |
| `ActivityFeed` | Recent activity list |

## Data Layer

The components expect these data shapes:

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

interface LowStockItem {
  id: string
  name: string
  quantity: number
  minStock: number
}
```

## Callbacks

| Callback | Description |
|----------|-------------|
| `onNewCustomer` | Navigate to create customer |
| `onStartSession` | Navigate to start session |
| `onViewSessions` | Navigate to sessions list |
| `onViewInventory` | Navigate to inventory |
| `onLowStockItemClick` | Navigate to specific inventory item |

## Expected User Flows

### Flow 1: View Dashboard Metrics
1. User navigates to Dashboard
2. User sees today's revenue with session/inventory breakdown
3. User sees active sessions, new customers, subscriptions counts
4. **Outcome:** User has quick overview of business status

### Flow 2: Respond to Low Stock Alert
1. User sees low stock banner at top
2. User clicks on a low stock item
3. **Outcome:** User navigates to inventory to restock

### Flow 3: Quick Actions
1. User clicks "New Customer" quick action
2. **Outcome:** User navigates to customer creation form

## Files to Reference

- `product-plan/sections/dashboard/README.md` — Feature overview
- `product-plan/sections/dashboard/tests.md` — Test instructions
- `product-plan/sections/dashboard/components/` — React components
- `product-plan/sections/dashboard/types.ts` — TypeScript interfaces
- `product-plan/sections/dashboard/sample-data.json` — Test data

## Done When

- [ ] Dashboard displays real-time metrics
- [ ] Revenue shows session vs inventory breakdown
- [ ] Active sessions count updates in real-time
- [ ] Low stock banner appears when items below threshold
- [ ] Quick actions navigate to correct pages
- [ ] Revenue chart displays correctly
- [ ] Activity feed shows recent operations
- [ ] Responsive on mobile
- [ ] Dark mode works correctly
