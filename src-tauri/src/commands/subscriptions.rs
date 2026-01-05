use crate::database::DbConn;
use serde::{Deserialize, Serialize};
use tauri::State;
use rusqlite::params;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Subscription {
    pub id: String,
    pub customer_id: String,
    pub customer_name: Option<String>,
    pub customer_human_id: Option<String>,
    pub plan_type: String,
    pub start_date: String,
    pub end_date: Option<String>,
    pub hours_allowance: Option<i32>,
    pub is_active: bool,
    pub created_at: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSubscription {
    pub customer_id: String,
    pub plan_type: String,
    pub start_date: String,
    pub end_date: Option<String>,
    pub hours_allowance: Option<i32>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSubscription {
    pub plan_type: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub hours_allowance: Option<i32>,
    pub is_active: Option<bool>,
}

fn validate_subscription_data(data: &CreateSubscription) -> Result<(), String> {
    // Validate customer_id
    if data.customer_id.trim().is_empty() {
        return Err("Customer ID is required".to_string());
    }

    // Validate plan_type
    let valid_plans = ["weekly", "half-monthly", "monthly"];
    if !valid_plans.contains(&data.plan_type.as_str()) {
        return Err("Invalid plan type. Must be: weekly, half-monthly, or monthly".to_string());
    }

    // Validate start_date format (basic check)
    if data.start_date.trim().is_empty() {
        return Err("Start date is required".to_string());
    }

    // Validate hours_allowance if provided
    if let Some(hours) = data.hours_allowance {
        if hours < 0 {
            return Err("Hours allowance cannot be negative".to_string());
        }
        if hours > 744 {
            return Err("Hours allowance cannot exceed 744 hours (31 days)".to_string());
        }
    }

    Ok(())
}

fn validate_update_subscription_data(data: &UpdateSubscription) -> Result<(), String> {
    if let Some(plan_type) = &data.plan_type {
        let valid_plans = ["weekly", "half-monthly", "monthly"];
        if !valid_plans.contains(&plan_type.as_str()) {
            return Err("Invalid plan type. Must be: weekly, half-monthly, or monthly".to_string());
        }
    }

    if let Some(hours) = data.hours_allowance {
        if hours < 0 {
            return Err("Hours allowance cannot be negative".to_string());
        }
        if hours > 744 {
            return Err("Hours allowance cannot exceed 744 hours (31 days)".to_string());
        }
    }

    Ok(())
}

fn subscription_from_row(row: &rusqlite::Row) -> Result<Subscription, rusqlite::Error> {
    Ok(Subscription {
        id: row.get(0)?,
        customer_id: row.get(1)?,
        customer_name: row.get(2)?,
        customer_human_id: row.get(3)?,
        plan_type: row.get(4)?,
        start_date: row.get(5)?,
        end_date: row.get(6)?,
        hours_allowance: row.get(7)?,
        is_active: row.get::<_, i32>(8)? == 1,
        created_at: row.get(9)?,
    })
}

#[tauri::command]
pub fn get_subscriptions(state: State<DbConn>) -> Result<Vec<Subscription>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare(
            "SELECT 
                s.id, s.customer_id, c.name, c.human_id, s.plan_type, s.start_date, s.end_date, 
                s.hours_allowance, s.is_active, s.created_at
            FROM subscriptions s
            LEFT JOIN customers c ON s.customer_id = c.id
            ORDER BY s.created_at DESC"
        )
        .map_err(|e| e.to_string())?;
    
    let sub_iter = stmt
        .query_map([], |row| subscription_from_row(row))
        .map_err(|e| e.to_string())?;
    
    let mut subscriptions = Vec::new();
    for sub in sub_iter {
        subscriptions.push(sub.map_err(|e| e.to_string())?);
    }
    
    Ok(subscriptions)
}

#[tauri::command]
pub fn get_subscription(state: State<DbConn>, id: String) -> Result<Subscription, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare(
            "SELECT 
                s.id, s.customer_id, c.name, c.human_id, s.plan_type, s.start_date, s.end_date, 
                s.hours_allowance, s.is_active, s.created_at
            FROM subscriptions s
            LEFT JOIN customers c ON s.customer_id = c.id
            WHERE s.id = ?"
        )
        .map_err(|e| e.to_string())?;
    
    let sub = stmt
        .query_row(params![id], |row| subscription_from_row(row))
        .map_err(|e| e.to_string())?;
    
    Ok(sub)
}

#[tauri::command]
pub fn create_subscription(state: State<DbConn>, data: CreateSubscription) -> Result<Subscription, String> {
    // Validate input data
    validate_subscription_data(&data)?;
    
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    // Check if customer exists
    let customer_exists: bool = conn
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM customers WHERE id = ?)",
            params![&data.customer_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;
    
    if !customer_exists {
        return Err("Customer not found".to_string());
    }
    
    let id = uuid::Uuid::new_v4().to_string();
    let created_at = chrono::Utc::now().to_rfc3339();
    
    conn.execute(
        "INSERT INTO subscriptions (id, customer_id, plan_type, start_date, end_date, hours_allowance, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        params![&id, &data.customer_id, &data.plan_type, &data.start_date, &data.end_date as &dyn rusqlite::ToSql, &data.hours_allowance as &dyn rusqlite::ToSql, 1i32, &created_at],
    ).map_err(|e| e.to_string())?;
    
    Ok(Subscription {
        id,
        customer_id: data.customer_id,
        customer_name: None,
        customer_human_id: None,
        plan_type: data.plan_type,
        start_date: data.start_date,
        end_date: data.end_date,
        hours_allowance: data.hours_allowance,
        is_active: true,
        created_at,
    })
}

#[tauri::command]
pub fn update_subscription(state: State<DbConn>, id: String, data: UpdateSubscription) -> Result<Subscription, String> {
    // Validate input data
    validate_update_subscription_data(&data)?;
    
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut updates = Vec::new();
    let mut values: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    if let Some(plan_type) = &data.plan_type {
        updates.push("plan_type = ?");
        values.push(Box::new(plan_type.clone()));
    }
    if let Some(start_date) = &data.start_date {
        updates.push("start_date = ?");
        values.push(Box::new(start_date.clone()));
    }
    if let Some(end_date) = &data.end_date {
        updates.push("end_date = ?");
        values.push(Box::new(end_date.clone()));
    }
    if let Some(hours_allowance) = data.hours_allowance {
        updates.push("hours_allowance = ?");
        values.push(Box::new(hours_allowance));
    }
    if let Some(is_active) = data.is_active {
        updates.push("is_active = ?");
        values.push(Box::new(if is_active { 1i32 } else { 0i32 }));
    }
    
    if !updates.is_empty() {
        let query = format!("UPDATE subscriptions SET {} WHERE id = ?", updates.join(", "));
        values.push(Box::new(id.clone()));
        
        conn.execute(&query, rusqlite::params_from_iter(values.iter()))
            .map_err(|e| e.to_string())?;
    }
    
    let mut stmt = conn
        .prepare(
            "SELECT 
                s.id, s.customer_id, c.name, c.human_id, s.plan_type, s.start_date, s.end_date, 
                s.hours_allowance, s.is_active, s.created_at
            FROM subscriptions s
            LEFT JOIN customers c ON s.customer_id = c.id
            WHERE s.id = ?"
        )
        .map_err(|e| e.to_string())?;
    
    let sub = stmt
        .query_row(params![id], |row| subscription_from_row(row))
        .map_err(|e| e.to_string())?;
    
    Ok(sub)
}

#[tauri::command]
pub fn delete_subscription(state: State<DbConn>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    conn.execute("DELETE FROM subscriptions WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}
