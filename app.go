package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"myproject/backend/database"
	"myproject/backend/models"
	"myproject/backend/service"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// App struct
type App struct {
	ctx                 context.Context
	sessionService      *service.SessionService
	invoiceService      *service.InvoiceService
	subscriptionService *service.SubscriptionService
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.sessionService = service.NewSessionService()
	a.invoiceService = service.NewInvoiceService()
	a.subscriptionService = service.NewSubscriptionService()
	a.SeedDatabase() // Auto seed on startup
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// --- Customers ---

func (a *App) GetCustomers() []models.Customer {
	var customers []models.Customer
	database.DB.Preload("Subscriptions").Preload("Invoices").Order("created_at desc").Find(&customers)
	return customers
}

func (a *App) AddCustomer(data models.Customer) error {
	data.ID = uuid.NewString()

	// Automatically generate HumanID if not provided or looks like a UUID fragment
	return database.DB.Transaction(func(tx *gorm.DB) error {
		var lastCustomer models.Customer
		// Find the highest HumanID that matches the pattern C + digits
		tx.Where("human_id LIKE ?", "C%").Order("human_id desc").First(&lastCustomer)

		nextNum := 1
		if lastCustomer.HumanID != "" {
			var currentNum int
			_, err := fmt.Sscanf(lastCustomer.HumanID, "C%d", &currentNum)
			if err == nil {
				nextNum = currentNum + 1
			}
		}

		// Format as C followed by 3 digits (e.g., C001, C015, C123)
		data.HumanID = fmt.Sprintf("C%03d", nextNum)

		return tx.Create(&data).Error
	})
}

func (a *App) UpdateCustomer(id string, data models.Customer) error {
	var customer models.Customer
	if err := database.DB.First(&customer, "id = ?", id).Error; err != nil {
		return err
	}
	// Update fields
	return database.DB.Model(&customer).Updates(data).Error
}

func (a *App) DeleteCustomer(id string) error {
	return database.DB.Delete(&models.Customer{}, "id = ?", id).Error
}

func (a *App) CheckCustomerDuplicate(name string, phone string) (*models.Customer, error) {
	var customer models.Customer
	result := database.DB.Where("name = ? OR phone = ?", name, phone).First(&customer)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return &customer, nil
}

// --- Resources ---

func (a *App) GetResources() []models.Resource {
	var resources []models.Resource
	database.DB.Order("name asc").Find(&resources)
	return resources
}

func (a *App) AddResource(data models.Resource) error {
	data.ID = uuid.NewString()
	return database.DB.Create(&data).Error
}

func (a *App) UpdateResource(id string, data models.Resource) error {
	return database.DB.Model(&models.Resource{}).Where("id = ?", id).Updates(data).Error
}

func (a *App) DeleteResource(id string) error {
	return database.DB.Delete(&models.Resource{}, "id = ?", id).Error
}

// --- Inventory ---

func (a *App) GetInventory() []models.InventoryItem {
	var items []models.InventoryItem
	database.DB.Order("name asc").Find(&items)
	return items
}

func (a *App) AddInventory(data models.InventoryItem) error {
	data.ID = uuid.NewString()
	return database.DB.Create(&data).Error
}

func (a *App) UpdateInventory(id string, data models.InventoryItem) error {
	return database.DB.Model(&models.InventoryItem{}).Where("id = ?", id).Updates(data).Error
}

func (a *App) DeleteInventory(id string) error {
	return database.DB.Delete(&models.InventoryItem{}, "id = ?", id).Error
}

func (a *App) AdjustInventoryQuantity(id string, delta int) error {
	return database.DB.Model(&models.InventoryItem{}).Where("id = ?", id).Update("quantity", gorm.Expr("quantity + ?", delta)).Error
}

// --- Sessions ---

func (a *App) GetActiveSessions() []models.Session {
	var sessions []models.Session
	// Load related data
	database.DB.Where("status = ?", "active").
		Preload("InventoryConsumptions").
		Find(&sessions)

	for i := range sessions {
		var c models.Customer
		var r models.Resource
		database.DB.First(&c, "id = ?", sessions[i].CustomerID)
		database.DB.First(&r, "id = ?", sessions[i].ResourceID)
		sessions[i].CustomerName = c.Name
		sessions[i].ResourceName = r.Name
	}
	return sessions
}

func (a *App) StartSession(customerID string, resourceID string) error {
	_, err := a.sessionService.StartSession(customerID, resourceID)
	return err
}

func (a *App) EndSession(sessionID string) (string, error) {
	var invoiceID string
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		// 1. End the session via service
		session, err := a.sessionService.EndSessionWithTx(tx, sessionID)
		if err != nil {
			return err
		}

		// 2. Generate Invoice via service
		invoice, err := a.invoiceService.CreateInvoiceFromSession(tx, session)
		if err != nil {
			return err
		}
		invoiceID = invoice.ID
		return nil
	})
	return invoiceID, err
}

func (a *App) AddSessionInventory(sessionID string, item models.SessionInventoryInput) error {
	return a.sessionService.AddInventoryConsumption(sessionID, item.InventoryID, item.Quantity)
}

func (a *App) RemoveSessionInventory(sessionID string, inventoryID string) error {
	return a.sessionService.RemoveInventoryConsumption(sessionID, inventoryID)
}

func (a *App) UpdateSessionInventory(sessionID string, inventoryID string, quantity int) error {
	return a.sessionService.UpdateInventoryConsumption(sessionID, inventoryID, quantity)
}

// --- Subscriptions ---

func (a *App) GetSubscriptions() []models.Subscription {
	var subs []models.Subscription
	database.DB.Find(&subs)
	for i := range subs {
		var c models.Customer
		database.DB.First(&c, "id = ?", subs[i].CustomerID)
		subs[i].CustomerName = c.Name

		if subs[i].IsActive && subs[i].EndDate.After(time.Now()) {
			subs[i].DaysRemaining = int(time.Until(subs[i].EndDate).Hours() / 24)
		} else {
			subs[i].DaysRemaining = 0
		}
	}
	return subs
}

type AddSubscriptionData struct {
	CustomerID string `json:"customer_id"`
	PlanType   string `json:"plan_type"`
	Price      int64  `json:"price"` // Price in piasters
	StartDate  string `json:"start_date"`
}

func (a *App) AddSubscription(data AddSubscriptionData) error {
	startDate, err := time.Parse(time.RFC3339, data.StartDate)
	if err != nil {
		startDate = time.Now()
	}

	_, err = a.subscriptionService.CreateSubscription(data.CustomerID, data.PlanType, data.Price, startDate)
	return err
}

func (a *App) UpdateSubscription(id string, data models.Subscription) error {
	return database.DB.Model(&models.Subscription{}).Where("id = ?", id).Updates(data).Error
}

func (a *App) DeleteSubscription(id string) error {
	return database.DB.Delete(&models.Subscription{}, "id = ?", id).Error
}

func (a *App) DeactivateSubscription(id string) error {
	return a.subscriptionService.CancelSubscription(id)
}

func (a *App) ChangeSubscriptionPlan(id string, newPlanType string) error {
	return database.DB.Model(&models.Subscription{}).Where("id = ?", id).Update("plan_type", newPlanType).Error
}

func (a *App) CancelSubscription(id string) error {
	return a.subscriptionService.CancelSubscription(id)
}

func (a *App) ReactivateSubscription(id string) error {
	return database.DB.Transaction(func(tx *gorm.DB) error {
		var sub models.Subscription
		if err := tx.First(&sub, "id = ?", id).Error; err != nil {
			return err
		}

		if err := tx.Model(&sub).Updates(map[string]interface{}{"is_active": true, "status": "active"}).Error; err != nil {
			return err
		}

		return tx.Model(&models.Customer{}).Where("id = ?", sub.CustomerID).Update("customer_type", sub.PlanType).Error
	})
}

// --- Invoices ---

func (a *App) GetInvoices() []models.Invoice {
	var invoices []models.Invoice
	database.DB.Preload("LineItems").Preload("Payments").Order("created_at desc").Find(&invoices)
	for i := range invoices {
		var c models.Customer
		database.DB.First(&c, "id = ?", invoices[i].CustomerID)
		invoices[i].CustomerName = c.Name
		invoices[i].CustomerPhone = c.Phone
	}
	return invoices
}

type ProcessPaymentData struct {
	InvoiceID     string `json:"invoice_id"`
	Amount        int64  `json:"amount"` // Received in Piasters
	PaymentMethod string `json:"payment_method"`
	Notes         string `json:"notes"`
}

func (a *App) ProcessPayment(data ProcessPaymentData) error {
	payment := models.Payment{
		BaseModel: models.BaseModel{ID: uuid.NewString()},
		InvoiceID: data.InvoiceID,
		Amount:    data.Amount,
		Method:    data.PaymentMethod,
		Notes:     data.Notes,
		Date:      time.Now(),
	}

	return database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&payment).Error; err != nil {
			return err
		}

		var invoice models.Invoice
		if err := tx.First(&invoice, "id = ?", data.InvoiceID).Error; err != nil {
			return err
		}

		invoice.PaidAmount += data.Amount
		if invoice.PaidAmount >= invoice.Total {
			invoice.Status = "paid"
			now := time.Now()
			invoice.PaidDate = &now
		} else {
			invoice.Status = "partially_paid"
		}

		if err := tx.Save(&invoice).Error; err != nil {
			return err
		}

		var customer models.Customer
		if err := tx.First(&customer, "id = ?", invoice.CustomerID).Error; err != nil {
			return err
		}
		customer.TotalSpent += data.Amount
		return tx.Save(&customer).Error
	})
}

type BulkPaymentData struct {
	InvoiceIDs    []string `json:"invoice_ids"`
	Amount        int64    `json:"amount"` // Received in Piasters
	PaymentMethod string   `json:"payment_method"`
	Notes         string   `json:"notes"`
}

func (a *App) ProcessBulkPayment(data BulkPaymentData) error {
	if len(data.InvoiceIDs) == 0 || data.Amount <= 0 {
		return nil
	}

	return database.DB.Transaction(func(tx *gorm.DB) error {
		remainingAmount := data.Amount

		for _, invoiceID := range data.InvoiceIDs {
			if remainingAmount <= 0 {
				break
			}

			var invoice models.Invoice
			if err := tx.First(&invoice, "id = ?", invoiceID).Error; err != nil {
				return err
			}

			// Calculate how much is needed to pay off this invoice
			dueForThisInvoice := invoice.Total - invoice.PaidAmount
			if dueForThisInvoice <= 0 {
				continue
			}

			paymentForThisInvoice := dueForThisInvoice
			if remainingAmount < dueForThisInvoice {
				paymentForThisInvoice = remainingAmount
			}

			// Create payment record for this invoice
			payment := models.Payment{
				BaseModel: models.BaseModel{ID: uuid.NewString()},
				InvoiceID: invoice.ID,
				Amount:    paymentForThisInvoice,
				Method:    data.PaymentMethod,
				Notes:     data.Notes,
				Date:      time.Now(),
			}
			if err := tx.Create(&payment).Error; err != nil {
				return err
			}

			// Update invoice
			invoice.PaidAmount += paymentForThisInvoice
			if invoice.PaidAmount >= invoice.Total {
				invoice.Status = "paid"
				now := time.Now()
				invoice.PaidDate = &now
			} else {
				invoice.Status = "partially_paid"
			}

			if err := tx.Save(&invoice).Error; err != nil {
				return err
			}

			// Update customer total spent
			var customer models.Customer
			if err := tx.First(&customer, "id = ?", invoice.CustomerID).Error; err != nil {
				return err
			}
			customer.TotalSpent += paymentForThisInvoice
			if err := tx.Save(&customer).Error; err != nil {
				return err
			}

			remainingAmount -= paymentForThisInvoice
		}

		return nil
	})
}

// --- Settings ---

func (a *App) GetSettings() *models.Settings {
	var appSettings models.AppSettings
	result := database.DB.First(&appSettings)
	if result.Error != nil {
		return nil
	}
	var settings models.Settings
	json.Unmarshal([]byte(appSettings.Settings), &settings)
	return &settings
}

func (a *App) UpdateSettings(settings models.Settings) error {
	bytes, _ := json.Marshal(settings)

	var appSettings models.AppSettings
	result := database.DB.First(&appSettings)
	if result.Error != nil {
		appSettings = models.AppSettings{
			Settings: string(bytes),
		}
		return database.DB.Create(&appSettings).Error
	}

	appSettings.Settings = string(bytes)
	return database.DB.Save(&appSettings).Error
}

// --- Dashboard ---

func (a *App) GetDashboardMetrics() models.DashboardMetrics {
	var metrics models.DashboardMetrics

	startOfDay := time.Now().Truncate(24 * time.Hour)
	var payments []models.Payment
	database.DB.Where("created_at >= ?", startOfDay).Find(&payments)
	for _, p := range payments {
		metrics.TodayRevenue += p.Amount
	}

	var count int64
	database.DB.Model(&models.Session{}).Where("status = ?", "active").Count(&count)
	metrics.ActiveSessions = int(count)

	database.DB.Model(&models.Customer{}).Where("created_at >= ?", startOfDay).Count(&count)
	metrics.NewCustomersToday = int(count)

	database.DB.Model(&models.Subscription{}).Where("status = ?", "active").Count(&count)
	metrics.ActiveSubscriptions = int(count)

	return metrics
}

func (a *App) SeedDatabase() string {
	var count int64
	database.DB.Model(&models.Customer{}).Count(&count)
	if count > 2 {
		return "Database already has sufficient data"
	}

	// 1. Create Customers
	customers := []models.Customer{
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Ahmed Ali", Phone: "01012345678", HumanID: "C001", CustomerType: "visitor", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Sara Mohamed", Phone: "01123456789", HumanID: "C002", CustomerType: "monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Zeyad Sleem", Phone: "01234567890", HumanID: "C003", CustomerType: "weekly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Omar Khaled", Phone: "01512345678", HumanID: "C004", CustomerType: "visitor", Balance: 5000},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Nour Hassan", Phone: "01098765432", HumanID: "C005", CustomerType: "half-monthly", Balance: 0},
	}
	for _, c := range customers {
		database.DB.Create(&c)
	}

	// 2. Create Resources
	resources := []models.Resource{
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Desk A1", ResourceType: "desk", RatePerHour: 5000, IsAvailable: true}, // 50 EGP
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Desk A2", ResourceType: "desk", RatePerHour: 5000, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Meeting Room 1", ResourceType: "room", RatePerHour: 20000, IsAvailable: true}, // 200 EGP
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Private Office", ResourceType: "room", RatePerHour: 15000, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Shared Seat 1", ResourceType: "seat", RatePerHour: 3000, IsAvailable: true}, // 30 EGP
	}
	for _, r := range resources {
		database.DB.Create(&r)
	}

	// 3. Create Inventory
	inventory := []models.InventoryItem{
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Coffee", Category: "beverage", Price: 3000, Quantity: 50, MinStock: 10},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Tea", Category: "beverage", Price: 2000, Quantity: 100, MinStock: 20},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Water Bottle", Category: "beverage", Price: 1000, Quantity: 40, MinStock: 5},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Cola", Category: "beverage", Price: 2500, Quantity: 30, MinStock: 5},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Chips", Category: "snack", Price: 1500, Quantity: 20, MinStock: 5},
	}
	for _, i := range inventory {
		database.DB.Create(&i)
	}

	// 4. Create Subscriptions
	// Link subscriptions to the created customers (by index, assuming order is preserved or just fetching)
	// We need actual IDs.
	var savedCustomers []models.Customer
	database.DB.Order("created_at asc").Find(&savedCustomers)

	if len(savedCustomers) >= 3 {
		// Sara (Index 1) - Monthly
		sub1 := models.Subscription{
			BaseModel:  models.BaseModel{ID: uuid.NewString()},
			CustomerID: savedCustomers[1].ID,
			PlanType:   "monthly",
			StartDate:  time.Now().AddDate(0, 0, -10), // Started 10 days ago
			EndDate:    time.Now().AddDate(0, 0, 20),
			IsActive:   true,
			Status:     "active",
		}
		database.DB.Create(&sub1)

		// Zeyad (Index 2) - Weekly
		sub2 := models.Subscription{
			BaseModel:  models.BaseModel{ID: uuid.NewString()},
			CustomerID: savedCustomers[2].ID,
			PlanType:   "weekly",
			StartDate:  time.Now().AddDate(0, 0, -2),
			EndDate:    time.Now().AddDate(0, 0, 5),
			IsActive:   true,
			Status:     "active",
		}
		database.DB.Create(&sub2)
	}

	// 5. Create an Active Session
	var savedResources []models.Resource
	database.DB.Find(&savedResources)

	if len(savedCustomers) > 0 && len(savedResources) > 0 {
		// Start a session for Ahmed (Index 0) on Desk A1 (Index 0)
		a.StartSession(savedCustomers[0].ID, savedResources[0].ID)
	}

	return "Seeded successfully with rich data"
}
