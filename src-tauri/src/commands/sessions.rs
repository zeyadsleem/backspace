use crate::database::DbPool;
use rust_decimal::Decimal;
use rust_decimal::prelude::Zero;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Row};
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct SessionView {
    pub id: String,
    pub customer_id: String,
    pub customer_name: String,
    pub resource_id: String,
    pub resource_name: String,
    pub started_at: chrono::NaiveDateTime,
    pub resource_rate_snapshot: Decimal,
    pub inventory_total: Decimal,
    pub is_subscribed: bool,
    pub status: String,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(Deserialize)]
pub struct AddInventoryDto {
    pub inventory_id: String,
    pub quantity: i64,
}

#[tauri::command]
pub async fn get_active_sessions(pool: State<'_, DbPool>) -> Result<Vec<SessionView>, String> {
    sqlx::query_as::<_, SessionView>(
        r#"
        SELECT 
            s.id, s.customer_id, c.name as customer_name,
            s.resource_id, r.name as resource_name,
            s.started_at, s.resource_rate_snapshot, s.inventory_total,
            s.is_subscribed, s.status, s.created_at, s.updated_at
        FROM sessions s
        JOIN customers c ON s.customer_id = c.id
        JOIN resources r ON s.resource_id = r.id
        WHERE s.status = 'active'
        ORDER BY s.started_at DESC
        "#
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn start_session(pool: State<'_, DbPool>, customer_id: String, resource_id: String) -> Result<String, String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    // Check resource
    let resource_opt = sqlx::query!("SELECT rate_per_hour, is_available FROM resources WHERE id = ?", resource_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    let resource = resource_opt.ok_or("Resource not found")?;
    if !resource.is_available.unwrap_or(true) {
        return Err("Resource is currently in use".to_string());
    }

    // Check active session for customer
    let has_active = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM sessions WHERE customer_id = ? AND status = 'active'")
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
        
    if has_active > 0 {
        return Err("Customer already has an active session".to_string());
    }

    // Check subscription
    let active_sub = sqlx::query!(
        "SELECT id FROM subscriptions WHERE customer_id = ? AND status = 'active' AND start_date <= date('now') AND end_date >= date('now')", 
        customer_id
    )
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    let is_subscribed = active_sub.is_some();
    let id = Uuid::new_v4().to_string();
    let now = chrono::Local::now().naive_local();

    // Use sqlx::query because query! macro with dynamic table schemas during dev can be truncated if tables not exist in DB_URL
    // But we ran migrations.
    sqlx::query(
        "INSERT INTO sessions (id, customer_id, resource_id, started_at, is_subscribed, resource_rate_snapshot, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&customer_id)
    .bind(&resource_id)
    .bind(now)
    .bind(is_subscribed)
    .bind(resource.rate_per_hour)
    .bind("active")
    .bind(now)
    .bind(now)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    // Mark resource unavailable
    sqlx::query("UPDATE resources SET is_available = FALSE WHERE id = ?")
        .bind(&resource_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(id)
}

#[tauri::command]
pub async fn add_session_inventory(pool: State<'_, DbPool>, session_id: String, item: AddInventoryDto) -> Result<(), String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    // Get item info & check stock
    let inv_item = sqlx::query!("SELECT price, quantity, name FROM inventory WHERE id = ?", item.inventory_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Item not found")?;

    if inv_item.quantity < item.quantity {
        return Err(format!("Insufficient stock for {}. Available: {}", inv_item.name, inv_item.quantity));
    }

    let consumption_id = Uuid::new_v4().to_string();
    
    // Deduct stock
    sqlx::query("UPDATE inventory SET quantity = quantity - ? WHERE id = ?")
        .bind(item.quantity)
        .bind(&item.inventory_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    // Add to session_inventory
    sqlx::query(
        "INSERT INTO session_inventory (id, session_id, inventory_id, quantity, price_at_time) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(&consumption_id)
    .bind(&session_id)
    .bind(&item.inventory_id)
    .bind(item.quantity)
    .bind(inv_item.price)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    // Update session total
    let amount = inv_item.price * Decimal::from(item.quantity);
    sqlx::query("UPDATE sessions SET inventory_total = inventory_total + ?, updated_at = ? WHERE id = ?")
        .bind(amount)
        .bind(chrono::Local::now().naive_local())
        .bind(&session_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn end_session(pool: State<'_, DbPool>, session_id: String) -> Result<String, String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    let session = sqlx::query!(
        "SELECT s.*, r.name as resource_name 
         FROM sessions s
         JOIN resources r ON s.resource_id = r.id 
         WHERE s.id = ?", 
        session_id
    )
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| e.to_string())?
    .ok_or("Session not found")?;

    if session.status != "active" {
        return Err("Session is not active".to_string());
    }

    let end_time = chrono::Local::now().naive_local();
    let duration = end_time - session.started_at;
    let duration_minutes = duration.num_minutes();
    let duration_hours = Decimal::from(duration_minutes) / Decimal::from(60);

    let session_cost = if session.is_subscribed.unwrap_or(false) {
        Decimal::ZERO
    } else {
        duration_hours * session.resource_rate_snapshot
    };

    let total_amount = session_cost + session.inventory_total;

    // Update session
    sqlx::query("UPDATE sessions SET ended_at = ?, status = 'completed', updated_at = ? WHERE id = ?")
        .bind(end_time)
        .bind(end_time)
        .bind(&session_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    // Free resource
    sqlx::query("UPDATE resources SET is_available = TRUE WHERE id = ?")
        .bind(session.resource_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    // Create Invoice
    // Generate Invoice Number
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM invoices")
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    let invoice_number = format!("INV-{:04}", count + 1);
    let invoice_id = Uuid::new_v4().to_string();
    let due_date = chrono::Local::now().date_naive() + chrono::Duration::days(7); // Default 7 days

    sqlx::query(
        "INSERT INTO invoices (id, invoice_number, customer_id, session_id, amount, total, status, due_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&invoice_id)
    .bind(invoice_number)
    .bind(&session.customer_id)
    .bind(&session_id)
    .bind(total_amount) // amount
    .bind(total_amount) // total (minus discount if any, 0 for now)
    .bind("unpaid")
    .bind(due_date)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    // Insert Invoice Items
    // 1. Session Duration Cost
    if !session_cost.is_zero() {
        sqlx::query(
            "INSERT INTO invoice_items (id, invoice_id, description, quantity, rate, amount) VALUES (?, ?, ?, ?, ?, ?)"
        )
        .bind(Uuid::new_v4().to_string())
        .bind(&invoice_id)
        .bind(format!("Session - {} ({:.0} mins)", session.resource_name, duration_minutes))
        .bind(1)
        .bind(session_cost) // rate is the full cost for 1 unit of session
        .bind(session_cost)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    // 2. Inventory Items
    let session_items = sqlx::query!(
        "SELECT si.inventory_id, i.name, si.quantity, si.price_at_time 
         FROM session_inventory si
         JOIN inventory i ON si.inventory_id = i.id
         WHERE si.session_id = ?",
        session_id
    )
    .fetch_all(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    for item in session_items {
        let amount = item.price_at_time * Decimal::from(item.quantity);
        sqlx::query(
            "INSERT INTO invoice_items (id, invoice_id, description, quantity, rate, amount) VALUES (?, ?, ?, ?, ?, ?)"
        )
        .bind(Uuid::new_v4().to_string())
        .bind(&invoice_id)
        .bind(item.name)
        .bind(item.quantity)
        .bind(item.price_at_time)
        .bind(amount)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    // Update Customer Balance (Increase Debt)
    sqlx::query("UPDATE customers SET balance = balance + ?, updated_at = ? WHERE id = ?")
        .bind(total_amount)
        .bind(end_time)
        .bind(&session.customer_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(invoice_id)
}
