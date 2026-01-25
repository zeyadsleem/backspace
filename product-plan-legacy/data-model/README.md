# Backspace Data Model

## Overview

Backspace uses 7 core entities to manage coworking space operations.

## Entities

### Customer
A person who uses the coworking space. Customers can be visitors (pay-per-session) or subscribers (weekly, half-monthly, or monthly plans).

**Key Fields:**
- `id` — UUID
- `humanId` — Human-readable ID (C-001, C-002, etc.)
- `name` — Full name
- `phone` — Egyptian phone number (validated)
- `email` — Optional email address
- `customerType` — visitor | weekly | half-monthly | monthly
- `balance` — Account balance (can be negative)
- `notes` — Additional notes
- `createdAt` — Creation timestamp

### Resource
A bookable space unit within the coworking facility.

**Key Fields:**
- `id` — UUID
- `name` — Resource name (e.g., "Seat A1", "Meeting Room 1")
- `resourceType` — seat | room | desk
- `ratePerHour` — Hourly rate in EGP
- `isAvailable` — Current availability status
- `createdAt` — Creation timestamp

### Session
A time-bounded usage period when a customer occupies a resource.

**Key Fields:**
- `id` — UUID
- `customerId` — Reference to Customer
- `resourceId` — Reference to Resource
- `startedAt` — Session start time
- `endedAt` — Session end time (null if active)
- `durationMinutes` — Calculated duration
- `amount` — Session cost (0 if subscribed)
- `createdAt` — Creation timestamp

### Subscription
A time-based access plan granting unlimited session access.

**Key Fields:**
- `id` — UUID
- `customerId` — Reference to Customer
- `planType` — weekly | half-monthly | monthly
- `startDate` — Subscription start date
- `endDate` — Auto-calculated end date
- `isActive` — Current status
- `createdAt` — Creation timestamp

### Inventory
A consumable item available for purchase during sessions.

**Key Fields:**
- `id` — UUID
- `name` — Item name
- `category` — beverage | snack | meal
- `price` — Current price in EGP
- `quantity` — Current stock level
- `minStock` — Minimum threshold for alerts
- `createdAt` — Creation timestamp

### InventoryConsumption
A record of an inventory item consumed during a session.

**Key Fields:**
- `id` — UUID
- `sessionId` — Reference to Session
- `inventoryId` — Reference to Inventory
- `quantity` — Quantity consumed
- `priceAtConsumption` — Price locked at consumption time
- `createdAt` — Consumption timestamp

### Invoice
A billing document generated at session end.

**Key Fields:**
- `id` — UUID
- `invoiceNumber` — Human-readable number (INV-0001)
- `customerId` — Reference to Customer
- `sessionId` — Optional reference to Session
- `amount` — Subtotal
- `discount` — Discount percentage
- `total` — Final amount
- `paidAmount` — Amount paid so far
- `status` — paid | unpaid | pending
- `dueDate` — Payment due date
- `paidDate` — Date fully paid
- `lineItems` — Array of line items
- `payments` — Array of payment records
- `createdAt` — Creation timestamp

## Relationships

```
Customer ─┬─< Session >─┬─ Resource
          │             │
          │             └─< InventoryConsumption >─ Inventory
          │
          ├─< Subscription
          │
          └─< Invoice >─ Session (optional)
```

- Customer has many Sessions, Subscriptions, and Invoices
- Session belongs to one Customer and one Resource
- Session has many InventoryConsumptions
- Session has one Invoice (generated at end)
- InventoryConsumption belongs to one Session and one Inventory item
- Invoice belongs to one Customer and optionally one Session
