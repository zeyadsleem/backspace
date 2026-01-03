# Fast Plan - Backspace

## Goal

Leverage existing frontend and connect Tauri backend quickly. Frontend is already well-built with mock APIs - just need to replace with Tauri commands.

## Current State

**Frontend (Complete UI):**

- ✅ React 19, TanStack Router/Query, shadcn/ui
- ✅ Customers pages (list, detail, form)
- ✅ Navigation and layout
- ✅ Bilingual support (AR/EN)
- ✅ Using fetch() with mock API endpoints

**Backend (Empty):**

- ✅ Tauri setup done
- ❌ No commands implemented
- ❌ No database

## Fast Implementation Strategy

### Step 1: Setup Database (Rust) - 1 Day

- [ ] Install SQLite dependencies (rusqlite or libsql)
- [ ] Create database schema (customers, sessions, resources, etc.)
- [ ] Create database connection in Tauri
- [ ] Add migration setup

### Step 2: Create Type Definitions - 0.5 Day

- [ ] Create shared types file in Rust (Customer, Session, etc.)
- [ ] Use serde for JSON serialization
- [ ] Keep types consistent with frontend interfaces

### Step 3: Implement Customer Commands - 1 Day

- [ ] `get_customers()` - List all customers
- [ ] `get_customer(id)` - Get single customer
- [ ] `create_customer(data)` - Create new customer
- [ ] `update_customer(id, data)` - Update customer
- [ ] `delete_customer(id)` - Delete customer

### Step 4: Connect Frontend to Tauri - 0.5 Day

- [ ] Install @tauri-apps/api
- [ ] Create Tauri API wrapper (`src/lib/tauri-api.ts`)
- [ ] Replace fetch() calls with invoke()
- [ ] Update TanStack Query to use Tauri commands

### Step 5: Implement Remaining Commands - 3 Days

**Resources (0.5 day):**

- [ ] `get_resources()`
- [ ] `create_resource()`
- [ ] `update_resource()`

**Sessions (1 day):**

- [ ] `start_session(customerId, resourceId)`
- [ ] `end_session(sessionId)`
- [ ] `get_active_sessions()`

**Inventory (0.5 day):**

- [ ] `get_inventory()`
- [ ] `update_stock()`

**Subscriptions (0.5 day):**

- [ ] `get_subscriptions()`
- [ ] `create_subscription()`

**Invoices (0.5 day):**

- [ ] `get_invoices()`
- [ ] `create_invoice()`

### Step 6: Create Remaining Frontend Pages - 2 Days

- [ ] Resources page (seats/rooms table)
- [ ] Sessions page (active sessions, start/end)
- [ ] Inventory page (stock levels, movements)
- [ ] Subscriptions page (plans, management)
- [ ] Invoices page (billing, payments)
- [ ] Reports page (daily analytics)

### Step 7: Testing & Polish - 1 Day

- [ ] Test all flows end-to-end
- [ ] Add error handling with toasts
- [ ] Fix RTL issues
- [ ] Add loading states

**Total: ~9 Days**

## Code Structure

### Tauri Commands (src-tauri/src/commands/)

```rust
// mod.rs
pub mod customers;
pub mod sessions;
pub mod resources;

// customers.rs
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Customer {
    pub id: String,
    pub human_id: String,
    pub name: String,
    pub phone: String,
    pub email: Option<String>,
    pub customer_type: String,
    pub created_at: String,
}

#[tauri::command]
pub fn get_customers() -> Result<Vec<Customer>, String> {
    // Database query
}
```

### Frontend API Wrapper (src/lib/tauri-api.ts)

```ts
import { invoke } from "@tauri-apps/api/core";

export const api = {
  customers: {
    list: () => invoke<Customer[]>("get_customers"),
    get: (id: string) => invoke<Customer>("get_customer", { id }),
    create: (data: CreateCustomer) => invoke<Customer>("create_customer", { data }),
    update: (id: string, data: UpdateCustomer) => invoke("update_customer", { id, data }),
    delete: (id: string) => invoke("delete_customer", { id }),
  },
};
```

### Replace in Routes

```ts
// Before
const { data } = useQuery({
  queryKey: ["customers"],
  queryFn: async () => {
    const res = await fetch("/api/customers");
    return res.json();
  },
});

// After
const { data } = useQuery({
  queryKey: ["customers"],
  queryFn: () => api.customers.list(),
});
```

## Database Schema (SQLite)

```sql
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  human_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  customer_type TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE resources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  is_available INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_minutes INTEGER,
  amount REAL,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (resource_id) REFERENCES resources(id)
);

CREATE TABLE inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  min_stock INTEGER NOT NULL,
  price REAL NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE inventory_movements (
  id TEXT PRIMARY KEY,
  inventory_id TEXT NOT NULL,
  movement_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (inventory_id) REFERENCES inventory(id)
);

CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  hours_allowance INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL,
  due_date TEXT NOT NULL,
  paid_date TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  total REAL NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);
```

## Key Decisions

1. **Reuse Frontend**: All UI components and pages are ready
2. **Tauri Commands**: Simple function-based API
3. **SQLite Embedded**: No external database needed
4. **Type Safety**: Rust types match TypeScript interfaces
5. **TanStack Query**: Keeps existing state management

## Immediate Next Steps

1. Create `src-tauri/src/commands/` directory
2. Add rusqlite to Cargo.toml
3. Implement first command: `get_customers`
4. Test invoke from frontend
5. Repeat for other commands
