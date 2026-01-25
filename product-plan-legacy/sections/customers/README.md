# Customers Section

## Overview
The Customers section manages the complete customer lifecycle—from registration with Egyptian phone validation to profile management, history tracking, and balance management. Users can search, filter, and export customer data.

## Components

- **CustomersList** - Main list view with search, filtering, and sorting
- **CustomerRow** - Individual customer row in the list table
- **CustomerForm** - Form for creating/editing customers with validation
- **CustomerDialog** - Modal dialog wrapper for the customer form
- **CustomerProfile** - Detailed customer profile view with statistics and history tabs

## User Flows

- Register a new customer with name, phone (Egyptian format), email (optional), customer type, and notes
- View customer list with search and filtering by customer type
- View individual customer profile with complete history
- Edit customer details (name, phone, email, type, notes)
- View customer session history with dates and costs
- View customer subscription history
- View customer invoice history
- View customer inventory consumption history
- Track and update customer balance
- Delete customer (with confirmation)
- Export customer list to CSV

## UI Requirements

- Customer registration form with real-time validation (Egyptian phone format, email format)
- Customer list table with columns: ID, Name, Phone, Type, Balance, Created Date
- Search input for filtering by name or phone
- Filter dropdown for customer type (All, Visitor, Weekly, Half-Monthly, Monthly)
- Sort options (by name, by date)
- Customer profile view with tabs: Overview, Sessions, Subscriptions, Invoices, Consumptions
- Customer statistics card showing total sessions, total spent, member since
- Avatar with customer initials
- Balance display with positive/negative styling
- Pagination for large customer lists
- Empty state for no customers
- Confirmation dialog for delete action

## Configuration

- shell: true
