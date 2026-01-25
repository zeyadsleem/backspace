use crate::database::DbPool;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Subscription {
    pub id: String,
    pub customer_id: String,
    pub customer_name: String, // Joined from customers
    pub plan_type: String,
    pub start_date: chrono::NaiveDate,
    pub end_date: chrono::NaiveDate,
    pub status: String,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(Deserialize)]
pub struct CreateSubscriptionDto {
    pub customer_id: String,
    pub plan_type: String,
    pub start_date: String, // String from frontend, parsed manually or via chrono serde if configured
}

#[derive(Deserialize)]
pub struct UpdateSubscriptionDto {
    pub plan_type: Option<String>,
    pub status: Option<String>,
}

#[tauri::command]
pub async fn get_subscriptions(pool: State<'_, DbPool>) -> Result<Vec<Subscription>, String> {
    sqlx::query_as::<_, Subscription>(
        r#"
        SELECT s.id, s.customer_id, c.name as customer_name, 
               s.plan_type, s.start_date, s.end_date, s.status, s.created_at, s.updated_at
        FROM subscriptions s
        JOIN customers c ON s.customer_id = c.id
        ORDER BY s.created_at DESC
        "#
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_subscription(pool: State<'_, DbPool>, data: CreateSubscriptionDto) -> Result<Subscription, String> {
    let id = Uuid::new_v4().to_string();
    let start_date = chrono::NaiveDate::parse_from_str(&data.start_date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid date format: {}", e))?;
    
    // Calculate end date based on plan type
    let duration_days = match data.plan_type.as_str() {
        "weekly" => 7,
        "half-monthly" => 15,
        "monthly" => 30,
        _ => 30, // Default
    };
    let end_date = start_date + chrono::Duration::days(duration_days);
    
    // Fetch customer name for return struct
    let customer_name: String = sqlx::query_scalar("SELECT name FROM customers WHERE id = ?")
        .bind(&data.customer_id)
        .fetch_one(&*pool)
        .await
        .map_err(|_| "Customer not found".to_string())?;

    let now = chrono::Local::now().naive_local();

    // Insert
    sqlx::query(
        "INSERT INTO subscriptions (id, customer_id, plan_type, start_date, end_date, status, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, 'active', ?, ?)"
    )
    .bind(&id)
    .bind(&data.customer_id)
    .bind(&data.plan_type)
    .bind(start_date)
    .bind(end_date)
    .bind(now)
    .bind(now)
    .execute(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    // Create Invoice for Subscription? (Optional, but good practice)
    // For now we just return the object

    Ok(Subscription {
        id,
        customer_id: data.customer_id,
        customer_name,
        plan_type: data.plan_type,
        start_date,
        end_date,
        status: "active".to_string(),
        created_at: now,
        updated_at: now,
    })
}

#[tauri::command]
pub async fn deactivate_subscription(pool: State<'_, DbPool>, id: String) -> Result<(), String> {
    sqlx::query("UPDATE subscriptions SET status = 'inactive', updated_at = ? WHERE id = ?")
        .bind(chrono::Local::now().naive_local())
        .bind(id)
        .execute(&*pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn cancel_subscription(pool: State<'_, DbPool>, id: String) -> Result<(), String> {
    sqlx::query("UPDATE subscriptions SET status = 'cancelled', updated_at = ? WHERE id = ?")
        .bind(chrono::Local::now().naive_local())
        .bind(id)
        .execute(&*pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn reactivate_subscription(pool: State<'_, DbPool>, id: String) -> Result<(), String> {
    sqlx::query("UPDATE subscriptions SET status = 'active', updated_at = ? WHERE id = ?")
        .bind(chrono::Local::now().naive_local())
        .bind(id)
        .execute(&*pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn change_subscription_plan(pool: State<'_, DbPool>, id: String, new_plan_type: String) -> Result<(), String> {
    // This is complex: does it extend? replace? 
    // Simplified: Just update the plan type and recalc end date from TODAY or original start? 
    // Let's assume it restarts the subscription from now or updates the type for future renewal.
    // For simplicity: Update plan type and re-calculate end date from *original start* (preserving period) OR just text update.
    // Better: Update plan type.
    sqlx::query("UPDATE subscriptions SET plan_type = ?, updated_at = ? WHERE id = ?")
        .bind(new_plan_type)
        .bind(chrono::Local::now().naive_local())
        .bind(id)
        .execute(&*pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
