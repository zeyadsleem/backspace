# Reports Section - Test Cases

## View Revenue Report

### TC-REV-001: Display Revenue Summary
**Preconditions:** User is on the Reports page
**Steps:**
1. Navigate to the Revenue Report section
2. Observe the revenue summary cards

**Expected Results:**
- Today's revenue is displayed with sessions and inventory breakdown
- This week's revenue is displayed with sessions and inventory breakdown
- This month's revenue is displayed with sessions and inventory breakdown
- Comparison with last month shows percentage change
- Positive changes are highlighted in green, negative in red

### TC-REV-002: View Revenue Chart
**Preconditions:** User is on the Reports page
**Steps:**
1. Navigate to the Revenue Report section
2. Observe the revenue chart

**Expected Results:**
- Chart displays historical revenue data points
- Sessions and inventory revenue are distinguishable (different colors/lines)
- Dates are displayed on the x-axis
- Revenue amounts are displayed on the y-axis
- Hovering over data points shows detailed values

### TC-REV-003: View Top Customers by Revenue
**Preconditions:** User is on the Reports page
**Steps:**
1. Navigate to the Revenue Report section
2. Scroll to the Top Customers list

**Expected Results:**
- Top customers are listed in descending order by revenue
- Each entry shows customer name and total revenue
- Clicking on a customer navigates to their profile

---

## View Utilization Report

### TC-UTL-001: Display Overall Utilization Rate
**Preconditions:** User is on the Reports page
**Steps:**
1. Navigate to the Utilization Report section
2. Observe the overall utilization metric

**Expected Results:**
- Overall utilization rate is displayed as a percentage
- Visual indicator (gauge/progress bar) shows the rate
- Average session duration is displayed

### TC-UTL-002: View Resource Utilization Breakdown
**Preconditions:** User is on the Reports page
**Steps:**
1. Navigate to the Utilization Report section
2. Observe the resource utilization list

**Expected Results:**
- Resources are listed with their individual utilization rates
- Resources are sorted by utilization rate (highest first)
- Each resource shows name and percentage rate
- Clicking on a resource navigates to its details

### TC-UTL-003: View Peak Hours Analysis
**Preconditions:** User is on the Reports page
**Steps:**
1. Navigate to the Utilization Report section
2. Observe the peak hours chart

**Expected Results:**
- Chart displays occupancy by hour of day
- Peak hours are visually highlighted
- Hours are displayed on the x-axis (9 AM - 6 PM)
- Occupancy percentage is displayed on the y-axis

---

## View Operation History

### TC-OPH-001: Display Operation History List
**Preconditions:** User is on the Reports page
**Steps:**
1. Navigate to the Operation History section
2. Observe the operations list

**Expected Results:**
- Operations are listed in reverse chronological order (newest first)
- Each operation shows type, description, and timestamp
- Operation types are visually distinguished (icons/colors)
- Customer and resource references are clickable when present

### TC-OPH-002: Filter Operations by Type
**Preconditions:** User is on the Reports page with operation history visible
**Steps:**
1. Click on the operation type filter
2. Select a specific operation type (e.g., "session_start")
3. Observe the filtered list

**Expected Results:**
- Only operations of the selected type are displayed
- Filter selection is visually indicated
- Count of filtered results is shown
- Clear filter option is available

### TC-OPH-003: View Operation Details
**Preconditions:** User is on the Reports page with operation history visible
**Steps:**
1. Click on an operation entry
2. Observe the operation details

**Expected Results:**
- Full operation details are displayed
- Related customer information is shown (if applicable)
- Related resource information is shown (if applicable)
- Timestamp is displayed in user's local timezone

---

## Export Reports

### TC-EXP-001: Export Revenue Report
**Preconditions:** User is on the Reports page viewing Revenue Report
**Steps:**
1. Click the "Export" button in the Revenue Report section
2. Select export format (if options available)
3. Confirm export

**Expected Results:**
- Export process initiates
- Loading indicator is shown during export
- File downloads successfully
- Exported file contains all revenue data (summary, chart data, top customers)
- File format is correct (CSV/PDF/Excel)

### TC-EXP-002: Export Utilization Report
**Preconditions:** User is on the Reports page viewing Utilization Report
**Steps:**
1. Click the "Export" button in the Utilization Report section
2. Select export format (if options available)
3. Confirm export

**Expected Results:**
- Export process initiates
- Loading indicator is shown during export
- File downloads successfully
- Exported file contains utilization data (overall rate, by resource, peak hours)
- File format is correct (CSV/PDF/Excel)

### TC-EXP-003: Export Operation History
**Preconditions:** User is on the Reports page viewing Operation History
**Steps:**
1. Click the "Export" button in the Operation History section
2. Select export format (if options available)
3. Select date range (if options available)
4. Confirm export

**Expected Results:**
- Export process initiates
- Loading indicator is shown during export
- File downloads successfully
- Exported file contains operation records with all fields
- Records are in chronological order
- File format is correct (CSV/PDF/Excel)

### TC-EXP-004: Export with No Data
**Preconditions:** User is on the Reports page with no data available
**Steps:**
1. Click the "Export" button on any report section
2. Observe the behavior

**Expected Results:**
- User is informed that there is no data to export
- Export button may be disabled when no data is available
- Appropriate message is displayed

---

## Edge Cases and Error Handling

### TC-ERR-001: Reports Page with No Data
**Preconditions:** New system with no historical data
**Steps:**
1. Navigate to the Reports page

**Expected Results:**
- Empty states are displayed for each report section
- Helpful messages guide user on how data will appear
- No errors are thrown

### TC-ERR-002: Reports Page Loading State
**Preconditions:** User navigates to Reports page
**Steps:**
1. Navigate to the Reports page
2. Observe loading behavior

**Expected Results:**
- Loading indicators are shown while data is being fetched
- Skeleton loaders or spinners are displayed
- Page becomes interactive once data loads

### TC-ERR-003: Reports Data Refresh
**Preconditions:** User is on the Reports page
**Steps:**
1. Click refresh button (if available) or reload the page
2. Observe the data refresh

**Expected Results:**
- Data is refreshed from the server
- Loading state is shown during refresh
- Updated data is displayed
- Last updated timestamp is shown (if applicable)
