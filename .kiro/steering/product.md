# Product Overview

**Backspace** is a coworking space management system built as a Tauri desktop application.

## Core Features

- **Customer Management**: Handle visitors and subscribers with comprehensive profiles (✅ Complete)
- **Resource Management**: Manage seats and rooms with real-time availability tracking (⏳ Next)
- **Session Management**: Track workspace usage sessions from start to finish
- **Consumption Tracking**: Monitor and bill for additional services (snacks, drinks, etc.)
- **Inventory Management**: Track stock levels and movements with low-stock alerts
- **Subscription Management**: Handle various subscription types (weekly, monthly, etc.)
- **Invoice Generation**: Automated billing with detailed line items
- **Reporting**: Comprehensive daily reports and analytics

## Architecture Philosophy

Simplified architecture with embedded Rust backend via Tauri commands. Tauri invoke provides frontend-backend communication. Single application package with no external server dependencies.
