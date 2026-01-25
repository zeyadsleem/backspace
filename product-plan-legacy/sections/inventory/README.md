# Inventory Section

## Overview
The Inventory section manages all consumable items available for purchase during sessions—beverages, snacks, and meals. It supports dynamic pricing, stock tracking, minimum threshold alerts, and consumption reporting.

## Components

- **InventoryList** - Main list view with category filtering and search
- **InventoryItemCard** - Individual item card with quantity controls
- **InventoryForm** - Form for creating/editing inventory items
- **InventoryDialog** - Modal dialog wrapper for the inventory form
- **LowStockAlert** - Alert banner for items below minimum stock

## User Flows

- Add a new inventory item with name, category, price, quantity, and minimum stock threshold
- View all inventory items organized by category
- Update item quantity (add stock or adjust)
- Update item price (for market changes)
- Set minimum stock threshold per item
- View low stock alerts for items below threshold
- View out-of-stock items prominently
- Delete inventory item (with confirmation)

## UI Requirements

- Inventory item form with name, category dropdown (Beverage/Snack/Meal), price input, quantity input, minimum stock input
- Inventory list grouped by category with expandable sections
- Item cards showing: Name, Price (EGP), Quantity, Min Stock, Status
- Quick +/- buttons for quantity adjustment
- Low stock warning badges (orange for low, red for out-of-stock)
- Low stock alert banner at top when items need restocking
- Category filter tabs or dropdown
- Search input for finding items

## Configuration

- shell: true
