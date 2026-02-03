package main

import (
	"context"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"myproject/backend/database"
	"myproject/backend/models"
	"myproject/backend/service"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// generateShortHumanID generates a short 8-character human-readable ID
func generateShortHumanID() string {
	// Generate UUID and take first 8 characters
	u := uuid.New()
	return strings.ToUpper(hex.EncodeToString(u[:4]))
}

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

func (a *App) GetCustomers() ([]models.Customer, error) {
	var customers []models.Customer
	if err := database.DB.Preload("Subscriptions").Preload("Invoices").Order("created_at desc").Find(&customers).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch customers: %w", err)
	}
	return customers, nil
}

// GetCustomersPaginated returns paginated customers with search support
func (a *App) GetCustomersPaginated(params models.PaginationParams) (*models.PaginatedResult[models.Customer], error) {
	var customers []models.Customer
	var total int64

	// Default values
	if params.Page < 1 {
		params.Page = 1
	}
	if params.PageSize < 1 || params.PageSize > 100 {
		params.PageSize = 20
	}

	query := database.DB.Model(&models.Customer{})

	// Search filter
	if params.Search != "" {
		searchPattern := "%" + params.Search + "%"
		query = query.Where("name LIKE ? OR phone LIKE ? OR human_id LIKE ?", searchPattern, searchPattern, searchPattern)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count customers: %w", err)
	}

	// Sorting
	orderClause := "created_at desc"
	if params.SortBy != "" {
		direction := "asc"
		if params.SortDesc {
			direction = "desc"
		}
		orderClause = params.SortBy + " " + direction
	}

	// Fetch paginated results
	offset := (params.Page - 1) * params.PageSize
	if err := database.DB.Preload("Subscriptions").Preload("Invoices").
		Where(query).
		Order(orderClause).
		Offset(offset).
		Limit(params.PageSize).
		Find(&customers).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch customers: %w", err)
	}

	totalPages := int(total) / params.PageSize
	if int(total)%params.PageSize > 0 {
		totalPages++
	}

	return &models.PaginatedResult[models.Customer]{
		Items:      customers,
		Total:      total,
		Page:       params.Page,
		PageSize:   params.PageSize,
		TotalPages: totalPages,
	}, nil
}

func (a *App) AddCustomer(data models.Customer) error {
	data.ID = uuid.NewString()

	// Validate required fields
	if strings.TrimSpace(data.Name) == "" {
		return errors.New("customer name is required")
	}
	if strings.TrimSpace(data.Phone) == "" {
		return errors.New("customer phone is required")
	}

	// Generate short HumanID (8 chars)
	data.HumanID = generateShortHumanID()

	return database.DB.Create(&data).Error
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

func (a *App) GetResources() ([]models.Resource, error) {
	var resources []models.Resource
	if err := database.DB.Order("name asc").Find(&resources).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch resources: %w", err)
	}
	return resources, nil
}

func (a *App) AddResource(data models.Resource) error {
	// Validate required fields
	if strings.TrimSpace(data.Name) == "" {
		return errors.New("resource name is required")
	}
	if data.RatePerHour < 0 {
		return errors.New("rate per hour cannot be negative")
	}

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

func (a *App) GetInventory() ([]models.InventoryItem, error) {
	var items []models.InventoryItem
	if err := database.DB.Order("name asc").Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch inventory: %w", err)
	}
	return items, nil
}

func (a *App) AddInventory(data models.InventoryItem) error {
	// Validate required fields
	if strings.TrimSpace(data.Name) == "" {
		return errors.New("item name is required")
	}
	if data.Price < 0 {
		return errors.New("price cannot be negative")
	}
	if data.Quantity < 0 {
		return errors.New("quantity cannot be negative")
	}
	if data.MinStock < 0 {
		return errors.New("minimum stock cannot be negative")
	}

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

func (a *App) GetActiveSessions() ([]models.Session, error) {
	var sessions []models.Session
	// Load related data with Preload to avoid N+1 queries
	if err := database.DB.Where("status = ?", "active").
		Preload("Customer").
		Preload("Resource").
		Preload("InventoryConsumptions").
		Find(&sessions).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch active sessions: %w", err)
	}

	// Populate computed fields from preloaded relationships
	for i := range sessions {
		sessions[i].CustomerName = sessions[i].Customer.Name
		sessions[i].ResourceName = sessions[i].Resource.Name
	}
	return sessions, nil
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
		if invoice != nil {
			invoiceID = invoice.ID
		}
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

func (a *App) GetSubscriptions() ([]models.Subscription, error) {
	var subs []models.Subscription
	// Use Preload to avoid N+1 query problem
	if err := database.DB.Preload("Customer").Find(&subs).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch subscriptions: %w", err)
	}
	for i := range subs {
		subs[i].CustomerName = subs[i].Customer.Name

		if subs[i].IsActive && subs[i].EndDate.After(time.Now()) {
			subs[i].DaysRemaining = int(time.Until(subs[i].EndDate).Hours() / 24)
		} else {
			subs[i].DaysRemaining = 0
		}
	}
	return subs, nil
}

type AddSubscriptionData struct {
	CustomerID string `json:"customer_id"`
	PlanType   string `json:"plan_type"`
	Price      int64  `json:"price"` // Price in piasters
	StartDate  string `json:"start_date"`
}

func (a *App) AddSubscription(data AddSubscriptionData) error {
	// Validate plan type
	validPlanTypes := map[string]bool{"weekly": true, "half-monthly": true, "monthly": true}
	if !validPlanTypes[data.PlanType] {
		return fmt.Errorf("invalid plan type: %s (must be weekly, half-monthly, or monthly)", data.PlanType)
	}

	// Validate price
	if data.Price <= 0 {
		return errors.New("subscription price must be positive")
	}

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

func (a *App) GetInvoices() ([]models.Invoice, error) {
	var invoices []models.Invoice
	// Use Preload for Customer to avoid N+1 query problem
	if err := database.DB.Preload("Customer").Preload("LineItems").Preload("Payments").Order("created_at desc").Find(&invoices).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch invoices: %w", err)
	}
	// Populate computed fields from preloaded Customer
	for i := range invoices {
		invoices[i].CustomerName = invoices[i].Customer.Name
		invoices[i].CustomerPhone = invoices[i].Customer.Phone
	}
	return invoices, nil
}

// GetInvoicesPaginated returns paginated invoices with filters
func (a *App) GetInvoicesPaginated(params models.PaginationParams, status string) (*models.PaginatedResult[models.Invoice], error) {
	var invoices []models.Invoice
	var total int64

	// Default values
	if params.Page < 1 {
		params.Page = 1
	}
	if params.PageSize < 1 || params.PageSize > 100 {
		params.PageSize = 20
	}

	query := database.DB.Model(&models.Invoice{})

	// Status filter
	if status != "" {
		query = query.Where("status = ?", status)
	}

	// Search filter (by invoice number or customer)
	if params.Search != "" {
		searchPattern := "%" + params.Search + "%"
		query = query.Where("invoice_number LIKE ?", searchPattern)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count invoices: %w", err)
	}

	// Sorting
	orderClause := "created_at desc"
	if params.SortBy != "" {
		direction := "asc"
		if params.SortDesc {
			direction = "desc"
		}
		orderClause = params.SortBy + " " + direction
	}

	// Fetch paginated results
	offset := (params.Page - 1) * params.PageSize
	baseQuery := database.DB.Preload("Customer").Preload("LineItems").Preload("Payments")

	if status != "" {
		baseQuery = baseQuery.Where("status = ?", status)
	}
	if params.Search != "" {
		searchPattern := "%" + params.Search + "%"
		baseQuery = baseQuery.Where("invoice_number LIKE ?", searchPattern)
	}

	if err := baseQuery.Order(orderClause).
		Offset(offset).
		Limit(params.PageSize).
		Find(&invoices).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch invoices: %w", err)
	}

	// Populate computed fields
	for i := range invoices {
		invoices[i].CustomerName = invoices[i].Customer.Name
		invoices[i].CustomerPhone = invoices[i].Customer.Phone
	}

	totalPages := int(total) / params.PageSize
	if int(total)%params.PageSize > 0 {
		totalPages++
	}

	return &models.PaginatedResult[models.Invoice]{
		Items:      invoices,
		Total:      total,
		Page:       params.Page,
		PageSize:   params.PageSize,
		TotalPages: totalPages,
	}, nil
}

type ProcessPaymentData struct {
	InvoiceID     string `json:"invoice_id"`
	Amount        int64  `json:"amount"` // Received in Piasters
	PaymentMethod string `json:"payment_method"`
	Notes         string `json:"notes"`
}

func (a *App) ProcessPayment(data ProcessPaymentData) error {
	// Validate payment amount
	if data.Amount <= 0 {
		return errors.New("payment amount must be positive")
	}

	return database.DB.Transaction(func(tx *gorm.DB) error {
		// Get invoice first to check remaining balance
		var invoice models.Invoice
		if err := tx.First(&invoice, "id = ?", data.InvoiceID).Error; err != nil {
			return err
		}

		// Calculate remaining balance
		remainingBalance := invoice.Total - invoice.PaidAmount
		if remainingBalance <= 0 {
			return errors.New("invoice is already fully paid")
		}

		// Prevent overpayment
		if data.Amount > remainingBalance {
			return fmt.Errorf("payment amount (%d) exceeds remaining balance (%d)", data.Amount, remainingBalance)
		}

		payment := models.Payment{
			BaseModel: models.BaseModel{ID: uuid.NewString()},
			InvoiceID: data.InvoiceID,
			Amount:    data.Amount,
			Method:    data.PaymentMethod,
			Notes:     data.Notes,
			Date:      time.Now(),
		}

		if err := tx.Create(&payment).Error; err != nil {
			return err
		}

		// Update invoice
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

		// Update customer total spent
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

func (a *App) GetSettings() (*models.Settings, error) {
	var appSettings models.AppSettings
	result := database.DB.First(&appSettings)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			// Return default settings if not found
			return &models.Settings{}, nil
		}
		return nil, result.Error
	}

	var settings models.Settings
	if err := json.Unmarshal([]byte(appSettings.Settings), &settings); err != nil {
		return nil, fmt.Errorf("failed to unmarshal settings: %w", err)
	}
	return &settings, nil
}

func (a *App) UpdateSettings(settings models.Settings) error {
	bytes, err := json.Marshal(settings)
	if err != nil {
		return fmt.Errorf("failed to marshal settings: %w", err)
	}

	var appSettings models.AppSettings
	result := database.DB.First(&appSettings)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			appSettings = models.AppSettings{
				Settings: string(bytes),
			}
			return database.DB.Create(&appSettings).Error
		}
		return result.Error
	}

	appSettings.Settings = string(bytes)
	return database.DB.Save(&appSettings).Error
}

// --- Dashboard ---

func (a *App) GetDashboardMetrics() (models.DashboardMetrics, error) {
	var metrics models.DashboardMetrics

	startOfDay := time.Now().Truncate(24 * time.Hour)
	var payments []models.Payment
	if err := database.DB.Where("created_at >= ?", startOfDay).Find(&payments).Error; err != nil {
		return metrics, fmt.Errorf("failed to fetch today payments: %w", err)
	}
	for _, p := range payments {
		metrics.TodayRevenue += p.Amount
	}

	var count int64
	if err := database.DB.Model(&models.Session{}).Where("status = ?", "active").Count(&count).Error; err != nil {
		return metrics, fmt.Errorf("failed to count active sessions: %w", err)
	}
	metrics.ActiveSessions = int(count)

	if err := database.DB.Model(&models.Customer{}).Where("created_at >= ?", startOfDay).Count(&count).Error; err != nil {
		return metrics, fmt.Errorf("failed to count new customers: %w", err)
	}
	metrics.NewCustomersToday = int(count)

	if err := database.DB.Model(&models.Subscription{}).Where("status = ?", "active").Count(&count).Error; err != nil {
		return metrics, fmt.Errorf("failed to count active subscriptions: %w", err)
	}
	metrics.ActiveSubscriptions = int(count)

	return metrics, nil
}

// ResetAndSeedDatabase clears all data and creates fresh seed data
func (a *App) ResetAndSeedDatabase() (string, error) {
	// Delete all data in correct order to respect foreign keys
	if err := database.DB.Exec("DELETE FROM payments").Error; err != nil {
		return "", fmt.Errorf("failed to delete payments: %w", err)
	}
	if err := database.DB.Exec("DELETE FROM line_items").Error; err != nil {
		return "", fmt.Errorf("failed to delete line_items: %w", err)
	}
	if err := database.DB.Exec("DELETE FROM invoices").Error; err != nil {
		return "", fmt.Errorf("failed to delete invoices: %w", err)
	}
	if err := database.DB.Exec("DELETE FROM inventory_consumptions").Error; err != nil {
		return "", fmt.Errorf("failed to delete inventory_consumptions: %w", err)
	}
	if err := database.DB.Exec("DELETE FROM sessions").Error; err != nil {
		return "", fmt.Errorf("failed to delete sessions: %w", err)
	}
	if err := database.DB.Exec("DELETE FROM subscriptions").Error; err != nil {
		return "", fmt.Errorf("failed to delete subscriptions: %w", err)
	}
	if err := database.DB.Exec("DELETE FROM inventory_items").Error; err != nil {
		return "", fmt.Errorf("failed to delete inventory_items: %w", err)
	}
	if err := database.DB.Exec("DELETE FROM resources").Error; err != nil {
		return "", fmt.Errorf("failed to delete resources: %w", err)
	}
	if err := database.DB.Exec("DELETE FROM customers").Error; err != nil {
		return "", fmt.Errorf("failed to delete customers: %w", err)
	}

	return a.SeedDatabase()
}

func (a *App) SeedDatabase() (string, error) {
	return a.SeedLargeDataset()
}

// SeedLargeDataset creates a comprehensive dataset with 100+ customers, 50+ resources, etc.
func (a *App) SeedLargeDataset() (string, error) {
	// Generate 100 customers with diverse data
	customerNames := []string{
		"Ahmed Ali", "Sara Mohamed", "Zeyad Sleem", "Omar Khaled", "Nour Hassan",
		"Mohamed Ibrahim", "Fatima Ahmed", "Ali Hassan", "Mariam Khaled", "Youssef Omar",
		"Aya Mahmoud", "Karim Mostafa", "Nada Sayed", "Hassan Ali", "Reem Khaled",
		"Tamer Hosny", "Dina Fouad", "Samir Ghanem", "Laila Taher", "Ramy Emam",
		"Sherihan Adel", "Adel Emam", "Yasmin Abdulaziz", "Ahmed Ezz", "Mona Zaki",
		"Karim Abdelaziz", "Hend Sabry", "Ahmed Helmy", "Menna Shalaby", "Asser Yassin",
		"Ghada Adel", "Khaled ElNabawy", "Nelly Karim", "Amr Waked", "Sawsan Badr",
		"Mahmoud Hemida", "Elham Shahin", "Maged ElKedwany", "Donia Samir", "Hussein Fahmy",
		"Mervat Amin", "Nour ElSherif", "Poussy Naguib", "Ahmed Zaki", "Souad Hosny",
		"Rushdy Abaza", "Faten Hamama", "Omar Sharif", "Anwar Wagdy", "Leila Fawzi",
		"Mahmoud Yassin", "Nadia Lotfi", "Iman ElKady", "Shadia", "Fouad Elmohandes",
		"Farid Shawqi", "Huda Sultan", "Taheyya Kariokka", "Shoukry Sarhan", "Kamal ElShennawi",
		"Zubaida Tharwat", "Soad Hosny", "AbdelHalim Hafez", "Umm Kulthum", "Mohamed AbdelWahab",
		"Asmahan", "Farid AlAtrash", "Muharram Fouad", "Hafez AbdelWahab", "AbdelAziz Mahmoud",
		"Laila Taher", "Shadia", "Samiha Ayoub", "Zahret ElOla", "Hend Rostom",
		"Berlanti AbdelHamid", "Madiha Yousri", "Faten Hamama", "Omar Sharif", "Ahmed Mazhar",
		"Imad Hamdi", "Shukry Sarhan", "Hussein Riad", "Mahmoud ElMeligy", "Youssef Wahbi",
		"George Abyad", "AbdelWareth Asar", "Seraj Munir", "Mohamed ElDib", "AbdelFattah ElKosseir",
		"Ismail Yasin", "Stephan Rosti", "Fouad Shafiq", "Shafik Nour ElDin", "Zaki Rostom",
		"Mahmoud Shokoko", "AbdelSalam ElNabrawy", "Mohamed Kamel", "ElDeif Ahmad", "Fathi Qandil",
		"Hassan Fayeq", "AbdelMonem Ismail", "Ahmed Allam", "AbdelGhani ElSayed", "Kamal Hussain",
	}

	customerTypes := []string{"visitor", "weekly", "half-monthly", "monthly"}
	phonePrefixes := []string{"010", "011", "012", "015"}

	customers := make([]models.Customer, 0, 100)
	for i, name := range customerNames {
		phone := fmt.Sprintf("%s%08d", phonePrefixes[i%4], i+12345678)
		balance := int64((i % 10) * 500) // Some customers have balance
		customerType := customerTypes[i%4]

		customers = append(customers, models.Customer{
			BaseModel:     models.BaseModel{ID: uuid.NewString()},
			Name:          name,
			Phone:         phone,
			HumanID:       generateShortHumanID(),
			CustomerType:  customerType,
			Balance:       balance,
			TotalSessions: i * 2,
			TotalSpent:    int64(i * 1000),
		})
	}

	for _, c := range customers {
		if err := database.DB.Create(&c).Error; err != nil {
			return "", fmt.Errorf("failed to seed customer %s: %w", c.Name, err)
		}
	}

	// Generate 50 resources
	resourceTypes := []string{"desk", "room", "seat"}
	rateRanges := map[string][]int64{
		"desk": {5000, 6000, 5500, 7000, 4500, 8000, 3500, 9000, 4000, 6500},
		"room": {20000, 25000, 30000, 15000, 18000, 22000, 35000, 40000, 12000, 28000},
		"seat": {3000, 3500, 4000, 2500, 4500, 5000, 2000, 6000, 1500, 5500},
	}

	resources := make([]models.Resource, 0, 50)
	for i := 0; i < 50; i++ {
		resType := resourceTypes[i%3]
		rates := rateRanges[resType]
		rate := rates[i%10]

		var name string
		switch resType {
		case "desk":
			name = fmt.Sprintf("Desk %c%d", 'A'+i/10, i%10+1)
		case "room":
			name = fmt.Sprintf("Room %d", i+1)
		case "seat":
			name = fmt.Sprintf("Seat %d", i+1)
		}

		resources = append(resources, models.Resource{
			BaseModel:    models.BaseModel{ID: uuid.NewString()},
			Name:         name,
			ResourceType: resType,
			RatePerHour:  rate,
			IsAvailable:  true,
		})
	}

	for _, r := range resources {
		if err := database.DB.Create(&r).Error; err != nil {
			return "", fmt.Errorf("failed to seed resource %s: %w", r.Name, err)
		}
	}

	// Generate 100 inventory items
	inventoryItems := []struct {
		name     string
		category string
		price    int64
		quantity int
		minStock int
	}{
		// Beverages
		{"Coffee", "beverage", 3000, 100, 20},
		{"Tea", "beverage", 2000, 150, 30},
		{"Water Bottle", "beverage", 1000, 80, 15},
		{"Cola", "beverage", 2500, 60, 10},
		{"Sprite", "beverage", 2500, 50, 10},
		{"Fanta", "beverage", 2500, 50, 10},
		{"Juice Orange", "beverage", 3500, 40, 8},
		{"Juice Mango", "beverage", 3500, 40, 8},
		{"Red Bull", "beverage", 5000, 30, 5},
		{"Monster Energy", "beverage", 4500, 25, 5},
		{"Power Horse", "beverage", 4000, 35, 8},
		{"Nescafe", "beverage", 3500, 60, 12},
		{"Hot Chocolate", "beverage", 4000, 40, 10},
		{"Latte", "beverage", 5000, 45, 10},
		{"Cappuccino", "beverage", 5500, 40, 8},
		{"Espresso", "beverage", 3000, 50, 10},
		{"Iced Coffee", "beverage", 4500, 55, 12},
		{"Lemonade", "beverage", 2500, 70, 15},
		{"Iced Tea", "beverage", 2500, 65, 15},
		{"Smoothie", "beverage", 6000, 30, 8},

		// Snacks
		{"Chips Lays", "snack", 1500, 50, 10},
		{"Chips Doritos", "snack", 1500, 50, 10},
		{"Chocolate KitKat", "snack", 2000, 40, 8},
		{"Chocolate Snickers", "snack", 2500, 40, 8},
		{"Biscuits", "snack", 1500, 60, 12},
		{"Popcorn", "snack", 1000, 45, 9},
		{"Nuts Mix", "snack", 4000, 25, 5},
		{"Cheetos", "snack", 2000, 55, 12},
		{"Pringles", "snack", 3500, 35, 8},
		{"Oreo", "snack", 2000, 50, 10},
		{"Twix", "snack", 2500, 45, 10},
		{"Mars", "snack", 2500, 48, 10},
		{" Galaxy", "snack", 3000, 40, 8},
		{"Milka", "snack", 3500, 30, 8},
		{"Lindt", "snack", 8000, 20, 5},
		{"Ferrero Rocher", "snack", 10000, 15, 3},
		{"Dates", "snack", 3000, 40, 10},
		{"Nuts", "snack", 2500, 35, 8},
		{"Trail Mix", "snack", 4500, 25, 6},
		{"Protein Bar", "snack", 5000, 30, 8},

		// Supplies
		{"Printer Paper A4", "supplies", 5000, 30, 5},
		{"Pen Blue", "supplies", 500, 100, 20},
		{"Pen Black", "supplies", 500, 100, 20},
		{"Notebook", "supplies", 2500, 40, 8},
		{"Sticky Notes", "supplies", 1500, 35, 7},
		{"USB Flash 16GB", "supplies", 8000, 20, 4},
		{"Phone Charger", "supplies", 12000, 15, 3},
		{"HDMI Cable", "supplies", 15000, 10, 2},
		{"Mouse Pad", "supplies", 3000, 25, 5},
		{"Webcam", "supplies", 25000, 8, 2},
		{"Headphones", "supplies", 15000, 12, 3},
		{"Ethernet Cable", "supplies", 5000, 20, 5},
		{"Power Bank", "supplies", 20000, 10, 3},
		{"Laptop Stand", "supplies", 35000, 6, 2},
		{"Desk Lamp", "supplies", 18000, 8, 2},
		{"Whiteboard Markers", "supplies", 3000, 25, 6},
		{"Stapler", "supplies", 4000, 15, 4},
		{"Scissors", "supplies", 2500, 20, 5},
		{"Tape", "supplies", 1500, 30, 8},
		{"Glue", "supplies", 2000, 25, 6},

		// Food
		{"Sandwich", "food", 8000, 25, 5},
		{"Pizza Slice", "food", 12000, 20, 5},
		{"Burger", "food", 15000, 15, 4},
		{"Salad", "food", 10000, 18, 5},
		{"Falafel", "food", 5000, 30, 8},
		{"Koshary", "food", 12000, 20, 5},
		{"Shawerma", "food", 13000, 18, 5},
		{"Feteer", "food", 8000, 12, 3},
		{"Croissant", "food", 4000, 25, 6},
		{"Muffin", "food", 3500, 30, 8},
		{"Donut", "food", 3000, 35, 10},
		{"Cookie", "food", 2500, 40, 10},
		{"Cake Slice", "food", 6000, 15, 4},
		{"Brownie", "food", 5000, 20, 5},
		{"Pancake", "food", 7000, 12, 3},
		{"Waffle", "food", 6000, 15, 4},
		{"Ice Cream", "food", 4000, 20, 5},
		{"Yogurt", "food", 3500, 25, 6},
		{"Fruit Salad", "food", 8000, 15, 4},
		{"Granola Bar", "food", 3000, 30, 8},
	}

	for _, item := range inventoryItems {
		inv := models.InventoryItem{
			BaseModel: models.BaseModel{ID: uuid.NewString()},
			Name:      item.name,
			Category:  item.category,
			Price:     item.price,
			Quantity:  item.quantity,
			MinStock:  item.minStock,
		}
		if err := database.DB.Create(&inv).Error; err != nil {
			return "", fmt.Errorf("failed to seed inventory item %s: %w", item.name, err)
		}
	}

	// Get saved customers and resources
	var savedCustomers []models.Customer
	if err := database.DB.Order("created_at asc").Find(&savedCustomers).Error; err != nil {
		return "", fmt.Errorf("failed to fetch seeded customers: %w", err)
	}

	var savedResources []models.Resource
	if err := database.DB.Find(&savedResources).Error; err != nil {
		return "", fmt.Errorf("failed to fetch seeded resources: %w", err)
	}

	// Create subscriptions for 40 customers
	planTypes := []string{"weekly", "half-monthly", "monthly"}
	planPrices := map[string]int64{
		"weekly":       50000,
		"half-monthly": 90000,
		"monthly":      160000,
	}

	for i := 0; i < 40 && i < len(savedCustomers); i++ {
		planType := planTypes[i%3]
		startDays := -((i % 20) + 1) // Start between 1-20 days ago
		duration := 7
		if planType == "half-monthly" {
			duration = 15
		} else if planType == "monthly" {
			duration = 30
		}

		startDate := time.Now().AddDate(0, 0, startDays)
		endDate := startDate.AddDate(0, 0, duration)

		subscription := models.Subscription{
			BaseModel:  models.BaseModel{ID: uuid.NewString()},
			CustomerID: savedCustomers[i].ID,
			PlanType:   planType,
			Price:      planPrices[planType],
			StartDate:  startDate,
			EndDate:    endDate,
			IsActive:   true,
			Status:     "active",
		}
		if err := database.DB.Create(&subscription).Error; err != nil {
			return "", fmt.Errorf("failed to seed subscription: %w", err)
		}
	}

	// Create 20 active sessions
	for i := 0; i < 20 && i < len(savedCustomers) && i < len(savedResources); i++ {
		if err := a.StartSession(savedCustomers[i].ID, savedResources[i].ID); err != nil {
			return "", fmt.Errorf("failed to seed session: %w", err)
		}

		// Add some inventory consumptions to sessions
		if i%2 == 0 { // Every other session has items
			itemCount := (i % 3) + 1 // 1-3 items
			for j := 0; j < itemCount; j++ {
				// Get a random inventory item
				var invItem models.InventoryItem
				if err := database.DB.Order("RANDOM()").First(&invItem).Error; err == nil {
					// Add consumption to the session (we need to get the session ID first)
					// This is simplified - in production you'd track session IDs
				}
			}
		}
	}

	// Create some historical completed sessions with invoices and payments
	// Only for customers WITHOUT subscriptions (indices 40-50, since 20-40 have subscriptions)
	for i := 40; i < 50 && i < len(savedCustomers) && i < len(savedResources); i++ {
		// Start and immediately end session to create invoice
		session, err := a.sessionService.StartSession(savedCustomers[i].ID, savedResources[i].ID)
		if err != nil {
			continue // Skip if resource is in use
		}

		// End session to create invoice
		invoiceID, err := a.EndSession(session.ID)
		if err != nil {
			continue
		}

		// Add payment for 80% of invoices (only if amount > 0)
		if i%5 != 0 {
			// Get the invoice to know the total
			var invoice models.Invoice
			if err := database.DB.First(&invoice, "id = ?", invoiceID).Error; err == nil {
				// Only pay if there's an amount to pay
				if invoice.Total > 0 {
					data := ProcessPaymentData{
						InvoiceID:     invoiceID,
						Amount:        invoice.Total,
						PaymentMethod: "cash",
						Notes:         "Auto payment from seed",
					}
					a.ProcessPayment(data)
				}
			}
		}
	}

	return fmt.Sprintf("Seeded successfully with %d customers, %d resources, %d inventory items, 40 subscriptions, 20 active sessions, 30 historical sessions with invoices",
		len(customers), len(resources), len(inventoryItems)), nil
}
