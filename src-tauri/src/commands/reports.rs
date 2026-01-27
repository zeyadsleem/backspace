use crate::database::DbPool;
use serde::{Deserialize, Serialize};
use sqlx::{Row, sqlite::SqliteRow};
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

#[derive(Debug, Serialize, Deserialize)]
pub struct RevenueDataPoint {
    pub date: String,
    pub sessions: f64,
    pub inventory: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TopCustomer {
    pub id: String,
    pub name: String,
    pub revenue: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RecentActivityView {
    pub id: String,
    pub description: String,
    pub operation_type: String,
    pub timestamp: chrono::NaiveDateTime,
}

#[tauri::command]
pub async fn get_dashboard_metrics(pool: State<'_, DbPool>) -> Result<DashboardMetrics, String> {
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

    let session_revenue: f64 = row.try_get::<Option<f64>, _>("session_rev").unwrap_or_default().unwrap_or(0.0);
    let inventory_revenue: f64 = row.try_get::<Option<f64>, _>("inventory_rev").unwrap_or_default().unwrap_or(0.0);
    
    let today_revenue = session_revenue + inventory_revenue;

    let active_sessions: i64 = sqlx::query("SELECT COUNT(*) FROM sessions WHERE status = 'active'")
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?
        .get(0);

    let new_customers_today: i64 = sqlx::query("SELECT COUNT(*) FROM customers WHERE date(created_at) = date('now', 'localtime')")
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?
        .get(0);

    let active_subscriptions: i64 = sqlx::query("SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND start_date <= date('now') AND end_date >= date('now')")
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?
        .get(0);

    let total_resources: i64 = sqlx::query("SELECT COUNT(*) FROM resources")
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?
        .get(0);
    
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
    let rows = sqlx::query(
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
            CAST(COALESCE(SUM(CASE WHEN ii.id IS NOT NULL AND (ii.description LIKE 'Session%' OR ii.description LIKE '%Subscription%') THEN ii.amount ELSE 0 END), 0) AS REAL) as sessions,
            CAST(COALESCE(SUM(CASE WHEN ii.id IS NOT NULL AND (ii.description NOT LIKE 'Session%' AND ii.description NOT LIKE '%Subscription%') THEN ii.amount ELSE 0 END), 0) AS REAL) as inventory
        FROM dates d
        LEFT JOIN invoices i ON date(i.created_at) = d.date
        LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
        GROUP BY d.date
        ORDER BY d.date
        "#
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|r| RevenueDataPoint {
        date: r.get(0),
        sessions: r.get(1),
        inventory: r.get(2),
    }).collect())
}

#[tauri::command]
pub async fn get_top_customers(pool: State<'_, DbPool>) -> Result<Vec<TopCustomer>, String> {
    let rows = sqlx::query(
        r#"
        SELECT id, name, CAST(total_spent AS REAL) as revenue 
        FROM customers 
        ORDER BY total_spent DESC 
        LIMIT 5
        "#
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|r| TopCustomer {
        id: r.get(0),
        name: r.get(1),
        revenue: r.get(2),
    }).collect())
}

#[tauri::command]
pub async fn get_recent_activity(pool: State<'_, DbPool>) -> Result<Vec<RecentActivityView>, String> {
    let rows = sqlx::query(
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
    .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|r| RecentActivityView {
        id: r.get(0),
        description: r.get(1),
        operation_type: r.get(2),
        timestamp: r.get(3),
    }).collect())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RevenueSummary {
    pub sessions: f64,
    pub inventory: f64,
    pub total: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RevenueReportData {
    pub today: RevenueSummary,
    pub this_week: RevenueSummary,
    pub this_month: RevenueSummary,
    pub comparison: ComparisonData,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ComparisonData {
    pub last_month: RevenueSummary,
    pub percent_change: f64,
}

async fn get_summary_for_period(pool: &DbPool, period_sql: &str) -> Result<RevenueSummary, String> {
    let query = format!(
        r#"
        SELECT 
            SUM(CASE WHEN description LIKE 'Session%' OR description LIKE '%Subscription%' THEN amount ELSE 0 END) as session_rev,
            SUM(CASE WHEN description NOT LIKE 'Session%' AND description NOT LIKE '%Subscription%' THEN amount ELSE 0 END) as inventory_rev
        FROM invoice_items ii
        JOIN invoices i ON ii.invoice_id = i.id
        WHERE {}
        "#,
        period_sql
    );

    let row = sqlx::query(&query)
        .fetch_one(pool)
        .await
        .map_err(|e| e.to_string())?;

    let sessions: f64 = row.try_get::<Option<f64>, _>("session_rev").unwrap_or_default().unwrap_or(0.0);
    let inventory: f64 = row.try_get::<Option<f64>, _>("inventory_rev").unwrap_or_default().unwrap_or(0.0);
    
    Ok(RevenueSummary {
        sessions,
        inventory,
        total: sessions + inventory,
    })
}

#[tauri::command]
pub async fn get_revenue_report(pool: State<'_, DbPool>) -> Result<RevenueReportData, String> {
    let today = get_summary_for_period(&*pool, "date(i.created_at) = date('now', 'localtime')").await?;
    let this_week = get_summary_for_period(&*pool, "date(i.created_at) >= date('now', '-7 days', 'localtime')").await?;
    let this_month = get_summary_for_period(&*pool, "date(i.created_at) >= date('now', 'start of month', 'localtime')").await?;
    let last_month = get_summary_for_period(&*pool, "date(i.created_at) >= date('now', 'start of month', '-1 month', 'localtime') AND date(i.created_at) < date('now', 'start of month', 'localtime')").await?;

    let percent_change = if last_month.total > 0.0 {
        ((this_month.total - last_month.total) / last_month.total) * 100.0
    } else {
        0.0
    };

    Ok(RevenueReportData {
        today,
        this_week,
        this_month,
        comparison: ComparisonData {
            last_month,
            percent_change,
        },
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResourceUtilization {
    pub id: String,
    pub name: String,
    pub rate: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PeakHour {
    pub hour: i32,
    pub occupancy: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UtilizationData {
    pub overall_rate: f64,
    pub by_resource: Vec<ResourceUtilization>,
    pub peak_hours: Vec<PeakHour>,
    pub average_session_duration: f64,
}

#[tauri::command]
pub async fn get_utilization_report(pool: State<'_, DbPool>) -> Result<UtilizationData, String> {
    let total_resources: i64 = sqlx::query("SELECT COUNT(*) FROM resources")
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?
        .get(0);
    
    let total_duration_mins: i64 = sqlx::query("SELECT SUM(duration_minutes) FROM sessions WHERE ended_at >= date('now', '-7 days', 'localtime')")
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?
        .get::<Option<i64>, _>(0)
        .unwrap_or(0);

    let overall_rate = if total_resources > 0 {
        let total_possible = 7.0 * 24.0 * 60.0 * total_resources as f64;
        (total_duration_mins as f64 / total_possible) * 100.0
    } else {
        0.0
    };

    let avg_duration: f64 = sqlx::query("SELECT AVG(duration_minutes) FROM sessions WHERE ended_at IS NOT NULL")
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?
        .get::<Option<f64>, _>(0)
        .unwrap_or(0.0);

    // By Resource
    let rows = sqlx::query(
        r#"
        SELECT r.id, r.name, 
               (CAST(COALESCE(SUM(s.duration_minutes), 0) AS REAL) / (7.0 * 24.0 * 60.0)) * 100.0 as rate
        FROM resources r
        LEFT JOIN sessions s ON r.id = s.resource_id AND s.ended_at >= date('now', '-7 days', 'localtime')
        GROUP BY r.id
        "#
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    let by_resource = rows.into_iter().map(|r| ResourceUtilization {
        id: r.get(0),
        name: r.get(1),
        rate: r.get(2),
    }).collect();

    // Peak Hours
    let mut peak_hours = Vec::new();
    for hour in 0..24 {
        peak_hours.push(PeakHour {
            hour,
            occupancy: 0.0,
        });
    }

    Ok(UtilizationData {
        overall_rate,
        by_resource,
        peak_hours,
        average_session_duration: avg_duration,
    })
}

#[tauri::command]
pub async fn get_operation_history(pool: State<'_, DbPool>) -> Result<Vec<RecentActivityView>, String> {
    let rows = sqlx::query(
        r#"
        SELECT id, 'Session Started: ' || resource_id as description, 'session_start' as operation_type, started_at as timestamp FROM sessions
        UNION ALL
        SELECT id, 'Invoice Created #' || invoice_number as description, 'invoice_created' as operation_type, created_at as timestamp FROM invoices
        UNION ALL
        SELECT id, 'New Customer: ' || name as description, 'customer_new' as operation_type, created_at as timestamp FROM customers
        ORDER BY timestamp DESC
        LIMIT 100
        "#
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|r| RecentActivityView {
        id: r.get(0),
        description: r.get(1),
        operation_type: r.get(2),
        timestamp: r.get(3),
    }).collect())
}
