use crate::database::DbConn;
use serde::{Deserialize, Serialize};
use tauri::State;
use rusqlite::params;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Resource {
    pub id: String,
    pub name: String,
    pub resource_type: String,
    pub is_available: bool,
    pub created_at: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateResource {
    pub name: String,
    pub resource_type: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateResource {
    pub name: Option<String>,
    pub resource_type: Option<String>,
    pub is_available: Option<bool>,
}

fn resource_from_row(row: &rusqlite::Row) -> Result<Resource, rusqlite::Error> {
    Ok(Resource {
        id: row.get(0)?,
        name: row.get(1)?,
        resource_type: row.get(2)?,
        is_available: row.get::<_, i32>(3)? == 1,
        created_at: row.get(4)?,
    })
}

#[tauri::command]
pub fn get_resources(state: State<DbConn>) -> Result<Vec<Resource>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare("SELECT id, name, resource_type, is_available, created_at FROM resources ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;
    
    let resource_iter = stmt
        .query_map([], |row| resource_from_row(row))
        .map_err(|e| e.to_string())?;
    
    let mut resources = Vec::new();
    for resource in resource_iter {
        resources.push(resource.map_err(|e| e.to_string())?);
    }
    
    Ok(resources)
}

#[tauri::command]
pub fn get_resource(state: State<DbConn>, id: String) -> Result<Resource, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare("SELECT id, name, resource_type, is_available, created_at FROM resources WHERE id = ?")
        .map_err(|e| e.to_string())?;
    
    let resource = stmt
        .query_row(params![id], |row| resource_from_row(row))
        .map_err(|e| e.to_string())?;
    
    Ok(resource)
}

#[tauri::command]
pub fn create_resource(state: State<DbConn>, data: CreateResource) -> Result<Resource, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let id = uuid::Uuid::new_v4().to_string();
    let created_at = chrono::Utc::now().to_rfc3339();
    
    conn.execute(
        "INSERT INTO resources (id, name, resource_type, is_available, created_at) VALUES (?, ?, ?, ?, ?)",
        params![&id, &data.name, &data.resource_type, 1i32, &created_at],
    ).map_err(|e| e.to_string())?;
    
    Ok(Resource {
        id,
        name: data.name,
        resource_type: data.resource_type,
        is_available: true,
        created_at,
    })
}

#[tauri::command]
pub fn update_resource(state: State<DbConn>, id: String, data: UpdateResource) -> Result<Resource, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut updates = Vec::new();
    let mut values: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    if let Some(name) = &data.name {
        updates.push("name = ?");
        values.push(Box::new(name.clone()));
    }
    if let Some(resource_type) = &data.resource_type {
        updates.push("resource_type = ?");
        values.push(Box::new(resource_type.clone()));
    }
    if let Some(is_available) = data.is_available {
        updates.push("is_available = ?");
        values.push(Box::new(if is_available { 1i32 } else { 0i32 }));
    }
    
    if !updates.is_empty() {
        let query = format!("UPDATE resources SET {} WHERE id = ?", updates.join(", "));
        values.push(Box::new(id.clone()));
        
        conn.execute(&query, rusqlite::params_from_iter(values.iter()))
            .map_err(|e| e.to_string())?;
    }
    
    let mut stmt = conn
        .prepare("SELECT id, name, resource_type, is_available, created_at FROM resources WHERE id = ?")
        .map_err(|e| e.to_string())?;
    
    let resource = stmt
        .query_row(params![id], |row| resource_from_row(row))
        .map_err(|e| e.to_string())?;
    
    Ok(resource)
}

#[tauri::command]
pub fn delete_resource(state: State<DbConn>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    conn.execute("DELETE FROM resources WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}
