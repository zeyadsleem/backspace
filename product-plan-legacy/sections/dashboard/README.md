# Dashboard Section

## Overview
The Dashboard provides a real-time business overview for coworking space operators. It displays key metrics at a glance—today's revenue split by sessions and inventory, active sessions count, new customers, active subscriptions, and resource utilization—along with low stock alerts and quick action buttons for common tasks.

## Components

- **Dashboard** - Main dashboard container component
- **MetricCard** - Displays individual KPI metrics with icons and variants
- **LowStockBanner** - Alert banner for inventory items below minimum stock
- **QuickActions** - Quick action buttons for common tasks
- **RevenueChart** - Revenue trend chart with period selector
- **ActivityFeed** - Recent activity feed showing latest operations

## User Flows

- View today's revenue with breakdown (sessions vs inventory)
- Monitor active sessions count with real-time updates
- See new customers registered today
- Check active subscriptions count
- View resource utilization percentage
- Receive low stock inventory alerts
- Access quick actions: New Customer, Start Session
- View revenue trend chart (daily/weekly/monthly toggle)
- Navigate to detailed sections by clicking on metric cards

## UI Requirements

- Metric cards displaying: Today's Revenue (with session/inventory split), Active Sessions, New Customers, Active Subscriptions, Resource Utilization Rate
- Low stock alert banner when inventory items fall below minimum threshold
- Quick action buttons prominently placed for New Customer and Start Session
- Revenue chart with date range selector (Today, This Week, This Month)
- Recent activity feed showing latest operations
- All metrics update in real-time without page refresh
- Responsive grid layout adapting to screen sizes
- Support for both light and dark themes

## Configuration

- shell: true
