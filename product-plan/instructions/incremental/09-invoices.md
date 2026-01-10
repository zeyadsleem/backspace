# Milestone 9: Invoices

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-8 complete

---

## Goal

Implement the Invoices section — billing and payment tracking.

## Overview

The Invoices section handles billing document generation and management. Invoices are created at session end with itemized breakdown of session costs and inventory consumptions.

**Key Functionality:**
- Auto-generate invoices from sessions
- Create manual invoices
- View invoices with status filtering
- Record payments (full and partial)
- Print/export invoices

## Components

| Component | Description |
|-----------|-------------|
| `InvoicesList` | List of all invoices |
| `InvoiceRow` | Individual invoice row |
| `InvoiceForm` | Create/edit form |
| `InvoiceDialog` | Form in modal |
| `PaymentForm` | Record payment form |
| `PaymentDialog` | Payment in modal |

## Data Layer

```typescript
interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  sessionId: string | null
  amount: number
  discount: number
  total: number
  paidAmount: number
  status: 'paid' | 'unpaid' | 'pending'
  dueDate: string
  paidDate: string | null
  lineItems: LineItem[]
  payments: Payment[]
}
```

## Status Colors

| Status | Color | Description |
|--------|-------|-------------|
| Paid | Green | Fully paid |
| Unpaid | Red | No payment |
| Pending | Orange | Partial payment |

## Callbacks

| Callback | Description |
|----------|-------------|
| `onView` | View invoice details |
| `onEdit` | Edit invoice |
| `onRecordPayment` | Open payment form |
| `onPrint` | Print invoice |
| `onCreate` | Create manual invoice |
| `onExport` | Export invoices |

## Expected User Flows

### Flow 1: View Invoice
1. User clicks on invoice row
2. User sees itemized breakdown
3. **Outcome:** Full invoice details displayed

### Flow 2: Record Payment
1. User clicks "Record Payment"
2. User enters amount, method, date
3. User clicks "Record"
4. **Outcome:** Payment recorded, status updates

### Flow 3: Partial Payment
1. User records payment less than total
2. **Outcome:** Status changes to "Pending", remaining balance shown

## Files to Reference

- `product-plan/sections/invoices/` — All section files

## Done When

- [ ] Invoice list displays with status filtering
- [ ] Invoice auto-generates from session end
- [ ] Manual invoice creation works
- [ ] Payment recording works
- [ ] Partial payments track remaining balance
- [ ] Status updates correctly
- [ ] Print layout works
- [ ] Currency formatting (EGP)
