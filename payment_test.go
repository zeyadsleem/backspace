package main

import (
	"testing"

	"myproject/backend/database"
	"myproject/backend/models"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestProcessPayment_ValidPayment tests normal payment processing
func TestProcessPayment_ValidPayment(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	// Create test customer
	customer := models.Customer{
		BaseModel: models.BaseModel{ID: uuid.NewString()},
		Name:      "Payment Test Customer",
		Phone:     "01011111111",
		HumanID:   generateShortHumanID(),
	}
	require.NoError(t, database.DB.Create(&customer).Error)

	// Create test invoice
	invoice := models.Invoice{
		BaseModel:  models.BaseModel{ID: uuid.NewString()},
		CustomerID: customer.ID,
		Total:      10000, // 100 EGP
		Status:     "unpaid",
	}
	require.NoError(t, database.DB.Create(&invoice).Error)

	// Process payment
	data := ProcessPaymentData{
		InvoiceID:     invoice.ID,
		Amount:        10000, // Pay full amount
		PaymentMethod: "cash",
		Notes:         "Test payment",
	}

	err := app.ProcessPayment(data)
	require.NoError(t, err, "Should process payment without error")

	// Verify invoice is paid
	var updatedInvoice models.Invoice
	err = database.DB.First(&updatedInvoice, "id = ?", invoice.ID).Error
	require.NoError(t, err)
	assert.Equal(t, int64(10000), updatedInvoice.PaidAmount)
	assert.Equal(t, "paid", updatedInvoice.Status)
}

// TestProcessPayment_PartialPayment tests partial payment
func TestProcessPayment_PartialPayment(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	// Create test customer
	customer := models.Customer{
		BaseModel: models.BaseModel{ID: uuid.NewString()},
		Name:      "Partial Payment Customer",
		Phone:     "01022222222",
		HumanID:   generateShortHumanID(),
	}
	require.NoError(t, database.DB.Create(&customer).Error)

	// Create test invoice
	invoice := models.Invoice{
		BaseModel:  models.BaseModel{ID: uuid.NewString()},
		CustomerID: customer.ID,
		Total:      10000,
		Status:     "unpaid",
	}
	require.NoError(t, database.DB.Create(&invoice).Error)

	// Process partial payment
	data := ProcessPaymentData{
		InvoiceID:     invoice.ID,
		Amount:        5000, // Pay half
		PaymentMethod: "cash",
	}

	err := app.ProcessPayment(data)
	require.NoError(t, err)

	// Verify invoice is partially paid
	var updatedInvoice models.Invoice
	err = database.DB.First(&updatedInvoice, "id = ?", invoice.ID).Error
	require.NoError(t, err)
	assert.Equal(t, int64(5000), updatedInvoice.PaidAmount)
	assert.Equal(t, "partially_paid", updatedInvoice.Status)
}

// TestProcessPayment_Overpayment tests that overpayment is rejected
func TestProcessPayment_Overpayment(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	// Create test customer
	customer := models.Customer{
		BaseModel: models.BaseModel{ID: uuid.NewString()},
		Name:      "Overpayment Customer",
		Phone:     "01033333333",
		HumanID:   generateShortHumanID(),
	}
	require.NoError(t, database.DB.Create(&customer).Error)

	// Create test invoice with 100 EGP total
	invoice := models.Invoice{
		BaseModel:  models.BaseModel{ID: uuid.NewString()},
		CustomerID: customer.ID,
		Total:      10000,
		PaidAmount: 0,
		Status:     "unpaid",
	}
	require.NoError(t, database.DB.Create(&invoice).Error)

	// Try to pay more than invoice total
	data := ProcessPaymentData{
		InvoiceID:     invoice.ID,
		Amount:        15000, // Try to pay 150 EGP when only 100 is due
		PaymentMethod: "cash",
	}

	err := app.ProcessPayment(data)
	assert.Error(t, err, "Should reject overpayment")
	assert.Contains(t, err.Error(), "exceeds remaining balance")

	// Verify invoice was not updated
	var updatedInvoice models.Invoice
	err = database.DB.First(&updatedInvoice, "id = ?", invoice.ID).Error
	require.NoError(t, err)
	assert.Equal(t, int64(0), updatedInvoice.PaidAmount, "Paid amount should remain 0")
	assert.Equal(t, "unpaid", updatedInvoice.Status, "Status should remain unpaid")
}

// TestProcessPayment_NegativeAmount tests that negative payment is rejected
func TestProcessPayment_NegativeAmount(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	data := ProcessPaymentData{
		InvoiceID:     "some-id",
		Amount:        -100,
		PaymentMethod: "cash",
	}

	err := app.ProcessPayment(data)
	assert.Error(t, err, "Should reject negative payment amount")
	assert.Contains(t, err.Error(), "must be positive")
}

// TestProcessPayment_ZeroAmount tests that zero payment is rejected
func TestProcessPayment_ZeroAmount(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	data := ProcessPaymentData{
		InvoiceID:     "some-id",
		Amount:        0,
		PaymentMethod: "cash",
	}

	err := app.ProcessPayment(data)
	assert.Error(t, err, "Should reject zero payment amount")
	assert.Contains(t, err.Error(), "must be positive")
}

// TestProcessPayment_AlreadyPaidInvoice tests paying an already paid invoice
func TestProcessPayment_AlreadyPaidInvoice(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	// Create test customer
	customer := models.Customer{
		BaseModel: models.BaseModel{ID: uuid.NewString()},
		Name:      "Already Paid Customer",
		Phone:     "01044444444",
		HumanID:   generateShortHumanID(),
	}
	require.NoError(t, database.DB.Create(&customer).Error)

	// Create already paid invoice
	invoice := models.Invoice{
		BaseModel:  models.BaseModel{ID: uuid.NewString()},
		CustomerID: customer.ID,
		Total:      10000,
		PaidAmount: 10000,
		Status:     "paid",
	}
	require.NoError(t, database.DB.Create(&invoice).Error)

	// Try to pay again
	data := ProcessPaymentData{
		InvoiceID:     invoice.ID,
		Amount:        5000,
		PaymentMethod: "cash",
	}

	err := app.ProcessPayment(data)
	assert.Error(t, err, "Should reject payment for already paid invoice")
	assert.Contains(t, err.Error(), "already fully paid")
}

// TestProcessPayment_MultiplePartialPayments tests multiple partial payments
func TestProcessPayment_MultiplePartialPayments(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	// Create test customer
	customer := models.Customer{
		BaseModel: models.BaseModel{ID: uuid.NewString()},
		Name:      "Multiple Payment Customer",
		Phone:     "01055555555",
		HumanID:   generateShortHumanID(),
	}
	require.NoError(t, database.DB.Create(&customer).Error)

	// Create test invoice
	invoice := models.Invoice{
		BaseModel:  models.BaseModel{ID: uuid.NewString()},
		CustomerID: customer.ID,
		Total:      10000,
		Status:     "unpaid",
	}
	require.NoError(t, database.DB.Create(&invoice).Error)

	// First payment: 30 EGP
	data1 := ProcessPaymentData{
		InvoiceID:     invoice.ID,
		Amount:        3000,
		PaymentMethod: "cash",
	}
	err := app.ProcessPayment(data1)
	require.NoError(t, err)

	// Second payment: 40 EGP
	data2 := ProcessPaymentData{
		InvoiceID:     invoice.ID,
		Amount:        4000,
		PaymentMethod: "card",
	}
	err = app.ProcessPayment(data2)
	require.NoError(t, err)

	// Third payment: 30 EGP (should complete the invoice)
	data3 := ProcessPaymentData{
		InvoiceID:     invoice.ID,
		Amount:        3000,
		PaymentMethod: "transfer",
	}
	err = app.ProcessPayment(data3)
	require.NoError(t, err)

	// Verify invoice is fully paid
	var updatedInvoice models.Invoice
	err = database.DB.First(&updatedInvoice, "id = ?", invoice.ID).Error
	require.NoError(t, err)
	assert.Equal(t, int64(10000), updatedInvoice.PaidAmount)
	assert.Equal(t, "paid", updatedInvoice.Status)

	// Verify customer total spent was updated
	var updatedCustomer models.Customer
	err = database.DB.First(&updatedCustomer, "id = ?", customer.ID).Error
	require.NoError(t, err)
	assert.Equal(t, int64(10000), updatedCustomer.TotalSpent)
}

// TestProcessPayment_NonExistentInvoice tests payment for non-existent invoice
func TestProcessPayment_NonExistentInvoice(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	data := ProcessPaymentData{
		InvoiceID:     "non-existent-id",
		Amount:        5000,
		PaymentMethod: "cash",
	}

	err := app.ProcessPayment(data)
	assert.Error(t, err, "Should reject payment for non-existent invoice")
}
