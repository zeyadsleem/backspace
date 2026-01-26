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
    pub resource_rate_snapshot: f64,
    pub inventory_total: f64,
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
    use sqlx::Row;
    use std::str::FromStr;
    
    let resource_row = sqlx::query("SELECT rate_per_hour, is_available FROM resources WHERE id = ?")
        .bind(&resource_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    let resource_row = resource_row.ok_or("Resource not found")?;
    let is_available: bool = resource_row.try_get("is_available").unwrap_or(true); // Assuming boolean or 0/1
    // Actually sqlite boolean is 0/1 integer. sqlx maps boolean to boolean.
    // If it fails, we check logic. Schema says BOOLEAN.
    
    if !is_available {
        return Err("Resource is currently in use".to_string());
    }
    
    let rate_s: String = resource_row.try_get("rate_per_hour").unwrap_or_default();
    let rate_per_hour = Decimal::from_str(&rate_s).unwrap_or(Decimal::ZERO);

    // Check active session for customer
    let has_active: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM sessions WHERE customer_id = ? AND status = 'active'")
        .bind(&customer_id)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
        
    if has_active > 0 {
        return Err("Customer already has an active session".to_string());
    }

    // Check subscription
    let active_sub = sqlx::query(
        "SELECT id FROM subscriptions WHERE customer_id = ? AND status = 'active' AND start_date <= date('now') AND end_date >= date('now')"
    )
    .bind(&customer_id)
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
    .bind(rate_per_hour.to_string())
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

    // Audit Log
    sqlx::query(
        "INSERT INTO audit_logs (id, operation_type, description, customer_id, resource_id, performed_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(uuid::Uuid::new_v4().to_string())
    .bind("session_start")
    .bind(format!("Session started for customer {} on resource {}", customer_id, resource_id))
    .bind(&customer_id)
    .bind(&resource_id)
    .bind(now)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(id)
}

#[tauri::command]
pub async fn add_session_inventory(pool: State<'_, DbPool>, session_id: String, item: AddInventoryDto) -> Result<(), String> {
    let now = chrono::Local::now().naive_local();
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    // Get item info & check stock
    use sqlx::Row;
    use std::str::FromStr;
    
    let inv_row = sqlx::query("SELECT price, quantity, name FROM inventory WHERE id = ?")
        .bind(&item.inventory_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Item not found")?;

    let name: String = inv_row.try_get("name").unwrap_or_default();
    let quantity: i64 = inv_row.try_get("quantity").unwrap_or(0);
    // Assuming price is stored as string/real in DB. If configured as DECIMAL in DB, reading as string is safest.
    let price_s: String = inv_row.try_get("price").unwrap_or_default();
    let price = Decimal::from_str(&price_s).unwrap_or(Decimal::ZERO);

    if quantity < item.quantity {
        return Err(format!("Insufficient stock for {}. Available: {}", name, quantity));
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
    .bind(price.to_string())
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    // Update session total
    let amount = price * Decimal::from(item.quantity);
    sqlx::query("UPDATE sessions SET inventory_total = inventory_total + ?, updated_at = ? WHERE id = ?")
        .bind(amount.to_string())
        .bind(now)
        .bind(&session_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    // Audit Log
    sqlx::query(
        "INSERT INTO audit_logs (id, operation_type, description, performed_at) VALUES (?, ?, ?, ?)"
    )
    .bind(uuid::Uuid::new_v4().to_string())
    .bind("inventory_add")
    .bind(format!("Added {} x {} to session {}", item.quantity, name, session_id))
    .bind(now)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}


#[tauri::command]
pub async fn remove_session_inventory(pool: State<'_, DbPool>, session_id: String, inventory_id: String) -> Result<(), String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    use sqlx::Row;
    use std::str::FromStr;

    // Get all consumptions for this item in this session
    let rows = sqlx::query("SELECT id, quantity, price_at_time FROM session_inventory WHERE session_id = ? AND inventory_id = ?")
        .bind(&session_id)
        .bind(&inventory_id)
        .fetch_all(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    if rows.is_empty() {
        return Err("Item not found in session".to_string());
    }

    let mut total_quantity = 0i64;
    let mut total_amount = Decimal::ZERO;

    for row in rows {
        let q: i64 = row.try_get("quantity").unwrap_or(0);
        let p_s: String = row.try_get("price_at_time").unwrap_or_default();
        let p = Decimal::from_str(&p_s).unwrap_or(Decimal::ZERO);
        
        total_quantity += q;
        total_amount += p * Decimal::from(q);

        // Delete the record
        let id: String = row.try_get("id").unwrap_or_default();
        sqlx::query("DELETE FROM session_inventory WHERE id = ?")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;
    }

    // Return stock
    sqlx::query("UPDATE inventory SET quantity = quantity + ? WHERE id = ?")
        .bind(total_quantity)
        .bind(&inventory_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    // Update session total
    sqlx::query("UPDATE sessions SET inventory_total = inventory_total - ?, updated_at = ? WHERE id = ?")
        .bind(total_amount.to_string())
        .bind(chrono::Local::now().naive_local())
        .bind(&session_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn update_session_inventory(pool: State<'_, DbPool>, session_id: String, inventory_id: String, quantity: i64) -> Result<(), String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    use sqlx::Row;
    use std::str::FromStr;

    // Get current total quantity in session
    let rows = sqlx::query("SELECT id, quantity, price_at_time FROM session_inventory WHERE session_id = ? AND inventory_id = ?")
        .bind(&session_id)
        .bind(&inventory_id)
        .fetch_all(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    if rows.is_empty() {
        return Err("Item not found in session".to_string());
    }

    let mut current_quantity = 0i64;
    let mut current_amount = Decimal::ZERO;
    let mut last_price = Decimal::ZERO;

    for row in rows {
        let q: i64 = row.try_get("quantity").unwrap_or(0);
        let p_s: String = row.try_get("price_at_time").unwrap_or_default();
        let p = Decimal::from_str(&p_s).unwrap_or(Decimal::ZERO);
        
        current_quantity += q;
        current_amount += p * Decimal::from(q);
        last_price = p;

        // Delete old records to replace with a single one
        let id: String = row.try_get("id").unwrap_or_default();
        sqlx::query("DELETE FROM session_inventory WHERE id = ?")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;
    }

    let diff = quantity - current_quantity;

    // Check stock if increasing
    if diff > 0 {
        let inv_stock: i64 = sqlx::query_scalar("SELECT quantity FROM inventory WHERE id = ?")
            .bind(&inventory_id)
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;

        if inv_stock < diff {
            return Err("Insufficient stock".to_string());
        }
    }

    // Update stock
    sqlx::query("UPDATE inventory SET quantity = quantity - ? WHERE id = ?")
        .bind(diff)
        .bind(&inventory_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    // Create new record
    let consumption_id = Uuid::new_v4().to_string();
    sqlx::query(
        "INSERT INTO session_inventory (id, session_id, inventory_id, quantity, price_at_time) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(&consumption_id)
    .bind(&session_id)
    .bind(&inventory_id)
    .bind(quantity)
    .bind(last_price.to_string())
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    // Update session total
    let new_amount = last_price * Decimal::from(quantity);
    let amount_diff = new_amount - current_amount;

    sqlx::query("UPDATE sessions SET inventory_total = inventory_total + ?, updated_at = ? WHERE id = ?")
        .bind(amount_diff.to_string())
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

    use sqlx::Row;
    use std::str::FromStr;

    let session_row = sqlx::query(
        "SELECT s.*, r.name as resource_name 
         FROM sessions s
         JOIN resources r ON s.resource_id = r.id 
         WHERE s.id = ?"
    )
    .bind(&session_id)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| e.to_string())?
    .ok_or("Session not found")?;

    let status: String = session_row.try_get("status").unwrap_or_default();
    if status != "active" {
        return Err("Session is not active".to_string());
    }

    let started_at: chrono::NaiveDateTime = session_row.try_get("started_at").unwrap();
    let customer_id: String = session_row.try_get("customer_id").unwrap_or_default();
    let resource_id: String = session_row.try_get("resource_id").unwrap_or_default();
    let resource_name: String = session_row.try_get("resource_name").unwrap_or_default();
    let is_subscribed: bool = session_row.try_get("is_subscribed").unwrap_or(false);
    
    let rate_s: String = session_row.try_get("resource_rate_snapshot").unwrap_or_default();
    let resource_rate_snapshot = Decimal::from_str(&rate_s).unwrap_or(Decimal::ZERO);
    
    let inv_total_s: String = session_row.try_get("inventory_total").unwrap_or_default();
    let inventory_total = Decimal::from_str(&inv_total_s).unwrap_or(Decimal::ZERO);

    let end_time = chrono::Local::now().naive_local();
    let duration = end_time - started_at;
    let duration_minutes = duration.num_minutes();
    let duration_hours = Decimal::from(duration_minutes) / Decimal::from(60);

    let session_cost = if is_subscribed {
        Decimal::ZERO
    } else {
        duration_hours * resource_rate_snapshot
    };

    let total_amount = session_cost + inventory_total;

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
        .bind(&resource_id)
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
    .bind(&customer_id)
    .bind(&session_id)
    .bind(total_amount.to_string()) // amount
    .bind(total_amount.to_string()) // total
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
        .bind(format!("Session - {} ({:.0} mins)", resource_name, duration_minutes))
        .bind(1)
        .bind(session_cost.to_string())
        .bind(session_cost.to_string())
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    // 2. Inventory Items
    // Use Vec of struct or explicit parsing
    struct SessItem {
        inventory_id: String,
        name: String,
        quantity: i64,
        price_at_time: Decimal,
    }
    
    let item_rows = sqlx::query(
        "SELECT si.inventory_id, i.name, si.quantity, si.price_at_time 
         FROM session_inventory si
         JOIN inventory i ON si.inventory_id = i.id
         WHERE si.session_id = ?"
    )
    .bind(&session_id)
    .fetch_all(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;
    
    let mut session_items = Vec::new();
    for row in item_rows {
        let price_s: String = row.try_get("price_at_time").unwrap_or_default();
        let price = Decimal::from_str(&price_s).unwrap_or(Decimal::ZERO);
        session_items.push(SessItem {
            inventory_id: row.try_get("inventory_id").unwrap_or_default(),
            name: row.try_get("name").unwrap_or_default(),
            quantity: row.try_get("quantity").unwrap_or(0),
            price_at_time: price,
        });
    }

    for item in session_items {
        let amount = item.price_at_time * Decimal::from(item.quantity);
        sqlx::query(
            "INSERT INTO invoice_items (id, invoice_id, description, quantity, rate, amount) VALUES (?, ?, ?, ?, ?, ?)"
        )
        .bind(Uuid::new_v4().to_string())
        .bind(&invoice_id)
        .bind(item.name)
        .bind(item.quantity)
        .bind(item.price_at_time.to_string())
        .bind(amount.to_string())
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    // Update Customer Balance (Increase Debt)
    sqlx::query("UPDATE customers SET balance = balance + ?, updated_at = ? WHERE id = ?")
        .bind(total_amount.to_string())
        .bind(end_time)
        .bind(&customer_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    // Audit Log
    sqlx::query(
        "INSERT INTO audit_logs (id, operation_type, description, customer_id, resource_id, performed_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(uuid::Uuid::new_v4().to_string())
    .bind("session_end")
    .bind(format!("Session ended for customer {} on resource {}. Total: {}", customer_id, resource_id, total_amount))
    .bind(&customer_id)
    .bind(&resource_id)
    .bind(end_time)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(invoice_id)
}
