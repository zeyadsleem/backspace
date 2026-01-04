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
    pub rate_per_hour: f64,
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
    pub rate_per_hour: Option<f64>,
}

fn validate_resource_data(data: &CreateResource) -> Result<(), String> {
    // Validate name
    let name = data.name.trim();
    if name.len() < 2 {
        return Err("Name must be at least 2 characters".to_string());
    }
    if name.len() > 100 {
        return Err("Name is too long (max 100 characters)".to_string());
    }

    // Validate resource type
    let valid_types = ["seat", "desk", "room"];
    if !valid_types.contains(&data.resource_type.as_str()) {
        return Err("Resource type must be 'seat', 'desk', or 'room'".to_string());
    }

    Ok(())
}

fn validate_update_resource_data(data: &UpdateResource) -> Result<(), String> {
    if let Some(name) = &data.name {
        let name = name.trim();
        if name.len() < 2 {
            return Err("Name must be at least 2 characters".to_string());
        }
        if name.len() > 100 {
            return Err("Name is too long (max 100 characters)".to_string());
        }
    }

    if let Some(resource_type) = &data.resource_type {
        let valid_types = ["seat", "desk", "room"];
        if !valid_types.contains(&resource_type.as_str()) {
            return Err("Resource type must be 'seat', 'desk', or 'room'".to_string());
        }
    }

    if let Some(rate) = data.rate_per_hour {
        if rate < 0.0 {
            return Err("Rate per hour cannot be negative".to_string());
        }
    }

    Ok(())
}

fn resource_from_row(row: &rusqlite::Row) -> Result<Resource, rusqlite::Error> {
    Ok(Resource {
        id: row.get(0)?,
        name: row.get(1)?,
        resource_type: row.get(2)?,
        is_available: row.get::<_, i32>(3)? == 1,
        rate_per_hour: row.get(4)?,
        created_at: row.get(5)?,
    })
}

#[tauri::command]
pub fn get_resources(state: State<DbConn>) -> Result<Vec<Resource>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare("SELECT id, name, resource_type, is_available, rate_per_hour, created_at FROM resources ORDER BY created_at DESC")
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
        .prepare("SELECT id, name, resource_type, is_available, rate_per_hour, created_at FROM resources WHERE id = ?")
        .map_err(|e| e.to_string())?;
    
    let resource = stmt
        .query_row(params![id], |row| resource_from_row(row))
        .map_err(|e| e.to_string())?;
    
    Ok(resource)
}

#[tauri::command]
pub fn create_resource(state: State<DbConn>, data: CreateResource) -> Result<Resource, String> {
    // Validate input data
    validate_resource_data(&data)?;
    
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let id = uuid::Uuid::new_v4().to_string();
    let created_at = chrono::Utc::now().to_rfc3339();
    let name = data.name.trim().to_string();
    
    conn.execute(
        "INSERT INTO resources (id, name, resource_type, is_available, rate_per_hour, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        params![&id, &name, &data.resource_type, 1i32, 50.0f64, &created_at],
    ).map_err(|e| e.to_string())?;
    
    Ok(Resource {
        id,
        name,
        resource_type: data.resource_type,
        is_available: true,
        rate_per_hour: 50.0,
        created_at,
    })
}

#[tauri::command]
pub fn update_resource(state: State<DbConn>, id: String, data: UpdateResource) -> Result<Resource, String> {
    // Validate input data
    validate_update_resource_data(&data)?;
    
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut updates = Vec::new();
    let mut values: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    if let Some(name) = &data.name {
        updates.push("name = ?");
        values.push(Box::new(name.trim().to_string()));
    }
    if let Some(resource_type) = &data.resource_type {
        updates.push("resource_type = ?");
        values.push(Box::new(resource_type.clone()));
    }
    if let Some(is_available) = data.is_available {
        updates.push("is_available = ?");
        values.push(Box::new(if is_available { 1i32 } else { 0i32 }));
    }
    if let Some(rate_per_hour) = data.rate_per_hour {
        updates.push("rate_per_hour = ?");
        values.push(Box::new(rate_per_hour));
    }
    
    if !updates.is_empty() {
        let query = format!("UPDATE resources SET {} WHERE id = ?", updates.join(", "));
        values.push(Box::new(id.clone()));
        
        conn.execute(&query, rusqlite::params_from_iter(values.iter()))
            .map_err(|e| e.to_string())?;
    }
    
    let mut stmt = conn
        .prepare("SELECT id, name, resource_type, is_available, rate_per_hour, created_at FROM resources WHERE id = ?")
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
