mod database;
mod commands;

use database::DbConn;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      
      let conn = database::init_db().expect("Failed to initialize database");
      app.manage(DbConn(std::sync::Mutex::new(conn)));
      
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      commands::get_customers,
      commands::get_customer,
      commands::create_customer,
      commands::update_customer,
      commands::delete_customer,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
