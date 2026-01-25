# Backspace

**Backspace** is a modern, reliable, and RTL-first desktop application for managing coworking spaces. It streamlines daily operations including customer management, session tracking, inventory control, and billing.

## 🚀 Key Features

- **Session Management**: Track active sessions with real-time duration and cost calculation.
- **Inventory & POS**: Manage stock (beverages, snacks) and add items directly to active sessions.
- **Billing & Invoices**: Generate invoices automatically, track payments, and manage partial/bulk payments.
- **Customer Management**: Detailed profiles, membership history, and debt tracking.
- **Subscriptions**: Manage day-based subscriptions (Weekly, Monthly) with auto-expiry.
- **Reports & Analytics**: Track revenue, resource utilization, and operation history.
- **RTL Support**: Built from the ground up for Arabic users with full RTL directionality.

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) + [Immer](https://github.com/immerjs/immer)
- **Routing**: [React Router v7](https://reactrouter.com/)

### Backend (Desktop)
- **Core**: [Tauri v2](https://tauri.app/) (Rust)
- **Database**: SQLite (via [SQLx](https://github.com/launchbadge/sqlx))
- **Architecture**: Command-based architecture with async background workers.

## 📂 Project Structure

```
├── src/                # React Frontend
│   ├── components/     # UI Components (Shell, Shared, Features)
│   ├── context/        # React Contexts
│   ├── hooks/          # Custom Hooks
│   ├── lib/            # Utilities & Translations
│   ├── pages/          # Application Pages
│   └── stores/         # Zustand Global Store
│
├── src-tauri/          # Rust Backend
│   ├── src/
│   │   ├── commands/   # Tauri Commands (Business Logic)
│   │   ├── database/   # DB Initialization & Migrations
│   │   └── main.rs     # Entry Point
│   └── migrations/     # SQLx Migrations
│
└── product-plan/       # Project Documentation & Standards
```

## ⚡ Getting Started

### Prerequisites
- Node.js & npm/bun
- Rust & Cargo (for Tauri)
- Basic development tools (GCC, etc.)

### Development

1. **Install Dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

2. **Run in Development Mode**
   ```bash
   # This runs both the Vite dev server and the Tauri desktop window
   npm run tauri dev
   # or
   bun tauri dev
   ```

## 🌍 Localization

The application is fully localized for English and Arabic.
- **RTL/LTR**: Automatically supported based on selected language.
- **Translations**: Managed in `src/lib/translations.ts`.

---
*Built with ❤️ for coworking spaces.*
