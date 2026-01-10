# Sessions Tests

## User Flow Tests

### Start Session
- [ ] Verify customer search filters correctly
- [ ] Verify customer list shows subscription status
- [ ] Verify resource selection shows available resources only
- [ ] Verify resource cards show hourly rate
- [ ] Verify session summary displays before starting
- [ ] Verify subscribed customers show "Free (Subscription)" rate
- [ ] Verify form validation requires customer and resource
- [ ] Verify onSubmit is called with correct data

### Active Sessions View
- [ ] Verify active sessions count in header
- [ ] Verify empty state when no active sessions
- [ ] Verify "Start Session" button triggers callback
- [ ] Verify sessions display in grid layout

### Active Session Card
- [ ] Verify customer name and initials display
- [ ] Verify resource name displays
- [ ] Verify elapsed time updates in real-time
- [ ] Verify session cost calculates correctly for non-subscribed
- [ ] Verify "Covered" shows for subscribed customers
- [ ] Verify inventory total displays correctly
- [ ] Verify total cost sums session and inventory
- [ ] Verify recent inventory items display
- [ ] Verify "Add Item" button triggers modal
- [ ] Verify "End" button triggers onEndSession

### Inventory Add Modal
- [ ] Verify search filters inventory items
- [ ] Verify out-of-stock items are hidden
- [ ] Verify item selection highlights correctly
- [ ] Verify quantity selector works
- [ ] Verify quantity cannot exceed stock
- [ ] Verify total calculates correctly
- [ ] Verify "Add to Session" submits data
- [ ] Verify modal closes on cancel

## Component Tests

### ActiveSessionCard
- [ ] Verify elapsed time calculation
- [ ] Verify session cost calculation based on rate
- [ ] Verify initials generation from name

### InventoryAddModal
- [ ] Verify filtered items excludes zero quantity
- [ ] Verify max quantity respects stock

## Accessibility Tests

- [ ] Verify modal can be closed with Escape key
- [ ] Verify form fields are keyboard accessible
- [ ] Verify proper focus management in modals
