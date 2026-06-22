# AgDR-0001: Refresh shadcn UI components

## Context

The `backspace` UI package was updated with the latest generated shadcn component templates, new global styles, and shared helpers.

## Decision

Adopt the refreshed shadcn output in `packages/ui`, and keep interactive primitives explicitly marked as client components when they rely on browser-only behavior.

## Rationale

This keeps the UI package aligned with the current component generator output while preserving runtime correctness for interactive controls.

## Consequences

- Generated components should be reviewed for client/server boundaries during future refreshes.
- PRs that apply similar UI refreshes should reference this decision record.
