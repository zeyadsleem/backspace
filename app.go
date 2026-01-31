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

// ResetAndSeedDatabase clears all data and creates fresh seed data
func (a *App) ResetAndSeedDatabase() string {
	// Delete all data in correct order to respect foreign keys
	database.DB.Exec("DELETE FROM payments")
	database.DB.Exec("DELETE FROM line_items")
	database.DB.Exec("DELETE FROM invoices")
	database.DB.Exec("DELETE FROM inventory_consumptions")
	database.DB.Exec("DELETE FROM sessions")
	database.DB.Exec("DELETE FROM subscriptions")
	database.DB.Exec("DELETE FROM inventory_items")
	database.DB.Exec("DELETE FROM resources")
	database.DB.Exec("DELETE FROM customers")

	return a.SeedDatabase()
}

func (a *App) SeedDatabase() string {
	// 1. Create 50 Customers
	customers := []models.Customer{
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Ahmed Ali", Phone: "01012345678", HumanID: "C001", CustomerType: "visitor", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Sara Mohamed", Phone: "01123456789", HumanID: "C002", CustomerType: "monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Zeyad Sleem", Phone: "01234567890", HumanID: "C003", CustomerType: "weekly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Omar Khaled", Phone: "01512345678", HumanID: "C004", CustomerType: "visitor", Balance: 5000},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Nour Hassan", Phone: "01098765432", HumanID: "C005", CustomerType: "half-monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Mohamed Ibrahim", Phone: "01011111111", HumanID: "C006", CustomerType: "monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Fatima Ahmed", Phone: "01022222222", HumanID: "C007", CustomerType: "weekly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Ali Hassan", Phone: "01033333333", HumanID: "C008", CustomerType: "visitor", Balance: 2500},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Mariam Khaled", Phone: "01044444444", HumanID: "C009", CustomerType: "half-monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Youssef Omar", Phone: "01055555555", HumanID: "C010", CustomerType: "monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Aya Mahmoud", Phone: "01066666666", HumanID: "C011", CustomerType: "weekly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Karim Mostafa", Phone: "01077777777", HumanID: "C012", CustomerType: "visitor", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Nada Sayed", Phone: "01088888888", HumanID: "C013", CustomerType: "monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Hassan Ali", Phone: "01099999999", HumanID: "C014", CustomerType: "half-monthly", Balance: 1000},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Reem Khaled", Phone: "01100000000", HumanID: "C015", CustomerType: "weekly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Tamer Hosny", Phone: "01111111111", HumanID: "C016", CustomerType: "visitor", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Dina Fouad", Phone: "01122222222", HumanID: "C017", CustomerType: "monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Samir Ghanem", Phone: "01133333333", HumanID: "C018", CustomerType: "half-monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Laila Taher", Phone: "01144444444", HumanID: "C019", CustomerType: "weekly", Balance: 7500},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Ramy Emam", Phone: "01155555555", HumanID: "C020", CustomerType: "visitor", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Sherihan Adel", Phone: "01166666666", HumanID: "C021", CustomerType: "monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Adel Emam", Phone: "01177777777", HumanID: "C022", CustomerType: "half-monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Yasmin Abdulaziz", Phone: "01188888888", HumanID: "C023", CustomerType: "weekly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Ahmed Ezz", Phone: "01199999999", HumanID: "C024", CustomerType: "visitor", Balance: 3200},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Mona Zaki", Phone: "01200000000", HumanID: "C025", CustomerType: "monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Karim Abdelaziz", Phone: "01211111111", HumanID: "C026", CustomerType: "half-monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Hend Sabry", Phone: "01222222222", HumanID: "C027", CustomerType: "weekly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Ahmed Helmy", Phone: "01233333333", HumanID: "C028", CustomerType: "visitor", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Menna Shalaby", Phone: "01244444444", HumanID: "C029", CustomerType: "monthly", Balance: 1500},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Asser Yassin", Phone: "01255555555", HumanID: "C030", CustomerType: "half-monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Ghada Adel", Phone: "01266666666", HumanID: "C031", CustomerType: "weekly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Khaled ElNabawy", Phone: "01277777777", HumanID: "C032", CustomerType: "visitor", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Nelly Karim", Phone: "01288888888", HumanID: "C033", CustomerType: "monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Amr Waked", Phone: "01299999999", HumanID: "C034", CustomerType: "half-monthly", Balance: 2000},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Sawsan Badr", Phone: "01300000000", HumanID: "C035", CustomerType: "weekly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Mahmoud Hemida", Phone: "01311111111", HumanID: "C036", CustomerType: "visitor", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Elham Shahin", Phone: "01322222222", HumanID: "C037", CustomerType: "monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Maged ElKedwany", Phone: "01333333333", HumanID: "C038", CustomerType: "half-monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Donia Samir", Phone: "01344444444", HumanID: "C039", CustomerType: "weekly", Balance: 5000},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Hussein Fahmy", Phone: "01355555555", HumanID: "C040", CustomerType: "visitor", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Mervat Amin", Phone: "01366666666", HumanID: "C041", CustomerType: "monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Nour ElSherif", Phone: "01377777777", HumanID: "C042", CustomerType: "half-monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Poussy Naguib", Phone: "01388888888", HumanID: "C043", CustomerType: "weekly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Ahmed Zaki", Phone: "01399999999", HumanID: "C044", CustomerType: "visitor", Balance: 1800},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Souad Hosny", Phone: "01400000000", HumanID: "C045", CustomerType: "monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Rushdy Abaza", Phone: "01411111111", HumanID: "C046", CustomerType: "half-monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Faten Hamama", Phone: "01422222222", HumanID: "C047", CustomerType: "weekly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Omar Sharif", Phone: "01433333333", HumanID: "C048", CustomerType: "visitor", Balance: 1200},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Anwar Wagdy", Phone: "01444444444", HumanID: "C049", CustomerType: "monthly", Balance: 0},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Leila Fawzi", Phone: "01455555555", HumanID: "C050", CustomerType: "half-monthly", Balance: 0},
	}
	for _, c := range customers {
		database.DB.Create(&c)
	}

	// 2. Create 20 Resources
	resources := []models.Resource{
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Desk A1", ResourceType: "desk", RatePerHour: 5000, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Desk A2", ResourceType: "desk", RatePerHour: 5000, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Desk A3", ResourceType: "desk", RatePerHour: 5000, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Desk B1", ResourceType: "desk", RatePerHour: 6000, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Desk B2", ResourceType: "desk", RatePerHour: 6000, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Desk B3", ResourceType: "desk", RatePerHour: 6000, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Desk C1", ResourceType: "desk", RatePerHour: 5500, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Desk C2", ResourceType: "desk", RatePerHour: 5500, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Meeting Room 1", ResourceType: "room", RatePerHour: 20000, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Meeting Room 2", ResourceType: "room", RatePerHour: 25000, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Meeting Room 3", ResourceType: "room", RatePerHour: 30000, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Private Office 1", ResourceType: "room", RatePerHour: 15000, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Private Office 2", ResourceType: "room", RatePerHour: 15000, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Private Office 3", ResourceType: "room", RatePerHour: 18000, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Shared Seat 1", ResourceType: "seat", RatePerHour: 3000, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Shared Seat 2", ResourceType: "seat", RatePerHour: 3000, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Shared Seat 3", ResourceType: "seat", RatePerHour: 3000, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Shared Seat 4", ResourceType: "seat", RatePerHour: 3500, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Shared Seat 5", ResourceType: "seat", RatePerHour: 3500, IsAvailable: true},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Shared Seat 6", ResourceType: "seat", RatePerHour: 3500, IsAvailable: true},
	}
	for _, r := range resources {
		database.DB.Create(&r)
	}

	// 3. Create 25 Inventory Items
	inventory := []models.InventoryItem{
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Coffee", Category: "beverage", Price: 3000, Quantity: 100, MinStock: 20},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Tea", Category: "beverage", Price: 2000, Quantity: 150, MinStock: 30},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Water Bottle", Category: "beverage", Price: 1000, Quantity: 80, MinStock: 15},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Cola", Category: "beverage", Price: 2500, Quantity: 60, MinStock: 10},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Sprite", Category: "beverage", Price: 2500, Quantity: 50, MinStock: 10},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Fanta", Category: "beverage", Price: 2500, Quantity: 50, MinStock: 10},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Juice Orange", Category: "beverage", Price: 3500, Quantity: 40, MinStock: 8},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Juice Mango", Category: "beverage", Price: 3500, Quantity: 40, MinStock: 8},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Red Bull", Category: "beverage", Price: 5000, Quantity: 30, MinStock: 5},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Chips Lays", Category: "snack", Price: 1500, Quantity: 50, MinStock: 10},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Chips Doritos", Category: "snack", Price: 1500, Quantity: 50, MinStock: 10},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Chocolate KitKat", Category: "snack", Price: 2000, Quantity: 40, MinStock: 8},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Chocolate Snickers", Category: "snack", Price: 2500, Quantity: 40, MinStock: 8},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Biscuits", Category: "snack", Price: 1500, Quantity: 60, MinStock: 12},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Popcorn", Category: "snack", Price: 1000, Quantity: 45, MinStock: 9},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Nuts Mix", Category: "snack", Price: 4000, Quantity: 25, MinStock: 5},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Printer Paper A4", Category: "supplies", Price: 5000, Quantity: 30, MinStock: 5},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Pen Blue", Category: "supplies", Price: 500, Quantity: 100, MinStock: 20},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Pen Black", Category: "supplies", Price: 500, Quantity: 100, MinStock: 20},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Notebook", Category: "supplies", Price: 2500, Quantity: 40, MinStock: 8},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Sticky Notes", Category: "supplies", Price: 1500, Quantity: 35, MinStock: 7},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "USB Flash 16GB", Category: "supplies", Price: 8000, Quantity: 20, MinStock: 4},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Phone Charger", Category: "supplies", Price: 12000, Quantity: 15, MinStock: 3},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "HDMI Cable", Category: "supplies", Price: 15000, Quantity: 10, MinStock: 2},
		{BaseModel: models.BaseModel{ID: uuid.NewString()}, Name: "Mouse Pad", Category: "supplies", Price: 3000, Quantity: 25, MinStock: 5},
	}
	for _, i := range inventory {
		database.DB.Create(&i)
	}

	// 4. Create Subscriptions for 20 customers
	var savedCustomers []models.Customer
	database.DB.Order("created_at asc").Find(&savedCustomers)

	// Create various subscriptions
	subscriptions := []struct {
		customerIdx int
		planType    string
		startDays   int
		duration    int
	}{
		{1, "monthly", -25, 30},
		{2, "weekly", -5, 7},
		{4, "half-monthly", -10, 15},
		{5, "monthly", -20, 30},
		{6, "weekly", -3, 7},
		{8, "monthly", -15, 30},
		{9, "half-monthly", -7, 15},
		{10, "monthly", -30, 30},
		{11, "weekly", -1, 7},
		{13, "monthly", -12, 30},
		{14, "half-monthly", -8, 15},
		{16, "monthly", -5, 30},
		{17, "weekly", -2, 7},
		{19, "monthly", -18, 30},
		{20, "half-monthly", -6, 15},
		{21, "monthly", -22, 30},
		{22, "weekly", -4, 7},
		{24, "monthly", -9, 30},
		{26, "half-monthly", -11, 15},
		{28, "monthly", -14, 30},
	}

	for _, sub := range subscriptions {
		if sub.customerIdx < len(savedCustomers) {
			startDate := time.Now().AddDate(0, 0, sub.startDays)
			endDate := startDate.AddDate(0, 0, sub.duration)
			subscription := models.Subscription{
				BaseModel:  models.BaseModel{ID: uuid.NewString()},
				CustomerID: savedCustomers[sub.customerIdx].ID,
				PlanType:   sub.planType,
				StartDate:  startDate,
				EndDate:    endDate,
				IsActive:   true,
				Status:     "active",
			}
			database.DB.Create(&subscription)
		}
	}

	// 5. Create 5 Active Sessions
	var savedResources []models.Resource
	database.DB.Find(&savedResources)

	activeSessionIndices := []int{0, 3, 6, 12, 15}
	for i, sessionIdx := range activeSessionIndices {
		if i < len(savedCustomers) && sessionIdx < len(savedResources) {
			a.StartSession(savedCustomers[i].ID, savedResources[sessionIdx].ID)
		}
	}

	return fmt.Sprintf("Seeded successfully with %d customers, %d resources, %d inventory items, 20 subscriptions, 5 active sessions",
		len(customers), len(resources), len(inventory))
}
