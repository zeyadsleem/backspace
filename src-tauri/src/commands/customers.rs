use crate::database::DbConn;
use serde::{Deserialize, Serialize};
use tauri::State;
use rusqlite::params;

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

fn customer_from_row(row: &rusqlite::Row) -> Result<Customer, rusqlite::Error> {
    Ok(Customer {
        id: row.get(0)?,
        human_id: row.get(1)?,
        name: row.get(2)?,
        phone: row.get(3)?,
        email: row.get(4)?,
        customer_type: row.get(5)?,
        notes: row.get(6)?,
        created_at: row.get(7)?,
    })
}

#[tauri::command]
pub fn get_customers(state: State<DbConn>) -> Result<Vec<Customer>, String> {
    let conn = state.0.lock().unwrap();
    
    let mut stmt = conn
        .prepare("SELECT id, human_id, name, phone, email, customer_type, notes, created_at FROM customers ORDER BY created_at DESC")
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
    let conn = state.0.lock().unwrap();
    
    let mut stmt = conn
        .prepare("SELECT id, human_id, name, phone, email, customer_type, notes, created_at FROM customers WHERE id = ?")
        .map_err(|e| e.to_string())?;
    
    let customer = stmt
        .query_row(&[&id], |row| customer_from_row(row))
        .map_err(|e| e.to_string())?;
    
    Ok(customer)
}

#[tauri::command]
pub fn create_customer(state: State<DbConn>, data: CreateCustomer) -> Result<Customer, String> {
    let conn = state.0.lock().unwrap();
    
    let id = uuid::Uuid::new_v4().to_string();
    let created_at = chrono::Utc::now().to_rfc3339();
    
    conn.execute(
        "INSERT INTO customers (id, human_id, name, phone, email, customer_type, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        params![&id, "C0001", &data.name, &data.phone, &data.email as &dyn rusqlite::ToSql, &data.customer_type, &data.notes as &dyn rusqlite::ToSql, &created_at],
    ).map_err(|e| e.to_string())?;
    
    Ok(Customer {
        id,
        human_id: "C0001".to_string(),
        name: data.name,
        phone: data.phone,
        email: data.email,
        customer_type: data.customer_type,
        notes: data.notes,
        created_at,
    })
}

#[tauri::command]
pub fn update_customer(state: State<DbConn>, id: String, data: UpdateCustomer) -> Result<Customer, String> {
    let mut updates = Vec::new();
    let mut values = Vec::new();
    
    if let Some(name) = &data.name {
        updates.push("name = ?");
        values.push(name.clone());
    }
    if let Some(phone) = &data.phone {
        updates.push("phone = ?");
        values.push(phone.clone());
    }
    if let Some(email) = &data.email {
        updates.push("email = ?");
        values.push(email.clone());
    }
    if let Some(customer_type) = &data.customer_type {
        updates.push("customer_type = ?");
        values.push(customer_type.clone());
    }
    if let Some(notes) = &data.notes {
        updates.push("notes = ?");
        values.push(notes.clone());
    }
    
    if !updates.is_empty() {
        let conn = state.0.lock().unwrap();
        
        let query = format!("UPDATE customers SET {} WHERE id = ?", updates.join(", "));
        values.push(id.clone());
        
        conn.execute(&query, rusqlite::params_from_iter(values.iter()))
            .map_err(|e| e.to_string())?;
    }
    
    let conn = state.0.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, human_id, name, phone, email, customer_type, notes, created_at FROM customers WHERE id = ?")
        .map_err(|e| e.to_string())?;
    
    let customer = stmt
        .query_row(&[&id], |row| customer_from_row(row))
        .map_err(|e| e.to_string())?;
    
    Ok(customer)
}

#[tauri::command]
pub fn delete_customer(state: State<DbConn>, id: String) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    
    conn.execute("DELETE FROM customers WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}
