# AGENTS.md - Backspace Codebase Guide

Backspace is a Wails desktop application with a Go backend and React/TypeScript frontend.

## Project Structure

```
backspace/
├── app.go              # Main app logic and Wails bindings
├── main.go             # Entry point
├── backend/
│   ├── database/       # Database init and helpers
│   ├── models/         # GORM models
│   ├── service/        # Business logic services
│   └── finance/        # Financial calculations
├── frontend/src/
│   ├── components/     # React components (by feature)
│   ├── pages/          # Page components
│   ├── stores/         # Zustand state management
│   ├── lib/            # Utilities, validations, formatters
│   └── types/          # TypeScript type definitions
```

## Build & Test Commands

### Full Application

```bash
wails dev                    # Development mode with hot reload
wails build                  # Production build
```

### Backend Tests (Go)

```bash
go test ./...                              # Run all tests
go test -v -run TestAddCustomer ./...      # Run single test
go test -v -race -coverprofile=coverage.out ./...  # With coverage
```

### Frontend Tests (Vitest)

```bash
cd frontend
npm run test                               # Run all tests
npx vitest run src/test/validations.test.ts  # Single file
npx vitest run -t "customerSchema"         # Pattern match
npm run test:coverage -- --run             # With coverage
```

### Linting

```bash
cd frontend && npm run lint    # Check issues (Biome via Ultracite)
cd frontend && npm run format  # Auto-fix
go fmt ./...                   # Format Go code
```

## Subscription & Pricing Logic (New)

### Daily Cap Pricing
Resources now support a `maxPrice` (Daily Cap). The calculation logic in `backend/finance` ensures session cost never exceeds this cap per session.
- **Resource Model:** Added `MaxPrice int64`.
- **Session Model:** Added `ResourceMaxPrice int64` (snapshot at start).

### Subscription Operations
We have refactored subscription management to be transactional and accounting-friendly:
- **Upgrade:** `UpgradeSubscription` refunds the remaining days of the old plan to the customer's balance, then creates a new subscription.
- **Refund:** `RefundSubscription` supports both `cash` (creates a negative payment/refund record) and `balance` (adds to customer wallet).
- **Withdrawal:** `WithdrawBalance` allows customers to cash out their wallet balance, creating a negative payment record for tracking.

### Negative Payments
The `Payment` model and database constraints have been updated to allow negative amounts (`amount < 0`) to support refunds and withdrawals.

## Go Code Style

### Imports (grouped by: stdlib, external, internal)

```go
import (
    "errors"
    "fmt"

    "github.com/google/uuid"
    "gorm.io/gorm"

    "myproject/backend/database"
    "myproject/backend/models"
)
```

### Struct Tags

```go
type Customer struct {
    BaseModel
    HumanID string `json:"humanId" gorm:"uniqueIndex;not null"`
    Name    string `json:"name" gorm:"not null"`
}
```

### Error Handling

```go
if err := database.DB.First(&customer, "id = ?", id).Error; err != nil {
    return nil, fmt.Errorf("failed to fetch customer: %w", err)
}
```

### Validation Pattern

```go
func (a *App) AddCustomer(data models.Customer) error {
    if strings.TrimSpace(data.Name) == "" {
        return errors.New("customer name is required")
    }
    // proceed...
}
```

### Transactions

```go
return database.DB.Transaction(func(tx *gorm.DB) error {
    // multi-step operations
    return nil
})
```

### Test Pattern

```go
func TestAddCustomer_EmptyName(t *testing.T) {
    database.InitDB()
    defer database.CloseDB()
    app := NewApp()
    err := app.AddCustomer(models.Customer{Name: ""})
    assert.Error(t, err)
    assert.Contains(t, err.Error(), "name is required")
}
```

## TypeScript Code Style

### File Naming

- Components: `PascalCase.tsx` (e.g., `SubscriptionForm.tsx`)
- Utilities: `kebab-case.ts` or `camelCase.ts`

### Imports (external first, then @/ aliases)

```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";
import type { Customer } from "@/types";
```

### Component Structure

```typescript
interface Props {
  customers: Customer[];
  onSubmit?: (data: FormData) => void;
}

export function MyComponent({ customers, onSubmit }: Props) {
  const t = useAppStore((state) => state.t);
  return <div>{/* JSX */}</div>;
}
```

### Types (use interface for objects, type for unions)

```typescript
export type CustomerType = "visitor" | "weekly" | "monthly";
export interface Customer {
  id: string;
  name: string;
  customerType: CustomerType;
}
```

### Zustand Store Access

```typescript
const t = useAppStore((state) => state.t);
const customers = useAppStore((state) => state.customers);
```

### Currency (stored in piasters, 1 EGP = 100 piasters)

```typescript
import { toPiasters, formatCurrency } from "@/lib/formatters";
toPiasters(50); // 5000 (for backend)
formatCurrency(5000); // "50.00" (for display)
```

### Validation (Zod)

```typescript
export const customerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^01[0125][0-9]{8}$/),
});
```

### Formatting (Biome)

- 2 spaces indent, 100 char line width, no semicolons, double quotes

## Wails Communication

```go
// Backend (app.go)
func (a *App) GetCustomers() ([]models.Customer, error) { ... }
```

```typescript
// Frontend
import * as App from "../../wailsjs/go/main/App";
const customers = await App.GetCustomers();
```

## Important Notes

- Run `go test ./...` before committing Go changes
- Run `npm run lint` in frontend/ before committing TS changes
- All prices use piasters internally (multiply by 100)
- Use `t()` from store for translations, never hardcode strings
- App supports RTL (Arabic) - use `isRTL` from store for layout

## Important Note

After major changes, please update this file (@AGENTS.me). Keep this file up-to-date with the project's status.
