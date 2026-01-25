# Milestone 7: Subscriptions

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-6 complete

---

## Goal

Implement the Subscriptions section — day-based subscription management.

## Overview

The Subscriptions section manages day-based access plans for customers. It supports weekly (7 days), half-monthly (15 days), and monthly (30 days) plans with automatic end-date calculation.

**Key Functionality:**
- Create subscriptions with customer, plan type, start date
- Auto-calculate end date based on plan
- View subscriptions with status filtering
- Track days remaining
- Deactivate subscriptions

## Components

| Component | Description |
|-----------|-------------|
| `SubscriptionsList` | List of all subscriptions |
| `SubscriptionCard` | Individual subscription card |
| `SubscriptionForm` | Create subscription form |
| `SubscriptionDialog` | Form in modal |

## Data Layer

```typescript
interface Subscription {
  id: string
  customerId: string
  customerName: string
  planType: 'weekly' | 'half-monthly' | 'monthly'
  startDate: string
  endDate: string
  isActive: boolean
  daysRemaining: number
  createdAt: string
}
```

## Plan Types

| Plan | Days | Description |
|------|------|-------------|
| Weekly | 7 | One week access |
| Half-Monthly | 15 | Two weeks access |
| Monthly | 30 | One month access |

## Callbacks

| Callback | Description |
|----------|-------------|
| `onView` | View subscription details |
| `onEdit` | Edit subscription |
| `onDeactivate` | Deactivate subscription |
| `onCreate` | Create new subscription |

## Expected User Flows

### Flow 1: Create Subscription
1. User clicks "Create Subscription"
2. User selects customer
3. User selects plan type
4. User sets start date
5. End date auto-calculates
6. User clicks "Create"
7. **Outcome:** Subscription active, customer sessions now free

### Flow 2: Deactivate Subscription
1. User clicks deactivate on subscription
2. User confirms
3. **Outcome:** Subscription inactive, customer sessions now billed

## Files to Reference

- `product-plan/sections/subscriptions/` — All section files

## Done When

- [ ] Subscription list displays with filtering
- [ ] Create subscription form works
- [ ] End date auto-calculates correctly
- [ ] Days remaining shows correctly
- [ ] Deactivate works with confirmation
- [ ] Session pricing respects subscription status
- [ ] Arabic/English labels work
