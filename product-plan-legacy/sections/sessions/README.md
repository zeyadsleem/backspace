# Sessions Section

## Overview
The Sessions section is the core operational hub for tracking customer usage. It handles session start with customer/resource selection, mid-session inventory consumption additions, session end with automatic cost calculation, and provides real-time monitoring of all active sessions.

## Components

- **ActiveSessions** - Main view showing all active sessions with real-time updates
- **ActiveSessionCard** - Individual session card with timer, costs, and actions
- **InventoryAddModal** - Modal for adding inventory items to a session
- **StartSessionDialog** - Dialog for starting a new session

## User Flows

- Start a new session by selecting customer and available resource
- View all active sessions with real-time elapsed time and running costs
- Add inventory consumption to an active session (select item, quantity)
- Add multiple inventory items during a single session
- View running total of inventory costs in active session
- End a session with automatic duration and cost calculation
- Generate invoice at session end (optional)
- View session history with filtering by date, customer, or resource
- View session details including all inventory consumptions

## UI Requirements

- Session start form with searchable customer dropdown and resource selector
- Active sessions list/grid with: Customer name, Resource, Elapsed time, Session cost, Inventory cost, Total cost
- One-click "Add Inventory" button on each active session card
- Inventory addition modal with searchable item dropdown, quantity input, current price display
- Running inventory total displayed on active session
- "End Session" button with cost summary before confirmation
- Session history table with columns: Date, Customer, Resource, Duration, Session Cost, Inventory Cost, Total
- Subscription indicator showing "Session Covered" for subscribed customers
- Real-time updates every second for elapsed time and costs

## Configuration

- shell: true
