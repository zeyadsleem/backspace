# Backspace - ERP System Design Document

## 📋 Document Information

**Product**: Backspace ERP System
**Version**: 1.0.0
**Last Updated**: January 5, 2026
**Status**: Active
**Authors**: Backspace Development Team

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│                    (React + TypeScript)                     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │     Hooks    │      │
│  │  (Routes)    │  │   (UI Lib)   │  │ (Custom &   │      │
│  │              │  │              │  │  Query)     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                       │
│                    │  State Mgmt     │                       │
│                    │ (TanStack Query)│                       │
│                    └───────┬────────┘                       │
└────────────────────────────┼────────────────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │  Tauri IPC Bridge (API)     │
              │  (invoke commands)           │
              └──────────────┬──────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                   Backend Layer (Rust)                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Commands   │  │  Validation  │  │   Database   │      │
│  │   (Handlers) │  │    Module    │  │  (SQLite)    │      │
│  └──────────────┘  └──────────────┘  └──────┬───────┘      │
│                                              │              │
└──────────────────────────────────────────────┘              │
                                              │
                             ┌──────────────▼──────────────┐
                             │   Local SQLite Database      │
                             │   (Single File Storage)      │
                             └─────────────────────────────┘
```

### Technology Stack

#### Frontend

| Technology      | Version | Purpose                 |
| --------------- | ------- | ----------------------- |
| React           | 19.2.3  | UI Framework            |
| TypeScript      | 5.x     | Type Safety             |
| TanStack Router | 1.141.1 | Client-side Routing     |
| TanStack Query  | 5.90.12 | Server State Management |
| TanStack Form   | 1.12.3  | Form State Management   |
| Zod             | 4.1.13  | Schema Validation       |
| TailwindCSS     | 4.0.15  | Styling                 |
| shadcn/ui       | Latest  | UI Components           |
| Lucide React    | 0.473.0 | Icons                   |
| Next Themes     | 0.4.6   | Theme Management        |
| Sonner          | 2.0.5   | Toast Notifications     |

#### Backend

| Technology        | Version | Purpose            |
| ----------------- | ------- | ------------------ |
| Rust              | 1.77.2+ | Backend Language   |
| Tauri             | 2.9.5   | Desktop Framework  |
| SQLite (rusqlite) | 0.32    | Database Engine    |
| UUID              | 4.x     | Unique IDs         |
| Chrono            | 0.4     | Date/Time Handling |
| Serde             | 1.x     | Serialization      |

---

## 🗄️ Database Design

### Entity Relationship Diagram

```
┌─────────────────┐
│   customers     │
├─────────────────┤
│ id (PK)         │───────┐
│ human_id        │       │
│ name            │       │
│ phone           │       │
│ email           │       │
│ customer_type   │       │
│ balance         │       │
│ notes           │       │
│ created_at      │       │
└─────────────────┘       │
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        │                 │                 │
┌───────▼────────┐  ┌────▼─────────┐  ┌──▼──────────────┐
│   sessions     │  │  invoices    │  │  subscriptions   │
├────────────────┤  ├──────────────┤  ├─────────────────┤
│ id (PK)        │  │ id (PK)      │  │ id (PK)         │
│ customer_id FK │  │ customer_id FK│ │ customer_id FK   │
│ resource_id FK  │  │ amount       │  │ plan_type       │
│ started_at     │  │ status       │  │ start_date      │
│ ended_at       │  │ due_date     │  │ end_date        │
│ duration_min   │  │ paid_date    │  │ hours_allowance │
│ amount         │  │ created_at   │  │ is_active       │
│ created_at     │  └──────────────┘  │ created_at      │
└────────────────┘                    └─────────────────┘
        │
        │
┌───────▼────────┐
│   resources     │
├────────────────┤
│ id (PK)         │
│ name            │
│ resource_type   │
│ rate_per_hour   │
│ is_available    │
│ created_at      │
└────────────────┘

┌─────────────────┐
│   inventory     │
├─────────────────┤
│ id (PK)         │
│ name            │
│ quantity        │
│ min_stock       │
│ price           │
│ created_at      │
└─────────────────┘
```

### Table Schemas

#### 1. customers

```sql
CREATE TABLE customers (
    id TEXT PRIMARY KEY,                    -- UUID
    human_id TEXT NOT NULL UNIQUE,          -- Human-readable ID (C-001)
    name TEXT NOT NULL,                     -- Full name
    phone TEXT NOT NULL UNIQUE,             -- Phone number
    email TEXT,                            -- Email address
    customer_type TEXT NOT NULL,           -- 'visitor' | 'monthly' | 'quarterly' | 'annual'
    balance REAL DEFAULT 0,                 -- Account balance
    notes TEXT,                            -- Additional notes
    created_at TEXT NOT NULL                -- ISO 8601 timestamp
);

CREATE INDEX idx_customers_human_id ON customers(human_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_type ON customers(customer_type);
```

**Constraints:**

- `human_id`: Auto-incremented format (C-001, C-002, ...)
- `phone`: Must be valid Egyptian format (10 or 11 digits starting with 1)
- `customer_type`: Enum values
- `balance`: Can be negative (debt) or positive (credit)

#### 2. resources

```sql
CREATE TABLE resources (
    id TEXT PRIMARY KEY,                    -- UUID
    name TEXT NOT NULL,                     -- Resource name (e.g., "Seat A1")
    resource_type TEXT NOT NULL,            -- 'seat' | 'room' | 'desk'
    rate_per_hour REAL NOT NULL,            -- Hourly rate
    is_available INTEGER NOT NULL DEFAULT 1, -- Boolean (0 or 1)
    created_at TEXT NOT NULL                -- ISO 8601 timestamp
);

CREATE INDEX idx_resources_type ON resources(resource_type);
CREATE INDEX idx_resources_availability ON resources(is_available);
```

**Constraints:**

- `rate_per_hour`: Must be > 0
- `is_available`: 1 = available, 0 = occupied
- `resource_type`: Enum values

#### 3. sessions

```sql
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,                    -- UUID
    customer_id TEXT NOT NULL,              -- Customer UUID
    resource_id TEXT NOT NULL,              -- Resource UUID
    started_at TEXT NOT NULL,                -- Session start time
    ended_at TEXT,                         -- Session end time (NULL if active)
    duration_minutes INTEGER,                -- Duration in minutes (NULL if active)
    amount REAL,                           -- Calculated cost (NULL if active)
    created_at TEXT NOT NULL                -- ISO 8601 timestamp
);

CREATE INDEX idx_sessions_customer ON sessions(customer_id);
CREATE INDEX idx_sessions_resource ON sessions(resource_id);
CREATE INDEX idx_sessions_started_at ON sessions(started_at);
CREATE INDEX idx_sessions_ended_at ON sessions(ended_at);
CREATE INDEX idx_sessions_active ON sessions(ended_at) WHERE ended_at IS NULL;

FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE RESTRICT
```

**Constraints:**

- `started_at`: Cannot be in the future
- `ended_at`: Must be >= started_at if not NULL
- `duration_minutes`: Auto-calculated on session end
- `amount`: Auto-calculated as `(duration_minutes / 60) * resource.rate_per_hour`

#### 4. subscriptions

```sql
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY,                    -- UUID
    customer_id TEXT NOT NULL,              -- Customer UUID
    plan_type TEXT NOT NULL,                -- 'weekly' | 'half-monthly' | 'monthly'
    start_date TEXT NOT NULL,               -- Subscription start date
    end_date TEXT,                          -- Subscription end date
    hours_allowance INTEGER,                -- Included hours (NULL = unlimited)
    is_active INTEGER NOT NULL DEFAULT 1,    -- Boolean (0 or 1)
    created_at TEXT NOT NULL                -- ISO 8601 timestamp
);

CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_plan_type ON subscriptions(plan_type);
CREATE INDEX idx_subscriptions_active ON subscriptions(is_active);
CREATE INDEX idx_subscriptions_dates ON subscriptions(start_date, end_date);

FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
```

**Constraints:**

- `plan_type`: Enum values
- `start_date`: Cannot be in the future
- `end_date`: Auto-calculated based on plan_type if not provided
- `hours_allowance`: Hours included in subscription (can be 0)
- `is_active`: 1 = active, 0 = inactive

**Plan Type Configurations:**

- `weekly`: +7 days from start_date
- `half-monthly`: +15 days from start_date
- `monthly`: +30 days from start_date

#### 5. invoices

```sql
CREATE TABLE invoices (
    id TEXT PRIMARY KEY,                    -- UUID
    customer_id TEXT NOT NULL,              -- Customer UUID
    amount REAL NOT NULL,                   -- Total amount
    status TEXT NOT NULL,                   -- 'paid' | 'unpaid' | 'pending'
    due_date TEXT NOT NULL,                 -- Invoice due date
    paid_date TEXT,                         -- Payment date
    created_at TEXT NOT NULL                -- ISO 8601 timestamp
);

CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);

FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
```

**Constraints:**

- `status`: Enum values
- `due_date`: Must be >= created_at
- `paid_date`: Required when status is 'paid'
- `amount`: Must be > 0

#### 6. invoice_items

```sql
CREATE TABLE invoice_items (
    id TEXT PRIMARY KEY,                    -- UUID
    invoice_id TEXT NOT NULL,               -- Invoice UUID
    description TEXT NOT NULL,              -- Item description
    quantity INTEGER NOT NULL,              -- Item quantity
    unit_price REAL NOT NULL,               -- Price per unit
    total REAL NOT NULL,                    -- Line item total (quantity * unit_price)
    created_at TEXT NOT NULL                -- ISO 8601 timestamp
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
```

**Constraints:**

- `quantity`: Must be > 0
- `unit_price`: Must be >= 0
- `total`: Auto-calculated as `quantity * unit_price`

#### 7. inventory

```sql
CREATE TABLE inventory (
    id TEXT PRIMARY KEY,                    -- UUID
    name TEXT NOT NULL,                     -- Item name
    quantity INTEGER NOT NULL DEFAULT 0,     -- Current stock
    min_stock INTEGER NOT NULL DEFAULT 0,    -- Minimum stock threshold
    price REAL NOT NULL,                     -- Price per unit
    created_at TEXT NOT NULL                -- ISO 8601 timestamp
);

CREATE INDEX idx_inventory_name ON inventory(name);
CREATE INDEX idx_inventory_quantity ON inventory(quantity);
```

**Constraints:**

- `quantity`: Must be >= 0
- `min_stock`: Must be >= 0
- `price`: Must be >= 0

---

## 🔌 API Design

### Command Pattern

All backend functionality is exposed through Tauri commands following this pattern:

```rust
#[tauri::command]
pub async fn command_name(
    state: State<DbConn>,
    param1: Type1,
    param2: Type2
) -> Result<ReturnType, String> {
    // Implementation
}
```

### API Commands Reference

#### Customer Commands

```typescript
// Get all customers
get_customers(): Promise<Customer[]>

// Get single customer
get_customer(id: string): Promise<Customer>

// Create customer
create_customer(data: CreateCustomer): Promise<Customer>

// Update customer
update_customer(id: string, data: UpdateCustomer): Promise<Customer>

// Delete customer
delete_customer(id: string): Promise<void>
```

**Input/Output Types:**

```typescript
interface Customer {
  id: string;
  humanId: string;
  name: string;
  phone: string;
  email?: string;
  customerType: 'visitor' | 'monthly' | 'quarterly' | 'annual';
  balance: number;
  notes?: string;
  createdAt: string;
}

interface CreateCustomer {
  name: string;
  phone: string;
  email?: string;
  customerType: 'visitor' | 'monthly' | 'quarterly' | 'annual';
  notes?: string;
}

interface UpdateCustomer {
  name?: string;
  phone?: string;
  email?: string;
  customerType?: 'visitor' | 'monthly' | 'quarterly' | 'annual';
  balance?: number;
  notes?: string;
}
```

#### Resource Commands

```typescript
get_resources(): Promise<Resource[]>
get_resource(id: string): Promise<Resource>
create_resource(data: CreateResource): Promise<Resource>
update_resource(id: string, data: UpdateResource): Promise<Resource>
delete_resource(id: string): Promise<void>
```

**Types:**

```typescript
interface Resource {
  id: string;
  name: string;
  resourceType: 'seat' | 'room' | 'desk';
  ratePerHour: number;
  isAvailable: boolean;
  createdAt: string;
}

interface CreateResource {
  name: string;
  resourceType: 'seat' | 'room' | 'desk';
  ratePerHour: number;
}

interface UpdateResource {
  name?: string;
  resourceType?: 'seat' | 'room' | 'desk';
  ratePerHour?: number;
  isAvailable?: boolean;
}
```

#### Session Commands

```typescript
get_sessions(): Promise<SessionWithDetails[]>
get_session(id: string): Promise<SessionWithDetails>
get_active_sessions(): Promise<SessionWithDetails[]>
start_session(data: CreateSession): Promise<Session>
end_session(id: string): Promise<SessionWithDetails>
```

**Types:**

```typescript
interface SessionWithDetails {
  id: string;
  customerId: string;
  customerName: string;
  customerHumanId: string;
  resourceId: string;
  resourceName: string;
  resourceType: string;
  ratePerHour: number;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  amount: number | null;
  createdAt: string;
}

interface CreateSession {
  customerId: string;
  resourceId: string;
}
```

#### Subscription Commands

```typescript
get_subscriptions(): Promise<Subscription[]>
get_subscription(id: string): Promise<Subscription>
create_subscription(data: CreateSubscription): Promise<Subscription>
update_subscription(id: string, data: UpdateSubscription): Promise<Subscription>
delete_subscription(id: string): Promise<void>
```

**Types:**

```typescript
interface Subscription {
  id: string;
  customerId: string;
  customerName: string | null;
  customerHumanId: string | null;
  planType: 'weekly' | 'half-monthly' | 'monthly';
  startDate: string;
  endDate: string | null;
  hoursAllowance: number | null;
  isActive: boolean;
  createdAt: string;
}

interface CreateSubscription {
  customerId: string;
  planType: 'weekly' | 'half-monthly' | 'monthly';
  startDate: string;
  endDate?: string | null;
  hoursAllowance?: number | null;
}

interface UpdateSubscription {
  planType?: 'weekly' | 'half-monthly' | 'monthly';
  startDate?: string;
  endDate?: string | null;
  hoursAllowance?: number | null;
  isActive?: boolean;
}
```

#### Invoice Commands

```typescript
get_invoices(): Promise<Invoice[]>
get_invoice(id: string): Promise<InvoiceWithItems>
create_invoice(data: CreateInvoice): Promise<Invoice>
update_invoice(id: string, data: UpdateInvoice): Promise<Invoice>
delete_invoice(id: string): Promise<void>
```

**Types:**

```typescript
interface InvoiceWithItems {
  id: string;
  customerId: string;
  customerName: string | null;
  customerHumanId: string | null;
  amount: number;
  status: 'paid' | 'unpaid' | 'pending';
  dueDate: string;
  paidDate: string | null;
  createdAt: string;
  items: InvoiceItem[];
}

interface CreateInvoice {
  customerId: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'pending';
  dueDate: string;
  items: CreateInvoiceItem[];
}

interface CreateInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface UpdateInvoice {
  status?: 'paid' | 'unpaid' | 'pending';
  paidDate?: string;
}
```

#### Inventory Commands

```typescript
get_inventory(): Promise<Inventory[]>
get_inventory_item(id: string): Promise<Inventory>
create_inventory(data: CreateInventory): Promise<Inventory>
update_inventory(id: string, data: UpdateInventory): Promise<Inventory>
delete_inventory(id: string): Promise<void>
```

**Types:**

```typescript
interface Inventory {
  id: string;
  name: string;
  quantity: number;
  minStock: number;
  price: number;
  createdAt: string;
}

interface CreateInventory {
  name: string;
  quantity: number;
  minStock: number;
  price: number;
}

interface UpdateInventory {
  name?: string;
  quantity?: number;
  minStock?: number;
  price?: number;
}
```

#### Report Commands

```typescript
get_daily_revenue(): Promise<DailyRevenue[]>
get_top_customers(limit?: number): Promise<TopCustomer[]>
get_resource_utilization(): Promise<ResourceUtilization[]>
get_overview_stats(): Promise<OverviewStats>
```

**Types:**

```typescript
interface DailyRevenue {
  period: string;
  revenue: number;
  sessions: number;
  customers: number;
}

interface TopCustomer {
  rank: number;
  name: string;
  totalSpent: number;
  sessions: number;
}

interface ResourceUtilization {
  name: string;
  usage: number;
  total: number;
}

interface OverviewStats {
  totalRevenue: number;
  totalSessions: number;
  activeCustomers: number;
  averageSessionAmount: number;
}
```

#### Database Commands

```typescript
reset_database(): Promise<void>
```

---

## 🎨 Frontend Architecture

### Directory Structure

```
src/
├── components/              # Reusable UI components
│   ├── ui/                 # Base UI components (shadcn/ui)
│   ├── customers/          # Customer-specific components
│   ├── sessions/           # Session-specific components
│   ├── shared/             # Shared components
│   └── layout/             # Layout components
├── routes/                 # Page routes
│   ├── index.tsx           # Dashboard
│   ├── customers.tsx       # Customer list
│   ├── customers.$id.tsx   # Customer detail
│   ├── resources.tsx       # Resources page
│   ├── sessions.tsx        # Sessions page
│   ├── subscriptions.tsx   # Subscriptions page
│   ├── inventory.tsx       # Inventory page
│   └── settings.tsx       # Settings page
├── lib/                    # Core libraries
│   ├── tauri-api.ts        # API client
│   ├── i18n.ts             # Internationalization
│   ├── formatters.ts       # Data formatters
│   └── validation/         # Validation schemas
│       ├── schemas/        # Zod schemas
│       └── validators/     # Custom validators
├── hooks/                  # Custom React hooks
│   ├── use-customers.ts
│   ├── use-resources.ts
│   ├── use-sessions.ts
│   └── use-subscriptions.ts
├── features/               # Feature modules
│   └── customers/         # Customer feature
│       ├── components/     # Feature components
│       ├── hooks/          # Feature hooks
│       └── schemas/        # Feature schemas
└── styles/                 # Global styles
    └── index.css          # Tailwind + custom styles
```

### Component Architecture

#### Page Components

```typescript
// Example: customers.tsx
export default function CustomersPage() {
  // Hooks
  const { data: customers, isLoading } = useCustomers();
  const { language, dir } = useI18n();

  // State
  const [searchQuery, setSearchQuery] = useState('');

  // Render
  return (
    <div className="container mx-auto p-6" dir={dir}>
      <PageHeader />
      <CustomerTable data={customers} />
    </div>
  );
}
```

#### Feature Components

```typescript
// Example: customer-form.tsx
export function CustomerForm({
  mode = 'create',
  customer,
  onSuccess,
}) {
  const form = useCustomerForm({ mode, customer, onSuccess });

  return (
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit}>
        <CustomerBasicInfo />
        <CustomerContactInfo />
        <CustomerPlanSelection />
        <FormActions />
      </Form>
    </FormProvider>
  );
}
```

#### UI Primitives

```typescript
// Example: form-field.tsx
export function FormField({
  label,
  error,
  hint,
  children,
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {hint && <HintMessage>{hint}</HintMessage>}
    </div>
  );
}
```

### State Management

#### Data Fetching (TanStack Query)

```typescript
// Hook: use-customers.ts
export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => api.customers.list(),
  });
}

// Usage in component
const { data: customers, isLoading, error } = useCustomers();
```

#### Mutations (TanStack Query)

```typescript
// Hook: use-create-customer.ts
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomer) =>
      api.customers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// Usage in component
const createCustomer = useCreateCustomer();
await createCustomer.mutateAsync(formData);
```

### Form Management

#### TanStack Form + Zod

```typescript
// Schema: customer.ts
export const createCustomerSchema = z.object({
  name: z.string().min(1),
  phone: egyptianPhoneSchema,
  email: emailSchema.optional(),
  customerType: customerTypeSchema,
});

// Hook: use-customer-form.ts
export function useCustomerForm({ mode, customer }) {
  const form = useForm({
    defaultValues: getDefaultValues(mode, customer),
    onSubmit: async ({ value }) => {
      const validated = createCustomerSchema.parse(value);
      await api.customers.create(validated);
    },
  });

  return form;
}

// Usage in component
const form = useCustomerForm({ mode: 'create' });
<form.Field
  name="name"
  children={(field) => (
    <Input
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
/>
```

---

## 🔒 Security Design

### Input Validation

#### Frontend Validation

```typescript
// Egyptian Phone Validation
const egyptianPhoneSchema = z.string().regex(
  /^(\+20|0)?1[0125]\d{8}$/,
  'Invalid Egyptian phone number'
);

// Email Validation (RFC 5322)
const emailSchema = z.string()
  .email('Invalid email address')
  .refine(email => !isDisposableEmail(email), 'Disposable emails not allowed');
```

#### Backend Validation

```rust
// Egyptian Phone Validation (Rust)
pub fn validate_egyptian_phone(phone: &str) -> Result<(), AppError> {
    let normalized = normalize_phone(phone)?;
    if !regex::Regex::new(r"^1[0125]\d{8}$")?.is_match(&normalized) {
        return Err(AppError::Validation(
            "Invalid Egyptian phone number".to_string()
        ));
    }
    Ok(())
}

```

### SQL Injection Prevention

```rust
// Parameterized queries (rusqlite)
conn.execute(
    "INSERT INTO customers (id, name, phone) VALUES (?, ?, ?)",
    params![id, name, phone]
)?;

// Safe - no string concatenation
```

### Data Sanitization

```rust
// Input trimming and validation
pub fn sanitize_string(input: &str) -> String {
    input.trim().to_string()
}
```

---

## 📊 Validation Module

### Egyptian Phone Validator

**Features:**

- Normalize phone numbers (+20 → 0)
- Validate Egyptian carrier prefixes (010, 011, 012, 015)
- Detect carrier type (Vodafone, Etisalat, Orange, WE)
- International format support

**Implementation:**

```typescript
// src/lib/validation/validators/egyptian-phone.ts
export function validateEgyptianPhone(
  phone: string
): Result<ValidatedPhone, ValidationError> {
  const normalized = normalizePhone(phone);
  const carrier = detectCarrier(normalized);

  if (!isValidPhone(normalized)) {
    return { success: false, error: 'Invalid Egyptian phone number' };
  }

  return {
    success: true,
    data: {
      original: phone,
      normalized,
      international: `+20${normalized.substring(1)}`,
      carrier,
    },
  };
}
```

### Email Validator

**Features:**

- RFC 5322 compliant validation
- Disposable email detection
- Common typos detection
- Domain validation

**Implementation:**

```typescript
// src/lib/validation/validators/email.ts
export function validateEmail(
  email: string
): Result<ValidatedEmail, ValidationError> {
  if (!isValidEmailFormat(email)) {
    return { success: false, error: 'Invalid email format' };
  }

  if (isDisposableEmail(email)) {
    return { success: false, error: 'Disposable emails not allowed' };
  }

  return {
    success: true,
    data: {
      email: email.toLowerCase(),
      domain: extractDomain(email),
      suggestions: suggestCorrections(email),
    },
  };
}
```

---

## 🧪 Testing Strategy

### Unit Tests

#### Frontend (Vitest)

```typescript
// Example: egyptian-phone.test.ts
import { describe, it, expect } from 'vitest';
import { validateEgyptianPhone } from './egyptian-phone';

describe('validateEgyptianPhone', () => {
  it('should validate valid Vodafone number', () => {
    const result = validateEgyptianPhone('01012345678');
    expect(result.success).toBe(true);
    expect(result.data?.carrier).toBe('Vodafone');
  });

  it('should reject invalid phone number', () => {
    const result = validateEgyptianPhone('1234567890');
    expect(result.success).toBe(false);
  });
});
```

#### Backend (Rust)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_egyptian_phone_valid() {
        let result = validate_egyptian_phone("01012345678");
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_egyptian_phone_invalid() {
        let result = validate_egyptian_phone("1234567890");
        assert!(result.is_err());
    }
}
```

### E2E Tests (Playwright)

```typescript
// Example: customer-form.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Customer Form', () => {
  test('should create new customer', async ({ page }) => {
    await page.goto('/customers');
    await page.getByRole('button', { name: 'Add Customer' }).click();
    await page.getByLabel('Name').fill('Test Customer');
    await page.getByLabel('Phone').fill('01012345678');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Customer created')).toBeVisible();
  });
});
```

### Test Coverage Goals

- Unit tests: 80%+ coverage
- E2E tests: Critical user flows
- Integration tests: API commands

---

## 📈 Performance Optimization

### Frontend Optimization

1. **Code Splitting**: Lazy load routes and components
2. **Memoization**: React.memo, useMemo, useCallback
3. **Query Caching**: TanStack Query caching
4. **Virtual Scrolling**: For long lists
5. **Bundle Size**: Tree shaking, minification

### Backend Optimization

1. **Database Indexing**: Indexed queries
2. **Query Optimization**: JOIN efficiency
3. **Connection Pooling**: SQLite connection management
4. **Caching**: In-memory caching for frequently accessed data

### Performance Targets

- Initial load: < 3 seconds
- Page navigation: < 1 second
- API response: < 500ms
- Form submission: < 1 second

---

## 🔄 Data Flow

### Session Lifecycle

```
User Action           Frontend          Backend           Database
   │                    │                 │                  │
   │  Start Session     │                 │                  │
   ├───────────────────>│                 │                  │
   │                    │  invoke()       │                  │
   │                    ├────────────────>│                  │
   │                    │                 │  INSERT sessions   │
   │                    │                 ├─────────────────>│
   │                    │                 │<─────────────────┤
   │                    │<────────────────┤                  │
   │<───────────────────┤                 │                  │
   │                    │                 │                  │
   │  End Session       │                 │                  │
   ├───────────────────>│                 │                  │
   │                    │  invoke()       │                  │
   │                    ├────────────────>│                  │
   │                    │                 │  UPDATE sessions   │
   │                    │                 │  (calc duration,  │
   │                    │                 │   amount)          │
   │                    │                 ├─────────────────>│
   │                    │                 │<─────────────────┤
   │                    │<────────────────┤                  │
   │<───────────────────┤                 │                  │
```

### Invoice Creation Flow

```
1. End Session → Calculate Cost
2. Add Inventory Items → Calculate Line Items
3. Review Invoice → Display Summary
4. Confirm → Create Invoice Record
5. Print → Generate PDF/Print View
```

---

## 🚨 Error Handling

### Error Types

```typescript
// Frontend Error Types
enum AppError {
  ValidationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  NetworkError,
}

// Backend Error Types
enum AppError {
  Validation(String),
  NotFound(String),
  Conflict(String),
  Database(String),
}
```

### Error Display

```typescript
// Toast notifications (Sonner)
toast.error(
  language === 'ar'
    ? `فشل: ${errorMessage}`
    : `Failed: ${errorMessage}`
);

// Form errors
<ErrorMessage>{errors.name?.message}</ErrorMessage>
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  /* Single column layout */
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  /* Two column layout */
}

/* Desktop */
@media (min-width: 1025px) {
  /* Multi column layout */
}
```

### Mobile Optimizations

- Touch-friendly buttons (min 44x44px)
- Bottom navigation
- Swipe gestures
- Optimized forms

---

## 🌐 Internationalization

### Supported Languages

- **Arabic (ar)**: RTL support, Egyptian phone formats
- **English (en)**: LTR support

### Translation Structure

```typescript
// src/lib/i18n.ts
export const translations = {
  customers: {
    title: {
      ar: 'العملاء',
      en: 'Customers',
    },
    // ...
  },
};

// Usage
const t = translations.customers.title[language];
```

### RTL/LTR Support

```typescript
const { dir } = useI18n(); // 'rtl' or 'ltr'

<div dir={dir}>
  {/* Content */}
</div>
```

---

## 📊 Analytics & Monitoring

### Metrics to Track

- Page load times
- API response times
- User actions (create, update, delete)
- Error rates
- Feature usage

### Logging

```typescript
// Console logging
console.log('[App]', 'Action completed', data);

// Error logging
console.error('[App]', 'Error occurred', error);

// Backend logging (Rust)
println!("[INFO] Customer created: {}", customer_id);
```

---

## 🔄 Future Enhancements

### Potential Features

1. **Multi-user support**: Role-based access control
2. **Cloud sync**: Backup to cloud storage
3. **API integration**: External accounting software
4. **SMS notifications**: Session reminders
5. **Mobile app**: iOS and Android apps
6. **Resource booking**: Future reservations
7. **Automated workflows**: Subscription renewals

### Scalability Considerations

- Database migration (PostgreSQL for cloud)
- API layer (REST or GraphQL)
- Microservices architecture
- Load balancing

---

## 📚 Documentation

### Code Documentation

- JSDoc for TypeScript
- Rustdoc for Rust
- README for each feature module

### User Documentation

- User manual (Arabic/English)
- Video tutorials
- FAQ section
- Support contact

---

## ✅ Version History

| Version | Date        | Changes                 |
| ------- | ----------- | ----------------------- |
| 1.0.0   | Jan 5, 2026 | Initial design document |

---

## 📝 Change Requests

All change requests must be submitted through the project management system and approved by the technical lead before implementation.

---

## 🔗 Related Documents

- [Product Requirements Document (PRD)](./PRD.md)
- [Design System](./design-system.md)
- [API Documentation](../src/lib/tauri-api.ts)
- [Database Schema](../src-tauri/src/database.rs)
