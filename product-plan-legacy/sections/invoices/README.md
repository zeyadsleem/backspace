# Invoices Section

## Overview
The Invoices section handles billing document generation and management. Invoices are created at session end with itemized breakdown of session costs and inventory consumptions, supporting status tracking, partial payments, and print/export functionality.

## Components

- **InvoicesList** - Main list view with status filtering
- **InvoiceRow** - Individual invoice row in the list
- **InvoiceForm** - Form for creating/editing invoices
- **InvoiceDialog** - Modal dialog wrapper for the invoice form
- **PaymentForm** - Form for recording payments
- **PaymentDialog** - Modal dialog wrapper for the payment form

## User Flows

- Create invoice from completed session (auto-populated with session and inventory data)
- Create manual invoice for a customer
- View all invoices with filtering by status, customer, and date range
- View invoice details with itemized breakdown
- Edit invoice status (Paid/Unpaid/Pending)
- Record payment with date, method, and notes
- Record partial payment and track remaining balance
- Print invoice
- Export invoice to PDF

## UI Requirements

- Invoice creation form with customer selection, line items, discount field, due date
- Auto-generated invoice number (INV-0001 format)
- Invoice list table with columns: Invoice #, Customer, Amount, Status, Due Date
- Status filter tabs (All, Paid, Unpaid, Pending)
- Status badges with colors (Paid: green, Unpaid: red, Pending: orange)
- Payment recording modal with date, method dropdown (Cash/Card/Transfer), amount, notes
- Currency formatting in EGP

## Configuration

- shell: true
