# Product Overview

**Backspace** is a comprehensive coworking space management system built with modern TypeScript technologies.

## Core Features

The system manages the complete lifecycle of a coworking space operation:

- **Customer Management**: Handle visitors and subscribers with comprehensive profiles
- **Resource Management**: Manage seats and rooms with real-time availability tracking
- **Session Management**: Track workspace usage sessions from start to finish
- **Consumption Tracking**: Monitor and bill for additional services (snacks, drinks, etc.)
- **Inventory Management**: Track stock levels and movements with low-stock alerts
- **Subscription Management**: Handle various subscription types (weekly, monthly, etc.)
- **Invoice Generation**: Automated billing with detailed line items
- **Audit Logging**: Complete operation tracking for compliance and debugging
- **Reporting**: Comprehensive daily reports and analytics

## Business Logic

The system implements sophisticated business rules:

- **Time-based Billing**: Calculates costs based on subscription allowances and overage rates
- **Atomic Operations**: Session closure is handled as a single transaction ensuring data integrity
- **Financial Safety**: Immutable invoices and comprehensive audit trails
- **Inventory Control**: Automatic stock deduction with movement tracking

## Architecture Philosophy

Built using Domain-Driven Design with clear separation of concerns across 7 independent domains, 3 system layers, and comprehensive reporting capabilities.
