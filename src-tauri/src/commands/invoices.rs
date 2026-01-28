use crate::database::DbPool;
use rust_decimal::Decimal;
// use rust_decimal::prelude::Zero;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Row};
use tauri::State;
use uuid::Uuid;
// use std::str::FromStr;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct InvoiceView {
    pub id: String,
    pub invoice_number: String,
    pub customer_id: String,
    pub customer_name: String,
    pub amount: f64,
    pub total: f64,
    pub paid_amount: f64,
    pub status: String,
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
    pub rate: f64,
    pub amount: f64,
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
    // Fetch invoice manually to avoid implicit types
    use sqlx::Row;
    let row = sqlx::query(
        "SELECT total, paid_amount, status, customer_id FROM invoices WHERE id = ?"
    )
    .bind(&data.invoice_id)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| e.to_string())?
    .ok_or("Invoice not found")?;

    // Map fields. Decimals stored/returned might be REAL or TEXT. Parse carefully.
    // Assuming we store as TEXT/REAL. 
    // We try to read as String then parse, or f64.
    // If bind uses string, read as string is safest.
    let total_s: String = row.try_get("total").unwrap_or_default();
    let total = Decimal::from_str_exact(&total_s).unwrap_or(Decimal::ZERO);
    
    let paid_s: String = row.try_get("paid_amount").unwrap_or_default();
    let paid_amount = Decimal::from_str_exact(&paid_s).unwrap_or(Decimal::ZERO);
    
    let status: String = row.try_get("status").unwrap_or_default();
    let customer_id: String = row.try_get("customer_id").unwrap_or_default();

    // Struct for logic
    struct Inv { total: Decimal, paid_amount: Decimal, status: String }
    let invoice = Inv { total, paid_amount, status };
    
    if invoice.status == "cancelled" {
        return Err("Cannot pay cancelled invoice".to_string());
    }
    // Logic uses 'invoice', so we constructed a local struct.
    // We don't need customer_id here? Logic doesn't seems to use it in snippet.
    // Wait, original query fetched customer_id. Maybe it's not used in this function.
    // Ah, original 'invoice' var was used.

    if invoice.status == "cancelled" {
        return Err("Cannot pay cancelled invoice".to_string());
    }

    // Explicitly handle potential NULL from DB if not default 0, though schema says DEFAULT 0.
    // SQLx might return strict types. Schema: paid_amount DECIMAL DEFAULT 0.
    let current_paid = invoice.paid_amount;
    let new_paid = current_paid + data.amount;
    let total = invoice.total; // already Decimal from our local struct mapping
    
    let mut status = "partially_paid";
    if new_paid >= total {
        status = "paid";
    }

    let transaction_id = Uuid::new_v4().to_string();
    let now = chrono::Local::now().naive_local();

    // Record Transaction
    sqlx::query(
        "INSERT INTO transactions (id, invoice_id, amount, payment_method, notes, payment_date) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(transaction_id)
    .bind(&data.invoice_id)
    .bind(data.amount.to_string())
    .bind(&data.payment_method)
    .bind(&data.notes)
    .bind(now)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    // Update Invoice
    let paid_date = if status == "paid" { Some(now) } else { None };
    sqlx::query("UPDATE invoices SET paid_amount = ?, status = ?, paid_date = ?, updated_at = ? WHERE id = ?")
        .bind(new_paid.to_string())
        .bind(status)
        .bind(paid_date)
        .bind(now)
        .bind(&data.invoice_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    // Update Customer Stats
    // Decrease balance (debt) and increase total_spent
    sqlx::query("UPDATE customers SET total_spent = total_spent + ?, balance = balance - ?, updated_at = ? WHERE id = ?")
        .bind(data.amount.to_string())
        .bind(data.amount.to_string())
        .bind(now)
        .bind(customer_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    // Audit Log
    sqlx::query(
        "INSERT INTO audit_logs (id, operation_type, description, performed_at) VALUES (?, ?, ?, ?)"
    )
    .bind(uuid::Uuid::new_v4().to_string())
    .bind("payment_received")
    .bind(format!("Payment of {} received for invoice {}", data.amount, data.invoice_id))
    .bind(now)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}

#[derive(Deserialize)]
pub struct BulkPaymentDto {
    pub invoice_ids: Vec<String>,
    pub amount: Decimal,
    pub payment_method: String,
    pub notes: Option<String>,
}

#[tauri::command]
pub async fn process_bulk_payment(pool: State<'_, DbPool>, data: BulkPaymentDto) -> Result<(), String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;
    let mut remaining_amount = data.amount;
    let now = chrono::Local::now().naive_local();

    for invoice_id in data.invoice_ids {
        if remaining_amount.is_zero() {
            break;
        }

        let row = sqlx::query(
            "SELECT total, paid_amount, status, customer_id FROM invoices WHERE id = ?"
        )
        .bind(&invoice_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Invoice {} not found", invoice_id))?;

        let total_s: String = row.try_get("total").unwrap_or_default();
        let total = Decimal::from_str_exact(&total_s).unwrap_or(Decimal::ZERO);
        
        let paid_s: String = row.try_get("paid_amount").unwrap_or_default();
        let paid_amount = Decimal::from_str_exact(&paid_s).unwrap_or(Decimal::ZERO);
        
        let status: String = row.try_get("status").unwrap_or_default();
        let customer_id: String = row.try_get("customer_id").unwrap_or_default();

        if status == "cancelled" || status == "paid" {
            continue;
        }

        let balance_due = total - paid_amount;
        let amount_to_pay = remaining_amount.min(balance_due);
        
        if amount_to_pay.is_zero() {
            continue;
        }

        let new_paid = paid_amount + amount_to_pay;
        let mut new_status = "partially_paid";
        if new_paid >= total {
            new_status = "paid";
        }

        let transaction_id = Uuid::new_v4().to_string();
        
        // Record Transaction
        sqlx::query(
            "INSERT INTO transactions (id, invoice_id, amount, payment_method, notes, payment_date) VALUES (?, ?, ?, ?, ?, ?)"
        )
        .bind(transaction_id)
        .bind(&invoice_id)
        .bind(amount_to_pay.to_string())
        .bind(&data.payment_method)
        .bind(&data.notes)
        .bind(now)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

        // Update Invoice
        let paid_date = if new_status == "paid" { Some(now) } else { None };
        sqlx::query("UPDATE invoices SET paid_amount = ?, status = ?, paid_date = ?, updated_at = ? WHERE id = ?")
            .bind(new_paid.to_string())
            .bind(new_status)
            .bind(paid_date)
            .bind(now)
            .bind(&invoice_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;

        // Update Customer Stats
        sqlx::query("UPDATE customers SET total_spent = total_spent + ?, balance = balance - ?, updated_at = ? WHERE id = ?")
            .bind(amount_to_pay.to_string())
            .bind(amount_to_pay.to_string())
            .bind(now)
            .bind(customer_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;

        // Audit Log
        sqlx::query(
            "INSERT INTO audit_logs (id, operation_type, description, performed_at) VALUES (?, ?, ?, ?)"
        )
        .bind(uuid::Uuid::new_v4().to_string())
        .bind("payment_received")
        .bind(format!("Bulk payment part of {} received for invoice {}", amount_to_pay, invoice_id))
        .bind(now)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

        remaining_amount -= amount_to_pay;
    }

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}
