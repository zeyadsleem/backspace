use crate::database::DbPool;
use serde_json::Value; // We'll store/retrieve generic JSON or strict structs if we have them in shared types
use tauri::State;

#[tauri::command]
pub async fn get_settings(pool: State<'_, DbPool>) -> Result<Value, String> {
    let row: Option<(String,)> = sqlx::query_as("SELECT value FROM settings WHERE key = 'app_settings'")
        .fetch_optional(&*pool)
        .await
        .map_err(|e| e.to_string())?;

    if let Some((json_str,)) = row {
        let settings: Value = serde_json::from_str(&json_str).map_err(|e| e.to_string())?;
        Ok(settings)
    } else {
        // Return null or empty object if not found, frontend can use defaults
        Ok(Value::Null)
    }
}

#[tauri::command]
pub async fn update_settings(pool: State<'_, DbPool>, settings: Value) -> Result<(), String> {
    let json_str = serde_json::to_string(&settings).map_err(|e| e.to_string())?;
    
    // Upsert logic
    sqlx::query(
        "INSERT INTO settings (key, value, updated_at) VALUES ('app_settings', ?, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
    )
    .bind(json_str)
    .execute(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}
