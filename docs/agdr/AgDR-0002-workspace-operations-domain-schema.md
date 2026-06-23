# AgDR-0002: Workspace Operations Domain Schema

## Status

Accepted

## Date

2026-06-23

## Context

Backspace needs a Visit-first operational model for coworking/workspace staff workflows. The existing app already uses Better Auth, Drizzle ORM, PostgreSQL, Hono, tRPC, and TanStack Router. The first implementation issue introduces database schema foundations for workspace operations without changing that stack.

The product rule is that every physical entrant has a Visit, not every Visit is billable, and sales-like actions are contextual Charges/Add-ons attached to operational targets rather than a standalone anonymous POS flow.

## Decision

Model the domain as additive Drizzle schema modules under `packages/db/src/schema/`:

- `workspace.ts` for branches, floors, spaces, and space status history.
- `people.ts` for people, customer/host accounts, and tenants.
- `memberships.ts` for membership plans and memberships.
- `bookings.ts` for reservations.
- `visits.ts` for Visits, Usage Sessions, hosted guest links, visit types, and billing responsibility.
- `events.ts` for events and attendees.
- `billing.ts` for Charges, invoices, invoice items, payments, refunds, and payment methods.
- `operations.ts` for shifts, cleaning tasks, and maintenance tickets.
- `staff.ts` for roles, permissions, staff profiles, and branch access.
- `audit.ts` for approval requests and audit logs.

Better Auth tables remain unchanged. The new domain schema exports from `packages/db/src/schema/index.ts` so the existing `createDb()` schema bundle can see the operational tables.

Charges must target exactly one operational context among Visit, Usage Session, Event, Host Account, or Invoice Draft/Invoice. This is enforced as a database check constraint in the schema foundation and should also be enforced by future domain services.

## Consequences

- Future implementation issues can add tRPC routers and services against stable table names and enum values.
- The generated stack remains intact; no new ORM, framework, payment provider, or deployment decision is introduced.
- No migration file is generated in this issue. Local development can use Drizzle push while migration strategy is decided separately if production deployment becomes in scope.
- The schema uses integer minor-unit money fields by convention (`*_cents`) and fixed currency columns to avoid floating-point billing logic.
- The first schema test asserts table exports, core enum values, and Visit/Charge/Invoice/Payment operational links.

## Alternatives Considered

- Keep one large `schema.ts` file: rejected because the domain is broad and module boundaries improve reviewability.
- Replace Better Auth user/session tables with custom staff auth tables: rejected because Better Auth is part of the fixed stack.
- Add a standalone POS sales table: rejected because it violates the Visit-first product rule.
- Generate migrations immediately: deferred because production deployment is explicitly out of scope and migration governance should be handled as its own ticket/AgDR when needed.
