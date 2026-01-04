use crate::database::DbConn;
use serde::{Deserialize, Serialize};
use tauri::State;
use rusqlite::params;
use chrono::{DateTime, Utc};

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Session {
    pub id: String,
    pub customer_id: String,
    pub resource_id: String,
    pub started_at: String,
    pub ended_at: Option<String>,
    pub duration_minutes: Option<i32>,
    pub amount: Option<f64>,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SessionWithDetails {
    pub id: String,
    pub customer_id: String,
    pub customer_name: String,
    pub customer_human_id: String,
    pub resource_id: String,
    pub resource_name: String,
    pub resource_type: String,
    pub started_at: String,
    pub ended_at: Option<String>,
    pub duration_minutes: Option<i32>,
    pub amount: Option<f64>,
    pub created_at: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSession {
    pub customer_id: String,
    pub resource_id: String,
}

fn session_from_row(row: &rusqlite::Row) -> Result<Session, rusqlite::Error> {
    Ok(Session {
        id: row.get(0)?,
        customer_id: row.get(1)?,
        resource_id: row.get(2)?,
        started_at: row.get(3)?,
        ended_at: row.get(4)?,
        duration_minutes: row.get(5)?,
        amount: row.get(6)?,
        created_at: row.get(7)?,
    })
}

fn session_with_details_from_row(row: &rusqlite::Row) -> Result<SessionWithDetails, rusqlite::Error> {
    Ok(SessionWithDetails {
        id: row.get(0)?,
        customer_id: row.get(1)?,
        customer_name: row.get(2)?,
        customer_human_id: row.get(3)?,
        resource_id: row.get(4)?,
        resource_name: row.get(5)?,
        resource_type: row.get(6)?,
        started_at: row.get(7)?,
        ended_at: row.get(8)?,
        duration_minutes: row.get(9)?,
        amount: row.get(10)?,
        created_at: row.get(11)?,
    })
}

#[tauri::command]
pub fn get_sessions(state: State<DbConn>) -> Result<Vec<SessionWithDetails>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare(
            "SELECT 
                s.id, s.customer_id, c.name, c.human_id, s.resource_id, r.name, r.resource_type, 
                s.started_at, s.ended_at, s.duration_minutes, s.amount, s.created_at
            FROM sessions s
            LEFT JOIN customers c ON s.customer_id = c.id
            LEFT JOIN resources r ON s.resource_id = r.id
            ORDER BY s.started_at DESC"
        )
        .map_err(|e| e.to_string())?;
    
    let session_iter = stmt
        .query_map([], |row| session_with_details_from_row(row))
        .map_err(|e| e.to_string())?;
    
    let mut sessions = Vec::new();
    for session in session_iter {
        sessions.push(session.map_err(|e| e.to_string())?);
    }
    
    Ok(sessions)
}

#[tauri::command]
pub fn get_session(state: State<DbConn>, id: String) -> Result<SessionWithDetails, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare(
            "SELECT 
                s.id, s.customer_id, c.name, c.human_id, s.resource_id, r.name, r.resource_type, 
                s.started_at, s.ended_at, s.duration_minutes, s.amount, s.created_at
            FROM sessions s
            LEFT JOIN customers c ON s.customer_id = c.id
            LEFT JOIN resources r ON s.resource_id = r.id
            WHERE s.id = ?"
        )
        .map_err(|e| e.to_string())?;
    
    let session = stmt
        .query_row(params![id], |row| session_with_details_from_row(row))
        .map_err(|e| e.to_string())?;
    
    Ok(session)
}

#[tauri::command]
pub fn get_active_sessions(state: State<DbConn>) -> Result<Vec<SessionWithDetails>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare(
            "SELECT 
                s.id, s.customer_id, c.name, c.human_id, s.resource_id, r.name, r.resource_type, 
                s.started_at, s.ended_at, s.duration_minutes, s.amount, s.created_at
            FROM sessions s
            LEFT JOIN customers c ON s.customer_id = c.id
            LEFT JOIN resources r ON s.resource_id = r.id
            WHERE s.ended_at IS NULL
            ORDER BY s.started_at DESC"
        )
        .map_err(|e| e.to_string())?;
    
    let session_iter = stmt
        .query_map([], |row| session_with_details_from_row(row))
        .map_err(|e| e.to_string())?;
    
    let mut sessions = Vec::new();
    for session in session_iter {
        sessions.push(session.map_err(|e| e.to_string())?);
    }
    
    Ok(sessions)
}

#[tauri::command]
pub fn start_session(state: State<DbConn>, data: CreateSession) -> Result<Session, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let id = uuid::Uuid::new_v4().to_string();
    let started_at = chrono::Utc::now().to_rfc3339();
    let created_at = started_at.clone();
    
    conn.execute(
        "INSERT INTO sessions (id, customer_id, resource_id, started_at, ended_at, duration_minutes, amount, created_at) VALUES (?, ?, ?, ?, NULL, NULL, NULL, ?)",
        params![&id, &data.customer_id, &data.resource_id, &started_at, &created_at],
    ).map_err(|e| e.to_string())?;
    
    Ok(Session {
        id,
        customer_id: data.customer_id,
        resource_id: data.resource_id,
        started_at,
        ended_at: None,
        duration_minutes: None,
        amount: None,
        created_at,
    })
}

#[tauri::command]
pub fn end_session(state: State<DbConn>, id: String) -> Result<SessionWithDetails, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare("SELECT started_at FROM sessions WHERE id = ?")
        .map_err(|e| e.to_string())?;
    
    let started_at_str: String = stmt
        .query_row(params![id], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    
    let started_at: DateTime<Utc> = started_at_str
        .parse()
        .map_err(|e| format!("Invalid date format: {}", e))?;
    
    let ended_at = chrono::Utc::now();
    let ended_at_str = ended_at.to_rfc3339();
    
    let duration_minutes = ended_at.signed_duration_since(started_at).num_minutes() as i32;
    
    let amount = duration_minutes as f64 * 1.0;
    
    conn.execute(
        "UPDATE sessions SET ended_at = ?, duration_minutes = ?, amount = ? WHERE id = ?",
        params![&ended_at_str, duration_minutes, amount, &id],
    ).map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare(
            "SELECT 
                s.id, s.customer_id, c.name, c.human_id, s.resource_id, r.name, r.resource_type, 
                s.started_at, s.ended_at, s.duration_minutes, s.amount, s.created_at
            FROM sessions s
            LEFT JOIN customers c ON s.customer_id = c.id
            LEFT JOIN resources r ON s.resource_id = r.id
            WHERE s.id = ?"
        )
        .map_err(|e| e.to_string())?;
    
    let session = stmt
        .query_row(params![id], |row| session_with_details_from_row(row))
        .map_err(|e| e.to_string())?;
    
    Ok(session)
}
