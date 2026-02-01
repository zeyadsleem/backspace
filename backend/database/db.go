package database

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"

	"myproject/backend/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	DB       *gorm.DB
	initOnce sync.Once
)

func InitDB() {
	initOnce.Do(func() {

		var err error

		// 2. Path Security & Persistence: Use OS standard Config Dir (AppData/Roaming on Windows, ~/.config on Linux)
		configDir, err := os.UserConfigDir()
		if err != nil {
			log.Fatal("Failed to get user config directory:", err)
		}

		appDir := filepath.Join(configDir, "backspace")
		if err := os.MkdirAll(appDir, 0755); err != nil {
			log.Fatal("Failed to create app directory:", err)
		}

		dbPath := filepath.Join(appDir, "backspace.db")

		// CRITICAL: Log the exact path so we can verify persistence
		fmt.Printf("📂 Database Path: %s\n", dbPath)

		// 3. Open Database Connection
		DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		if err != nil {
			log.Fatal("Failed to connect to database:", err)
		}

		// 4. Connection Pooling (Critical for SQLite Concurrency)
		sqlDB, err := DB.DB()
		if err != nil {
			log.Fatal("Failed to get generic database object:", err)
		}

		// serialize writes to prevent "database is locked" errors
		sqlDB.SetMaxOpenConns(1)
		sqlDB.SetMaxIdleConns(1)
		sqlDB.SetConnMaxLifetime(30 * time.Minute)

		// 5. Performance & Concurrency Tuning (WAL Mode)
		// PRAGMA busy_timeout=5000: Waits 5s before failing if DB is busy (Crucial for concurrency)
		// PRAGMA journal_mode=WAL: Non-blocking reads, better concurrency
		// PRAGMA synchronous=NORMAL: Faster writes, still safe for WAL
		// PRAGMA foreign_keys = ON: Enforce referential integrity
		if err := DB.Exec("PRAGMA journal_mode=WAL;").Error; err != nil {
			log.Printf("Error setting WAL mode: %v", err)
		}
		if err := DB.Exec("PRAGMA synchronous=NORMAL;").Error; err != nil {
			log.Printf("Error setting synchronous mode: %v", err)
		}
		if err := DB.Exec("PRAGMA busy_timeout=5000;").Error; err != nil {
			log.Printf("Error setting busy timeout: %v", err)
		}
		if err := DB.Exec("PRAGMA foreign_keys = ON;").Error; err != nil {
			log.Printf("Error enabling foreign keys: %v", err)
		}

		// 6. Auto Migrate
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
	})
}

// CloseDB gracefully closes the database connection
func CloseDB() error {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err != nil {
			return err
		}
		return sqlDB.Close()
	}
	return nil
}
