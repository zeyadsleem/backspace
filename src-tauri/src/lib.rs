mod database;
mod commands;
mod error;
mod validation;

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
      commands::get_resources,
      commands::get_resource,
      commands::create_resource,
      commands::update_resource,
      commands::delete_resource,
      commands::get_sessions,
      commands::get_session,
      commands::get_active_sessions,
      commands::start_session,
      commands::end_session,
      commands::get_inventory,
      commands::get_inventory_item,
      commands::create_inventory,
      commands::update_inventory,
      commands::delete_inventory,
      commands::get_subscriptions,
      commands::get_subscription,
      commands::create_subscription,
      commands::update_subscription,
      commands::delete_subscription,
      commands::get_invoices,
      commands::get_invoice,
      commands::create_invoice,
      commands::update_invoice,
      commands::delete_invoice,
      commands::get_daily_revenue,
      commands::get_top_customers,
      commands::get_resource_utilization,
      commands::get_overview_stats,
      database::reset_database,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
