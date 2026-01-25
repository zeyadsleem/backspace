# Customers Tests

## User Flow Tests

### Customer Registration
- [ ] Verify form displays all required fields (name, phone, customer type)
- [ ] Verify form displays optional fields (email, notes)
- [ ] Verify name field validation (required)
- [ ] Verify Egyptian phone format validation (01XXXXXXXXX)
- [ ] Verify email format validation when provided
- [ ] Verify customer type dropdown shows all options
- [ ] Verify form submission with valid data triggers onSubmit
- [ ] Verify form shows loading state during submission

### Customer List
- [ ] Verify customer list displays all customers
- [ ] Verify table shows correct columns: ID, Name, Phone, Type, Balance
- [ ] Verify customer count is displayed in header
- [ ] Verify clicking "New Customer" triggers onCreate callback
- [ ] Verify clicking "Export" triggers onExport callback

### Search and Filtering
- [ ] Verify search by customer name works
- [ ] Verify search by phone number works
- [ ] Verify search by customer ID works
- [ ] Verify filter by customer type works
- [ ] Verify "All Types" filter shows all customers
- [ ] Verify sort by name (A-Z) works
- [ ] Verify sort by date (newest first) works
- [ ] Verify empty state shows when no results match filters

### Customer Profile
- [ ] Verify profile displays customer name and initials avatar
- [ ] Verify profile displays customer type badge with correct color
- [ ] Verify profile displays phone number
- [ ] Verify profile displays email when available
- [ ] Verify profile displays member since date
- [ ] Verify profile displays balance with correct styling (positive/negative)
- [ ] Verify profile displays notes when available
- [ ] Verify statistics cards show total sessions, total spent, avg per session
- [ ] Verify tabs are displayed (Sessions, Subscriptions, Invoices, Consumptions)
- [ ] Verify "Back to Customers" button triggers onBack callback
- [ ] Verify "Edit" button triggers onEdit callback
- [ ] Verify "Delete" button triggers onDelete callback

### Customer Row
- [ ] Verify row displays customer initials avatar
- [ ] Verify row displays customer name and ID
- [ ] Verify row displays phone number
- [ ] Verify row displays customer type badge
- [ ] Verify row displays balance with correct color
- [ ] Verify view action button triggers onView callback
- [ ] Verify edit action button triggers onEdit callback
- [ ] Verify delete action button triggers onDelete callback

### Customer Dialog
- [ ] Verify dialog opens when isOpen is true
- [ ] Verify dialog closes when clicking backdrop
- [ ] Verify dialog closes when clicking X button
- [ ] Verify dialog displays correct title
- [ ] Verify form is rendered inside dialog

## Component Tests

### CustomerForm
- [ ] Verify initial data populates form fields when editing
- [ ] Verify empty form for new customer
- [ ] Verify validatePhone accepts valid Egyptian numbers
- [ ] Verify validatePhone rejects invalid numbers
- [ ] Verify validateEmail accepts valid emails
- [ ] Verify validateEmail accepts empty email (optional)
- [ ] Verify error messages display for invalid fields
- [ ] Verify submit button shows "Create Customer" for new
- [ ] Verify submit button shows "Update Customer" for edit

### CustomersList
- [ ] Verify filteredCustomers updates when search changes
- [ ] Verify filteredCustomers updates when type filter changes
- [ ] Verify sorting changes order correctly

### CustomerProfile
- [ ] Verify formatDate formats dates correctly
- [ ] Verify formatCurrency formats amounts correctly
- [ ] Verify initials are generated correctly from name

## Accessibility Tests

- [ ] Verify all form fields have proper labels
- [ ] Verify form fields are keyboard accessible
- [ ] Verify error messages are announced to screen readers
- [ ] Verify dialog can be closed with Escape key
- [ ] Verify proper color contrast in both themes
