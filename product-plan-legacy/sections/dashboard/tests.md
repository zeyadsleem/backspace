# Dashboard Tests

## User Flow Tests

### Revenue Display
- [ ] Verify today's revenue displays correctly with proper currency formatting
- [ ] Verify session revenue breakdown is shown
- [ ] Verify inventory revenue breakdown is shown
- [ ] Verify revenue updates in real-time without page refresh

### Active Sessions Monitoring
- [ ] Verify active sessions count displays correctly
- [ ] Verify clicking on active sessions card navigates to sessions section
- [ ] Verify count updates in real-time

### New Customers Display
- [ ] Verify new customers count for today displays correctly
- [ ] Verify clicking on new customers card navigates to customers section

### Active Subscriptions
- [ ] Verify active subscriptions count displays correctly
- [ ] Verify clicking on subscriptions card navigates to subscriptions section

### Resource Utilization
- [ ] Verify utilization percentage displays correctly
- [ ] Verify utilization card shows success variant when above 80%
- [ ] Verify clicking on utilization card navigates to resources section

### Low Stock Alerts
- [ ] Verify low stock banner appears when items are below minimum threshold
- [ ] Verify banner shows correct count of low stock items
- [ ] Verify clicking on individual item triggers onViewInventoryItem callback
- [ ] Verify "View All" button navigates to inventory section
- [ ] Verify banner is hidden when no low stock alerts exist

### Quick Actions
- [ ] Verify "New Customer" button is visible and clickable
- [ ] Verify "Start Session" button is visible and clickable
- [ ] Verify onNewCustomer callback is triggered on click
- [ ] Verify onStartSession callback is triggered on click

### Revenue Chart
- [ ] Verify chart displays revenue data correctly
- [ ] Verify period selector toggles between Today, This Week, This Month
- [ ] Verify legend shows sessions and inventory totals
- [ ] Verify bars are properly scaled relative to max value
- [ ] Verify date labels are formatted correctly

### Activity Feed
- [ ] Verify recent activities display in chronological order
- [ ] Verify activity icons match activity type
- [ ] Verify timestamps are formatted as relative time (e.g., "5m ago")
- [ ] Verify empty state message when no activities exist

## Component Tests

### MetricCard
- [ ] Verify default variant styling
- [ ] Verify primary variant styling
- [ ] Verify success variant styling
- [ ] Verify onClick handler is called when clicked
- [ ] Verify subtitle truncates when too long

### LowStockBanner
- [ ] Verify returns null when alerts array is empty
- [ ] Verify shows "+X more" when more than 3 alerts
- [ ] Verify each alert button shows name and quantity/minStock

### RevenueChart
- [ ] Verify period state changes on button click
- [ ] Verify formatCurrency formats numbers correctly
- [ ] Verify formatDate shows weekday and day

### ActivityFeed
- [ ] Verify formatTime returns "Just now" for recent timestamps
- [ ] Verify formatTime returns minutes for < 60 minutes
- [ ] Verify formatTime returns hours for < 24 hours
- [ ] Verify formatTime returns date for older timestamps

## Accessibility Tests

- [ ] Verify all interactive elements are keyboard accessible
- [ ] Verify proper color contrast in both light and dark themes
- [ ] Verify screen reader can read metric values and labels
