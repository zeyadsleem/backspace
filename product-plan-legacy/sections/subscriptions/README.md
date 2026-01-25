# Subscriptions Section

## Overview
The Subscriptions section manages day-based access plans for customers. It supports weekly (7 days), half-monthly (15 days), and monthly (30 days) plans with automatic end-date calculation and real-time validity tracking during sessions.

## Components

- **SubscriptionsList** - Main list view with filtering by plan type and status
- **SubscriptionCard** - Individual subscription card with status and days remaining
- **SubscriptionForm** - Form for creating/editing subscriptions
- **SubscriptionDialog** - Modal dialog wrapper for the subscription form

## User Flows

- Create a new subscription by selecting customer, plan type, and start date
- View all subscriptions with filtering by plan type and status (active/inactive)
- View subscription details including remaining days
- Edit subscription details (plan type, dates)
- Deactivate a subscription manually
- View subscription history per customer
- Receive alerts for expiring subscriptions
- Check subscription validity during session start

## UI Requirements

- Subscription creation form with customer dropdown, plan type selector, start date picker
- Auto-calculated end date display based on plan type
- Subscription list table with columns: Customer, Plan Type, Start Date, End Date, Status, Days Remaining
- Filter tabs for Active/Inactive/All subscriptions
- Filter dropdown for plan type
- Status badges (Active: green, Inactive: gray, Expiring Soon: orange)
- Days remaining counter with visual indicator
- Plan type labels in both Arabic and English

## Configuration

- shell: true
