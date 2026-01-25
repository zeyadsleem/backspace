use crate::database::DbPool;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use tauri::State;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Customer {
    pub id: String,
    pub human_id: String,
    pub name: String,
    pub phone: String,
    pub email: Option<String>,
    pub customer_type: Option<String>,
    pub balance: Decimal,
    pub total_spent: Decimal,
    pub total_sessions: i64,
    pub notes: Option<String>,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(Deserialize)]
pub struct CreateCustomerDto {
    pub name: String,
    pub phone: String,
    pub email: Option<String>,
    pub customer_type: Option<String>,
    pub notes: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateCustomerDto {
    pub name: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub customer_type: Option<String>,
    pub notes: Option<String>,
}

#[tauri::command]
pub async fn get_customers(pool: State<'_, DbPool>) -> Result<Vec<Customer>, String> {
    sqlx::query_as::<_, Customer>("SELECT * FROM customers ORDER BY created_at DESC")
        .fetch_all(&*pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_customer(pool: State<'_, DbPool>, data: CreateCustomerDto) -> Result<Customer, String> {
    let id = uuid::Uuid::new_v4().to_string();
    
    // Generate human_id
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM customers")
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?;
    let human_id = format!("C-{:03}", count + 1);

    let customer = Customer {
        id: id.clone(),
        human_id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        customer_type: data.customer_type,
        balance: Decimal::ZERO,
        total_spent: Decimal::ZERO,
        total_sessions: 0,
        notes: data.notes,
        created_at: chrono::Local::now().naive_local(),
        updated_at: chrono::Local::now().naive_local(),
    };

    sqlx::query(
        "INSERT INTO customers (id, human_id, name, phone, email, customer_type, balance, total_spent, total_sessions, notes, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&customer.id)
    .bind(&customer.human_id)
    .bind(&customer.name)
    .bind(&customer.phone)
    .bind(&customer.email)
    .bind(&customer.customer_type)
    .bind(customer.balance)
    .bind(customer.total_spent)
    .bind(customer.total_sessions)
    .bind(&customer.notes)
    .bind(customer.created_at)
    .bind(customer.updated_at)
    .execute(&*pool)
    .await
    .map_err(|e| {
        if e.to_string().contains("UNIQUE constraint failed") {
             return "Phone number or ID already exists".to_string();
        }
        e.to_string()
    })?;

    Ok(customer)
}

#[tauri::command]
pub async fn update_customer(pool: State<'_, DbPool>, id: String, data: UpdateCustomerDto) -> Result<(), String> {
     sqlx::query("UPDATE customers SET 
        name = COALESCE(?, name), 
        phone = COALESCE(?, phone), 
        email = COALESCE(?, email), 
        customer_type = COALESCE(?, customer_type) 
        WHERE id = ?")
        .bind(data.name)
        .bind(data.phone)
        .bind(data.email)
    sqlx::query("UPDATE customers SET 
        name = COALESCE(?, name), 
        phone = COALESCE(?, phone), 
        email = COALESCE(?, email), 
        customer_type = COALESCE(?, customer_type),
        notes = COALESCE(?, notes),
        updated_at = ?
        WHERE id = ?")
        .bind(data.name)
        .bind(data.phone)
        .bind(data.email)
        .bind(data.customer_type)
        .bind(data.notes)
        .bind(chrono::Local::now().naive_local())
        .bind(id)
        .execute(&*pool)
        .await
        .map_err(|e| e.to_string())?;
        
    Ok(())
}

#[tauri::command]
pub async fn delete_customer(pool: State<'_, DbPool>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM customers WHERE id = ?")
        .bind(id)
        .execute(&*pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
