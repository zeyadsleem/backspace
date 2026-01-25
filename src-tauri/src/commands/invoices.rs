use crate::database::DbPool;
use rust_decimal::Decimal;
use rust_decimal::prelude::Zero;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Row};
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct InvoiceView {
    pub id: String,
    pub invoice_number: String,
    pub customer_id: String,
    pub customer_name: String,
    pub amount: Decimal,
    pub total: Decimal,
    pub paid_amount: Decimal,
    pub status: String,
    pub due_date: chrono::NaiveDate,
    pub due_date: chrono::NaiveDate,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(Deserialize)]
pub struct PaymentDto {
    pub invoice_id: String,
    pub amount: Decimal,
    pub payment_method: String,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct InvoiceItemView {
    pub id: String,
    pub description: String,
    pub quantity: i64,
    pub rate: Decimal,
    pub amount: Decimal,
}

#[tauri::command]
pub async fn get_invoices(pool: State<'_, DbPool>) -> Result<Vec<InvoiceView>, String> {
    sqlx::query_as::<_, InvoiceView>(
        r#"
        SELECT i.id, i.invoice_number, i.customer_id, c.name as customer_name, 
               i.amount, i.total, i.paid_amount, i.status, i.due_date, i.created_at, i.updated_at
        FROM invoices i
        JOIN customers c ON i.customer_id = c.id
        ORDER BY i.created_at DESC
        "#
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_invoice_items(pool: State<'_, DbPool>, invoice_id: String) -> Result<Vec<InvoiceItemView>, String> {
    sqlx::query_as::<_, InvoiceItemView>(
        "SELECT id, description, quantity, rate, amount FROM invoice_items WHERE invoice_id = ?"
    )
    .bind(invoice_id)
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn process_payment(pool: State<'_, DbPool>, data: PaymentDto) -> Result<(), String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;
    
    // Fetch invoice
    let invoice = sqlx::query!(
        "SELECT total, paid_amount, status, customer_id FROM invoices WHERE id = ?", 
        data.invoice_id
    )
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| e.to_string())?
    .ok_or("Invoice not found")?;

    if invoice.status == "cancelled" {
        return Err("Cannot pay cancelled invoice".to_string());
    }

    // Explicitly handle potential NULL from DB if not default 0, though schema says DEFAULT 0.
    // SQLx might return strict types. Schema: paid_amount DECIMAL DEFAULT 0.
    let current_paid = Decimal::from(invoice.paid_amount.unwrap_or(0)); 
    let new_paid = current_paid + data.amount;
    let total = Decimal::from(invoice.total); // Schema: total DECIMAL NOT NULL
    
    let mut status = "partially_paid";
    if new_paid >= total {
        status = "paid";
    }

    let transaction_id = Uuid::new_v4().to_string();
    let now = chrono::Local::now().naive_local();

    // Record Transaction
    sqlx::query(
        "INSERT INTO transactions (id, invoice_id, amount, payment_method, payment_date, notes) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(transaction_id)
    .bind(&data.invoice_id)
    .bind(data.amount)
    .bind(&data.payment_method)
    .bind(now)
    .bind(&data.notes)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    // Update Invoice
    let paid_date = if status == "paid" { Some(now) } else { None };
    sqlx::query("UPDATE invoices SET paid_amount = ?, status = ?, paid_date = ?, updated_at = ? WHERE id = ?")
        .bind(new_paid)
        .bind(status)
        .bind(paid_date)
        .bind(now)
        .bind(&data.invoice_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    // Update Customer Stats
    // Decrease balance (debt) and increase total_spent
    // Update Customer Stats
    // Decrease balance (debt) and increase total_spent
    sqlx::query("UPDATE customers SET total_spent = total_spent + ?, balance = balance - ?, updated_at = ? WHERE id = ?")
        .bind(data.amount)
        .bind(data.amount)
        .bind(now)
        .bind(invoice.customer_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}
