package service

import (
	"fmt"
	"time"

	"myproject/backend/database"
	"myproject/backend/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SubscriptionService struct {
	db *gorm.DB
}

func NewSubscriptionService() *SubscriptionService {
	return &SubscriptionService{db: database.DB}
}

// CreateSubscription creates a new subscription and generates a corresponding invoice
func (s *SubscriptionService) CreateSubscription(customerID string, planType string, price int64, startDate time.Time) (*models.Subscription, error) {
	var sub *models.Subscription

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Deactivate any existing active subscriptions for this customer
		if err := tx.Model(&models.Subscription{}).
			Where("customer_id = ? AND is_active = ?", customerID, true).
			Updates(map[string]interface{}{"is_active": false, "status": "inactive"}).Error; err != nil {
			return err
		}

		// 2. Calculate End Date
		days := 30
		if planType == "weekly" {
			days = 7
		} else if planType == "half-monthly" {
			days = 15
		}
		endDate := startDate.AddDate(0, 0, days)

		// 3. Create Invoice first
		invoiceID := uuid.NewString()
		invoiceNumber := fmt.Sprintf("SUB-%d", time.Now().Unix())
		
		invoice := &models.Invoice{
			BaseModel:     models.BaseModel{ID: invoiceID},
			InvoiceNumber: invoiceNumber,
			CustomerID:    customerID,
			Amount:        price,
			Total:         price,
			Status:        "unpaid", // Default to unpaid until payment is processed
			DueDate:       time.Now(),
		}

		if err := tx.Create(invoice).Error; err != nil {
			return err
		}

		// Add Line Item for the invoice
		lineItem := models.LineItem{
			BaseModel:   models.BaseModel{ID: uuid.NewString()},
			InvoiceID:   invoiceID,
			Description: fmt.Sprintf("Subscription: %s Plan", planType),
			Quantity:    1,
			Rate:        price,
			Amount:      price,
		}
		if err := tx.Create(&lineItem).Error; err != nil {
			return err
		}

		// 4. Create Subscription
		sub = &models.Subscription{
			BaseModel:  models.BaseModel{ID: uuid.NewString()},
			CustomerID: customerID,
			PlanType:   planType,
			Price:      price,
			StartDate:  startDate,
			EndDate:    endDate,
			IsActive:   true,
			Status:     "active",
			InvoiceID:  &invoiceID,
		}

		if err := tx.Create(sub).Error; err != nil {
			return err
		}

		// 5. Update Customer Type
		if err := tx.Model(&models.Customer{}).Where("id = ?", customerID).Update("customer_type", planType).Error; err != nil {
			return err
		}

		return nil
	})

	return sub, err
}

// CancelSubscription marks a subscription as inactive
func (s *SubscriptionService) CancelSubscription(id string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		var sub models.Subscription
		if err := tx.First(&sub, "id = ?", id).Error; err != nil {
			return err
		}

		if err := tx.Model(&sub).Updates(map[string]interface{}{
			"is_active": false,
			"status":    "inactive",
		}).Error; err != nil {
			return err
		}

		// Update customer back to visitor if no other active subs exist
		var activeCount int64
		tx.Model(&models.Subscription{}).Where("customer_id = ? AND is_active = ?", sub.CustomerID, true).Count(&activeCount)
		if activeCount == 0 {
			tx.Model(&models.Customer{}).Where("id = ?", sub.CustomerID).Update("customer_type", "visitor")
		}

		return nil
	})
}
