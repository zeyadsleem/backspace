package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"myproject/backend/database"
)

//go:embed all:frontend/dist
var assets embed.FS

// autoSeedDatabase checks if database is empty and seeds it with sample data
func autoSeedDatabase() {
	// Check if we have any customers
	var count int64
	database.DB.Raw("SELECT COUNT(*) FROM customers").Scan(&count)

	// If database is empty, seed it
	if count == 0 {
		println("🌱 Database is empty. Seeding with sample data...")
		app := NewApp()
		result, err := app.SeedDatabase()
		if err != nil {
			println("❌ Error seeding database:", err.Error())
		} else {
			println("✅", result)
		}
	}
}

func main() {
	// Initialize Database
	database.InitDB()
	// Ensure database is closed when application exits
	defer database.CloseDB()

	// Auto-seed database if empty
	autoSeedDatabase()

	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "myproject",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
