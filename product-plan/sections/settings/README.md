# Settings Section

## Overview
The Settings section provides application configuration options including company information, regional settings, appearance customization, language selection, and data management tools for backup and restore.

## Components

- **SettingsPage** - Main settings page with all configuration sections

## User Flows

- Update company information (name, address, contact)
- Configure currency symbol and format
- Set timezone
- Set date format preference
- Configure tax rate
- Toggle between light and dark theme
- Switch language between Arabic and English
- Backup database to file
- Restore database from backup file
- Export all data to CSV
- Reset database (with strong confirmation)

## UI Requirements

- Settings organized in sections/cards:
  - Company Information: Name, Address, Phone, Email inputs
  - Regional Settings: Currency dropdown, Timezone dropdown, Date format dropdown
  - Tax Configuration: Tax rate percentage input
  - Appearance: Theme toggle (Light/Dark/System), Language selector (Arabic/English)
  - Data Management: Backup button, Restore button, Export button, Reset button
- Save button for each section or auto-save on change
- Success/error notifications on save
- Warning dialogs for destructive actions

## Configuration

- shell: true
