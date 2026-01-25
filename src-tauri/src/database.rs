use sqlx::{sqlite::SqliteConnectOptions, SqlitePool};
use std::fs;
use std::str::FromStr;
use tauri::{AppHandle, Manager};

pub type DbPool = SqlitePool;

pub async fn init_db(app_handle: &AppHandle) -> Result<DbPool, Box<dyn std::error::Error>> {
    let app_dir = app_handle.path().app_data_dir()?;
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)?;
    }
    
    let db_path = app_dir.join("backspace.db");
    
    // Explicitly creating file is not strictly necessary if using create_if_missing(true) 
    // but ensures directory permissions are checked.
    if !db_path.exists() {
        fs::File::create(&db_path)?;
    }

    let db_url = format!("sqlite://{}", db_path.to_string_lossy());
    
    let options = SqliteConnectOptions::from_str(&db_url)?
        .create_if_missing(true);

    let pool = SqlitePool::connect_with(options).await?;

    // Run migrations
    // The path is relative to Cargo.toml directory during compilation
    sqlx::migrate!("./migrations").run(&pool).await?;

    Ok(pool)
}
