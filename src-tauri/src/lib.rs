pub mod database;
pub mod commands;
pub mod background;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      // ... existing setup ...
      let handle = app.handle().clone();
      tauri::async_runtime::block_on(async move {
          match database::init_db(&handle).await {
              Ok(pool) => {
                  handle.manage(pool);
                  log::info!("Database connection established.");
                  // Start Background Worker
                  background::init_background_worker(handle.clone());
              }
              Err(e) => {
                  log::error!("Failed to initialize database: {}", e);
                  panic!("Database initialization failed: {}", e);
              }
          }
      });

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
        commands::customers::get_customers,
        commands::customers::add_customer,
        commands::customers::update_customer,
        commands::customers::delete_customer,
        commands::resources::get_resources,
        commands::resources::add_resource,
        commands::resources::update_resource,
        commands::resources::delete_resource,
        commands::inventory::get_inventory,
        commands::inventory::add_inventory,
        commands::inventory::update_inventory,
        commands::inventory::delete_inventory,
        commands::sessions::get_active_sessions,
        commands::sessions::start_session,
        commands::sessions::end_session,
        commands::sessions::add_session_inventory,
        commands::invoices::get_invoices,
        commands::invoices::get_invoice_items,
        commands::invoices::process_payment,
        commands::settings::get_settings,
        commands::settings::update_settings
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

