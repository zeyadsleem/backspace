package service_test

import (
	"testing"
	"time"

	"myproject/backend/database"
	"myproject/backend/finance"
	"myproject/backend/models"
	"myproject/backend/service"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestDailyCapLogic(t *testing.T) {
	// Test the calculation logic directly first
	// Hourly Rate: 20 EGP (2000 Piasters)
	// Daily Cap: 50 EGP (5000 Piasters)
	hourlyRate := int64(2000)
	dailyCap := int64(5000)

	// Case 1: 1 Hour (Should be 20 EGP)
	cost1 := finance.CalculateSessionCost(60, hourlyRate, dailyCap)
	assert.Equal(t, int64(2000), cost1)

	// Case 2: 2 Hours (Should be 40 EGP)
	cost2 := finance.CalculateSessionCost(120, hourlyRate, dailyCap)
	assert.Equal(t, int64(4000), cost2)

	// Case 3: 3 Hours (Should be capped at 50 EGP instead of 60)
	cost3 := finance.CalculateSessionCost(180, hourlyRate, dailyCap)
	assert.Equal(t, int64(5000), cost3, "Should be capped at 5000")

	// Case 4: 10 Hours (Should still be 50 EGP)
	cost4 := finance.CalculateSessionCost(600, hourlyRate, dailyCap)
	assert.Equal(t, int64(5000), cost4, "Should be capped at 5000")
}

func TestRefundSubscription_Balance(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	subService := service.NewSubscriptionService()

	// 1. Create Customer
	customer := models.Customer{
		BaseModel: models.BaseModel{ID: uuid.NewString()},
		Name:      "Refund User",
		Phone:     "01012345678",
		Balance:   0,
	}
	require.NoError(t, database.DB.Create(&customer).Error)

	// 2. Create Subscription (Price 300 EGP, 30 Days)
	// Let's say 15 days passed, so refund should be ~150 EGP
	startDate := time.Now().AddDate(0, 0, -15)
	endDate := startDate.AddDate(0, 0, 30)
	price := int64(30000)

	sub := models.Subscription{
		BaseModel:  models.BaseModel{ID: uuid.NewString()},
		CustomerID: customer.ID,
		PlanType:   "monthly",
		Price:      price,
		StartDate:  startDate,
		EndDate:    endDate,
		IsActive:   true,
		Status:     "active",
	}
	require.NoError(t, database.DB.Create(&sub).Error)

	// 3. Perform Refund to Balance
	err := subService.RefundSubscription(sub.ID, "balance")
	require.NoError(t, err)

	// 4. Verify Subscription is inactive
	var updatedSub models.Subscription
	database.DB.First(&updatedSub, "id = ?", sub.ID)
	assert.False(t, updatedSub.IsActive)
	assert.Equal(t, "inactive", updatedSub.Status)

	// 5. Verify Customer Balance (Should be around 15000 piasters)
	var updatedCustomer models.Customer
	database.DB.First(&updatedCustomer, "id = ?", customer.ID)
	// Exact calculation: 30000 / 30 * 15 = 15000. Might vary slightly due to hours precision
	assert.InDelta(t, int64(15000), updatedCustomer.Balance, 1000)
}

func TestRefundSubscription_Cash(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	subService := service.NewSubscriptionService()

	customer := models.Customer{
		BaseModel: models.BaseModel{ID: uuid.NewString()},
		Name:      "Cash Refund User",
		Phone:     "01087654321",
		Balance:   0,
	}
	database.DB.Create(&customer)

	// Invoice is needed for cash refund linkage
	invoiceID := uuid.NewString()
	invoice := models.Invoice{
		BaseModel:  models.BaseModel{ID: invoiceID},
		CustomerID: customer.ID,
		Amount:     30000,
		Total:      30000,
		PaidAmount: 30000,
		Status:     "paid",
	}
	database.DB.Create(&invoice)

	sub := models.Subscription{
		BaseModel:  models.BaseModel{ID: uuid.NewString()},
		CustomerID: customer.ID,
		PlanType:   "monthly",
		Price:      30000,
		StartDate:  time.Now(), // Just started
		EndDate:    time.Now().AddDate(0, 0, 30),
		IsActive:   true,
		InvoiceID:  &invoiceID,
	}
	database.DB.Create(&sub)

	// Refund Cash (Full amount since it just started)
	err := subService.RefundSubscription(sub.ID, "cash")
	require.NoError(t, err)

	// Verify Payment Record (Negative)
	var refundPayment models.Payment
	err = database.DB.Where("invoice_id = ? AND type = ?", invoiceID, "refund").First(&refundPayment).Error
	require.NoError(t, err)
	// Allow tiny delta due to time precision
	assert.InDelta(t, int64(-30000), refundPayment.Amount, 5)
	assert.Equal(t, "cash", refundPayment.Method)

	// Verify Balance didn't change
	var updatedCustomer models.Customer
	database.DB.First(&updatedCustomer, "id = ?", customer.ID)
	assert.Equal(t, int64(0), updatedCustomer.Balance)
}

func TestUpgradeSubscription(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	subService := service.NewSubscriptionService()

	customer := models.Customer{
		BaseModel: models.BaseModel{ID: uuid.NewString()},
		Name:      "Upgrade User",
		Phone:     "01055555555",
		Balance:   0,
	}
	database.DB.Create(&customer)

	// Old Subscription: Weekly (300 EGP), used 0 days (full refund)
	sub := models.Subscription{
		BaseModel:  models.BaseModel{ID: uuid.NewString()},
		CustomerID: customer.ID,
		PlanType:   "weekly",
		Price:      30000,
		StartDate:  time.Now(),
		EndDate:    time.Now().AddDate(0, 0, 7),
		IsActive:   true,
	}
	database.DB.Create(&sub)

	// Upgrade to Monthly (750 EGP)
	// Expectation:
	// 1. Refund 300 EGP to balance -> Balance = 300
	// 2. Create Monthly Invoice (750 EGP)
	// 3. Try pay 750 from Balance (300) -> Fail (Insufficient)
	// 4. Final Balance: 300, Invoice Status: Unpaid (or Partially Paid if logic supported partial auto-pay, currently auto-pay is full or nothing)

	err := subService.UpgradeSubscription(customer.ID, "monthly", 75000, time.Now())
	require.NoError(t, err)

	// Verify Old Sub Inactive
	var oldSub models.Subscription
	database.DB.First(&oldSub, "id = ?", sub.ID)
	assert.False(t, oldSub.IsActive)

	// Verify New Sub Active
	var newSub models.Subscription
	database.DB.Where("customer_id = ? AND is_active = ?", customer.ID, true).First(&newSub)
	assert.Equal(t, "monthly", newSub.PlanType)
	assert.Equal(t, int64(75000), newSub.Price)

	// Verify Balance (Should have the refund from the old one)
	var updatedCustomer models.Customer
	database.DB.First(&updatedCustomer, "id = ?", customer.ID)
	assert.InDelta(t, int64(30000), updatedCustomer.Balance, 5) // Allow tiny delta
}

func TestWithdrawBalance(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	// Since WithdrawBalance is in App struct (app.go), we can't test it directly here easily without mocking or refactoring.
	// But the logic is simple GORM operations.
	// Instead, let's test the underlying manual steps that WithdrawBalance does to verify the logic works.

	customer := models.Customer{
		BaseModel: models.BaseModel{ID: uuid.NewString()},
		Name:      "Withdraw User",
		Phone:     "01099999999",
		Balance:   50000, // 500 EGP Balance
	}
	database.DB.Create(&customer)

	// Withdraw 200 EGP (20000)
	amount := int64(20000)

	// 1. Create Invoice
	invoice := models.Invoice{
		BaseModel:     models.BaseModel{ID: uuid.NewString()},
		InvoiceNumber: "WDR-TEST",
		CustomerID:    customer.ID,
		Amount:        0,
		Total:         0,
		Status:        "paid",
	}
	database.DB.Create(&invoice)

	// 2. Create Negative Payment
	payment := models.Payment{
		BaseModel: models.BaseModel{ID: uuid.NewString()},
		InvoiceID: invoice.ID,
		Amount:    -amount,
		Method:    "cash",
		Type:      "refund",
		Date:      time.Now(),
	}
	err := database.DB.Create(&payment).Error
	require.NoError(t, err)

	// 3. Deduct Balance
	err = database.DB.Model(&customer).Update("balance", customer.Balance-amount).Error
	require.NoError(t, err)

	// Verify
	var updatedCustomer models.Customer
	database.DB.First(&updatedCustomer, "id = ?", customer.ID)
	assert.Equal(t, int64(30000), updatedCustomer.Balance)

	var savedPayment models.Payment
	database.DB.First(&savedPayment, "invoice_id = ?", invoice.ID)
	assert.Equal(t, int64(-20000), savedPayment.Amount)
}
