# Technology Stack

## Runtime & Package Management

- **Bun**: Primary runtime environment and package manager
- **Node.js**: Compatible runtime for development tools
- **Turborepo**: Monorepo build system with optimized caching

## Frontend Stack

- **React 19**: UI framework with latest features
- **TypeScript**: Type-safe development across all packages
- **TanStack Router**: File-based routing with full type safety
- **TanStack Query**: Server state management and caching
- **TailwindCSS 4**: Utility-first CSS framework
- **shadcn/ui**: Reusable component library
- **Vite**: Build tool and development server
- **Tauri**: Desktop application framework

## Backend Stack

- **Elysia**: High-performance, type-safe web framework
- **oRPC**: End-to-end type-safe APIs with OpenAPI integration
- **Better Auth**: Authentication system
- **Drizzle ORM**: TypeScript-first database toolkit
- **SQLite/Turso**: Database engine
- **Zod**: Schema validation and type inference

## Development Tools

- **Oxlint**: Fast linting (replaces ESLint)
- **Oxfmt**: Fast formatting (replaces Prettier)
- **Husky**: Git hooks for code quality
- **lint-staged**: Run linters on staged files only

## Common Commands

### Development

```bash
# Start all applications
bun run dev

# Start specific apps
bun run dev:web      # Frontend only
bun run dev:server   # Backend only

# Desktop development
cd apps/web && bun run desktop:dev
```

### Database Operations

```bash
# Push schema changes
bun run db:push

# Open database studio
bun run db:studio

# Generate migrations
bun run db:generate

# Run migrations
bun run db:migrate

# Start local SQLite
bun run db:local
```

### Build & Deploy

```bash
# Build all packages
bun run build

# Type checking
bun run check-types

# Linting and formatting
bun run check

# Desktop build
cd apps/web && bun run desktop:build
```

### Testing

```bash
# Run tests (server)
cd apps/server && bun test

# Watch mode
cd apps/server && bun test --watch

# Coverage
cd apps/server && bun test --coverage
```

## Package Management

Uses Bun workspaces with catalog dependencies for version consistency:

- Shared dependencies defined in root `package.json` catalog
- Workspace packages use `workspace:*` for internal dependencies
- Common versions managed centrally (TypeScript, Zod, etc.)

## Environment Setup

Each app has its own environment configuration:

- `apps/server/.env` - Backend configuration
- `apps/web/.env` - Frontend configuration
- Use `.env.example` files as templates
