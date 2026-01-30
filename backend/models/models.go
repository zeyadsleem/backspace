package models

import (
	"time"

	"gorm.io/gorm"
)

// Base model with standard fields
type BaseModel struct {
	ID        string         `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"createdAt" ts_type:"string"`
	UpdatedAt time.Time      `json:"updatedAt" ts_type:"string"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Customer model
type Customer struct {
	BaseModel
	HumanID       string         `json:"humanId"`
	Name          string         `json:"name"`
	Phone         string         `json:"phone"`
	Email         *string        `json:"email"`
	CustomerType  string         `json:"customerType"` // visitor, weekly, etc.
	Balance       int64          `json:"balance"`      // In piasters
	Notes         *string        `json:"notes"`
	TotalSessions int            `json:"totalSessions"`
	TotalSpent    int64          `json:"totalSpent"` // In piasters
	Subscriptions []Subscription `json:"subscriptions" gorm:"foreignKey:CustomerID"`
	Invoices      []Invoice      `json:"invoices" gorm:"foreignKey:CustomerID"`
}

// Resource model
type Resource struct {
	BaseModel
	Name            string  `json:"name"`
	ResourceType    string  `json:"resourceType"` // seat, room, desk
	RatePerHour     int64   `json:"ratePerHour"`  // In piasters
	IsAvailable     bool    `json:"isAvailable"`
	UtilizationRate float64 `json:"utilizationRate" gorm:"-"` // This remains float as it's a percentage
}

// Subscription model
type Subscription struct {
	BaseModel
	CustomerID    string    `json:"customerId"`
	CustomerName  string    `json:"customerName" gorm:"-"` // Populated manually
	PlanType      string    `json:"planType"`              // weekly, half-monthly, monthly
	StartDate     time.Time `json:"startDate" ts_type:"string"`
	EndDate       time.Time `json:"endDate" ts_type:"string"`
	IsActive      bool      `json:"isActive"`
	Status        string    `json:"status"` // active, expired, inactive
	DaysRemaining int       `json:"daysRemaining" gorm:"-"`
}

// InventoryItem model
type InventoryItem struct {
	BaseModel
	Name     string `json:"name"`
	Category string `json:"category"` // beverage, snack, other
	Price    int64  `json:"price"`    // In piasters
	Quantity int    `json:"quantity"`
	MinStock int    `json:"minStock"`
}

// Session model
type Session struct {
	BaseModel
	CustomerID            string                 `json:"customerId"`
	Customer              Customer               `json:"-"`
	CustomerName          string                 `json:"customerName" gorm:"-"`
	ResourceID            string                 `json:"resourceId"`
	Resource              Resource               `json:"-"`
	ResourceName          string                 `json:"resourceName" gorm:"-"`
	ResourceRate          int64                  `json:"resourceRate"` // In piasters
	StartedAt             time.Time              `json:"startedAt" ts_type:"string"`
	EndedAt               *time.Time             `json:"endedAt" ts_type:"string"`
	IsSubscribed          bool                   `json:"isSubscribed"`
	InventoryConsumptions []InventoryConsumption `json:"inventoryConsumptions" gorm:"foreignKey:SessionID"`
	InventoryTotal        int64                  `json:"inventoryTotal"` // In piasters
	SessionCost           int64                  `json:"sessionCost"`    // In piasters
	TotalAmount           int64                  `json:"totalAmount"`    // In piasters
	DurationMinutes       int                    `json:"durationMinutes" gorm:"-"`
	Status                string                 `json:"status"` // active, completed
}

// InventoryConsumption model (Join table with extras)
type InventoryConsumption struct {
	BaseModel
	SessionID string    `json:"sessionId"`
	ItemID    string    `json:"itemId"` // ID of the InventoryItem
	ItemName  string    `json:"itemName"`
	Quantity  int       `json:"quantity"`
	Price     int64     `json:"price"` // Price at the time of consumption (in piasters)
	AddedAt   time.Time `json:"addedAt" ts_type:"string"`
}

// Invoice model
type Invoice struct {
	BaseModel
	InvoiceNumber string     `json:"invoiceNumber"`
	CustomerID    string     `json:"customerId"`
	Customer      Customer   `json:"-"`
	CustomerName  string     `json:"customerName" gorm:"-"`
	CustomerPhone string     `json:"customerPhone" gorm:"-"`
	SessionID     *string    `json:"sessionId"`
	Amount        int64      `json:"amount"`     // In piasters
	Discount      int64      `json:"discount"`   // In piasters
	Total         int64      `json:"total"`      // In piasters
	PaidAmount    int64      `json:"paidAmount"` // In piasters
	Status        string     `json:"status"`     // paid, unpaid, pending, cancelled
	DueDate       time.Time  `json:"dueDate" ts_type:"string"`
	PaidDate      *time.Time `json:"paidDate" ts_type:"string"`
	LineItems     []LineItem `json:"lineItems" gorm:"foreignKey:InvoiceID"`
	Payments      []Payment  `json:"payments" gorm:"foreignKey:InvoiceID"`
}

// LineItem model
type LineItem struct {
	BaseModel
	InvoiceID   string `json:"invoiceId"`
	Description string `json:"description"`
	Quantity    int    `json:"quantity"`
	Rate        int64  `json:"rate"`   // In piasters
	Amount      int64  `json:"amount"` // In piasters
}

// Payment model
type Payment struct {
	BaseModel
	InvoiceID string    `json:"invoiceId"`
	Amount    int64     `json:"amount"` // In piasters
	Method    string    `json:"method"` // cash, card, transfer
	Date      time.Time `json:"date" ts_type:"string"`
	Notes     string    `json:"notes"`
}

// AppSettings stores the entire settings JSON blob
type AppSettings struct {
	ID       uint   `gorm:"primaryKey"`
	Settings string `json:"settings"` // Stored as JSON string
}

// Settings sub-structs for better Wails binding
type CompanySettings struct {
	Name    string `json:"name"`
	Address string `json:"address"`
	Phone   string `json:"phone"`
	Email   string `json:"email"`
}

type RegionalSettings struct {
	Currency       string `json:"currency"`
	CurrencySymbol string `json:"currencySymbol"`
	Timezone       string `json:"timezone"`
	DateFormat     string `json:"dateFormat"`
}

type TaxSettings struct {
	Enabled bool  `json:"enabled"`
	Rate    int64 `json:"rate"` // Percentage
}

type AppearanceSettings struct {
	Theme    string `json:"theme"`
	Language string `json:"language"`
}

type DiscountSettings struct {
	Enabled bool   `json:"enabled"`
	Value   int64  `json:"value"`
	Label   string `json:"label"`
}

// Settings struct for JSON unmarshaling - matching Frontend
type Settings struct {
	Company    CompanySettings    `json:"company"`
	Regional   RegionalSettings   `json:"regional"`
	Tax        TaxSettings        `json:"tax"`
	Appearance AppearanceSettings `json:"appearance"`
	Discounts  DiscountSettings   `json:"discounts"`
}

// SessionInventoryInput is used for adding items to a session
type SessionInventoryInput struct {
	InventoryID string `json:"inventory_id"`
	Quantity    int    `json:"quantity"`
}

// DashboardMetrics model
type DashboardMetrics struct {
	TodayRevenue        int64 `json:"todayRevenue"`
	ActiveSessions      int   `json:"activeSessions"`
	NewCustomersToday   int   `json:"newCustomersToday"`
	ActiveSubscriptions int   `json:"activeSubscriptions"`
}
