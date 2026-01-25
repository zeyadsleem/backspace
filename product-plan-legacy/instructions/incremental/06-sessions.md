# Milestone 6: Sessions

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-5 complete

---

## Goal

Implement the Sessions section — core session workflow with inventory consumption.

## Overview

The Sessions section is the core operational hub for tracking customer usage. It handles session start, mid-session inventory additions, session end with cost calculation, and real-time monitoring.

**Key Functionality:**
- Start sessions with customer/resource selection
- Monitor active sessions with real-time elapsed time
- Add inventory consumption during sessions
- End sessions with automatic cost calculation
- View session history

## Components

| Component | Description |
|-----------|-------------|
| `ActiveSessions` | List of active sessions |
| `ActiveSessionCard` | Individual session card |
| `InventoryAddModal` | Add inventory to session |
| `StartSessionDialog` | Start new session form |

## Data Layer

```typescript
interface ActiveSession {
  id: string
  customerId: string
  customerName: string
  resourceId: string
  resourceName: string
  resourceRate: number
  startedAt: string
  isSubscribed: boolean
  inventoryConsumptions: InventoryConsumption[]
  inventoryTotal: number
}
```

## Callbacks

| Callback | Description |
|----------|-------------|
| `onStartSession` | Open start session dialog |
| `onAddInventory` | Open inventory add modal |
| `onEndSession` | End session and calculate cost |
| `onViewDetails` | View session details |

## Expected User Flows

### Flow 1: Start Session
1. User clicks "Start Session"
2. User selects customer (shows subscription status)
3. User selects available resource
4. User clicks "Start"
5. **Outcome:** Session appears in active list, resource marked occupied

### Flow 2: Add Inventory
1. User clicks "Add Inventory" on active session
2. User selects item and quantity
3. User clicks "Add"
4. **Outcome:** Item added, running total updated, stock deducted

### Flow 3: End Session
1. User clicks "End Session"
2. User sees cost summary (session + inventory)
3. User confirms
4. **Outcome:** Session ended, invoice generated, resource freed

## Business Logic

- **Subscribed customers:** Session cost = 0, only inventory billed
- **Visitors:** Session cost = duration × hourly rate
- **Inventory:** Price locked at consumption time
- **Real-time:** Elapsed time updates every second

## Files to Reference

- `product-plan/sections/sessions/` — All section files

## Done When

- [ ] Start session dialog works
- [ ] Active sessions display with real-time elapsed time
- [ ] Add inventory modal works
- [ ] Stock deducts on consumption
- [ ] End session calculates correct cost
- [ ] Subscription status affects pricing
- [ ] Invoice generated at session end
- [ ] Resource availability updates
