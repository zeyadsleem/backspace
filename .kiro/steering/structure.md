# Project Structure

## Monorepo Organization

```
backspace/
├── apps/                    # Applications
│   ├── web/                # React frontend (Vite + TanStack Router)
│   └── server/             # Elysia backend API
├── packages/               # Shared packages
│   ├── api/               # API layer and business logic
│   ├── auth/              # Authentication configuration
│   ├── config/            # Shared TypeScript configurations
│   ├── db/                # Database schema and queries
│   └── env/               # Environment variable validation
└── [config files]         # Root configuration files
```

## Backend Architecture (apps/server)

Follows Domain-Driven Design with clear separation:

```
apps/server/src/
├── domains/               # 7 Independent business domains
│   ├── customers/         # Customer management
│   ├── sessions/          # Workspace session tracking
│   ├── resources/         # Seat/room management
│   ├── consumptions/      # Additional service consumption
│   ├── inventory/         # Stock management
│   ├── subscriptions/     # Subscription plans
│   └── invoices/          # Billing and invoicing
├── layers/                # System-wide layers
│   ├── orchestration/     # Complex operation coordination
│   ├── guard/             # Data validation and security
│   └── audit/             # Operation logging
├── reports/               # Business reporting
└── test/                  # Test organization
    ├── unit/              # Domain-specific unit tests
    ├── integration/       # API and database tests
    └── e2e/               # End-to-end business flows
```

## Domain Structure Pattern

Each domain follows consistent structure:

```
domain/
├── index.ts              # Public exports
├── [domain].service.ts   # Business logic
└── [domain].dto.ts       # Data transfer objects
```

## Frontend Architecture (apps/web)

```
apps/web/src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   └── layout/          # Layout components
├── routes/              # File-based routing (TanStack Router)
├── lib/                 # Utilities and configurations
└── utils/               # Helper functions
```

## Database Package (packages/db)

```
packages/db/src/
├── schema/              # Drizzle schema definitions
│   ├── [entity].ts     # Individual table schemas
│   ├── relations.ts    # Table relationships
│   └── index.ts        # Schema exports
└── migrations/         # Database migration files
```

## Shared Packages

- **packages/api**: oRPC routers and API definitions
- **packages/auth**: Better Auth configuration
- **packages/config**: Shared TypeScript and build configs
- **packages/env**: Environment variable schemas with Zod

## File Naming Conventions

- **Services**: `[domain].service.ts`
- **DTOs**: `[domain].dto.ts`
- **Schemas**: `[entity].ts` (database tables)
- **Tests**: `[domain].test.ts`
- **Components**: `kebab-case.tsx`
- **Routes**: File-based routing follows TanStack Router conventions

## Import Patterns

- Use workspace references: `@backspace/db`, `@backspace/api`
- Relative imports within same package
- Barrel exports from `index.ts` files
- Domain exports only public interfaces

## Configuration Files

- **Root level**: Turborepo, Bun, TypeScript, linting configs
- **App level**: Vite, Tauri, app-specific configs
- **Package level**: Individual tsconfig.json files

## Development Workflow

1. Database changes go in `packages/db/src/schema/`
2. Business logic in appropriate `apps/server/src/domains/`
3. API routes in `packages/api/src/routers/`
4. Frontend components in `apps/web/src/components/`
5. Routes in `apps/web/src/routes/`

## Testing Strategy

- **Unit tests**: Domain services in isolation
- **Integration tests**: API endpoints and database operations
- **E2E tests**: Complete business workflows
- Test files co-located with source code where possible
