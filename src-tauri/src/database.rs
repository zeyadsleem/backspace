use rusqlite::{Connection, Result};
use std::fs;
use std::sync::Mutex;
use tauri::State;

pub struct DbConn(pub Mutex<Connection>);

pub fn init_db() -> Result<Connection> {
    let conn = Connection::open("backspace.db")?;

    create_tables(&conn)?;

    Ok(conn)
}

pub fn reset_database_impl() -> Result<()> {
    let db_path = "backspace.db";
    if fs::metadata(db_path).is_ok() {
        fs::remove_file(db_path).map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
    }
    let conn = Connection::open(db_path)?;
    create_tables(&conn)?;
    Ok(())
}

#[tauri::command]
pub fn reset_database(state: State<DbConn>) -> Result<(), String> {
    reset_database_impl().map_err(|e| e.to_string())?;
    
    let conn = Connection::open("backspace.db").map_err(|e| e.to_string())?;
    *state.0.lock().unwrap() = conn;
    
    Ok(())
}

fn create_tables(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS customers (
            id TEXT PRIMARY KEY,
            human_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            customer_type TEXT NOT NULL,
            notes TEXT,
            balance REAL NOT NULL DEFAULT 0,
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
            rate_per_hour REAL NOT NULL DEFAULT 50,
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
            created_at TEXT NOT NULL,
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

    conn.execute(
        "CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            customer_id TEXT NOT NULL,
            session_id TEXT,
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            balance_after REAL NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (customer_id) REFERENCES customers(id),
            FOREIGN KEY (session_id) REFERENCES sessions(id)
        )",
        [],
    )?;

    Ok(())
}
