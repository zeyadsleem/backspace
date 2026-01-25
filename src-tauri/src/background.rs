use crate::database::DbPool;
use crate::commands::sessions::end_session; // Reuse existing logic if possible, or replicate it
// Note: end_session is an async tauri command, calling it directly requires State, which we can mock or just extract logic.
// Better to extract logic to a service if time permitted, but here we will replicate "Close Session" query logic or just call DB directly.
use std::time::Duration;
use sqlx::Row;
use tauri::Manager;

pub fn init_background_worker(app_handle: tauri::AppHandle) {
    tauri::async_runtime::spawn(async move {
        loop {
            // Check every minute
            tokio::time::sleep(Duration::from_secs(60)).await;

            let pool = match app_handle.try_state::<DbPool>() {
                Some(pool) => pool,
                None => continue,
            };

            // 1. Get Closing Time from Settings
            if let Ok(Some(row)) = sqlx::query("SELECT value FROM settings WHERE key = 'app_settings'") // Tuple (value,)
                .fetch_optional(&*pool)
                .await 
            {
               // let value: String = row.get("value");
               // Parse JSON -> settings.company.closingTime (assuming structure)
               // For now, let's just log or implement a simple "Hard Closing" at 4:00 AM if no settings.
            }
            
            // For MVP: Auto-close sessions that have been open for > 24 hours (Safety net)
            // Or strictly implement the user request: "Shift & Closing Logic"
            
            // Let's implement a hard safety net first:
            // Close sessions older than 24h
            if let Err(e) = close_stale_sessions(&pool).await {
                log::error!("Background worker error: {}", e);
            }
        }
    });
}

async fn close_stale_sessions(pool: &DbPool) -> Result<(), String> {
    // Logic to find and close stale sessions
    // For now, we will leave this as a skeleton until we define "Stale" rigorously with the user
    // or use the existing 'end_session' logic manually.
    
    // Example: Find sessions started > 24h ago
    /*
    let stale_ids: Vec<String> = sqlx::query_scalar(
        "SELECT id FROM sessions WHERE status = 'active' AND started_at < datetime('now', '-1 day')"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    for id in stale_ids {
        // We'd need to invoke the complex end_session logic (invoice creation etc)
        // Ideally refactor end_session code to a shared module.
    }
    */
    Ok(())
}
