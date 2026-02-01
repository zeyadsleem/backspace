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
	HumanID       string         `json:"humanId" gorm:"uniqueIndex;not null"`
	Name          string         `json:"name" gorm:"not null"`
	Phone         string         `json:"phone" gorm:"not null"`
	Email         *string        `json:"email"`
	CustomerType  string         `json:"customerType" gorm:"not null;default:'visitor'"`       // visitor, weekly, etc.
	Balance       int64          `json:"balance" gorm:"not null;default:0;check:balance >= 0"` // In piasters
	Notes         *string        `json:"notes"`
	TotalSessions int            `json:"totalSessions" gorm:"not null;default:0;check:total_sessions >= 0"`
	TotalSpent    int64          `json:"totalSpent" gorm:"not null;default:0;check:total_spent >= 0"` // In piasters
	Subscriptions []Subscription `json:"subscriptions" gorm:"foreignKey:CustomerID"`
	Invoices      []Invoice      `json:"invoices" gorm:"foreignKey:CustomerID"`
}

// Resource model
type Resource struct {
	BaseModel
	Name            string  `json:"name" gorm:"not null"`
	ResourceType    string  `json:"resourceType" gorm:"not null"`                         // seat, room, desk
	RatePerHour     int64   `json:"ratePerHour" gorm:"not null;check:rate_per_hour >= 0"` // In piasters
	IsAvailable     bool    `json:"isAvailable" gorm:"not null;default:true"`
	UtilizationRate float64 `json:"utilizationRate" gorm:"-"` // This remains float as it's a percentage
}

// Subscription model
type Subscription struct {
	BaseModel
	CustomerID    string    `json:"customerId" gorm:"not null;index"`
	CustomerName  string    `json:"customerName" gorm:"-"`                                                             // Populated manually
	PlanType      string    `json:"planType" gorm:"not null;check:plan_type IN ('weekly', 'half-monthly', 'monthly')"` // weekly, half-monthly, monthly
	Price         int64     `json:"price" gorm:"not null;check:price >= 0"`                                            // Price at the time of subscription (in piasters)
	StartDate     time.Time `json:"startDate" ts_type:"string" gorm:"not null"`
	EndDate       time.Time `json:"endDate" ts_type:"string" gorm:"not null"`
	IsActive      bool      `json:"isActive" gorm:"not null;default:false"`
	Status        string    `json:"status" gorm:"not null;default:'inactive';check:status IN ('active', 'expired', 'inactive')"` // active, expired, inactive
	InvoiceID     *string   `json:"invoiceId"`
	DaysRemaining int       `json:"daysRemaining" gorm:"-"`
}

// InventoryItem model
type InventoryItem struct {
	BaseModel
	Name     string `json:"name" gorm:"not null"`
	Category string `json:"category" gorm:"not null"`               // beverage, snack, other
	Price    int64  `json:"price" gorm:"not null;check:price >= 0"` // In piasters
	Quantity int    `json:"quantity" gorm:"not null;default:0;check:quantity >= 0"`
	MinStock int    `json:"minStock" gorm:"not null;default:0;check:min_stock >= 0"`
}

// Session model
type Session struct {
	BaseModel
	CustomerID            string                 `json:"customerId" gorm:"not null;index"`
	Customer              Customer               `json:"-"`
	CustomerName          string                 `json:"customerName" gorm:"-"`
	ResourceID            string                 `json:"resourceId" gorm:"not null;index"`
	Resource              Resource               `json:"-"`
	ResourceName          string                 `json:"resourceName" gorm:"-"`
	ResourceRate          int64                  `json:"resourceRate" gorm:"not null;default:0;check:resource_rate >= 0"` // In piasters
	StartedAt             time.Time              `json:"startedAt" ts_type:"string" gorm:"not null"`
	EndedAt               *time.Time             `json:"endedAt" ts_type:"string"`
	IsSubscribed          bool                   `json:"isSubscribed" gorm:"not null;default:false"`
	InventoryConsumptions []InventoryConsumption `json:"inventoryConsumptions" gorm:"foreignKey:SessionID"`
	InventoryTotal        int64                  `json:"inventoryTotal" gorm:"not null;default:0;check:inventory_total >= 0"` // In piasters
	SessionCost           int64                  `json:"sessionCost" gorm:"not null;default:0;check:session_cost >= 0"`       // In piasters
	TotalAmount           int64                  `json:"totalAmount" gorm:"not null;default:0;check:total_amount >= 0"`       // In piasters
	DurationMinutes       int                    `json:"durationMinutes" gorm:"-"`
	Status                string                 `json:"status" gorm:"not null;default:'active';check:status IN ('active', 'completed')"` // active, completed
}

// InventoryConsumption model (Join table with extras)
type InventoryConsumption struct {
	BaseModel
	SessionID string    `json:"sessionId" gorm:"not null;index"`
	ItemID    string    `json:"itemId" gorm:"not null;index"` // ID of the InventoryItem
	ItemName  string    `json:"itemName" gorm:"not null"`
	Quantity  int       `json:"quantity" gorm:"not null;check:quantity > 0"`
	Price     int64     `json:"price" gorm:"not null;check:price >= 0"` // Price at the time of consumption (in piasters)
	AddedAt   time.Time `json:"addedAt" ts_type:"string" gorm:"not null"`
}

// Invoice model
type Invoice struct {
	BaseModel
	InvoiceNumber string     `json:"invoiceNumber" gorm:"uniqueIndex"`
	CustomerID    string     `json:"customerId" gorm:"not null;index"`
	Customer      Customer   `json:"-"`
	CustomerName  string     `json:"customerName" gorm:"-"`
	CustomerPhone string     `json:"customerPhone" gorm:"-"`
	SessionID     *string    `json:"sessionId"`
	Amount        int64      `json:"amount" gorm:"not null;default:0;check:amount >= 0"`                                                 // In piasters
	Discount      int64      `json:"discount" gorm:"not null;default:0;check:discount >= 0"`                                             // In piasters
	Total         int64      `json:"total" gorm:"not null;default:0;check:total >= 0"`                                                   // In piasters
	PaidAmount    int64      `json:"paidAmount" gorm:"not null;default:0;check:paid_amount >= 0"`                                        // In piasters
	Status        string     `json:"status" gorm:"not null;default:'unpaid';check:status IN ('paid', 'unpaid', 'pending', 'cancelled')"` // paid, unpaid, pending, cancelled
	DueDate       time.Time  `json:"dueDate" ts_type:"string" gorm:"not null"`
	PaidDate      *time.Time `json:"paidDate" ts_type:"string"`
	LineItems     []LineItem `json:"lineItems" gorm:"foreignKey:InvoiceID"`
	Payments      []Payment  `json:"payments" gorm:"foreignKey:InvoiceID"`
}

// LineItem model
type LineItem struct {
	BaseModel
	InvoiceID   string `json:"invoiceId" gorm:"not null;index"`
	Description string `json:"description" gorm:"not null"`
	Quantity    int    `json:"quantity" gorm:"not null;default:1;check:quantity > 0"`
	Rate        int64  `json:"rate" gorm:"not null;default:0;check:rate >= 0"`     // In piasters
	Amount      int64  `json:"amount" gorm:"not null;default:0;check:amount >= 0"` // In piasters
}

// Payment model
type Payment struct {
	BaseModel
	InvoiceID string    `json:"invoiceId" gorm:"not null;index"`
	Amount    int64     `json:"amount" gorm:"not null;check:amount > 0"`                             // In piasters
	Method    string    `json:"method" gorm:"not null;check:method IN ('cash', 'card', 'transfer')"` // cash, card, transfer
	Date      time.Time `json:"date" ts_type:"string" gorm:"not null"`
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
