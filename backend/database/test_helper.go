package database

import (
	"sync"
	"testing"

	"myproject/backend/models"

	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// TestDB holds a test database connection
var TestDB *gorm.DB
var testOnce sync.Once
var testMutex sync.Mutex

// SetupTestDB initializes a test database (thread-safe)
func SetupTestDB(t *testing.T) {
	testMutex.Lock()
	defer testMutex.Unlock()

	// Use in-memory SQLite for tests
	var err error
	TestDB, err = gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	require.NoError(t, err, "Failed to connect to test database")

	// Enable foreign keys
	TestDB.Exec("PRAGMA foreign_keys = ON;")

	// Set as global DB for the app
	DB = TestDB

	// Reset the initOnce so InitDB doesn't skip initialization
	initOnce = sync.Once{}

	// Run migrations
	require.NoError(t, TestDB.AutoMigrate(
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
	))
}

// CleanupTestDB closes the test database
func CleanupTestDB() {
	testMutex.Lock()
	defer testMutex.Unlock()

	if TestDB != nil {
		sqlDB, _ := TestDB.DB()
		sqlDB.Close()
		TestDB = nil
		DB = nil
		// Reset initOnce for next test
		initOnce = sync.Once{}
	}
}

// ResetTestDB clears all data from test database
func ResetTestDB(t *testing.T) {
	testMutex.Lock()
	defer testMutex.Unlock()

	require.NoError(t, TestDB.Exec("DELETE FROM payments").Error)
	require.NoError(t, TestDB.Exec("DELETE FROM line_items").Error)
	require.NoError(t, TestDB.Exec("DELETE FROM invoices").Error)
	require.NoError(t, TestDB.Exec("DELETE FROM inventory_consumptions").Error)
	require.NoError(t, TestDB.Exec("DELETE FROM sessions").Error)
	require.NoError(t, TestDB.Exec("DELETE FROM subscriptions").Error)
	require.NoError(t, TestDB.Exec("DELETE FROM inventory_items").Error)
	require.NoError(t, TestDB.Exec("DELETE FROM resources").Error)
	require.NoError(t, TestDB.Exec("DELETE FROM customers").Error)
}
