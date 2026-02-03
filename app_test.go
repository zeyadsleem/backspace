package main

import (
	"testing"

	"myproject/backend/database"
	"myproject/backend/models"
	"myproject/backend/service"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestAddCustomer_ValidData tests creating a customer with valid data
func TestAddCustomer_ValidData(t *testing.T) {
	// Initialize test database
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	customer := models.Customer{
		Name:  "Test Customer",
		Phone: "01012345678",
	}

	err := app.AddCustomer(customer)
	require.NoError(t, err, "Should create customer without error")

	// Verify customer was created
	customers, err := app.GetCustomers()
	require.NoError(t, err)
	assert.GreaterOrEqual(t, len(customers), 1, "Should have at least one customer")

	// Verify HumanID was generated
	found := false
	for _, c := range customers {
		if c.Name == "Test Customer" {
			found = true
			assert.NotEmpty(t, c.HumanID, "HumanID should be generated")
			assert.Len(t, c.HumanID, 8, "HumanID should be 8 characters")
			break
		}
	}
	assert.True(t, found, "Created customer should be found")
}

// TestAddCustomer_EmptyName tests that empty name is rejected
func TestAddCustomer_EmptyName(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	customer := models.Customer{
		Name:  "",
		Phone: "01012345678",
	}

	err := app.AddCustomer(customer)
	assert.Error(t, err, "Should reject customer with empty name")
	assert.Contains(t, err.Error(), "name is required")
}

// TestAddCustomer_EmptyPhone tests that empty phone is rejected
func TestAddCustomer_EmptyPhone(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	customer := models.Customer{
		Name:  "Test Customer",
		Phone: "",
	}

	err := app.AddCustomer(customer)
	assert.Error(t, err, "Should reject customer with empty phone")
	assert.Contains(t, err.Error(), "phone is required")
}

// TestAddResource_ValidData tests creating a resource with valid data
func TestAddResource_ValidData(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	resource := models.Resource{
		Name:         "Test Desk",
		ResourceType: "desk",
		RatePerHour:  5000,
	}

	err := app.AddResource(resource)
	require.NoError(t, err, "Should create resource without error")

	// Verify resource was created
	resources, err := app.GetResources()
	require.NoError(t, err)

	found := false
	for _, r := range resources {
		if r.Name == "Test Desk" {
			found = true
			assert.Equal(t, int64(5000), r.RatePerHour)
			break
		}
	}
	assert.True(t, found, "Created resource should be found")
}

// TestAddResource_NegativeRate tests that negative rate is rejected
func TestAddResource_NegativeRate(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	resource := models.Resource{
		Name:         "Test Desk",
		ResourceType: "desk",
		RatePerHour:  -100,
	}

	err := app.AddResource(resource)
	assert.Error(t, err, "Should reject resource with negative rate")
	assert.Contains(t, err.Error(), "cannot be negative")
}

// TestAddResource_EmptyName tests that empty name is rejected
func TestAddResource_EmptyName(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	resource := models.Resource{
		Name:         "",
		ResourceType: "desk",
		RatePerHour:  5000,
	}

	err := app.AddResource(resource)
	assert.Error(t, err, "Should reject resource with empty name")
	assert.Contains(t, err.Error(), "name is required")
}

// TestAddInventory_ValidData tests creating inventory with valid data
func TestAddInventory_ValidData(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	item := models.InventoryItem{
		Name:     "Test Coffee",
		Category: "beverage",
		Price:    3000,
		Quantity: 100,
		MinStock: 20,
	}

	err := app.AddInventory(item)
	require.NoError(t, err, "Should create inventory item without error")

	// Verify item was created
	items, err := app.GetInventory()
	require.NoError(t, err)

	found := false
	for _, i := range items {
		if i.Name == "Test Coffee" {
			found = true
			assert.Equal(t, int64(3000), i.Price)
			assert.Equal(t, 100, i.Quantity)
			break
		}
	}
	assert.True(t, found, "Created inventory item should be found")
}

// TestAddInventory_NegativePrice tests that negative price is rejected
func TestAddInventory_NegativePrice(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	item := models.InventoryItem{
		Name:     "Test Coffee",
		Category: "beverage",
		Price:    -100,
		Quantity: 100,
		MinStock: 20,
	}

	err := app.AddInventory(item)
	assert.Error(t, err, "Should reject inventory with negative price")
	assert.Contains(t, err.Error(), "cannot be negative")
}

// TestAddInventory_NegativeQuantity tests that negative quantity is rejected
func TestAddInventory_NegativeQuantity(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	item := models.InventoryItem{
		Name:     "Test Coffee",
		Category: "beverage",
		Price:    3000,
		Quantity: -10,
		MinStock: 20,
	}

	err := app.AddInventory(item)
	assert.Error(t, err, "Should reject inventory with negative quantity")
	assert.Contains(t, err.Error(), "cannot be negative")
}

// TestAddSubscription_ValidData tests creating subscription with valid data
func TestAddSubscription_ValidData(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()
	app.subscriptionService = service.NewSubscriptionService()

	// First create a customer
	customer := models.Customer{
		Name:  "Sub Test Customer",
		Phone: "01099999999",
	}
	err := app.AddCustomer(customer)
	require.NoError(t, err)

	// Get the customer ID
	customers, _ := app.GetCustomers()
	var customerID string
	for _, c := range customers {
		if c.Name == "Sub Test Customer" {
			customerID = c.ID
			break
		}
	}
	require.NotEmpty(t, customerID)

	// Create subscription
	data := AddSubscriptionData{
		CustomerID: customerID,
		PlanType:   "monthly",
		Price:      50000,
		StartDate:  "2024-01-01T00:00:00Z",
	}

	err = app.AddSubscription(data)
	require.NoError(t, err, "Should create subscription without error")

	// Verify subscription was created
	subs, err := app.GetSubscriptions()
	require.NoError(t, err)

	found := false
	for _, s := range subs {
		if s.CustomerID == customerID {
			found = true
			assert.Equal(t, "monthly", s.PlanType)
			assert.Equal(t, int64(50000), s.Price)
			break
		}
	}
	assert.True(t, found, "Created subscription should be found")
}

// TestAddSubscription_InvalidPlanType tests that invalid plan type is rejected
func TestAddSubscription_InvalidPlanType(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	data := AddSubscriptionData{
		CustomerID: "some-id",
		PlanType:   "invalid-plan",
		Price:      50000,
		StartDate:  "2024-01-01T00:00:00Z",
	}

	err := app.AddSubscription(data)
	assert.Error(t, err, "Should reject subscription with invalid plan type")
	assert.Contains(t, err.Error(), "invalid plan type")
}

// TestAddSubscription_NegativePrice tests that negative price is rejected
func TestAddSubscription_NegativePrice(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()

	app := NewApp()

	data := AddSubscriptionData{
		CustomerID: "some-id",
		PlanType:   "monthly",
		Price:      -100,
		StartDate:  "2024-01-01T00:00:00Z",
	}

	err := app.AddSubscription(data)
	assert.Error(t, err, "Should reject subscription with negative price")
	assert.Contains(t, err.Error(), "must be positive")
}

// TestGenerateShortHumanID tests the UUID generation function
func TestGenerateShortHumanID(t *testing.T) {
	id1 := generateShortHumanID()
	id2 := generateShortHumanID()

	// Check length
	assert.Len(t, id1, 8, "HumanID should be 8 characters")
	assert.Len(t, id2, 8, "HumanID should be 8 characters")

	// Check uniqueness
	assert.NotEqual(t, id1, id2, "Generated IDs should be unique")

	// Check format (should be uppercase hex)
	assert.Regexp(t, "^[A-F0-9]{8}$", id1, "HumanID should be uppercase hex")
}

// TestEndSession_ZeroAmount_NoInvoice checks that ending a zero-cost session does NOT create an invoice
func TestEndSession_ZeroAmount_NoInvoice(t *testing.T) {
	database.SetupTestDB(t)
	defer database.CleanupTestDB()
	app := NewApp()

	// Manually initialize services for testing since we're bypassing Wails startup
	app.sessionService = service.NewSessionService()
	app.invoiceService = service.NewInvoiceService()
	app.subscriptionService = service.NewSubscriptionService()

	// 1. Create Customer
	customer := models.Customer{Name: "Free User", Phone: "01000000000"}
	err := app.AddCustomer(customer)
	require.NoError(t, err)

	// Get Customer ID
	customers, _ := app.GetCustomers()
	var customerID string
	for _, c := range customers {
		if c.Name == "Free User" {
			customerID = c.ID
			break
		}
	}
	require.NotEmpty(t, customerID)

	// 2. Create Free Resource
	resource := models.Resource{Name: "Free Desk", ResourceType: "desk", RatePerHour: 0}
	err = app.AddResource(resource)
	require.NoError(t, err)

	// Get Resource ID
	resources, _ := app.GetResources()
	var resourceID string
	for _, r := range resources {
		if r.Name == "Free Desk" {
			resourceID = r.ID
			break
		}
	}
	require.NotEmpty(t, resourceID)

	// 3. Start Session
	err = app.StartSession(customerID, resourceID)
	require.NoError(t, err)

	// 4. Get Session ID
	sessions, err := app.GetActiveSessions()
	require.NoError(t, err)

	// Filter for our session
	var sessionID string
	for _, s := range sessions {
		if s.CustomerID == customerID {
			sessionID = s.ID
			break
		}
	}
	require.NotEmpty(t, sessionID, "Should find active session")

	// 5. End Session
	invoiceID, err := app.EndSession(sessionID)
	require.NoError(t, err)

	// 6. Verify NO Invoice ID returned
	assert.Empty(t, invoiceID, "Should not return invoice ID for zero amount session")

	// 7. Verify NO Invoice in DB
	invoices, err := app.GetInvoices()
	require.NoError(t, err)

	found := false
	for _, inv := range invoices {
		if inv.SessionID != nil && *inv.SessionID == sessionID {
			found = true
			break
		}
	}
	assert.False(t, found, "Should not create invoice for zero amount session")
}
