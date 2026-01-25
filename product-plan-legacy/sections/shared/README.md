# Shared Components

## Overview

Reusable UI components used across multiple sections of the application. These components provide consistent patterns for common interactions like confirmations, empty states, loading states, and form fields.

## Components

| Component | Description |
|-----------|-------------|
| `DeleteConfirmDialog` | Modal for confirming destructive actions with loading state |
| `EmptyState` | Placeholder for empty lists with icon, title, description, and action |
| `LoadingState` | Loading indicators (spinner, skeleton, dots variants) |
| `FormField` | Form input wrapper with label, error, and helper text |
| `PageHeader` | Page title with breadcrumbs and action buttons |
| `SearchInput` | Search input with debounce and clear button |
| `SuccessDialog` | Success confirmation modal with primary/secondary actions |

## Usage Patterns

### DeleteConfirmDialog

Use for any destructive action (delete customer, cancel subscription, etc.):

```tsx
<DeleteConfirmDialog
  isOpen={showDelete}
  title="Delete Customer"
  description="Are you sure you want to delete this customer? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  onConfirm={handleDelete}
  onCancel={() => setShowDelete(false)}
  isLoading={isDeleting}
/>
```

### EmptyState

Use when a list or collection has no items:

```tsx
<EmptyState
  icon="users"
  title="No customers yet"
  description="Add your first customer to get started"
  actionText="Add Customer"
  onAction={() => setShowForm(true)}
/>
```

### LoadingState

Use while fetching data:

```tsx
// Spinner (default)
<LoadingState text="Loading customers..." />

// Skeleton cards
<LoadingState variant="skeleton" skeletonCount={5} />

// Dots animation
<LoadingState variant="dots" />

// Full page
<LoadingState variant="spinner" fullPage />
```

### FormField

Wrap form inputs for consistent styling:

```tsx
<FormField
  label="Customer Name"
  required
  error={errors.name}
  htmlFor="name"
>
  <input
    id="name"
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="..."
  />
</FormField>
```

### PageHeader

Use at the top of each page:

```tsx
<PageHeader
  title="Customers"
  subtitle="Manage your customer database"
  breadcrumbs={[
    { label: 'Dashboard', href: '/' },
    { label: 'Customers' }
  ]}
  onBreadcrumbClick={(href) => navigate(href)}
  actions={
    <button onClick={() => setShowForm(true)}>
      Add Customer
    </button>
  }
/>
```

### SearchInput

Use for filtering lists:

```tsx
<SearchInput
  value={search}
  placeholder="Search customers..."
  onChange={setSearch}
  debounceMs={300}
/>
```

### SuccessDialog

Use after successful operations:

```tsx
<SuccessDialog
  isOpen={showSuccess}
  title="Customer Created"
  description="The customer has been added successfully."
  primaryActionText="View Customer"
  secondaryActionText="Add Another"
  onPrimaryAction={() => navigate(`/customers/${newId}`)}
  onSecondaryAction={() => resetForm()}
  onClose={() => setShowSuccess(false)}
/>
```

## Design Notes

- All components support dark mode via Tailwind dark: classes
- RTL support via logical properties (start/end instead of left/right)
- Consistent color scheme: amber for primary actions, red for destructive, emerald for success
- Accessible: proper focus management, keyboard navigation, ARIA attributes
