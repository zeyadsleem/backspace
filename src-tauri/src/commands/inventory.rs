use crate::database::DbConn;
use serde::{Deserialize, Serialize};
use tauri::State;
use rusqlite::params;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Inventory {
    pub id: String,
    pub name: String,
    pub quantity: i32,
    pub min_stock: i32,
    pub price: f64,
    pub created_at: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateInventory {
    pub name: String,
    pub quantity: i32,
    pub min_stock: i32,
    pub price: f64,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInventory {
    pub name: Option<String>,
    pub quantity: Option<i32>,
    pub min_stock: Option<i32>,
    pub price: Option<f64>,
}

fn validate_inventory_data(data: &CreateInventory) -> Result<(), String> {
    // Validate name
    let name = data.name.trim();
    if name.len() < 2 {
        return Err("Name must be at least 2 characters".to_string());
    }
    if name.len() > 100 {
        return Err("Name is too long (max 100 characters)".to_string());
    }

    // Validate quantity
    if data.quantity < 0 {
        return Err("Quantity cannot be negative".to_string());
    }

    // Validate min_stock
    if data.min_stock < 0 {
        return Err("Minimum stock cannot be negative".to_string());
    }

    // Validate price
    if data.price < 0.0 {
        return Err("Price cannot be negative".to_string());
    }

    Ok(())
}

fn validate_update_inventory_data(data: &UpdateInventory) -> Result<(), String> {
    if let Some(name) = &data.name {
        let name = name.trim();
        if name.len() < 2 {
            return Err("Name must be at least 2 characters".to_string());
        }
        if name.len() > 100 {
            return Err("Name is too long (max 100 characters)".to_string());
        }
    }

    if let Some(quantity) = data.quantity {
        if quantity < 0 {
            return Err("Quantity cannot be negative".to_string());
        }
    }

    if let Some(min_stock) = data.min_stock {
        if min_stock < 0 {
            return Err("Minimum stock cannot be negative".to_string());
        }
    }

    if let Some(price) = data.price {
        if price < 0.0 {
            return Err("Price cannot be negative".to_string());
        }
    }

    Ok(())
}

fn inventory_from_row(row: &rusqlite::Row) -> Result<Inventory, rusqlite::Error> {
    Ok(Inventory {
        id: row.get(0)?,
        name: row.get(1)?,
        quantity: row.get(2)?,
        min_stock: row.get(3)?,
        price: row.get(4)?,
        created_at: row.get(5)?,
    })
}

#[tauri::command]
pub fn get_inventory(state: State<DbConn>) -> Result<Vec<Inventory>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare("SELECT id, name, quantity, min_stock, price, created_at FROM inventory ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;
    
    let inventory_iter = stmt
        .query_map([], |row| inventory_from_row(row))
        .map_err(|e| e.to_string())?;
    
    let mut items = Vec::new();
    for item in inventory_iter {
        items.push(item.map_err(|e| e.to_string())?);
    }
    
    Ok(items)
}

#[tauri::command]
pub fn get_inventory_item(state: State<DbConn>, id: String) -> Result<Inventory, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare("SELECT id, name, quantity, min_stock, price, created_at FROM inventory WHERE id = ?")
        .map_err(|e| e.to_string())?;
    
    let item = stmt
        .query_row(params![id], |row| inventory_from_row(row))
        .map_err(|e| e.to_string())?;
    
    Ok(item)
}

#[tauri::command]
pub fn create_inventory(state: State<DbConn>, data: CreateInventory) -> Result<Inventory, String> {
    // Validate input data
    validate_inventory_data(&data)?;
    
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let id = uuid::Uuid::new_v4().to_string();
    let created_at = chrono::Utc::now().to_rfc3339();
    let name = data.name.trim().to_string();
    
    conn.execute(
        "INSERT INTO inventory (id, name, quantity, min_stock, price, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        params![&id, &name, data.quantity, data.min_stock, data.price, &created_at],
    ).map_err(|e| e.to_string())?;
    
    Ok(Inventory {
        id,
        name,
        quantity: data.quantity,
        min_stock: data.min_stock,
        price: data.price,
        created_at,
    })
}

#[tauri::command]
pub fn update_inventory(state: State<DbConn>, id: String, data: UpdateInventory) -> Result<Inventory, String> {
    // Validate input data
    validate_update_inventory_data(&data)?;
    
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut updates = Vec::new();
    let mut values: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    if let Some(name) = &data.name {
        updates.push("name = ?");
        values.push(Box::new(name.clone()));
    }
    if let Some(quantity) = data.quantity {
        updates.push("quantity = ?");
        values.push(Box::new(quantity));
    }
    if let Some(min_stock) = data.min_stock {
        updates.push("min_stock = ?");
        values.push(Box::new(min_stock));
    }
    if let Some(price) = data.price {
        updates.push("price = ?");
        values.push(Box::new(price));
    }
    
    if !updates.is_empty() {
        let query = format!("UPDATE inventory SET {} WHERE id = ?", updates.join(", "));
        values.push(Box::new(id.clone()));
        
        conn.execute(&query, rusqlite::params_from_iter(values.iter()))
            .map_err(|e| e.to_string())?;
    }
    
    let mut stmt = conn
        .prepare("SELECT id, name, quantity, min_stock, price, created_at FROM inventory WHERE id = ?")
        .map_err(|e| e.to_string())?;
    
    let item = stmt
        .query_row(params![id], |row| inventory_from_row(row))
        .map_err(|e| e.to_string())?;
    
    Ok(item)
}

#[tauri::command]
pub fn delete_inventory(state: State<DbConn>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    conn.execute("DELETE FROM inventory WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}
