# Resources Tests

## User Flow Tests

### Resource Creation
- [ ] Verify form displays all required fields (name, type, rate)
- [ ] Verify name field validation (required)
- [ ] Verify rate field validation (must be > 0)
- [ ] Verify resource type selection with visual buttons
- [ ] Verify form submission with valid data triggers onSubmit
- [ ] Verify form shows loading state during submission

### Resource List/Grid View
- [ ] Verify resources display in grid view by default
- [ ] Verify resources display in list view when toggled
- [ ] Verify available/occupied count in header
- [ ] Verify clicking "Add Resource" triggers onCreate callback

### Filtering
- [ ] Verify "All" filter shows all resources
- [ ] Verify "Seats" filter shows only seats
- [ ] Verify "Rooms" filter shows only rooms
- [ ] Verify "Desks" filter shows only desks
- [ ] Verify filter counts are accurate

### Resource Card
- [ ] Verify card displays resource name
- [ ] Verify card displays resource type with icon
- [ ] Verify card displays hourly rate in EGP format
- [ ] Verify card displays utilization percentage
- [ ] Verify availability badge shows correct status
- [ ] Verify available resources show green styling
- [ ] Verify occupied resources show red styling
- [ ] Verify "Start Session" button appears for available resources
- [ ] Verify edit button triggers onEdit callback
- [ ] Verify delete button triggers onDelete callback

### Resource Dialog
- [ ] Verify dialog opens when isOpen is true
- [ ] Verify dialog closes when clicking backdrop
- [ ] Verify dialog closes when clicking X button
- [ ] Verify dialog displays correct title

## Component Tests

### ResourceForm
- [ ] Verify initial data populates form fields when editing
- [ ] Verify empty form for new resource
- [ ] Verify type selection buttons work correctly
- [ ] Verify error messages display for invalid fields
- [ ] Verify submit button shows "Create Resource" for new
- [ ] Verify submit button shows "Update Resource" for edit

### ResourcesList
- [ ] Verify filteredResources updates when type filter changes
- [ ] Verify view mode toggle switches between grid and list
- [ ] Verify empty state shows when no resources match filter

### ResourceCard
- [ ] Verify grid view layout
- [ ] Verify list view layout
- [ ] Verify hover actions appear on grid cards

## Accessibility Tests

- [ ] Verify all form fields have proper labels
- [ ] Verify form fields are keyboard accessible
- [ ] Verify proper color contrast for status badges
- [ ] Verify action buttons have title attributes
