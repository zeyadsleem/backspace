use crate::database::DbConn;
use serde::{Deserialize, Serialize};
use tauri::State;
use rusqlite::params;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DailyRevenue {
    pub period: String,
    pub revenue: f64,
    pub sessions: i64,
    pub customers: i64,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TopCustomer {
    pub rank: i64,
    pub name: String,
    pub total_spent: f64,
    pub sessions: i64,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ResourceUtilization {
    pub name: String,
    pub usage: f64,
    pub total: i64,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct OverviewStats {
    pub total_revenue: f64,
    pub total_sessions: i64,
    pub active_customers: i64,
    pub average_session_amount: f64,
}

#[tauri::command]
pub fn get_daily_revenue(state: State<DbConn>) -> Result<Vec<DailyRevenue>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "
            SELECT 
                CASE 
                    WHEN date(sessions.started_at) = date('now') THEN 'Today'
                    WHEN date(sessions.started_at) >= date('now', '-7 days') THEN 'This Week'
                    WHEN date(sessions.started_at) >= date('now', '-30 days') THEN 'This Month'
                    ELSE 'Older'
                END as period,
                COALESCE(SUM(sessions.amount), 0) as revenue,
                COUNT(*) as sessions,
                COUNT(DISTINCT sessions.customer_id) as customers
            FROM sessions
            WHERE sessions.ended_at IS NOT NULL
              AND date(sessions.started_at) >= date('now', '-30 days')
            GROUP BY period
            ORDER BY
                CASE period
                    WHEN 'Today' THEN 1
                    WHEN 'This Week' THEN 2
                    WHEN 'This Month' THEN 3
                    ELSE 4
                END
        ",
        )
        .map_err(|e| e.to_string())?;

    let daily_iter = stmt
        .query_map([], |row| {
            Ok(DailyRevenue {
                period: row.get(0)?,
                revenue: row.get(1)?,
                sessions: row.get(2)?,
                customers: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut results: Vec<DailyRevenue> = Vec::new();
    for result in daily_iter {
        results.push(result.map_err(|e| e.to_string())?);
    }

    Ok(results)
}

#[tauri::command]
pub fn get_top_customers(state: State<DbConn>, limit: Option<i64>) -> Result<Vec<TopCustomer>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let limit = limit.unwrap_or(10);

    let mut stmt = conn
        .prepare(
            "
            SELECT 
                ROW_NUMBER() OVER (ORDER BY SUM(sessions.amount) DESC) as rank,
                customers.name,
                COALESCE(SUM(sessions.amount), 0) as total_spent,
                COUNT(sessions.id) as sessions
            FROM sessions
            JOIN customers ON sessions.customer_id = customers.id
            WHERE sessions.ended_at IS NOT NULL
            GROUP BY customers.id, customers.name
            ORDER BY total_spent DESC
            LIMIT ?
        ",
        )
        .map_err(|e| e.to_string())?;

    let top_iter = stmt
        .query_map([limit], |row| {
            Ok(TopCustomer {
                rank: row.get(0)?,
                name: row.get(1)?,
                total_spent: row.get(2)?,
                sessions: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut results: Vec<TopCustomer> = Vec::new();
    for result in top_iter {
        results.push(result.map_err(|e| e.to_string())?);
    }

    Ok(results)
}

#[tauri::command]
pub fn get_resource_utilization(state: State<DbConn>) -> Result<Vec<ResourceUtilization>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "
            SELECT 
                resources.name,
                COUNT(*) as total,
                SUM(CASE WHEN sessions.id IS NOT NULL AND sessions.ended_at IS NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as usage
            FROM resources
            LEFT JOIN sessions ON resources.id = sessions.resource_id 
                AND sessions.started_at >= datetime('now', '-1 day')
            GROUP BY resources.id, resources.name
            ORDER BY resources.name
        ",
        )
        .map_err(|e| e.to_string())?;

    let utilization_iter = stmt
        .query_map([], |row| {
            Ok(ResourceUtilization {
                name: row.get(0)?,
                total: row.get(1)?,
                usage: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut results: Vec<ResourceUtilization> = Vec::new();
    for result in utilization_iter {
        results.push(result.map_err(|e| e.to_string())?);
    }

    Ok(results)
}

#[tauri::command]
pub fn get_overview_stats(state: State<DbConn>) -> Result<OverviewStats, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "
            SELECT 
                COALESCE(SUM(sessions.amount), 0) as total_revenue,
                COUNT(sessions.id) as total_sessions,
                COUNT(DISTINCT sessions.customer_id) as active_customers,
                COALESCE(AVG(sessions.amount), 0) as average_session_amount
            FROM sessions
            WHERE sessions.ended_at IS NOT NULL
              AND date(sessions.started_at) >= date('now', '-30 days')
        ",
        )
        .map_err(|e| e.to_string())?;

    let stats = stmt
        .query_row([], |row| {
            Ok(OverviewStats {
                total_revenue: row.get(0)?,
                total_sessions: row.get(1)?,
                active_customers: row.get(2)?,
                average_session_amount: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(stats)
}
