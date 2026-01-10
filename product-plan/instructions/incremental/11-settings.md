# Milestone 11: Settings

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-10 complete

---

## Goal

Implement the Settings section — application configuration.

## Overview

The Settings section provides application configuration options including company information, regional settings, appearance customization, language selection, and data management.

**Key Functionality:**
- Update company information
- Configure currency and timezone
- Toggle light/dark theme
- Switch language (Arabic/English)
- Backup and restore database
- Export data

## Components

| Component | Description |
|-----------|-------------|
| `SettingsPage` | Main settings layout |

## Settings Sections

### Company Information
- Company name
- Address
- Phone
- Email

### Regional Settings
- Currency (EGP)
- Timezone
- Date format

### Appearance
- Theme (Light/Dark/System)
- Language (Arabic/English)

### Data Management
- Backup database
- Restore from backup
- Export all data
- Reset database (with confirmation)

## Callbacks

| Callback | Description |
|----------|-------------|
| `onSave` | Save settings changes |
| `onThemeChange` | Change theme |
| `onLanguageChange` | Change language |
| `onBackup` | Create backup |
| `onRestore` | Restore from backup |
| `onExport` | Export data |
| `onReset` | Reset database |

## Files to Reference

- `product-plan/sections/settings/` — All section files

## Done When

- [ ] Company info saves correctly
- [ ] Theme toggle works
- [ ] Language switch works with RTL
- [ ] Backup creates file
- [ ] Restore validates and applies
- [ ] Export generates CSV
- [ ] Reset requires confirmation
- [ ] Settings persist across sessions
