# Technology Stack

## Runtime & Build

- **Bun**: Package manager and runtime for frontend
- **Rust**: Backend runtime (Tauri)
- **Tauri v2**: Desktop application framework
- **Vite**: Frontend build tool

## Frontend Stack

- **React 19**: UI framework
- **TypeScript**: Type-safe development
- **TanStack Router**: File-based routing with type safety
- **TanStack Query**: Server state management with Tauri commands
- **TanStack Form**: Form management
- **shadcn/ui**: Component library
- **TailwindCSS 4**: Styling
- **Playwright**: E2E testing (in progress)

## Backend Stack

- **Tauri**: Desktop framework with command system
- **Rust**: Backend language
- **libsql**: SQLite database driver
- **Zod**: Schema validation
- **Serde**: Serialization/deserialization
- **tauri-plugin-commands**: Tauri command system

## Development Tools

- **oxlint**: Fast linting
- **oxfmt**: Fast formatting
- **Husky**: Git hooks
- **lint-staged**: Run linters on staged files

## Commands

### Development

```bash
bun run dev              # Start Vite dev server (port 3001)
bun run desktop:dev      # Start Tauri development
```

### Build

```bash
bun run build            # Production build
bun run desktop:build    # Build desktop application
```

### Code Quality

```bash
bun run lint             # Run oxlint
bun run format           # Format code with oxfmt
bun run check            # Run lint + format
bun run check-types      # TypeScript type checking
```

### Testing

```bash
bun run test             # Run Playwright tests
bun run test:ui          # Run Playwright with UI
bun run test:headed      # Run Playwright headed
```
