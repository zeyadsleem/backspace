# Inventory Section - Test Cases

## Overview
Test cases for inventory management user flows including adding items, updating quantities, updating prices, low stock alerts, and deleting items.

---

## 1. Add Item

### TC-INV-ADD-001: Add new inventory item with valid data
**Preconditions:** User is on the inventory management page
**Steps:**
1. Click "Add Item" button
2. Fill in item name: "Energy Drink"
3. Select category: "Beverage"
4. Enter price: 18.00
5. Enter quantity: 20
6. Enter minimum stock: 10
7. Click "Save" button

**Expected Result:**
- New item appears in the inventory list
- Item displays correct name, category, price, and quantity
- Success notification is shown
- Form closes/resets

### TC-INV-ADD-002: Add item with missing required fields
**Preconditions:** User is on the add item form
**Steps:**
1. Leave item name empty
2. Click "Save" button

**Expected Result:**
- Form validation error is displayed
- Item is not created
- Error message indicates required field

### TC-INV-ADD-003: Add item with invalid price (negative value)
**Preconditions:** User is on the add item form
**Steps:**
1. Fill in item name: "Test Item"
2. Select category: "Snack"
3. Enter price: -5.00
4. Enter quantity: 10
5. Click "Save" button

**Expected Result:**
- Validation error for price field
- Item is not created
- Error message indicates price must be positive

### TC-INV-ADD-004: Add item with zero quantity
**Preconditions:** User is on the add item form
**Steps:**
1. Fill in all required fields with valid data
2. Enter quantity: 0
3. Click "Save" button

**Expected Result:**
- Item is created successfully
- Item shows as "Out of Stock" status
- Low stock alert may be triggered if quantity < minStock

### TC-INV-ADD-005: Cancel add item operation
**Preconditions:** User is on the add item form with data entered
**Steps:**
1. Fill in some form fields
2. Click "Cancel" button

**Expected Result:**
- Form closes without saving
- No new item is created
- User returns to inventory list

---

## 2. Update Quantity

### TC-INV-QTY-001: Increase quantity using increment button
**Preconditions:** Inventory item exists with quantity = 10
**Steps:**
1. Locate item in inventory list
2. Click "+" (increment) button

**Expected Result:**
- Quantity increases to 11
- UI updates immediately
- Change is persisted

### TC-INV-QTY-002: Decrease quantity using decrement button
**Preconditions:** Inventory item exists with quantity = 10
**Steps:**
1. Locate item in inventory list
2. Click "-" (decrement) button

**Expected Result:**
- Quantity decreases to 9
- UI updates immediately
- Change is persisted

### TC-INV-QTY-003: Decrease quantity to zero
**Preconditions:** Inventory item exists with quantity = 1
**Steps:**
1. Locate item in inventory list
2. Click "-" (decrement) button

**Expected Result:**
- Quantity becomes 0
- Item status changes to "Out of Stock"
- Visual indicator shows out of stock state

### TC-INV-QTY-004: Attempt to decrease quantity below zero
**Preconditions:** Inventory item exists with quantity = 0
**Steps:**
1. Locate item in inventory list
2. Click "-" (decrement) button

**Expected Result:**
- Quantity remains at 0
- Decrement button is disabled or action is prevented
- No negative quantities allowed

### TC-INV-QTY-005: Bulk quantity update via edit form
**Preconditions:** Inventory item exists
**Steps:**
1. Click "Edit" on an inventory item
2. Change quantity from 10 to 50
3. Click "Save"

**Expected Result:**
- Quantity updates to 50
- Stock status updates accordingly
- Success notification shown

---

## 3. Update Price

### TC-INV-PRICE-001: Update price via edit form
**Preconditions:** Inventory item exists with price = 10.00
**Steps:**
1. Click "Edit" on the inventory item
2. Change price to 15.00
3. Click "Save"

**Expected Result:**
- Price updates to 15.00
- Price displays correctly in inventory list
- Success notification shown

### TC-INV-PRICE-002: Update price to zero
**Preconditions:** Inventory item exists with price = 10.00
**Steps:**
1. Click "Edit" on the inventory item
2. Change price to 0.00
3. Click "Save"

**Expected Result:**
- Validation error OR price updates to 0.00 (depending on business rules)
- If allowed, item shows as free

### TC-INV-PRICE-003: Update price with decimal precision
**Preconditions:** Inventory item exists
**Steps:**
1. Click "Edit" on the inventory item
2. Change price to 12.50
3. Click "Save"

**Expected Result:**
- Price updates to 12.50
- Decimal value is preserved and displayed correctly

### TC-INV-PRICE-004: Attempt to set negative price
**Preconditions:** Inventory item exists
**Steps:**
1. Click "Edit" on the inventory item
2. Enter price: -5.00
3. Click "Save"

**Expected Result:**
- Validation error is displayed
- Price is not updated
- Error message indicates price must be positive

---

## 4. Low Stock Alerts

### TC-INV-ALERT-001: Low stock alert appears when quantity drops below minimum
**Preconditions:** Item exists with quantity = 10, minStock = 10
**Steps:**
1. Decrease item quantity to 9

**Expected Result:**
- Low stock alert/indicator appears for the item
- Item is highlighted or marked as low stock
- Alert banner may appear if configured

### TC-INV-ALERT-002: Low stock alert displays correct items
**Preconditions:** Multiple items exist, some below minStock threshold
**Steps:**
1. Navigate to inventory page
2. View low stock alert section

**Expected Result:**
- Only items with quantity < minStock are shown in alert
- Alert shows item name and current quantity
- Items at or above minStock are not in alert

### TC-INV-ALERT-003: Low stock alert clears when quantity restored
**Preconditions:** Item is in low stock state (quantity < minStock)
**Steps:**
1. Increase item quantity above minStock threshold

**Expected Result:**
- Low stock alert/indicator is removed for the item
- Item no longer appears in low stock list

### TC-INV-ALERT-004: Out of stock items in alert
**Preconditions:** Item exists with quantity = 0
**Steps:**
1. View low stock alerts

**Expected Result:**
- Out of stock items are prominently displayed
- Visual distinction between low stock and out of stock
- Out of stock may have higher priority in alert

### TC-INV-ALERT-005: Dismiss low stock alert
**Preconditions:** Low stock alert is visible
**Steps:**
1. Click dismiss/close button on alert

**Expected Result:**
- Alert is dismissed from view
- Alert may reappear on page refresh or after time period
- Underlying stock levels are not affected

### TC-INV-ALERT-006: Click item in low stock alert
**Preconditions:** Low stock alert is visible with items
**Steps:**
1. Click on an item name in the low stock alert

**Expected Result:**
- User is navigated to item details or edit form
- Item is highlighted in the inventory list

---

## 5. Delete Item

### TC-INV-DEL-001: Delete item with confirmation
**Preconditions:** Inventory item exists
**Steps:**
1. Click "Delete" button on an inventory item
2. Confirm deletion in confirmation dialog

**Expected Result:**
- Item is removed from inventory list
- Success notification shown
- Item no longer appears in any views

### TC-INV-DEL-002: Cancel delete operation
**Preconditions:** Inventory item exists
**Steps:**
1. Click "Delete" button on an inventory item
2. Click "Cancel" in confirmation dialog

**Expected Result:**
- Item is not deleted
- Item remains in inventory list
- Dialog closes

### TC-INV-DEL-003: Delete item with zero quantity
**Preconditions:** Inventory item exists with quantity = 0
**Steps:**
1. Click "Delete" button on the item
2. Confirm deletion

**Expected Result:**
- Item is deleted successfully
- Item removed from out of stock list

### TC-INV-DEL-004: Delete item that was in low stock alert
**Preconditions:** Item is in low stock state and appears in alert
**Steps:**
1. Delete the low stock item
2. Confirm deletion

**Expected Result:**
- Item is deleted
- Item is removed from low stock alert
- Alert updates to reflect remaining low stock items

### TC-INV-DEL-005: Attempt to delete item referenced in active session
**Preconditions:** Item is currently being used in an active session (if applicable)
**Steps:**
1. Click "Delete" button on the item
2. Attempt to confirm deletion

**Expected Result:**
- Deletion is prevented OR warning is shown
- Error message explains item is in use
- Item remains in inventory (business rule dependent)

---

## Edge Cases & Error Handling

### TC-INV-ERR-001: Network error during save
**Preconditions:** User is saving an inventory item
**Steps:**
1. Simulate network disconnection
2. Attempt to save item

**Expected Result:**
- Error notification is displayed
- User can retry the operation
- Data is not lost from form

### TC-INV-ERR-002: Concurrent edit conflict
**Preconditions:** Same item is being edited by two users
**Steps:**
1. User A opens item for edit
2. User B edits and saves the same item
3. User A attempts to save

**Expected Result:**
- Conflict is detected
- User A is notified of the conflict
- Option to refresh and retry

### TC-INV-ERR-003: Very long item name
**Preconditions:** User is adding/editing an item
**Steps:**
1. Enter item name with 500+ characters
2. Attempt to save

**Expected Result:**
- Validation error for name length
- Maximum character limit is enforced
- Clear error message shown

---

## Accessibility Tests

### TC-INV-A11Y-001: Keyboard navigation
**Steps:**
1. Navigate inventory list using Tab key
2. Activate buttons using Enter/Space

**Expected Result:**
- All interactive elements are focusable
- Focus order is logical
- Actions can be performed via keyboard

### TC-INV-A11Y-002: Screen reader compatibility
**Steps:**
1. Use screen reader to navigate inventory
2. Verify all elements are announced correctly

**Expected Result:**
- Item names, quantities, and prices are announced
- Buttons have accessible labels
- Status changes are announced

### TC-INV-A11Y-003: Color contrast for stock status
**Steps:**
1. Verify low stock and out of stock indicators

**Expected Result:**
- Status indicators meet WCAG contrast requirements
- Status is not conveyed by color alone
