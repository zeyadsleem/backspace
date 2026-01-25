# Milestone 8: Inventory

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-7 complete

---

## Goal

Implement the Inventory section — stock management with dynamic pricing.

## Overview

The Inventory section manages all consumable items available for purchase during sessions—beverages, snacks, and meals. It supports dynamic pricing, stock tracking, and low stock alerts.

**Key Functionality:**
- Add inventory items with name, category, price, quantity
- Update quantities (+/- adjustments)
- Update prices for market changes
- Set minimum stock thresholds
- View low stock alerts
- Track consumption history

## Components

| Component | Description |
|-----------|-------------|
| `InventoryList` | List grouped by category |
| `InventoryItemCard` | Individual item card |
| `InventoryForm` | Create/edit form |
| `InventoryDialog` | Form in modal |
| `LowStockAlert` | Alert for low stock items |

## Data Layer

```typescript
interface InventoryItem {
  id: string
  name: string
  category: 'beverage' | 'snack' | 'meal'
  price: number
  quantity: number
  minStock: number
  createdAt: string
}
```

## Categories

| Category | Examples |
|----------|----------|
| Beverage | Tea, Coffee, Soft drinks, Juices |
| Snack | Chips, Biscuits, Chocolate, Nuts |
| Meal | Sandwiches, Instant noodles, Toast |

## Callbacks

| Callback | Description |
|----------|-------------|
| `onView` | View item details |
| `onEdit` | Open edit form |
| `onDelete` | Delete item |
| `onCreate` | Create new item |
| `onAdjustQuantity` | +/- quantity |
| `onUpdatePrice` | Update price |

## Expected User Flows

### Flow 1: Add Inventory Item
1. User clicks "Add Item"
2. User enters name, category, price, quantity, min stock
3. User clicks "Add"
4. **Outcome:** Item appears in list

### Flow 2: Adjust Quantity
1. User clicks +/- on item
2. **Outcome:** Quantity updates immediately

### Flow 3: Update Price
1. User edits price inline
2. **Outcome:** New price saved (doesn't affect past consumptions)

## Files to Reference

- `product-plan/sections/inventory/` — All section files

## Done When

- [ ] Inventory list displays grouped by category
- [ ] Create item form works
- [ ] Quantity adjustment works
- [ ] Price update works
- [ ] Low stock alert shows for items below threshold
- [ ] Out of stock items highlighted
- [ ] Delete with confirmation works
- [ ] Arabic/English labels work
