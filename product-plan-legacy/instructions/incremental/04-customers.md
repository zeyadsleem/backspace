# Milestone 4: Customers

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-3 complete

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for TDD approach

**What you need to build:**
- Backend API endpoints for CRUD operations
- Egyptian phone number validation
- Data fetching and state management
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no customers exist

---

## Goal

Implement the Customers section — complete customer lifecycle management.

## Overview

The Customers section manages the complete customer lifecycle—from registration with Egyptian phone validation to profile management, history tracking, and balance management.

**Key Functionality:**
- Register new customers with Egyptian phone validation
- View customer list with search and filtering
- View individual customer profiles with history
- Edit customer details
- Track customer balance
- Delete customers with confirmation

## Components

Copy the components from `product-plan/sections/customers/components/`:

| Component | Description |
|-----------|-------------|
| `CustomersList` | Main list view with search/filter |
| `CustomerRow` | Individual customer row |
| `CustomerForm` | Create/edit form |
| `CustomerDialog` | Form in modal |
| `CustomerProfile` | Customer detail view |

## Data Layer

```typescript
interface Customer {
  id: string
  humanId: string
  name: string
  phone: string
  email: string | null
  customerType: 'visitor' | 'weekly' | 'half-monthly' | 'monthly'
  balance: number
  notes: string
  createdAt: string
  totalSessions: number
  totalSpent: number
}
```

## Callbacks

| Callback | Description |
|----------|-------------|
| `onView` | Navigate to customer profile |
| `onEdit` | Open edit form |
| `onDelete` | Show delete confirmation |
| `onCreate` | Open create form |
| `onExport` | Export customer list to CSV |
| `onBack` | Return to customer list |

## Expected User Flows

### Flow 1: Create New Customer
1. User clicks "Add Customer" button
2. User fills in name, phone (Egyptian format), email (optional), type
3. User clicks "Create Customer"
4. **Outcome:** Customer appears in list, success message shown

### Flow 2: View Customer Profile
1. User clicks on a customer row
2. User sees profile with stats, history tabs
3. **Outcome:** Full customer information displayed

### Flow 3: Edit Customer
1. User clicks edit button on customer
2. User modifies details
3. User clicks "Update Customer"
4. **Outcome:** Changes saved, profile updated

### Flow 4: Delete Customer
1. User clicks delete button
2. User confirms in dialog
3. **Outcome:** Customer removed, list updated

## Validation

**Egyptian Phone:**
- Format: 01[0125]XXXXXXXX
- 11 digits starting with 01
- Carriers: 010 (Vodafone), 011 (Etisalat), 012 (Orange), 015 (WE)

**Email:**
- Standard email format validation
- Optional field

## Files to Reference

- `product-plan/sections/customers/README.md` — Feature overview
- `product-plan/sections/customers/tests.md` — Test instructions
- `product-plan/sections/customers/components/` — React components
- `product-plan/sections/customers/types.ts` — TypeScript interfaces
- `product-plan/sections/customers/sample-data.json` — Test data

## Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] Customer list displays with search and filter
- [ ] Egyptian phone validation works
- [ ] Create customer form works
- [ ] Edit customer form works
- [ ] Delete with confirmation works
- [ ] Customer profile shows all details
- [ ] Empty state shows when no customers
- [ ] Responsive on mobile
