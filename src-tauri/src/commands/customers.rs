use crate::database::DbConn;
use serde::{Deserialize, Serialize};
use tauri::State;
use rusqlite::params;
use std::sync::MutexGuard;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Customer {
    pub id: String,
    pub human_id: String,
    pub name: String,
    pub phone: String,
    pub email: Option<String>,
    pub customer_type: String,
    pub notes: Option<String>,
    pub balance: f64,
    pub created_at: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateCustomer {
    pub name: String,
    pub phone: String,
    pub email: Option<String>,
    pub customer_type: String,
    pub notes: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCustomer {
    pub name: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub customer_type: Option<String>,
    pub notes: Option<String>,
}

fn validate_customer_data(data: &CreateCustomer) -> Result<(), String> {
    // Validate name
    let name = data.name.trim();
    if name.len() < 2 {
        return Err("Name must be at least 2 characters".to_string());
    }
    if name.len() > 100 {
        return Err("Name is too long (max 100 characters)".to_string());
    }

    // Validate phone
    let phone = data.phone.trim();
    if phone.len() < 10 {
        return Err("Phone must be at least 10 digits".to_string());
    }
    if phone.len() > 20 {
        return Err("Phone is too long (max 20 characters)".to_string());
    }
    if !phone.chars().all(|c| c.is_ascii_digit() || c == '+' || c == '-' || c == ' ') {
        return Err("Phone contains invalid characters".to_string());
    }

    // Validate email if provided
    if let Some(email) = &data.email {
        let email = email.trim();
        if !email.is_empty() && !email.contains('@') {
            return Err("Invalid email format".to_string());
        }
    }

    // Validate customer type
    if data.customer_type != "visitor" && data.customer_type != "member" {
        return Err("Customer type must be 'visitor' or 'member'".to_string());
    }

    // Validate notes if provided
    if let Some(notes) = &data.notes {
        if notes.len() > 1000 {
            return Err("Notes are too long (max 1000 characters)".to_string());
        }
    }

    Ok(())
}

fn validate_update_customer_data(data: &UpdateCustomer) -> Result<(), String> {
    if let Some(name) = &data.name {
        let name = name.trim();
        if name.len() < 2 {
            return Err("Name must be at least 2 characters".to_string());
        }
        if name.len() > 100 {
            return Err("Name is too long (max 100 characters)".to_string());
        }
    }

    if let Some(phone) = &data.phone {
        let phone = phone.trim();
        if phone.len() < 10 {
            return Err("Phone must be at least 10 digits".to_string());
        }
        if phone.len() > 20 {
            return Err("Phone is too long (max 20 characters)".to_string());
        }
        if !phone.chars().all(|c| c.is_ascii_digit() || c == '+' || c == '-' || c == ' ') {
            return Err("Phone contains invalid characters".to_string());
        }
    }

    if let Some(email) = &data.email {
        let email = email.trim();
        if !email.is_empty() && !email.contains('@') {
            return Err("Invalid email format".to_string());
        }
    }

    if let Some(customer_type) = &data.customer_type {
        if customer_type != "visitor" && customer_type != "member" {
            return Err("Customer type must be 'visitor' or 'member'".to_string());
        }
    }

    if let Some(notes) = &data.notes {
        if notes.len() > 1000 {
            return Err("Notes are too long (max 1000 characters)".to_string());
        }
    }

    Ok(())
}

fn customer_from_row(row: &rusqlite::Row) -> Result<Customer, rusqlite::Error> {
    Ok(Customer {
        id: row.get(0)?,
        human_id: row.get(1)?,
        name: row.get(2)?,
        phone: row.get(3)?,
        email: row.get(4)?,
        customer_type: row.get(5)?,
        notes: row.get(6)?,
        balance: row.get(7)?,
        created_at: row.get(8)?,
    })
}

fn get_next_human_id(conn: &MutexGuard<rusqlite::Connection>) -> Result<String, String> {
    let result: Result<String, rusqlite::Error> = conn
        .query_row(
            "SELECT human_id FROM customers ORDER BY created_at DESC LIMIT 1",
            [],
            |row| row.get(0),
        );
    
    match result {
        Ok(last_id) => {
            let num_str = &last_id[1..];
            if let Ok(num) = num_str.parse::<u32>() {
                Ok(format!("C{:04}", num + 1))
            } else {
                Ok("C0001".to_string())
            }
        }
        Err(rusqlite::Error::QueryReturnedNoRows) => {
            Ok("C0001".to_string())
        }
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn get_customers(state: State<DbConn>) -> Result<Vec<Customer>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare("SELECT id, human_id, name, phone, email, customer_type, notes, balance, created_at FROM customers ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;
    
    let customer_iter = stmt
        .query_map([], |row| customer_from_row(row))
        .map_err(|e| e.to_string())?;
    
    let mut customers = Vec::new();
    for customer in customer_iter {
        customers.push(customer.map_err(|e| e.to_string())?);
    }
    
    Ok(customers)
}

#[tauri::command]
pub fn get_customer(state: State<DbConn>, id: String) -> Result<Customer, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare("SELECT id, human_id, name, phone, email, customer_type, notes, balance, created_at FROM customers WHERE id = ?")
        .map_err(|e| e.to_string())?;
    
    let customer = stmt
        .query_row(params![id], |row| customer_from_row(row))
        .map_err(|e| e.to_string())?;
    
    Ok(customer)
}

#[tauri::command]
pub fn create_customer(state: State<DbConn>, data: CreateCustomer) -> Result<Customer, String> {
    // Validate input data
    validate_customer_data(&data)?;
    
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let id = uuid::Uuid::new_v4().to_string();
    let human_id = get_next_human_id(&conn)?;
    let created_at = chrono::Utc::now().to_rfc3339();
    
    // Trim and sanitize data
    let name = data.name.trim().to_string();
    let phone = data.phone.trim().to_string();
    let email = data.email.as_ref().map(|e| e.trim().to_string()).filter(|e| !e.is_empty());
    let notes = data.notes.as_ref().map(|n| n.trim().to_string()).filter(|n| !n.is_empty());
    
    conn.execute(
        "INSERT INTO customers (id, human_id, name, phone, email, customer_type, notes, balance, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        params![&id, &human_id, &name, &phone, &email as &dyn rusqlite::ToSql, &data.customer_type, &notes as &dyn rusqlite::ToSql, 0.0f64, &created_at],
    ).map_err(|e| e.to_string())?;
    
    Ok(Customer {
        id,
        human_id,
        name,
        phone,
        email,
        customer_type: data.customer_type,
        notes,
        balance: 0.0,
        created_at,
    })
}

#[tauri::command]
pub fn update_customer(state: State<DbConn>, id: String, data: UpdateCustomer) -> Result<Customer, String> {
    // Validate input data
    validate_update_customer_data(&data)?;
    
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut updates = Vec::new();
    let mut values: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    if let Some(name) = &data.name {
        updates.push("name = ?");
        values.push(Box::new(name.trim().to_string()));
    }
    if let Some(phone) = &data.phone {
        updates.push("phone = ?");
        values.push(Box::new(phone.trim().to_string()));
    }
    if let Some(email) = &data.email {
        updates.push("email = ?");
        let trimmed = email.trim().to_string();
        values.push(Box::new(if trimmed.is_empty() { None } else { Some(trimmed) }));
    }
    if let Some(customer_type) = &data.customer_type {
        updates.push("customer_type = ?");
        values.push(Box::new(customer_type.clone()));
    }
    if let Some(notes) = &data.notes {
        updates.push("notes = ?");
        let trimmed = notes.trim().to_string();
        values.push(Box::new(if trimmed.is_empty() { None } else { Some(trimmed) }));
    }
    
    if !updates.is_empty() {
        let query = format!("UPDATE customers SET {} WHERE id = ?", updates.join(", "));
        values.push(Box::new(id.clone()));
        
        conn.execute(&query, rusqlite::params_from_iter(values.iter()))
            .map_err(|e| e.to_string())?;
    }
    
    let mut stmt = conn
        .prepare("SELECT id, human_id, name, phone, email, customer_type, notes, balance, created_at FROM customers WHERE id = ?")
        .map_err(|e| e.to_string())?;
    
    let customer = stmt
        .query_row(params![id], |row| customer_from_row(row))
        .map_err(|e| e.to_string())?;
    
    Ok(customer)
}

#[tauri::command]
pub fn delete_customer(state: State<DbConn>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    conn.execute("DELETE FROM customers WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}
