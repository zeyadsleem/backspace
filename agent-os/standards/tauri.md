# Tauri Integration — التكامل مع Tauri

## الهيكل الحالي

```
src-tauri/
├── src/
│   ├── main.rs       # Entry point
│   └── lib.rs        # Tauri setup
├── tauri.conf.json   # Configuration
└── Cargo.toml        # Rust dependencies
```

## استدعاء Rust من Frontend

```tsx
import { invoke } from '@tauri-apps/api/core'

// استدعاء Tauri command
const result = await invoke('command_name', { arg1: value1 })
```

## إضافة Command جديد

### 1. في Rust (`src-tauri/src/lib.rs`)

```rust
#[tauri::command]
fn get_customers() -> Vec<Customer> {
    // logic
}
```

### 2. تسجيل الـ Command

```rust
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_customers])
    // ...
```

### 3. استدعاء من Frontend

```tsx
const customers = await invoke<Customer[]>('get_customers')
```

## Database (SQLite) — قادم

سيتم إضافة SQLite للتخزين المحلي:
- `tauri-plugin-sql` للـ SQLite
- Migrations للـ schema
- CRUD operations لكل entity
