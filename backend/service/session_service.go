package service

import (
	"errors"
	"fmt"
	"time"

	"myproject/backend/database"
	"myproject/backend/finance"
	"myproject/backend/models"

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

		// 2. Create the session
		session = &models.Session{
			BaseModel:    models.BaseModel{ID: fmt.Sprintf("sess_%d", time.Now().UnixNano())},
			CustomerID:   customerID,
			ResourceID:   resourceID,
			ResourceRate: resource.RatePerHour,
			StartedAt:    time.Now(),
			Status:       "active",
		}

		if err := tx.Create(session).Error; err != nil {
			return err
		}

		// 3. Mark resource as unavailable
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
			BaseModel: models.BaseModel{ID: fmt.Sprintf("cons_%d", time.Now().UnixNano())},
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

	// 1. Get Session
	if err := tx.Preload("InventoryConsumptions").First(&session, "id = ?", sessionID).Error; err != nil {
		return nil, err
	}

	if session.Status != "active" {
		return nil, errors.New("session is already closed")
	}

	// 2. Calculate Costs
	endTime := time.Now()
	duration := int(endTime.Sub(session.StartedAt).Minutes())
	sessionCost := finance.CalculateSessionCost(duration, session.ResourceRate)

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

	return &session, nil
}

// RemoveInventoryConsumption removes an item from a session and restores stock
func (s *SessionService) RemoveInventoryConsumption(sessionID, itemID string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		var consumption models.InventoryConsumption
		if err := tx.Where("session_id = ? AND item_id = ?", sessionID, itemID).First(&consumption).Error; err != nil {
			return err
		}

		// Restore Stock
		if err := tx.Model(&models.InventoryItem{}).Where("id = ?", itemID).
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
func (s *SessionService) UpdateInventoryConsumption(sessionID, itemID string, newQuantity int) error {
	if newQuantity <= 0 {
		return s.RemoveInventoryConsumption(sessionID, itemID)
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		var consumption models.InventoryConsumption
		if err := tx.Where("session_id = ? AND item_id = ?", sessionID, itemID).First(&consumption).Error; err != nil {
			return err
		}

		diff := newQuantity - consumption.Quantity

		// Check stock if increasing
		if diff > 0 {
			var item models.InventoryItem
			tx.First(&item, "id = ?", itemID)
			if item.Quantity < diff {
				return fmt.Errorf("insufficient stock: only %d more available", item.Quantity)
			}
		}

		// Update Stock
		if err := tx.Model(&models.InventoryItem{}).Where("id = ?", itemID).
			Update("quantity", gorm.Expr("quantity - ?", diff)).Error; err != nil {
			return err
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
