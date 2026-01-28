use crate::database::DbPool;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use tauri::State;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Resource {
    pub id: String,
    pub name: String,
    pub resource_type: String, // 'seat', 'room', etc.
    pub rate_per_hour: f64,
    pub is_available: bool,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(Deserialize)]
pub struct CreateResourceDto {
    pub name: String,
    pub resource_type: String,
    pub rate_per_hour: f64,
}

#[derive(Deserialize)]
pub struct UpdateResourceDto {
    pub name: Option<String>,
    pub resource_type: Option<String>,
    pub rate_per_hour: Option<f64>,
    pub is_available: Option<bool>,
}

#[tauri::command]
pub async fn get_resources(pool: State<'_, DbPool>) -> Result<Vec<Resource>, String> {
    sqlx::query_as::<_, Resource>("SELECT * FROM resources ORDER BY name ASC")
        .fetch_all(&*pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_resource(pool: State<'_, DbPool>, data: CreateResourceDto) -> Result<Resource, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Local::now().naive_local();
    let resource = Resource {
        id: id.clone(),
        name: data.name,
        resource_type: data.resource_type,
        rate_per_hour: data.rate_per_hour,
        is_available: true,
        created_at: now,
        updated_at: now,
    };

    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO resources (id, name, resource_type, rate_per_hour, is_available, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&resource.id)
    .bind(&resource.name)
    .bind(&resource.resource_type)
    .bind(resource.rate_per_hour)
    .bind(resource.is_available)
    .bind(resource.created_at)
    .bind(resource.updated_at)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    // Audit Log
    sqlx::query(
        "INSERT INTO audit_logs (id, operation_type, description, resource_id, performed_at) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(uuid::Uuid::new_v4().to_string())
    .bind("resource_new")
    .bind(format!("New resource added: {}", resource.name))
    .bind(&resource.id)
    .bind(now)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(resource)
}

#[tauri::command]
pub async fn update_resource(pool: State<'_, DbPool>, id: String, data: UpdateResourceDto) -> Result<(), String> {
    let now = chrono::Local::now().naive_local();
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    sqlx::query("UPDATE resources SET 
        name = COALESCE(?, name), 
        resource_type = COALESCE(?, resource_type), 
        rate_per_hour = COALESCE(?, rate_per_hour), 
        is_available = COALESCE(?, is_available),
        updated_at = ?
        WHERE id = ?")
        .bind(&data.name)
        .bind(data.resource_type)
        .bind(data.rate_per_hour)
        .bind(data.is_available)
        .bind(now)
        .bind(&id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    // Audit Log
    sqlx::query(
        "INSERT INTO audit_logs (id, operation_type, description, resource_id, performed_at) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(uuid::Uuid::new_v4().to_string())
    .bind("resource_update")
    .bind(format!("Resource updated: {}", data.name.unwrap_or_else(|| "ID: ".to_string() + &id)))
    .bind(&id)
    .bind(now)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_resource(pool: State<'_, DbPool>, id: String) -> Result<(), String> {
    let now = chrono::Local::now().naive_local();
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    sqlx::query("DELETE FROM resources WHERE id = ?")
        .bind(&id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    // Audit Log
    sqlx::query(
        "INSERT INTO audit_logs (id, operation_type, description, performed_at) VALUES (?, ?, ?, ?)"
    )
    .bind(uuid::Uuid::new_v4().to_string())
    .bind("resource_delete")
    .bind(format!("Resource deleted: {}", id))
    .bind(now)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}
