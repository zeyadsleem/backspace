# Project Structure

## Single Application

```
backspace/
├── src/                    # Frontend (React)
│   ├── components/       # React components
│   │   ├── ui/         # shadcn/ui components
│   │   ├── customers/  # Feature components
│   │   └── layout/     # Layout components
│   ├── routes/         # TanStack Router files
│   ├── lib/           # Utilities (i18n, utils)
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles
├── src-tauri/              # Backend (Rust)
│   ├── src/
│   │   ├── main.rs    # Tauri entry point
│   │   ├── lib.rs     # Tauri app setup
│   │   └── commands/   # Tauri commands (backend logic)
│   │       ├── mod.rs
│   │       ├── customers.rs
│   │       ├── sessions.rs
│   │       ├── resources.rs
│   │       ├── consumptions.rs
│   │       ├── inventory.rs
│   │       ├── subscriptions.rs
│   │       └── invoices.rs
│   └── Cargo.toml
└── [config files]
```

## Frontend Structure (src/)

- **components/ui/**: Reusable shadcn/ui components
- **components/customers/**: Customer-specific components
- **routes/**: TanStack Router file-based routing
- **lib/**: Utilities (i18n, cn, etc.)

## Backend Structure (src-tauri/src/)

- **commands/**: Tauri commands for each domain
  - Each command file exports functions exposed to frontend
  - Business logic implemented in Rust
  - Database operations via libsql/SQLite

## File Naming Conventions

- **Components**: kebab-case (e.g., `customer-form.tsx`)
- **Commands**: kebab-case (e.g., `customers.rs`)
- **Routes**: File-based routing follows TanStack Router conventions
- **Types**: PascalCase (e.g., `Customer`, `Session`)

## Import Patterns

- Frontend: Use `@/` alias for src/ imports
- Backend: Use `crate::commands::*` for command imports
- No workspace references (single app)
