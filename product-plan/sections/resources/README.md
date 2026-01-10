# Resources Section

## Overview
The Resources section manages all bookable space units—seats, rooms, and desks. Users can create resources with hourly rates, track real-time availability, and view utilization statistics.

## Components

- **ResourcesList** - Main list/grid view with filtering and view mode toggle
- **ResourceCard** - Individual resource card with status and actions
- **ResourceForm** - Form for creating/editing resources
- **ResourceDialog** - Modal dialog wrapper for the resource form

## User Flows

- Create a new resource with name, type (Seat/Room/Desk), and hourly rate
- View all resources in a grid or list layout
- Filter resources by type
- View resource availability status (Available/Occupied)
- Edit resource details (name, type, rate)
- Toggle resource availability manually
- View resource utilization statistics
- Delete unused resource (with confirmation, blocked if active session exists)
- Quick-select available resource for new session

## UI Requirements

- Resource creation form with name, type dropdown, hourly rate input
- Resource grid view with visual cards showing name, type, rate, and status
- Resource list view as alternative display option
- Color-coded availability badges (green for Available, red for Occupied)
- Filter tabs or dropdown for resource type
- Resource detail modal/panel showing utilization stats
- Rate displayed in EGP currency format
- Empty state for no resources
- Confirmation dialog for delete action
- Visual distinction between resource types (icons or colors)

## Configuration

- shell: true
