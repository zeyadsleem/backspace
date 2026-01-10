# Milestone 5: Resources

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-4 complete

---

## Goal

Implement the Resources section — management of seats, rooms, and desks.

## Overview

The Resources section manages all bookable space units—seats, rooms, and desks. Users can create resources with hourly rates, track real-time availability, and view utilization statistics.

**Key Functionality:**
- Create resources with name, type, and hourly rate
- View resources in grid layout
- Filter by resource type
- Track availability status (Available/Occupied)
- Toggle availability manually
- Delete unused resources

## Components

| Component | Description |
|-----------|-------------|
| `ResourcesList` | Grid view of all resources |
| `ResourceCard` | Individual resource card |
| `ResourceForm` | Create/edit form |
| `ResourceDialog` | Form in modal |

## Data Layer

```typescript
interface Resource {
  id: string
  name: string
  resourceType: 'seat' | 'room' | 'desk'
  ratePerHour: number
  isAvailable: boolean
  createdAt: string
  utilizationRate: number
}
```

## Callbacks

| Callback | Description |
|----------|-------------|
| `onView` | View resource details |
| `onEdit` | Open edit form |
| `onDelete` | Show delete confirmation |
| `onCreate` | Open create form |
| `onToggleAvailability` | Toggle available/occupied |
| `onSelectForSession` | Select for new session |

## Expected User Flows

### Flow 1: Create Resource
1. User clicks "Add Resource"
2. User enters name, selects type, sets hourly rate
3. User clicks "Create Resource"
4. **Outcome:** Resource appears in grid

### Flow 2: Toggle Availability
1. User clicks availability toggle on resource
2. **Outcome:** Status changes, visual indicator updates

### Flow 3: Delete Resource
1. User clicks delete on unused resource
2. User confirms deletion
3. **Outcome:** Resource removed (blocked if active session)

## Files to Reference

- `product-plan/sections/resources/` — All section files

## Done When

- [ ] Resource grid displays all resources
- [ ] Filter by type works
- [ ] Create resource form works
- [ ] Edit resource form works
- [ ] Availability toggle works
- [ ] Delete with confirmation works
- [ ] Cannot delete resource with active session
- [ ] Empty state shows when no resources
