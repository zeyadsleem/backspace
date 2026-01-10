# Subscriptions Section - Test Cases

## Overview
Test cases for the subscriptions management user flows, covering subscription creation, viewing, deactivation, and list management.

---

## 1. Subscriptions List

### 1.1 Display Subscriptions List
**Scenario:** User views the subscriptions list page
- **Given:** User navigates to the subscriptions section
- **When:** The page loads
- **Then:** 
  - All subscriptions are displayed in a list/grid format
  - Each subscription shows customer name, plan type, dates, and status
  - Active subscriptions show days remaining
  - Inactive subscriptions are visually distinguished

### 1.2 Empty State
**Scenario:** No subscriptions exist
- **Given:** There are no subscriptions in the system
- **When:** User views the subscriptions list
- **Then:** 
  - Empty state message is displayed
  - "Create Subscription" button is prominently shown

### 1.3 Filter by Status
**Scenario:** User filters subscriptions by active/inactive status
- **Given:** User is on the subscriptions list page
- **When:** User selects "Active" filter
- **Then:** Only active subscriptions are displayed
- **When:** User selects "Inactive" filter
- **Then:** Only expired/deactivated subscriptions are displayed

### 1.4 Search Subscriptions
**Scenario:** User searches for a subscription
- **Given:** User is on the subscriptions list page
- **When:** User types a customer name in the search field
- **Then:** List filters to show matching subscriptions

---

## 2. Create Subscription

### 2.1 Open Create Form
**Scenario:** User initiates subscription creation
- **Given:** User is on the subscriptions list page
- **When:** User clicks "Create Subscription" button
- **Then:** Subscription form dialog/page opens with empty fields

### 2.2 Select Customer
**Scenario:** User selects a customer for the subscription
- **Given:** User is on the create subscription form
- **When:** User clicks the customer dropdown
- **Then:** 
  - List of customers is displayed
  - Customers are searchable
  - Customer name and ID are shown

### 2.3 Select Plan Type
**Scenario:** User selects a subscription plan
- **Given:** User is on the create subscription form
- **When:** User views plan type options
- **Then:** 
  - Weekly (7 days), Half-Monthly (15 days), and Monthly (30 days) options are available
  - Plan duration is clearly indicated

### 2.4 Set Start Date
**Scenario:** User sets the subscription start date
- **Given:** User is on the create subscription form
- **When:** User selects a start date
- **Then:** 
  - End date is automatically calculated based on plan type
  - End date is displayed to the user

### 2.5 Submit Valid Form
**Scenario:** User submits a valid subscription form
- **Given:** User has filled all required fields (customer, plan type, start date)
- **When:** User clicks "Create" button
- **Then:** 
  - Subscription is created
  - Success message is displayed
  - User is redirected to subscriptions list
  - New subscription appears in the list

### 2.6 Validation - Missing Customer
**Scenario:** User tries to submit without selecting a customer
- **Given:** User is on the create subscription form
- **When:** User clicks "Create" without selecting a customer
- **Then:** Validation error is shown for customer field

### 2.7 Validation - Missing Start Date
**Scenario:** User tries to submit without selecting a start date
- **Given:** User is on the create subscription form
- **When:** User clicks "Create" without selecting a start date
- **Then:** Validation error is shown for start date field

### 2.8 Cancel Creation
**Scenario:** User cancels subscription creation
- **Given:** User is on the create subscription form
- **When:** User clicks "Cancel" button
- **Then:** 
  - Form is closed
  - No subscription is created
  - User returns to subscriptions list

---

## 3. View Subscription Details

### 3.1 View Subscription Card
**Scenario:** User views subscription details
- **Given:** User is on the subscriptions list
- **When:** User clicks on a subscription card or "View" action
- **Then:** 
  - Subscription details are displayed
  - Customer name and ID are shown
  - Plan type with duration is shown
  - Start and end dates are displayed
  - Days remaining (for active) or expired status is shown
  - Creation date is visible

### 3.2 View Active Subscription
**Scenario:** User views an active subscription
- **Given:** Subscription is currently active
- **When:** User views the subscription
- **Then:** 
  - "Active" status badge is displayed
  - Days remaining countdown is shown
  - Deactivate option is available

### 3.3 View Expired Subscription
**Scenario:** User views an expired subscription
- **Given:** Subscription end date has passed
- **When:** User views the subscription
- **Then:** 
  - "Expired" status badge is displayed
  - Days remaining shows 0 or "Expired"
  - Deactivate option is not available

---

## 4. Deactivate Subscription

### 4.1 Initiate Deactivation
**Scenario:** User initiates subscription deactivation
- **Given:** User is viewing an active subscription
- **When:** User clicks "Deactivate" button
- **Then:** Confirmation dialog is displayed

### 4.2 Confirm Deactivation
**Scenario:** User confirms subscription deactivation
- **Given:** Deactivation confirmation dialog is open
- **When:** User clicks "Confirm" button
- **Then:** 
  - Subscription is marked as inactive
  - Success message is displayed
  - Subscription status updates to "Inactive"

### 4.3 Cancel Deactivation
**Scenario:** User cancels subscription deactivation
- **Given:** Deactivation confirmation dialog is open
- **When:** User clicks "Cancel" button
- **Then:** 
  - Dialog closes
  - Subscription remains active

---

## 5. Subscription Card Component

### 5.1 Display Customer Info
**Scenario:** Subscription card shows customer information
- **Given:** A subscription card is rendered
- **Then:** 
  - Customer name is prominently displayed
  - Customer ID may be shown as secondary info

### 5.2 Display Plan Badge
**Scenario:** Subscription card shows plan type
- **Given:** A subscription card is rendered
- **Then:** 
  - Plan type badge is displayed (Weekly/Half-Monthly/Monthly)
  - Badge color/style indicates plan type

### 5.3 Display Date Range
**Scenario:** Subscription card shows date information
- **Given:** A subscription card is rendered
- **Then:** 
  - Start date is displayed
  - End date is displayed
  - Date format is consistent and readable

### 5.4 Display Days Remaining
**Scenario:** Subscription card shows remaining days
- **Given:** An active subscription card is rendered
- **Then:** 
  - Days remaining is prominently shown
  - Visual indicator (progress bar/badge) shows urgency for low days

### 5.5 Status Indicator
**Scenario:** Subscription card shows status
- **Given:** A subscription card is rendered
- **Then:** 
  - Active subscriptions show green/positive indicator
  - Inactive/expired subscriptions show gray/neutral indicator

---

## 6. Language Support

### 6.1 English Display
**Scenario:** Subscriptions display in English
- **Given:** Language is set to English
- **When:** User views subscriptions
- **Then:** 
  - All labels are in English
  - Plan types show English names (Weekly, Half-Monthly, Monthly)
  - Dates are formatted for English locale

### 6.2 Arabic Display
**Scenario:** Subscriptions display in Arabic
- **Given:** Language is set to Arabic
- **When:** User views subscriptions
- **Then:** 
  - All labels are in Arabic
  - Plan types show Arabic names (أسبوعي, نصف شهري, شهري)
  - Layout is RTL
  - Dates are formatted appropriately

---

## 7. Edge Cases

### 7.1 Subscription Expiring Today
**Scenario:** Subscription expires on current date
- **Given:** Subscription end date is today
- **When:** User views the subscription
- **Then:** 
  - Days remaining shows 0 or "Expires Today"
  - Warning indicator may be shown

### 7.2 Customer with Existing Active Subscription
**Scenario:** Creating subscription for customer with active subscription
- **Given:** Customer already has an active subscription
- **When:** User tries to create another subscription for same customer
- **Then:** 
  - Warning is displayed about existing subscription
  - User can proceed or cancel

### 7.3 Past Start Date
**Scenario:** User selects a past date as start date
- **Given:** User is on the create subscription form
- **When:** User selects a date in the past
- **Then:** 
  - Validation error is shown OR
  - System allows backdating with warning

---

## 8. Integration with Sessions

### 8.1 Active Subscription Affects Session Cost
**Scenario:** Customer with active subscription starts a session
- **Given:** Customer has an active subscription
- **When:** A session is created for this customer
- **Then:** Session cost calculation considers subscription (may be zero)

### 8.2 Subscription Status Check
**Scenario:** System checks subscription status
- **Given:** Customer is being checked for active subscription
- **When:** System queries subscription status
- **Then:** 
  - Returns true if active subscription exists with remaining days > 0
  - Returns false otherwise
