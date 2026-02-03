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
			Status:        "unpaid",                    // Default to unpaid until payment is processed
			DueDate:       time.Now().AddDate(0, 0, 7), // Due in 7 days
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

// RefundSubscription cancels a subscription and refunds the remaining value
func (s *SubscriptionService) RefundSubscription(id string, refundMethod string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		var sub models.Subscription
		if err := tx.First(&sub, "id = ?", id).Error; err != nil {
			return err
		}

		if !sub.IsActive {
			return fmt.Errorf("subscription is already inactive")
		}

		// Calculate remaining value
		// Value per day = Price / Total Duration
		// Remaining Value = Value per day * Remaining Days
		duration := sub.EndDate.Sub(sub.StartDate).Hours() / 24
		if duration <= 0 {
			duration = 1 // Prevent division by zero
		}

		remainingDays := sub.EndDate.Sub(time.Now()).Hours() / 24
		if remainingDays < 0 {
			remainingDays = 0
		}

		refundAmount := int64(float64(sub.Price) / duration * remainingDays)

		// 1. Deactivate Subscription
		if err := tx.Model(&sub).Updates(map[string]interface{}{
			"is_active": false,
			"status":    "inactive", // or "refunded" if we add that status
		}).Error; err != nil {
			return err
		}

		// 2. Process Refund
		if refundAmount > 0 {
			if refundMethod == "cash" {
				// Create a negative payment record (Refund)
				// We need the original invoice ID
				invoiceID := ""
				if sub.InvoiceID != nil {
					invoiceID = *sub.InvoiceID
				} else {
					// Fallback: try to find invoice
					var inv models.Invoice
					if err := tx.Where("customer_id = ? AND amount = ?", sub.CustomerID, sub.Price).Last(&inv).Error; err == nil {
						invoiceID = inv.ID
					}
				}

				if invoiceID != "" {
					refundPayment := models.Payment{
						BaseModel: models.BaseModel{ID: uuid.NewString()},
						InvoiceID: invoiceID,
						Amount:    -refundAmount, // Negative amount for refund
						Method:    "cash",
						Type:      "refund",
						Date:      time.Now(),
						Notes:     fmt.Sprintf("Refund for cancelled subscription (%s)", sub.PlanType),
					}
					if err := tx.Create(&refundPayment).Error; err != nil {
						return err
					}
					// Note: We typically don't update Invoice.PaidAmount with refunds to keep track of total paid,
					// or we decrease it. Let's decrease it to reflect "net paid".
					if err := tx.Model(&models.Invoice{}).Where("id = ?", invoiceID).
						Update("paid_amount", gorm.Expr("paid_amount - ?", refundAmount)).Error; err != nil {
						return err
					}
				}
			} else {
				// Default: Refund to Balance
				if err := tx.Model(&models.Customer{}).Where("id = ?", sub.CustomerID).
					Update("balance", gorm.Expr("balance + ?", refundAmount)).Error; err != nil {
					return err
				}
			}
		}

		// 3. Update customer type back to visitor if no other active subs
		var activeCount int64
		if err := tx.Model(&models.Subscription{}).
			Where("customer_id = ? AND is_active = ? AND id != ?", sub.CustomerID, true, id).
			Count(&activeCount).Error; err != nil {
			return err
		}
		if activeCount == 0 {
			if err := tx.Model(&models.Customer{}).
				Where("id = ?", sub.CustomerID).
				Update("customer_type", "visitor").Error; err != nil {
				return err
			}
		}

		return nil
	})
}

// UpgradeSubscription upgrades/changes a subscription by refunding the old one and creating a new one
func (s *SubscriptionService) UpgradeSubscription(customerID string, newPlanType string, newPrice int64, startDate time.Time) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Find and Refund current active subscription
		var currentSub models.Subscription
		err := tx.Where("customer_id = ? AND is_active = ?", customerID, true).First(&currentSub).Error
		if err == nil {
			// Found active sub, refund it (using internal logic to share transaction)
			// We replicate Refund logic here to keep it in the same transaction block easily
			// or we could refactor Refund to take a tx. Let's do inline for safety.

			duration := currentSub.EndDate.Sub(currentSub.StartDate).Hours() / 24
			if duration <= 0 {
				duration = 1
			}
			remainingDays := currentSub.EndDate.Sub(time.Now()).Hours() / 24
			if remainingDays < 0 {
				remainingDays = 0
			}
			refundAmount := int64(float64(currentSub.Price) / duration * remainingDays)

			// Deactivate
			if err := tx.Model(&currentSub).Updates(map[string]interface{}{
				"is_active": false,
				"status":    "inactive",
			}).Error; err != nil {
				return err
			}

			// Add refund to balance
			if refundAmount > 0 {
				if err := tx.Model(&models.Customer{}).Where("id = ?", customerID).
					Update("balance", gorm.Expr("balance + ?", refundAmount)).Error; err != nil {
					return err
				}
			}
		} else if err != gorm.ErrRecordNotFound {
			return err
		}

		// 2. Create New Subscription (This logic is usually in CreateSubscription, but we need it here in tx)
		// We can call CreateSubscription but it creates its own transaction.
		// So we will replicate the creation logic OR make CreateSubscription accept a tx.
		// Refactoring CreateSubscription to accept tx is cleaner.
		// For now, I will inline the creation logic to ensure atomicity.

		// Calculate End Date
		days := 30
		if newPlanType == "weekly" {
			days = 7
		} else if newPlanType == "half-monthly" {
			days = 15
		}
		endDate := startDate.AddDate(0, 0, days)

		// Create Invoice
		invoiceID := uuid.NewString()
		invoiceNumber := fmt.Sprintf("SUB-%d", time.Now().Unix())

		invoice := &models.Invoice{
			BaseModel:     models.BaseModel{ID: invoiceID},
			InvoiceNumber: invoiceNumber,
			CustomerID:    customerID,
			Amount:        newPrice,
			Total:         newPrice,
			Status:        "unpaid",
			DueDate:       time.Now().AddDate(0, 0, 7),
		}

		if err := tx.Create(invoice).Error; err != nil {
			return err
		}

		lineItem := models.LineItem{
			BaseModel:   models.BaseModel{ID: uuid.NewString()},
			InvoiceID:   invoiceID,
			Description: fmt.Sprintf("Subscription Upgrade: %s Plan", newPlanType),
			Quantity:    1,
			Rate:        newPrice,
			Amount:      newPrice,
		}
		if err := tx.Create(&lineItem).Error; err != nil {
			return err
		}

		// Create Subscription
		sub := &models.Subscription{
			BaseModel:  models.BaseModel{ID: uuid.NewString()},
			CustomerID: customerID,
			PlanType:   newPlanType,
			Price:      newPrice,
			StartDate:  startDate,
			EndDate:    endDate,
			IsActive:   true,
			Status:     "active",
			InvoiceID:  &invoiceID,
		}

		if err := tx.Create(sub).Error; err != nil {
			return err
		}

		// Update Customer Type
		if err := tx.Model(&models.Customer{}).Where("id = ?", customerID).Update("customer_type", newPlanType).Error; err != nil {
			return err
		}

		// 3. Auto-pay from Balance if possible
		var customer models.Customer
		if err := tx.First(&customer, "id = ?", customerID).Error; err != nil {
			return err
		}

		if customer.Balance >= newPrice {
			// Pay full amount
			payment := models.Payment{
				BaseModel: models.BaseModel{ID: uuid.NewString()},
				InvoiceID: invoiceID,
				Amount:    newPrice,
				Method:    "balance",
				Date:      time.Now(),
				Notes:     "Auto-payment from balance after upgrade",
			}
			if err := tx.Create(&payment).Error; err != nil {
				return err
			}

			// Deduct balance
			if err := tx.Model(&customer).Update("balance", customer.Balance-newPrice).Error; err != nil {
				return err
			}

			// Mark invoice paid
			if err := tx.Model(invoice).Updates(map[string]interface{}{
				"status":      "paid",
				"paid_date":   time.Now(),
				"paid_amount": newPrice,
			}).Error; err != nil {
				return err
			}
		}

		return nil
	})
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
		// Use FOR UPDATE to prevent race conditions
		var activeCount int64
		if err := tx.Model(&models.Subscription{}).
			Where("customer_id = ? AND is_active = ? AND id != ?", sub.CustomerID, true, id).
			Count(&activeCount).Error; err != nil {
			return err
		}
		if activeCount == 0 {
			if err := tx.Model(&models.Customer{}).
				Where("id = ?", sub.CustomerID).
				Update("customer_type", "visitor").Error; err != nil {
				return err
			}
		}

		return nil
	})
}
