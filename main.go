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

// autoSeedDatabase resets and seeds the database with fresh sample data
func autoSeedDatabase() {
	println("🌱 Resetting and seeding database with fresh data...")

	app := NewApp()

	// First reset the database
	_, err := app.ResetAndSeedDatabase()
	if err != nil {
		println("❌ Error seeding database:", err.Error())
	} else {
		println("✅ Database seeded successfully!")
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
