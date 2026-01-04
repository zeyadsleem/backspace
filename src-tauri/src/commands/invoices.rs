use crate::database::DbConn;
use serde::{Deserialize, Serialize};
use tauri::State;
use rusqlite::params;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Invoice {
    pub id: String,
    pub customer_id: String,
    pub customer_name: Option<String>,
    pub customer_human_id: Option<String>,
    pub amount: f64,
    pub status: String,
    pub due_date: String,
    pub paid_date: Option<String>,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct InvoiceWithItems {
    pub id: String,
    pub customer_id: String,
    pub customer_name: Option<String>,
    pub customer_human_id: Option<String>,
    pub amount: f64,
    pub status: String,
    pub due_date: String,
    pub paid_date: Option<String>,
    pub created_at: String,
    pub items: Vec<InvoiceItem>,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct InvoiceItem {
    pub id: String,
    pub description: String,
    pub quantity: i32,
    pub unit_price: f64,
    pub total: f64,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateInvoice {
    pub customer_id: String,
    pub amount: f64,
    pub status: String,
    pub due_date: String,
    pub items: Vec<CreateInvoiceItem>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateInvoiceItem {
    pub description: String,
    pub quantity: i32,
    pub unit_price: f64,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInvoice {
    pub status: Option<String>,
    pub paid_date: Option<String>,
}

fn validate_invoice_data(data: &CreateInvoice) -> Result<(), String> {
    // Validate customer_id
    if data.customer_id.trim().is_empty() {
        return Err("Customer ID is required".to_string());
    }

    // Validate amount
    if data.amount < 0.0 {
        return Err("Amount cannot be negative".to_string());
    }

    // Validate status
    let valid_statuses = ["pending", "paid", "overdue", "cancelled"];
    if !valid_statuses.contains(&data.status.as_str()) {
        return Err("Invalid status. Must be: pending, paid, overdue, or cancelled".to_string());
    }

    // Validate due_date
    if data.due_date.trim().is_empty() {
        return Err("Due date is required".to_string());
    }

    // Validate items
    if data.items.is_empty() {
        return Err("Invoice must have at least one item".to_string());
    }

    for (i, item) in data.items.iter().enumerate() {
        if item.description.trim().is_empty() {
            return Err(format!("Item {} description is required", i + 1));
        }
        if item.description.len() > 500 {
            return Err(format!("Item {} description is too long (max 500 characters)", i + 1));
        }
        if item.quantity <= 0 {
            return Err(format!("Item {} quantity must be positive", i + 1));
        }
        if item.unit_price < 0.0 {
            return Err(format!("Item {} unit price cannot be negative", i + 1));
        }
    }

    Ok(())
}

fn validate_update_invoice_data(data: &UpdateInvoice) -> Result<(), String> {
    if let Some(status) = &data.status {
        let valid_statuses = ["pending", "paid", "overdue", "cancelled"];
        if !valid_statuses.contains(&status.as_str()) {
            return Err("Invalid status. Must be: pending, paid, overdue, or cancelled".to_string());
        }
    }

    Ok(())
}

fn invoice_from_row(row: &rusqlite::Row) -> Result<Invoice, rusqlite::Error> {
    Ok(Invoice {
        id: row.get(0)?,
        customer_id: row.get(1)?,
        customer_name: row.get(2)?,
        customer_human_id: row.get(3)?,
        amount: row.get(4)?,
        status: row.get(5)?,
        due_date: row.get(6)?,
        paid_date: row.get(7)?,
        created_at: row.get(8)?,
    })
}

fn invoice_item_from_row(row: &rusqlite::Row) -> Result<InvoiceItem, rusqlite::Error> {
    Ok(InvoiceItem {
        id: row.get(0)?,
        description: row.get(1)?,
        quantity: row.get(2)?,
        unit_price: row.get(3)?,
        total: row.get(4)?,
    })
}

#[tauri::command]
pub fn get_invoices(state: State<DbConn>) -> Result<Vec<Invoice>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare(
            "SELECT 
                i.id, i.customer_id, c.name, c.human_id, i.amount, i.status, i.due_date, i.paid_date, i.created_at
            FROM invoices i
            LEFT JOIN customers c ON i.customer_id = c.id
            ORDER BY i.created_at DESC"
        )
        .map_err(|e| e.to_string())?;
    
    let invoice_iter = stmt
        .query_map([], |row| invoice_from_row(row))
        .map_err(|e| e.to_string())?;
    
    let mut invoices = Vec::new();
    for invoice in invoice_iter {
        invoices.push(invoice.map_err(|e| e.to_string())?);
    }
    
    Ok(invoices)
}

#[tauri::command]
pub fn get_invoice(state: State<DbConn>, id: String) -> Result<InvoiceWithItems, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare(
            "SELECT 
                i.id, i.customer_id, c.name, c.human_id, i.amount, i.status, i.due_date, i.paid_date, i.created_at
            FROM invoices i
            LEFT JOIN customers c ON i.customer_id = c.id
            WHERE i.id = ?"
        )
        .map_err(|e| e.to_string())?;
    
    let invoice = stmt
        .query_row(params![id], |row| invoice_from_row(row))
        .map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare("SELECT id, description, quantity, unit_price, total FROM invoice_items WHERE invoice_id = ?")
        .map_err(|e| e.to_string())?;
    
    let item_iter = stmt
        .query_map(params![id], |row| invoice_item_from_row(row))
        .map_err(|e| e.to_string())?;
    
    let mut items = Vec::new();
    for item in item_iter {
        items.push(item.map_err(|e| e.to_string())?);
    }
    
    Ok(InvoiceWithItems {
        id: invoice.id,
        customer_id: invoice.customer_id,
        customer_name: invoice.customer_name,
        customer_human_id: invoice.customer_human_id,
        amount: invoice.amount,
        status: invoice.status,
        due_date: invoice.due_date,
        paid_date: invoice.paid_date,
        created_at: invoice.created_at,
        items,
    })
}

#[tauri::command]
pub fn create_invoice(state: State<DbConn>, data: CreateInvoice) -> Result<Invoice, String> {
    // Validate input data
    validate_invoice_data(&data)?;
    
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
        "INSERT INTO invoices (id, customer_id, amount, status, due_date, paid_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        params![&id, &data.customer_id, data.amount, &data.status, &data.due_date, None as Option<String>, &created_at],
    ).map_err(|e| e.to_string())?;
    
    for item in &data.items {
        let item_id = uuid::Uuid::new_v4().to_string();
        let total = item.quantity as f64 * item.unit_price;
        
        conn.execute(
            "INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?, ?)",
            params![&item_id, &id, &item.description, item.quantity, item.unit_price, total],
        ).map_err(|e| e.to_string())?;
    }
    
    Ok(Invoice {
        id,
        customer_id: data.customer_id,
        customer_name: None,
        customer_human_id: None,
        amount: data.amount,
        status: data.status,
        due_date: data.due_date,
        paid_date: None,
        created_at,
    })
}

#[tauri::command]
pub fn update_invoice(state: State<DbConn>, id: String, data: UpdateInvoice) -> Result<Invoice, String> {
    // Validate input data
    validate_update_invoice_data(&data)?;
    
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut updates = Vec::new();
    let mut values: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    if let Some(status) = &data.status {
        updates.push("status = ?");
        values.push(Box::new(status.clone()));
    }
    if let Some(paid_date) = &data.paid_date {
        updates.push("paid_date = ?");
        values.push(Box::new(paid_date.clone()));
    }
    
    if !updates.is_empty() {
        let query = format!("UPDATE invoices SET {} WHERE id = ?", updates.join(", "));
        values.push(Box::new(id.clone()));
        
        conn.execute(&query, rusqlite::params_from_iter(values.iter()))
            .map_err(|e| e.to_string())?;
    }
    
    let mut stmt = conn
        .prepare(
            "SELECT 
                i.id, i.customer_id, c.name, c.human_id, i.amount, i.status, i.due_date, i.paid_date, i.created_at
            FROM invoices i
            LEFT JOIN customers c ON i.customer_id = c.id
            WHERE i.id = ?"
        )
        .map_err(|e| e.to_string())?;
    
    let invoice = stmt
        .query_row(params![id], |row| invoice_from_row(row))
        .map_err(|e| e.to_string())?;
    
    Ok(invoice)
}

#[tauri::command]
pub fn delete_invoice(state: State<DbConn>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    conn.execute("DELETE FROM invoice_items WHERE invoice_id = ?", params![&id])
        .map_err(|e| e.to_string())?;
    
    conn.execute("DELETE FROM invoices WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}
