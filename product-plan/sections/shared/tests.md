# Test Instructions: Shared Components

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, etc.).

## Overview

Test the reusable UI components that are used across multiple sections of the application.

---

## Component Tests

### DeleteConfirmDialog

#### Renders correctly when open

**Setup:**
- `isOpen={true}`
- `title="Delete Customer"`
- `description="Are you sure?"`

**Expected Results:**
- [ ] Dialog is visible
- [ ] Title "Delete Customer" is displayed
- [ ] Description "Are you sure?" is displayed
- [ ] Cancel button is visible with text "Cancel"
- [ ] Confirm button is visible with text "Delete"

#### Handles confirm action

**Steps:**
1. Render dialog with `onConfirm` callback
2. Click the confirm button (text: "Delete")

**Expected Results:**
- [ ] `onConfirm` callback is called

#### Handles cancel action

**Steps:**
1. Render dialog with `onCancel` callback
2. Click the cancel button (text: "Cancel")

**Expected Results:**
- [ ] `onCancel` callback is called

#### Shows loading state

**Setup:**
- `isLoading={true}`

**Expected Results:**
- [ ] Spinner icon is visible in confirm button
- [ ] Buttons are disabled

#### Closes on backdrop click

**Steps:**
1. Click the backdrop (overlay)

**Expected Results:**
- [ ] `onCancel` callback is called

---

### EmptyState

#### Renders with all props

**Setup:**
- `icon="users"`
- `title="No customers yet"`
- `description="Add your first customer"`
- `actionText="Add Customer"`

**Expected Results:**
- [ ] Users icon is displayed
- [ ] Title "No customers yet" is visible
- [ ] Description "Add your first customer" is visible
- [ ] Button "Add Customer" is visible

#### Handles action click

**Steps:**
1. Render with `onAction` callback
2. Click the action button

**Expected Results:**
- [ ] `onAction` callback is called

#### Renders without optional props

**Setup:**
- Only `title` provided

**Expected Results:**
- [ ] Title is visible
- [ ] Default icon is shown
- [ ] No description or button

---

### LoadingState

#### Spinner variant

**Setup:**
- `variant="spinner"`
- `text="Loading..."`

**Expected Results:**
- [ ] Spinner animation is visible
- [ ] Text "Loading..." is displayed

#### Skeleton variant

**Setup:**
- `variant="skeleton"`
- `skeletonCount={3}`

**Expected Results:**
- [ ] 3 skeleton cards are rendered
- [ ] Skeleton has pulse animation

#### Dots variant

**Setup:**
- `variant="dots"`

**Expected Results:**
- [ ] 3 bouncing dots are visible

#### Full page mode

**Setup:**
- `fullPage={true}`

**Expected Results:**
- [ ] Loading is centered in full viewport height

---

### FormField

#### Renders label and input

**Setup:**
- `label="Customer Name"`
- `required={true}`

**Expected Results:**
- [ ] Label "Customer Name" is visible
- [ ] Required indicator (*) is shown
- [ ] Child input is rendered

#### Shows error message

**Setup:**
- `error="Name is required"`

**Expected Results:**
- [ ] Error message "Name is required" is visible
- [ ] Error has red color styling

#### Shows helper text

**Setup:**
- `helperText="Enter full name"`
- No error

**Expected Results:**
- [ ] Helper text "Enter full name" is visible
- [ ] Helper text has muted color

#### Error takes precedence over helper

**Setup:**
- `error="Invalid"`
- `helperText="Help text"`

**Expected Results:**
- [ ] Error "Invalid" is shown
- [ ] Helper text is NOT shown

---

### PageHeader

#### Renders title and subtitle

**Setup:**
- `title="Customers"`
- `subtitle="Manage your customers"`

**Expected Results:**
- [ ] Title "Customers" is visible as h1
- [ ] Subtitle "Manage your customers" is visible

#### Renders breadcrumbs

**Setup:**
- `breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Customers' }]}`

**Expected Results:**
- [ ] "Home" is clickable link
- [ ] "Customers" is plain text (current page)
- [ ] Separator (chevron) between items

#### Handles breadcrumb click

**Steps:**
1. Render with `onBreadcrumbClick` callback
2. Click "Home" breadcrumb

**Expected Results:**
- [ ] `onBreadcrumbClick` called with '/'

#### Renders actions

**Setup:**
- `actions={<button>Add</button>}`

**Expected Results:**
- [ ] Action button "Add" is visible

---

### SearchInput

#### Renders with placeholder

**Setup:**
- `placeholder="Search..."`
- `value=""`

**Expected Results:**
- [ ] Input has placeholder "Search..."
- [ ] Search icon is visible
- [ ] Clear button is NOT visible (empty value)

#### Shows clear button when has value

**Setup:**
- `value="test"`

**Expected Results:**
- [ ] Clear button (X) is visible

#### Handles input change with debounce

**Steps:**
1. Type "hello" in input
2. Wait for debounce (300ms default)

**Expected Results:**
- [ ] `onChange` called with "hello" after debounce

#### Handles clear

**Steps:**
1. Set initial value "test"
2. Click clear button

**Expected Results:**
- [ ] Input value becomes empty
- [ ] `onChange` called with ""

#### Handles Enter key

**Steps:**
1. Type "search term"
2. Press Enter

**Expected Results:**
- [ ] `onSubmit` called with "search term"

---

### SuccessDialog

#### Renders correctly when open

**Setup:**
- `isOpen={true}`
- `title="Success!"`
- `description="Operation completed"`

**Expected Results:**
- [ ] Dialog is visible
- [ ] Success icon (checkmark) is displayed
- [ ] Title "Success!" is visible
- [ ] Description "Operation completed" is visible

#### Handles primary action

**Steps:**
1. Click primary action button

**Expected Results:**
- [ ] `onPrimaryAction` callback is called

#### Handles secondary action

**Setup:**
- `secondaryActionText="Add Another"`

**Steps:**
1. Click secondary action button

**Expected Results:**
- [ ] `onSecondaryAction` callback is called

#### Closes on backdrop click

**Steps:**
1. Click the backdrop

**Expected Results:**
- [ ] `onClose` callback is called

---

## Accessibility Tests

- [ ] All dialogs trap focus when open
- [ ] Escape key closes dialogs
- [ ] Form fields have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Loading states have appropriate aria-busy
- [ ] Buttons have accessible names

---

## Dark Mode Tests

For each component:
- [ ] Renders correctly in light mode
- [ ] Renders correctly in dark mode
- [ ] Colors have sufficient contrast

---

## RTL Tests

For each component:
- [ ] Layout mirrors correctly in RTL
- [ ] Icons position correctly
- [ ] Text alignment is correct
