package service

import (
	"errors"
	"fmt"
	"time"

	"myproject/backend/database"
	"myproject/backend/finance"
	"myproject/backend/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SessionService struct {
	db *gorm.DB
}

func NewSessionService() *SessionService {
	return &SessionService{db: database.DB}
}

// StartSession initializes a new session for a customer and resource
func (s *SessionService) StartSession(customerID, resourceID string) (*models.Session, error) {
	var session *models.Session

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Check if resource is available
		var resource models.Resource
		if err := tx.First(&resource, "id = ?", resourceID).Error; err != nil {
			return errors.New("resource not found")
		}
		if !resource.IsAvailable {
			return errors.New("resource is already occupied")
		}

		// 2. Check for active subscription
		var activeSub int64
		tx.Model(&models.Subscription{}).Where("customer_id = ? AND is_active = ?", customerID, true).Count(&activeSub)
		isSubscribed := activeSub > 0

		// 3. Create the session
		session = &models.Session{
			BaseModel:        models.BaseModel{ID: uuid.NewString()},
			CustomerID:       customerID,
			ResourceID:       resourceID,
			ResourceRate:     resource.RatePerHour,
			ResourceMaxPrice: resource.MaxPrice, // Store snapshot of daily cap
			StartedAt:        time.Now(),
			Status:           "active",
			IsSubscribed:     isSubscribed,
		}

		if err := tx.Create(session).Error; err != nil {
			return err
		}

		// 4. Mark resource as unavailable
		if err := tx.Model(&resource).Update("is_available", false).Error; err != nil {
			return err
		}

		return nil
	})

	return session, err
}

// AddInventoryConsumption adds an item to a session and deducts from stock atomically
func (s *SessionService) AddInventoryConsumption(sessionID, itemID string, quantity int) error {
	if quantity <= 0 {
		return errors.New("quantity must be positive")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Get Inventory Item
		var item models.InventoryItem
		if err := tx.First(&item, "id = ?", itemID).Error; err != nil {
			return errors.New("inventory item not found")
		}

		// 2. Check Stock
		if item.Quantity < quantity {
			return fmt.Errorf("insufficient stock: only %d available", item.Quantity)
		}

		// 3. Deduct Stock
		if err := tx.Model(&item).Update("quantity", item.Quantity-quantity).Error; err != nil {
			return err
		}

		// 4. Create Consumption Record
		consumption := models.InventoryConsumption{
			BaseModel: models.BaseModel{ID: uuid.NewString()},
			SessionID: sessionID,
			ItemID:    itemID,
			ItemName:  item.Name,
			Quantity:  quantity,
			Price:     item.Price,
			AddedAt:   time.Now(),
		}

		if err := tx.Create(&consumption).Error; err != nil {
			return err
		}

		// 5. Update Session's InventoryTotal
		var session models.Session
		if err := tx.First(&session, "id = ?", sessionID).Error; err != nil {
			return err
		}

		newTotal := session.InventoryTotal + (item.Price * int64(quantity))
		if err := tx.Model(&session).Update("inventory_total", newTotal).Error; err != nil {
			return err
		}

		return nil
	})
}

// EndSession calculates costs, closes session, and frees resource
func (s *SessionService) EndSession(sessionID string) (*models.Session, error) {
	var session *models.Session
	err := s.db.Transaction(func(tx *gorm.DB) error {
		var err error
		session, err = s.EndSessionWithTx(tx, sessionID)
		return err
	})
	return session, err
}

// EndSessionWithTx allows calling EndSession within an existing transaction
func (s *SessionService) EndSessionWithTx(tx *gorm.DB, sessionID string) (*models.Session, error) {
	var session models.Session

	// 1. Get Session with Resource data
	if err := tx.Preload("InventoryConsumptions").First(&session, "id = ?", sessionID).Error; err != nil {
		return nil, err
	}

	if session.Status != "active" {
		return nil, errors.New("session is already closed")
	}

	// Load Resource to get ResourceName
	var resource models.Resource
	if err := tx.First(&resource, "id = ?", session.ResourceID).Error; err != nil {
		return nil, err
	}

	// 2. Calculate Costs
	endTime := time.Now()
	duration := int(endTime.Sub(session.StartedAt).Minutes())

	sessionCost := int64(0)
	if !session.IsSubscribed {
		sessionCost = finance.CalculateSessionCost(duration, session.ResourceRate, session.ResourceMaxPrice)
	}

	totalAmount := sessionCost + session.InventoryTotal

	// 3. Update Session
	updates := map[string]interface{}{
		"ended_at":     endTime,
		"session_cost": sessionCost,
		"total_amount": totalAmount,
		"status":       "completed",
	}

	if err := tx.Model(&session).Updates(updates).Error; err != nil {
		return nil, err
	}

	// 4. Free Resource
	if err := tx.Model(&models.Resource{}).Where("id = ?", session.ResourceID).Update("is_available", true).Error; err != nil {
		return nil, err
	}

	// Refresh session object for return
	tx.First(&session, "id = ?", sessionID)

	// Populate ResourceName for invoice generation
	session.ResourceName = resource.Name

	return &session, nil
}

// RemoveInventoryConsumption removes an item from a session and restores stock
func (s *SessionService) RemoveInventoryConsumption(sessionID, consumptionID string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		var consumption models.InventoryConsumption
		// Query by ID (consumption ID), ensuring it belongs to the session
		if err := tx.Where("id = ? AND session_id = ?", consumptionID, sessionID).First(&consumption).Error; err != nil {
			return err
		}

		// Restore Stock using the ItemID from the consumption record
		if err := tx.Model(&models.InventoryItem{}).Where("id = ?", consumption.ItemID).
			Update("quantity", gorm.Expr("quantity + ?", consumption.Quantity)).Error; err != nil {
			return err
		}

		// Update Session Total
		if err := tx.Model(&models.Session{}).Where("id = ?", sessionID).
			Update("inventory_total", gorm.Expr("inventory_total - ?", consumption.Price*int64(consumption.Quantity))).Error; err != nil {
			return err
		}

		return tx.Delete(&consumption).Error
	})
}

// UpdateInventoryConsumption updates the quantity of an item in a session
func (s *SessionService) UpdateInventoryConsumption(sessionID, consumptionID string, newQuantity int) error {
	if newQuantity <= 0 {
		return s.RemoveInventoryConsumption(sessionID, consumptionID)
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		var consumption models.InventoryConsumption
		// Query by ID (consumption ID)
		if err := tx.Where("id = ? AND session_id = ?", consumptionID, sessionID).First(&consumption).Error; err != nil {
			return err
		}

		diff := newQuantity - consumption.Quantity

		// Check stock if increasing
		if diff > 0 {
			var item models.InventoryItem
			// Use consumption.ItemID to find the inventory item
			if err := tx.First(&item, "id = ?", consumption.ItemID).Error; err != nil {
				return errors.New("inventory item not found")
			}
			if item.Quantity < diff {
				return fmt.Errorf("insufficient stock: only %d more available", item.Quantity)
			}

			// Deduct from Stock
			if err := tx.Model(&item).Update("quantity", item.Quantity-diff).Error; err != nil {
				return err
			}
		} else if diff < 0 {
			// Restore to Stock (diff is negative, so we subtract negative = add)
			if err := tx.Model(&models.InventoryItem{}).Where("id = ?", consumption.ItemID).
				Update("quantity", gorm.Expr("quantity - ?", diff)).Error; err != nil {
				return err
			}
		}

		// Update Consumption
		if err := tx.Model(&consumption).Update("quantity", newQuantity).Error; err != nil {
			return err
		}

		// Update Session Total
		if err := tx.Model(&models.Session{}).Where("id = ?", sessionID).
			Update("inventory_total", gorm.Expr("inventory_total + ?", consumption.Price*int64(diff))).Error; err != nil {
			return err
		}

		return nil
	})
}
