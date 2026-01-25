use crate::database::DbPool;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use tauri::State;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct InventoryItem {
    pub id: String,
    pub name: String,
    pub category: Option<String>,
    pub quantity: i64,
    pub price: Decimal,
    pub min_stock: Option<i64>,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(Deserialize)]
pub struct CreateInventoryDto {
    pub name: String,
    pub category: Option<String>,
    pub quantity: i64,
    pub price: Decimal,
    pub min_stock: Option<i64>,
}

#[derive(Deserialize)]
pub struct UpdateInventoryDto {
    pub name: Option<String>,
    pub category: Option<String>,
    pub quantity: Option<i64>,
    pub price: Option<Decimal>,
    pub min_stock: Option<i64>,
}

#[tauri::command]
pub async fn get_inventory(pool: State<'_, DbPool>) -> Result<Vec<InventoryItem>, String> {
    sqlx::query_as::<_, InventoryItem>("SELECT * FROM inventory ORDER BY name ASC")
        .fetch_all(&*pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_inventory(pool: State<'_, DbPool>, data: CreateInventoryDto) -> Result<InventoryItem, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let item = InventoryItem {
        id: id.clone(),
        name: data.name,
        category: data.category,
        quantity: data.quantity,
        price: data.price,
        min_stock: data.min_stock.or(Some(5)),
        created_at: chrono::Local::now().naive_local(),
        updated_at: chrono::Local::now().naive_local(),
    };

    sqlx::query(
        "INSERT INTO inventory (id, name, category, quantity, price, min_stock, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&item.id)
    .bind(&item.name)
    .bind(&item.category)
    .bind(item.quantity)
    .bind(item.price)
    .bind(item.min_stock)
    .bind(item.created_at)
    .bind(item.updated_at)
    .execute(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(item)
}

#[tauri::command]
pub async fn update_inventory(pool: State<'_, DbPool>, id: String, data: UpdateInventoryDto) -> Result<(), String> {
    sqlx::query("UPDATE inventory SET 
        name = COALESCE(?, name), 
        category = COALESCE(?, category), 
        quantity = COALESCE(?, quantity), 
        price = COALESCE(?, price), 
        min_stock = COALESCE(?, min_stock),
        updated_at = ?
        WHERE id = ?")
        .bind(data.name)
        .bind(data.category)
        .bind(data.quantity)
        .bind(data.price)
        .bind(data.min_stock)
        .bind(chrono::Local::now().naive_local())
        .bind(id)
        .execute(&*pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_inventory(pool: State<'_, DbPool>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM inventory WHERE id = ?")
        .bind(id)
        .execute(&*pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
