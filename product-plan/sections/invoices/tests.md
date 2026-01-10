# Invoices Section - Test Cases

## 1. Create Invoice

### TC-INV-001: Create invoice with single line item
**Preconditions:** User is on the invoices page
**Steps:**
1. Click "Create Invoice" button
2. Select a customer from the dropdown
3. Add a line item with description, quantity, and rate
4. Set due date
5. Click "Save" button

**Expected Result:**
- Invoice is created with auto-generated invoice number
- Line item amount is calculated (quantity × rate)
- Total equals line item amount
- Invoice status is set to "unpaid"
- User is redirected to invoice list or detail view
- Success notification is displayed

### TC-INV-002: Create invoice with multiple line items
**Preconditions:** User is on the create invoice form
**Steps:**
1. Select a customer
2. Add first line item (e.g., "Session - Seat A1", qty: 1, rate: 75.00)
3. Click "Add Line Item"
4. Add second line item (e.g., "Coffee", qty: 2, rate: 15.00)
5. Set due date
6. Click "Save"

**Expected Result:**
- Invoice is created with both line items
- Amount is sum of all line item amounts (75 + 30 = 105)
- Total reflects the correct sum

### TC-INV-003: Create invoice with discount
**Preconditions:** User is on the create invoice form
**Steps:**
1. Select a customer
2. Add line items totaling 200.00
3. Enter discount of 20.00
4. Set due date
5. Click "Save"

**Expected Result:**
- Invoice amount shows 200.00
- Discount shows 20.00
- Total shows 180.00 (amount - discount)

### TC-INV-004: Validation - Create invoice without required fields
**Preconditions:** User is on the create invoice form
**Steps:**
1. Leave customer unselected
2. Do not add any line items
3. Click "Save"

**Expected Result:**
- Form validation errors are displayed
- Customer field shows required error
- At least one line item is required
- Invoice is not created

---

## 2. View Invoice List

### TC-INV-010: View all invoices
**Preconditions:** Multiple invoices exist in the system
**Steps:**
1. Navigate to Invoices section

**Expected Result:**
- Invoice list is displayed
- Each row shows: Invoice number, Customer name, Total, Status, Due date
- Invoices are sorted by creation date (newest first)
- Status badges show correct colors (paid=green, unpaid=red, pending=yellow)

### TC-INV-011: View empty invoice list
**Preconditions:** No invoices exist in the system
**Steps:**
1. Navigate to Invoices section

**Expected Result:**
- Empty state is displayed
- Message indicates no invoices found
- "Create Invoice" button is visible

### TC-INV-012: View invoice details
**Preconditions:** At least one invoice exists
**Steps:**
1. Navigate to Invoices section
2. Click on an invoice row

**Expected Result:**
- Invoice detail view opens
- Shows all invoice information: number, customer, line items, payments
- Action buttons are available (Edit, Record Payment, Print)

---

## 3. Filter by Status

### TC-INV-020: Filter invoices by "Paid" status
**Preconditions:** Invoices with different statuses exist
**Steps:**
1. Navigate to Invoices section
2. Click on "Paid" filter/tab

**Expected Result:**
- Only invoices with status "paid" are displayed
- Filter indicator shows "Paid" is active
- Count reflects number of paid invoices

### TC-INV-021: Filter invoices by "Unpaid" status
**Preconditions:** Invoices with different statuses exist
**Steps:**
1. Navigate to Invoices section
2. Click on "Unpaid" filter/tab

**Expected Result:**
- Only invoices with status "unpaid" are displayed
- These are invoices with paidAmount = 0

### TC-INV-022: Filter invoices by "Pending" status
**Preconditions:** Invoices with partial payments exist
**Steps:**
1. Navigate to Invoices section
2. Click on "Pending" filter/tab

**Expected Result:**
- Only invoices with status "pending" are displayed
- These are invoices with partial payments (0 < paidAmount < total)

### TC-INV-023: Clear status filter
**Preconditions:** A status filter is currently active
**Steps:**
1. Click "All" or clear the active filter

**Expected Result:**
- All invoices are displayed regardless of status
- Filter indicator is cleared

---

## 4. Record Payment (Full Payment)

### TC-INV-030: Record full payment on unpaid invoice
**Preconditions:** An unpaid invoice exists with total = 75.00
**Steps:**
1. Navigate to invoice detail or click "Record Payment" from list
2. Enter amount: 75.00
3. Select payment method: "Cash"
4. Enter date: today
5. Click "Save Payment"

**Expected Result:**
- Payment is recorded
- Invoice paidAmount updates to 75.00
- Invoice status changes to "paid"
- paidDate is set to payment date
- Payment appears in invoice payment history
- Success notification is displayed

### TC-INV-031: Record full payment with card
**Preconditions:** An unpaid invoice exists
**Steps:**
1. Open Record Payment dialog
2. Enter full amount
3. Select payment method: "Card"
4. Add notes: "Visa ending 4242"
5. Click "Save Payment"

**Expected Result:**
- Payment is recorded with method "card"
- Notes are saved with the payment record
- Invoice status changes to "paid"

### TC-INV-032: Record full payment with bank transfer
**Preconditions:** An unpaid invoice exists
**Steps:**
1. Open Record Payment dialog
2. Enter full amount
3. Select payment method: "Transfer"
4. Add notes: "Bank ref: TRF123456"
5. Click "Save Payment"

**Expected Result:**
- Payment is recorded with method "transfer"
- Notes contain bank reference
- Invoice status changes to "paid"

---

## 5. Partial Payment

### TC-INV-040: Record partial payment on unpaid invoice
**Preconditions:** An unpaid invoice exists with total = 180.00
**Steps:**
1. Open Record Payment dialog
2. Enter amount: 100.00 (less than total)
3. Select payment method: "Cash"
4. Add notes: "Partial payment"
5. Click "Save Payment"

**Expected Result:**
- Payment of 100.00 is recorded
- Invoice paidAmount updates to 100.00
- Invoice status changes to "pending"
- Remaining balance shows 80.00
- paidDate remains null (not fully paid)

### TC-INV-041: Record second partial payment
**Preconditions:** Invoice with total = 180.00 has partial payment of 100.00 (status: pending)
**Steps:**
1. Open Record Payment dialog for the same invoice
2. Enter amount: 50.00
3. Select payment method: "Card"
4. Click "Save Payment"

**Expected Result:**
- Second payment is recorded
- Invoice paidAmount updates to 150.00
- Invoice status remains "pending"
- Remaining balance shows 30.00
- Payment history shows 2 payments

### TC-INV-042: Complete payment on pending invoice
**Preconditions:** Invoice with total = 180.00 has paidAmount = 150.00 (status: pending)
**Steps:**
1. Open Record Payment dialog
2. Enter remaining amount: 30.00
3. Select payment method: "Cash"
4. Click "Save Payment"

**Expected Result:**
- Final payment is recorded
- Invoice paidAmount updates to 180.00
- Invoice status changes to "paid"
- paidDate is set to this payment's date
- Payment history shows 3 payments

### TC-INV-043: Validation - Payment amount exceeds remaining balance
**Preconditions:** Invoice with total = 100.00, paidAmount = 80.00 (remaining = 20.00)
**Steps:**
1. Open Record Payment dialog
2. Enter amount: 50.00 (exceeds remaining 20.00)
3. Click "Save Payment"

**Expected Result:**
- Validation error is displayed
- Message indicates amount exceeds remaining balance
- Payment is not recorded

### TC-INV-044: Validation - Payment amount is zero or negative
**Preconditions:** An unpaid invoice exists
**Steps:**
1. Open Record Payment dialog
2. Enter amount: 0 or -10
3. Click "Save Payment"

**Expected Result:**
- Validation error is displayed
- Message indicates amount must be positive
- Payment is not recorded

### TC-INV-045: View payment history
**Preconditions:** Invoice has multiple payments recorded
**Steps:**
1. Open invoice detail view
2. Scroll to payment history section

**Expected Result:**
- All payments are listed chronologically
- Each payment shows: amount, method, date, notes
- Total paid amount matches sum of all payments

---

## Edge Cases

### TC-INV-050: Create invoice linked to session
**Preconditions:** An active session exists
**Steps:**
1. End a session (which auto-generates invoice)
2. View the generated invoice

**Expected Result:**
- Invoice is created with sessionId populated
- Line items include session cost and any inventory consumed
- Customer is linked from the session

### TC-INV-051: Attempt to edit paid invoice
**Preconditions:** A fully paid invoice exists
**Steps:**
1. Open the paid invoice
2. Attempt to edit

**Expected Result:**
- Edit is restricted or shows warning
- Paid invoices should not be modified (or require special permission)

### TC-INV-052: Print invoice
**Preconditions:** An invoice exists
**Steps:**
1. Open invoice detail
2. Click "Print" button

**Expected Result:**
- Print-friendly view is generated
- Shows company header, invoice details, line items, payment status
- Browser print dialog opens
