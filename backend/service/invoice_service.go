package service

import (
	"fmt"
	"time"

	"myproject/backend/database"
	"myproject/backend/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InvoiceService struct {
	db *gorm.DB
}

func NewInvoiceService() *InvoiceService {
	return &InvoiceService{db: database.DB}
}

// CreateInvoiceFromSession generates an invoice for a completed session
func (s *InvoiceService) CreateInvoiceFromSession(tx *gorm.DB, session *models.Session) (*models.Invoice, error) {
	invoiceID := uuid.NewString()
	invoiceNumber := fmt.Sprintf("INV-%d", time.Now().Unix())

	invoice := &models.Invoice{
		BaseModel:     models.BaseModel{ID: invoiceID},
		InvoiceNumber: invoiceNumber,
		CustomerID:    session.CustomerID,
		SessionID:     &session.ID,
		Amount:        session.TotalAmount,
		Total:         session.TotalAmount,
		Status:        "pending",
		DueDate:       time.Now().AddDate(0, 0, 7), // Due in 7 days
	}

	if err := tx.Create(invoice).Error; err != nil {
		return nil, err
	}

	// 1. Add Session Line Item
	sessionItem := models.LineItem{
		BaseModel:   models.BaseModel{ID: uuid.NewString()},
		InvoiceID:   invoiceID,
		Description: fmt.Sprintf("Session at %s", session.ResourceName),
		Quantity:    1,
		Rate:        session.SessionCost,
		Amount:      session.SessionCost,
	}
	if err := tx.Create(&sessionItem).Error; err != nil {
		return nil, err
	}

	// 2. Add Inventory Line Items
	var consumptions []models.InventoryConsumption
	if err := tx.Where("session_id = ?", session.ID).Find(&consumptions).Error; err != nil {
		return nil, err
	}

	for _, c := range consumptions {
		lineItem := models.LineItem{
			BaseModel:   models.BaseModel{ID: uuid.NewString()},
			InvoiceID:   invoiceID,
			Description: c.ItemName,
			Quantity:    c.Quantity,
			Rate:        c.Price,
			Amount:      c.Price * int64(c.Quantity),
		}
		if err := tx.Create(&lineItem).Error; err != nil {
			return nil, err
		}
	}

	return invoice, nil
}
