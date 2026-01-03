use rusqlite::{Connection, Result};
use std::sync::Mutex;

pub struct DbConn(pub Mutex<Connection>);

pub fn init_db() -> Result<Connection> {
    let conn = Connection::open("backspace.db")?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS customers (
            id TEXT PRIMARY KEY,
            human_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            customer_type TEXT NOT NULL,
            notes TEXT,
            created_at TEXT NOT NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS resources (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            resource_type TEXT NOT NULL,
            is_available INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            customer_id TEXT NOT NULL,
            resource_id TEXT NOT NULL,
            started_at TEXT NOT NULL,
            ended_at TEXT,
            duration_minutes INTEGER,
            amount REAL,
            FOREIGN KEY (customer_id) REFERENCES customers(id),
            FOREIGN KEY (resource_id) REFERENCES resources(id)
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS inventory (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            min_stock INTEGER NOT NULL,
            price REAL NOT NULL,
            created_at TEXT NOT NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS inventory_movements (
            id TEXT PRIMARY KEY,
            inventory_id TEXT NOT NULL,
            movement_type TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            notes TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (inventory_id) REFERENCES inventory(id)
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS subscriptions (
            id TEXT PRIMARY KEY,
            customer_id TEXT NOT NULL,
            plan_type TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT,
            hours_allowance INTEGER,
            is_active INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS invoices (
            id TEXT PRIMARY KEY,
            customer_id TEXT NOT NULL,
            amount REAL NOT NULL,
            status TEXT NOT NULL,
            due_date TEXT NOT NULL,
            paid_date TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS invoice_items (
            id TEXT PRIMARY KEY,
            invoice_id TEXT NOT NULL,
            description TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            total REAL NOT NULL,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id)
        )",
        [],
    )?;

    Ok(conn)
}

pub fn get_next_human_id(conn: &Connection, prefix: &str) -> Result<String> {
    let mut stmt = conn.prepare(
        "SELECT human_id FROM customers WHERE human_id LIKE ? ORDER BY human_id DESC LIMIT 1",
    )?;
    
    let pattern = format!("{}%", prefix);
    let mut rows = stmt.query(&[&pattern])?;
    
    if let Some(row) = rows.next()? {
        let last_id: String = row.get(0)?;
        if let Some(num_str) = last_id.strip_prefix(prefix) {
            if let Ok(num) = num_str.parse::<i32>() {
                return Ok(format!("{}{:04}", prefix, num + 1));
            }
        }
    }
    
    Ok(format!("{}{:04}", prefix, 1))
}
