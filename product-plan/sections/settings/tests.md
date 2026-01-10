# Settings Section - Test Cases

## Update Company Information

### TC-SET-001: View Company Settings
- **Precondition:** User is on the Settings page
- **Steps:**
  1. Navigate to the Company Information section
- **Expected:** Current company name, address, phone, and email are displayed in editable fields

### TC-SET-002: Update Company Name
- **Precondition:** User is on the Settings page
- **Steps:**
  1. Navigate to Company Information section
  2. Clear the company name field
  3. Enter a new company name "New Business Name"
  4. Click Save
- **Expected:** Company name is updated successfully, success message is displayed

### TC-SET-003: Update Company Address
- **Precondition:** User is on the Settings page
- **Steps:**
  1. Navigate to Company Information section
  2. Update the address field with new address
  3. Click Save
- **Expected:** Address is updated and reflected in settings

### TC-SET-004: Update Company Contact Information
- **Precondition:** User is on the Settings page
- **Steps:**
  1. Navigate to Company Information section
  2. Update phone number to "01098765432"
  3. Update email to "contact@newbusiness.com"
  4. Click Save
- **Expected:** Phone and email are updated successfully

### TC-SET-005: Validate Required Company Fields
- **Precondition:** User is on the Settings page
- **Steps:**
  1. Navigate to Company Information section
  2. Clear the company name field (leave empty)
  3. Click Save
- **Expected:** Validation error is shown, form is not submitted

### TC-SET-006: Validate Email Format
- **Precondition:** User is on the Settings page
- **Steps:**
  1. Navigate to Company Information section
  2. Enter invalid email format "invalid-email"
  3. Click Save
- **Expected:** Email validation error is displayed

---

## Change Theme

### TC-SET-010: View Current Theme Setting
- **Precondition:** User is on the Settings page
- **Steps:**
  1. Navigate to Appearance section
- **Expected:** Current theme selection is displayed (Light/Dark/System)

### TC-SET-011: Change Theme to Light Mode
- **Precondition:** User is on the Settings page, theme is not set to Light
- **Steps:**
  1. Navigate to Appearance section
  2. Select "Light" theme option
  3. Click Save
- **Expected:** Theme changes to light mode immediately, setting is persisted

### TC-SET-012: Change Theme to Dark Mode
- **Precondition:** User is on the Settings page, theme is not set to Dark
- **Steps:**
  1. Navigate to Appearance section
  2. Select "Dark" theme option
  3. Click Save
- **Expected:** Theme changes to dark mode immediately, setting is persisted

### TC-SET-013: Change Theme to System Default
- **Precondition:** User is on the Settings page
- **Steps:**
  1. Navigate to Appearance section
  2. Select "System" theme option
  3. Click Save
- **Expected:** Theme follows system preference, setting is persisted

### TC-SET-014: Theme Persists After Refresh
- **Precondition:** User has changed theme to Dark mode
- **Steps:**
  1. Refresh the browser page
- **Expected:** Dark theme is still applied after page reload

### TC-SET-015: Theme Persists Across Sessions
- **Precondition:** User has changed theme to Dark mode
- **Steps:**
  1. Log out of the application
  2. Log back in
- **Expected:** Dark theme is still applied after re-login

---

## Change Language

### TC-SET-020: View Current Language Setting
- **Precondition:** User is on the Settings page
- **Steps:**
  1. Navigate to Appearance section
- **Expected:** Current language selection is displayed (English/Arabic)

### TC-SET-021: Change Language to Arabic
- **Precondition:** User is on the Settings page, language is English
- **Steps:**
  1. Navigate to Appearance section
  2. Select "العربية" (Arabic) language option
  3. Click Save
- **Expected:** 
  - UI language changes to Arabic
  - Layout direction changes to RTL (right-to-left)
  - All labels and text are displayed in Arabic

### TC-SET-022: Change Language to English
- **Precondition:** User is on the Settings page, language is Arabic
- **Steps:**
  1. Navigate to Appearance section
  2. Select "English" language option
  3. Click Save
- **Expected:**
  - UI language changes to English
  - Layout direction changes to LTR (left-to-right)
  - All labels and text are displayed in English

### TC-SET-023: Language Persists After Refresh
- **Precondition:** User has changed language to Arabic
- **Steps:**
  1. Refresh the browser page
- **Expected:** Arabic language and RTL layout are still applied

### TC-SET-024: Language Persists Across Sessions
- **Precondition:** User has changed language to Arabic
- **Steps:**
  1. Log out of the application
  2. Log back in
- **Expected:** Arabic language setting is still applied after re-login

### TC-SET-025: Date Format Respects Language
- **Precondition:** User has changed language to Arabic
- **Steps:**
  1. Navigate to any page with dates displayed
- **Expected:** Dates are formatted according to regional settings

---

## Backup and Restore

### TC-SET-030: Initiate Backup
- **Precondition:** User is on the Settings page
- **Steps:**
  1. Navigate to Data Management section
  2. Click "Backup" button
- **Expected:** 
  - Backup process starts
  - Loading indicator is shown
  - Backup file is downloaded to user's device

### TC-SET-031: Backup File Contains All Data
- **Precondition:** User has created a backup
- **Steps:**
  1. Open the downloaded backup file
- **Expected:** Backup file contains all application data in valid format (JSON)

### TC-SET-032: Backup File Naming Convention
- **Precondition:** User initiates a backup
- **Steps:**
  1. Click "Backup" button
  2. Check the downloaded file name
- **Expected:** File name includes application name and timestamp (e.g., "backspace-backup-2026-01-06.json")

### TC-SET-033: Initiate Restore
- **Precondition:** User is on the Settings page, has a valid backup file
- **Steps:**
  1. Navigate to Data Management section
  2. Click "Restore" button
  3. Select a valid backup file
- **Expected:** File selection dialog opens

### TC-SET-034: Restore from Valid Backup
- **Precondition:** User has selected a valid backup file
- **Steps:**
  1. Select the backup file
  2. Confirm the restore action
- **Expected:**
  - Confirmation dialog is shown warning about data replacement
  - After confirmation, data is restored
  - Success message is displayed

### TC-SET-035: Restore Confirmation Required
- **Precondition:** User clicks Restore and selects a file
- **Steps:**
  1. Select a backup file
- **Expected:** Confirmation dialog appears warning that current data will be replaced

### TC-SET-036: Cancel Restore Operation
- **Precondition:** User is on restore confirmation dialog
- **Steps:**
  1. Click "Cancel" on the confirmation dialog
- **Expected:** Restore is cancelled, no data is changed

### TC-SET-037: Restore from Invalid File
- **Precondition:** User is on the Settings page
- **Steps:**
  1. Click "Restore" button
  2. Select an invalid file (e.g., a text file or corrupted JSON)
- **Expected:** Error message is displayed indicating invalid backup file

### TC-SET-038: Restore from Incompatible Version
- **Precondition:** User has a backup file from an incompatible version
- **Steps:**
  1. Click "Restore" button
  2. Select the incompatible backup file
- **Expected:** Error message indicates version incompatibility

### TC-SET-039: Export Data
- **Precondition:** User is on the Settings page
- **Steps:**
  1. Navigate to Data Management section
  2. Click "Export" button
- **Expected:** Data is exported in a readable format (CSV/Excel)

### TC-SET-040: Reset Application Data
- **Precondition:** User is on the Settings page
- **Steps:**
  1. Navigate to Data Management section
  2. Click "Reset" button
- **Expected:** Confirmation dialog appears with strong warning

### TC-SET-041: Confirm Reset Operation
- **Precondition:** User is on reset confirmation dialog
- **Steps:**
  1. Type confirmation text (if required)
  2. Click "Confirm Reset"
- **Expected:** 
  - All application data is cleared
  - Application returns to initial state
  - User is redirected to setup/onboarding

### TC-SET-042: Cancel Reset Operation
- **Precondition:** User is on reset confirmation dialog
- **Steps:**
  1. Click "Cancel"
- **Expected:** Reset is cancelled, no data is changed

---

## Regional Settings

### TC-SET-050: Update Timezone
- **Precondition:** User is on the Settings page
- **Steps:**
  1. Navigate to Regional Settings section
  2. Select a different timezone from dropdown
  3. Click Save
- **Expected:** Timezone is updated, all time displays reflect new timezone

### TC-SET-051: Update Date Format
- **Precondition:** User is on the Settings page
- **Steps:**
  1. Navigate to Regional Settings section
  2. Select a different date format (e.g., MM/DD/YYYY)
  3. Click Save
- **Expected:** Date format is updated, all dates in the app use new format

### TC-SET-052: Update Currency Settings
- **Precondition:** User is on the Settings page
- **Steps:**
  1. Navigate to Regional Settings section
  2. Update currency to "USD" and symbol to "$"
  3. Click Save
- **Expected:** Currency settings are updated, all monetary values display with new currency

---

## Tax Settings

### TC-SET-060: Enable Tax
- **Precondition:** User is on the Settings page, tax is disabled
- **Steps:**
  1. Navigate to Tax Settings section
  2. Toggle tax to enabled
  3. Set tax rate to 14%
  4. Click Save
- **Expected:** Tax is enabled, invoices will include tax calculations

### TC-SET-061: Disable Tax
- **Precondition:** User is on the Settings page, tax is enabled
- **Steps:**
  1. Navigate to Tax Settings section
  2. Toggle tax to disabled
  3. Click Save
- **Expected:** Tax is disabled, invoices will not include tax

### TC-SET-062: Update Tax Rate
- **Precondition:** User is on the Settings page, tax is enabled
- **Steps:**
  1. Navigate to Tax Settings section
  2. Change tax rate from 14% to 10%
  3. Click Save
- **Expected:** Tax rate is updated, future invoices use new rate
