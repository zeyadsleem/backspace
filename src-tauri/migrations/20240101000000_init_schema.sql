-- Enable Foreign Keys
PRAGMA foreign_keys = ON;

-- 1. Customers
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    human_id TEXT UNIQUE NOT NULL, -- C-001 format
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    customer_type TEXT DEFAULT 'visitor', -- Linked to PlanType
    balance DECIMAL NOT NULL DEFAULT 0,
    total_spent DECIMAL NOT NULL DEFAULT 0,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Resources (Seats, Rooms, etc.)
CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- 'seat', 'room', 'desk'
    rate_per_hour DECIMAL NOT NULL DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Inventory Items
CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT, -- 'beverage', 'snack', 'meal'
    quantity INTEGER NOT NULL DEFAULT 0,
    price DECIMAL NOT NULL DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL, -- 'weekly', 'monthly' etc.
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE RESTRICT,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration_minutes INTEGER,
    is_subscribed BOOLEAN DEFAULT FALSE,
    resource_rate_snapshot DECIMAL NOT NULL,
    inventory_total DECIMAL NOT NULL DEFAULT 0,
    session_cost DECIMAL NOT NULL DEFAULT 0,
    total_amount DECIMAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Session Inventory Consumption (Live tracking during session)
CREATE TABLE IF NOT EXISTS session_inventory (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    inventory_id TEXT NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Invoices (Master Record)
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL, -- INV-0001
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    session_id TEXT REFERENCES sessions(id) ON DELETE SET NULL, -- Nullable for subscription invoices
    amount DECIMAL NOT NULL, -- Subtotal
    discount DECIMAL DEFAULT 0,
    tax DECIMAL DEFAULT 0,
    total DECIMAL NOT NULL, -- Final total
    paid_amount DECIMAL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('paid', 'unpaid', 'pending', 'cancelled', 'partially_paid')),
    due_date DATE NOT NULL,
    paid_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Invoice Line Items (Detailed breakdown)
CREATE TABLE IF NOT EXISTS invoice_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    rate DECIMAL NOT NULL,
    amount DECIMAL NOT NULL -- quantity * rate
);

-- 9. Transactions (Payments Ledger)
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    invoice_id TEXT REFERENCES invoices(id) ON DELETE SET NULL,
    amount DECIMAL NOT NULL,
    payment_method TEXT NOT NULL, -- 'cash', 'card', 'transfer'
    payment_date TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Settings (Key-Value Store for persistent config)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY, -- e.g., 'company_info', 'tax_settings', 'theme'
    value TEXT NOT NULL, -- JSON string
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Audit Logs (Operation History)
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    operation_type TEXT NOT NULL, -- 'session_start', 'payment_received', etc.
    description TEXT NOT NULL,
    customer_id TEXT,
    resource_id TEXT,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_sessions_customer ON sessions(customer_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_audit_logs_type ON audit_logs(operation_type);
