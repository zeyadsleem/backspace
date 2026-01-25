use crate::database::DbPool;
use rust_decimal::Decimal;
use rust_decimal::prelude::Zero;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct DashboardMetrics {
    pub today_revenue: f64,
    pub session_revenue: f64,
    pub inventory_revenue: f64,
    pub active_sessions: i64,
    pub new_customers_today: i64,
    pub active_subscriptions: i64,
    pub resource_utilization: i64,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct RevenueDataPoint {
    pub date: String,
    pub sessions: f64,
    pub inventory: f64,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct TopCustomer {
    pub id: String,
    pub name: String,
    pub revenue: f64,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct RecentActivityView {
    pub id: String,
    pub description: String,
    pub operation_type: String,
    pub timestamp: chrono::NaiveDateTime,
}

#[tauri::command]
pub async fn get_dashboard_metrics(pool: State<'_, DbPool>) -> Result<DashboardMetrics, String> {
    let now = chrono::Local::now().naive_local();
    let today_str = now.date().to_string(); // YYYY-MM-DD

    // 1. Today's Revenue (Invoices paid today OR Sessions ended today? Usually Invoices created/paid today)
    // Let's use Invoices CREATED today for revenue tracking regardless of payment status? Or Paid?
    // Revenue usually implies earned. Let's go with Total of Invoices created today for simplicity of "Sales", 
    // or Paid amount today for "Cash Flow".
    // Sample data logic seemed to track "Revenue" as sales. Let's sum invoice items created today.
    
    // Revenue breakdown
    use sqlx::Row;
    let row = sqlx::query(
        r#"
        SELECT 
            SUM(CASE WHEN description LIKE 'Session%' OR description LIKE '%Subscription%' THEN amount ELSE 0 END) as session_rev,
            SUM(CASE WHEN description NOT LIKE 'Session%' AND description NOT LIKE '%Subscription%' THEN amount ELSE 0 END) as inventory_rev
        FROM invoice_items ii
        JOIN invoices i ON ii.invoice_id = i.id
        WHERE date(i.created_at) = date('now', 'localtime')
        "#
    )
    .fetch_one(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    let session_revenue: f64 = row.try_get::<Option<f64>, _>("session_rev").unwrap_or(None).unwrap_or(0.0);
    let inventory_revenue: f64 = row.try_get::<Option<f64>, _>("inventory_rev").unwrap_or(None).unwrap_or(0.0);
    
    let today_revenue = session_revenue + inventory_revenue;

    // Note: SQLx might return these as f64 or Decimal or i64 depending on driver inference.
    // Explicitly casting via 'as' if compatible, or use simple mapping.
    // For SQLite SUM(DECIMAL) -> REAL usually (f64).
    // Safest is to let SQLx map to what it thinks, then we convert.
    // But query! macro infers types from DB. We migrated as DECIMAL.
    // Let's assume it returns Option<f64> or similar. We'll handle conversion.
    // Actually, macro output fields have specific types.
    // We'll coerce to f64.
    


    // 2. Active Sessions
    let active_sessions: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM sessions WHERE status = 'active'")
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?;

    // 3. New Customers Today
    let new_customers_today: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM customers WHERE date(created_at) = date('now', 'localtime')")
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?;

    // 4. Active Subscriptions
    let active_subscriptions: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND start_date <= date('now') AND end_date >= date('now')")
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?;

    // 5. Resource Utilization (Active Sessions / Total Resources)
    let total_resources: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM resources")
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?;
    
    let resource_utilization = if total_resources > 0 {
        ((active_sessions as f64 / total_resources as f64) * 100.0) as i64
    } else {
        0
    };

    Ok(DashboardMetrics {
        today_revenue,
        session_revenue,
        inventory_revenue,
        active_sessions,
        new_customers_today,
        active_subscriptions,
        resource_utilization,
    })
}

#[tauri::command]
pub async fn get_revenue_chart_data(pool: State<'_, DbPool>) -> Result<Vec<RevenueDataPoint>, String> {
    // Last 7 days
    sqlx::query_as::<_, RevenueDataPoint>(
        r#"
        WITH RECURSIVE dates(date) AS (
            SELECT date('now', '-6 days', 'localtime')
            UNION ALL
            SELECT date(date, '+1 day')
            FROM dates
            WHERE date < date('now', 'localtime')
        )
        SELECT 
            d.date,
            COALESCE(SUM(CASE WHEN ii.id IS NOT NULL AND (ii.description LIKE 'Session%' OR ii.description LIKE '%Subscription%') THEN ii.amount ELSE 0 END), 0) as sessions,
            COALESCE(SUM(CASE WHEN ii.id IS NOT NULL AND (ii.description NOT LIKE 'Session%' AND ii.description NOT LIKE '%Subscription%') THEN ii.amount ELSE 0 END), 0) as inventory
        FROM dates d
        LEFT JOIN invoices i ON date(i.created_at) = d.date
        LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
        GROUP BY d.date
        ORDER BY d.date
        "#
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_top_customers(pool: State<'_, DbPool>) -> Result<Vec<TopCustomer>, String> {
    sqlx::query_as::<_, TopCustomer>(
        r#"
        SELECT id, name, total_spent as revenue 
        FROM customers 
        ORDER BY total_spent DESC 
        LIMIT 5
        "#
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_recent_activity(pool: State<'_, DbPool>) -> Result<Vec<RecentActivityView>, String> {
    // In a real app we might query an audit_logs table.
    // For now, let's union sessions start/end and invoice creations to simulate "Activity Stream"
    // Or just use audit_logs table if we populated it (we defined it in schema but didn't consistently insert into it in all commands).
    // Let's assume we want to query the actual operational tables for robust live data.
    
    // Union approach:
    // 1. Session Starts
    // 2. Invoices Created (Sales)
    // 3. New Customers
    sqlx::query_as::<_, RecentActivityView>(
        r#"
        SELECT id, 'Session Started: ' || resource_id as description, 'session_start' as operation_type, started_at as timestamp FROM sessions WHERE status = 'active'
        UNION ALL
        SELECT id, 'Invoice Created #' || invoice_number as description, 'invoice_created' as operation_type, created_at as timestamp FROM invoices
        UNION ALL
        SELECT id, 'New Customer: ' || name as description, 'customer_new' as operation_type, created_at as timestamp FROM customers
        ORDER BY timestamp DESC
        LIMIT 20
        "#
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())
}
