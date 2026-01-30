package database

import (
	"log"
	"os"
	"path/filepath"

	"myproject/backend/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() {
	var err error

	// Ensure data directory exists
	homeDir, _ := os.UserHomeDir()
	appDir := filepath.Join(homeDir, ".backspace")
	if err := os.MkdirAll(appDir, 0755); err != nil {
		log.Fatal("Failed to create app directory:", err)
	}

	dbPath := filepath.Join(appDir, "backspace.db")

	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Enforce Foreign Keys
	DB.Exec("PRAGMA foreign_keys = ON;")

	// Auto Migrate
	err = DB.AutoMigrate(
		&models.Customer{},
		&models.Resource{},
		&models.Subscription{},
		&models.InventoryItem{},
		&models.Session{},
		&models.InventoryConsumption{},
		&models.Invoice{},
		&models.LineItem{},
		&models.Payment{},
		&models.AppSettings{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
}
