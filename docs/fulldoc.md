# Backspace - Product Requirements Document (PRD)

## 📋 Executive Summary

**Product Name**: Backspace
**Version**: 1.0.1 (Updated for session-inventory integration and subscription adjustments)
**Last Updated**: January 6, 2026
**Status**: Active Development

Backspace is a comprehensive coworking space management system designed to simplify daily operations for coworking space owners and managers. Built as a modern desktop application using Tauri v2, it provides tools for customer management, resource scheduling, session tracking with real-time inventory consumption, inventory control, day-based subscription handling (without hour limits), and billing. Updates focus on simplifying inventory consumption during sessions, adjusting subscriptions to day-based models, enhancing reporting for operation history, and supporting dynamic inventory pricing.

---

## 🎯 Product Vision

To create an intuitive, efficient, and comprehensive management system that empowers coworking space operators to focus on their core business while the software handles the complexities of daily operations, including seamless session billing with inventory add-ons and flexible day-based subscriptions.

### Core Values

- **Simplicity**: Easy-to-use interface with minimal training required, especially for adding inventory consumption mid-session
- **Efficiency**: Streamlined workflows that save time and reduce errors, with real-time calculations
- **Reliability**: Stable desktop application that works offline
- **Flexibility**: Adaptable to different coworking space sizes and business models, including dynamic pricing
- **Localization**: Full Arabic/English support with RTL capabilities

---

## 👥 Target Audience

### Primary Users

- **Coworking Space Owners**: Small to medium-sized space operators
- **Space Managers**: Daily operations staff
- **Receptionists**: Front desk personnel handling check-ins, inventory additions, and payments
- **Administrators**: Users managing subscriptions and reporting

### Secondary Users

- **Accountants**: Users requiring financial reports and invoice data
- **Technical Staff**: Users managing resources and inventory

### User Personas

#### Ahmed (Space Owner)

- Runs a 20-seat coworking space in Tanta
- Needs quick access to revenue and usage statistics
- Prefers Arabic interface
- Wants to track subscription renewals and inventory consumption trends

#### Sara (Receptionist)

- Handles daily check-ins and check-outs
- Adds inventory consumption multiple times during a session (e.g., drinks/snacks)
- Manages customer registrations
- Creates invoices for session + inventory at session end

#### Mohamed (Manager)

- Monitors space utilization and inventory levels
- Reviews weekly reports with operation history filters
- Handles subscription modifications
- Updates inventory prices based on market changes

---

## 🏢 Business Requirements

### Key Business Objectives

1. **Increase Operational Efficiency**: Reduce time spent on administrative tasks by 50%, with one-click inventory additions during sessions
2. **Improve Customer Experience**: Faster check-in/check-out processes with mid-session inventory tracking
3. **Revenue Tracking**: Real-time visibility into daily, weekly, and monthly revenue, split by sessions and inventory
4. **Resource Optimization**: Better utilization tracking of seats and rooms
5. **Inventory Control**: Maintain optimal stock levels with dynamic pricing and consumption tracking

### Success Metrics

- Average session booking time: < 30 seconds
- Inventory addition during session: < 10 seconds
- Daily revenue calculation time: < 5 seconds
- Customer registration time: < 2 minutes
- System uptime: > 99.5%
- User error rate: < 5%

---

## 📝 Functional Requirements

### 1. Customer Management

#### 1.1 Customer Registration

- **Priority**: High
- **Description**: Create new customer profiles with complete information

**Requirements:**

- Capture customer name (required)
- Capture phone number (required, Egyptian format validation)
- Capture email (optional, email validation)
- Select customer type (Visitor/Weekly Member/Half-Monthly Member/Monthly Member)
- Add notes (optional)
- Generate unique human-readable ID (e.g., C-001, C-002)
- Display validation errors in real-time

**Acceptance Criteria:**

- System validates Egyptian phone numbers (+20 format)
- Duplicate prevention by phone number
- Success notification on creation
- Customer appears in customer list immediately

#### 1.2 Customer Profile Management

- **Priority**: High
- **Description**: View and edit customer information

**Requirements:**

- View complete customer profile
- Edit customer details
- View customer history (sessions, subscriptions, invoices, inventory consumptions)
- Track customer balance
- View customer statistics (total sessions, total spent on inventory/sessions)
- Search customers by name, phone, or ID

**Acceptance Criteria:**

- Profile updates reflect immediately
- History shows chronological order with filters (e.g., by date, type)
- Search returns results in < 1 second
- Profile displays customer avatar with initials

#### 1.3 Customer List

- **Priority**: High
- **Description**: Browse and filter customers

**Requirements:**

- Display all customers in a table
- Filter by customer type
- Search by name or phone
- Sort by creation date or name
- Quick actions (view, edit, delete)
- Export customer list to CSV

**Acceptance Criteria:**

- Supports pagination for > 100 customers
- Real-time filtering
- Sort preserves after page refresh

---

### 2. Resource Management

#### 2.1 Resource Creation

- **Priority**: High
- **Description**: Define available resources in the space

**Requirements:**

- Assign resource name (e.g., "Seat A1", "Meeting Room 1")
- Select resource type (Seat/Room/Desk)
- Set hourly rate
- Mark availability status
- Auto-generate unique ID

**Acceptance Criteria:**

- Resource names can be duplicated
- Rate must be positive number
- Default availability: Available
- Resource appears in session dropdown

#### 2.2 Resource Scheduling

- **Priority**: High
- **Description**: Assign resources to customers for sessions

**Requirements:**

- View all resources with availability status
- Filter by resource type
- Quick-select resources from visual grid
- Show currently occupied resources
- Auto-assign next available resource

**Acceptance Criteria:**

- Real-time availability updates
- Visual distinction for occupied resources
- Cannot assign unavailable resources

#### 2.3 Resource Management

- **Priority**: Medium
- **Description**: Edit and manage resources

**Requirements:**

- Edit resource details
- Update availability status
- Change hourly rates
- Delete unused resources
- View resource utilization statistics

**Acceptance Criteria:**

- Rate changes apply to future sessions only
- Cannot delete resources with active sessions
- Utilization shows percentage over time period

---

### 3. Session Management

#### 3.1 Session Start

- **Priority**: Critical
- **Description**: Begin a customer session

**Requirements:**

- Select customer (searchable dropdown)
- Select resource (availability-based)
- Auto-capture start time (current time)
- Check for active subscription (if subscribed, no session cost; only inventory)
- Display estimated hourly cost (if not subscribed)

**Acceptance Criteria:**

- Session starts with one click
- Resources filter by availability
- Start time accurate to the second
- If subscribed, display "Subscription Covered" for session cost

#### 3.2 Session Inventory Consumption

- **Priority**: High (New Feature)
- **Description**: Add inventory items multiple times during an active session

**Requirements:**

- From active session view, add items from inventory (searchable dropdown)
- Select quantity (default 1)
- Auto-deduct from inventory stock
- Capture price at time of addition (support dynamic pricing)
- Add multiple times (e.g., first drink, then snack after 30 min)
- View running total of inventory costs in session

**Acceptance Criteria:**

- Addition takes < 10 seconds
- Stock updates in real-time, prevents over-consumption
- List all additions in session details
- Price locked at addition time (even if market price changes later)

#### 3.3 Session End

- **Priority**: Critical
- **Description**: Complete a customer session

**Requirements:**

- Auto-capture end time (current time)
- Calculate duration in minutes
- Calculate session cost based on hourly rate (if not subscribed; subscribed sessions are free)
- Sum inventory consumption costs
- Display final amount (session + inventory)
- Option to create invoice immediately
- Release resource for new sessions

**Acceptance Criteria:**

- Cost calculation accurate to the minute
- Duration calculation includes partial hours
- Resource becomes available immediately
- Invoice creation optional; auto-generates breakdown (session + itemized inventory)

#### 3.4 Active Sessions View

- **Priority**: High
- **Description**: Monitor all ongoing sessions

**Requirements:**

- List all active sessions
- Show customer name, resource, elapsed time (real-time), current cost (session + inventory, real-time)
- One-click add inventory consumption
- One-click end session
- Filter by resource type

**Acceptance Criteria:**

- Updates every second
- Shows 10+ sessions simultaneously
- Sort by start time or elapsed time
- Total active sessions and inventory consumption displayed

#### 3.5 Session History

- **Priority**: Medium
- **Description**: View completed sessions

**Requirements:**

- Browse past sessions with inventory consumptions
- Filter by date range, customer, resource
- View session details including itemized inventory
- Re-generate invoice
- Export to CSV

**Acceptance Criteria:**

- History unlimited or configurable
- Date range picker
- Detailed view shows chronological consumptions

---

### 4. Subscription Management

#### 4.1 Subscription Plans

- **Priority**: High
- **Description**: Define subscription types based on days (no hour limits)

**Requirements:**

- Weekly Plan: 7 days access
- Half-Monthly Plan: 15 days access
- Monthly Plan: 30 days access
- Auto-calculate end date based on plan type
- Subscriptions cover unlimited session hours during the period; billing only for inventory

**Acceptance Criteria:**

- Plan labels in Arabic and English
- End date auto-calculated
- No hours allowance (unlimited access during days)

#### 4.2 Create Subscription

- **Priority**: High
- **Description**: Assign subscription to customer

**Requirements:**

- Select customer
- Select plan type
- Set start date (default: today)
- Auto-calculate end date
- Mark as active

**Acceptance Criteria:**

- Customer can have multiple subscriptions
- Overlapping subscriptions allowed (latest active one applies)
- Active subscriptions appear in customer profile
- Sessions during active period have zero cost

#### 4.3 Manage Subscriptions

- **Priority**: High
- **Description**: View and modify subscriptions

**Requirements:**

- View all subscriptions
- Filter by plan type, active/inactive
- Edit subscription details
- Deactivate subscriptions
- View subscription history per customer

**Acceptance Criteria:**

- List shows customer name and plan type
- Show active/inactive toggle
- Deactivation retains history

#### 4.4 Subscription Tracking

- **Priority**: High
- **Description**: Track subscription validity for sessions

**Requirements:**

- Auto-check if session falls within active subscription period
- If valid, zero session cost; only inventory billed
- Alert on expiration
- Prevent sessions post-expiration without new subscription (optional)

**Acceptance Criteria:**

- Validity checked on session start/end
- Real-time display in session view

---

### 5. Inventory Management

#### 5.1 Inventory Setup

- **Priority**: Medium
- **Description**: Define inventory items with dynamic pricing

**Requirements:**

- Pre-defined product list (67 items):
  - Beverages (15 products): Tea, Coffee, Nescafé, Soft drinks, Juices
  - Snacks (8 products): Chips, Biscuits, Chocolate, Nuts
  - Meals (6 products): Instant noodles, Sandwiches, Toast, Pizza
- Default prices per item (editable for market changes)
- Default quantity per item
- Minimum stock threshold per item
- Item categories

**Acceptance Criteria:**

- Items can be added/removed
- Prices and quantities editable (price history optional)
- Minimum stock configurable
- Items organized by category

#### 5.2 Stock Management

- **Priority**: High
- **Description**: Track and update inventory levels

**Requirements:**

- View all inventory items
- Update quantities (+ / - buttons)
- Set minimum stock threshold
- Alert when stock below minimum
- Show out-of-stock items prominently
- Quick price updates (for market fluctuations)

**Acceptance Criteria:**

- Quantity changes save instantly and deduct on consumption
- Minimum stock warnings visible
- Out-of-stock items disabled in session additions
- Bulk quantity/price updates supported
- Price changes do not affect past consumptions

#### 5.3 Inventory Reports

- **Priority**: Low
- **Description**: Generate inventory reports

**Requirements:**

- View consumption by period/session/customer
- Fast-moving items report
- Low stock report
- Inventory value summary (using current prices)

**Acceptance Criteria:**

- Reports exportable to PDF/CSV
- Configurable date ranges
- Visual charts and graphs

---

### 6. Invoicing

#### 6.1 Create Invoice

- **Priority**: High
- **Description**: Generate customer invoices at session end

**Requirements:**

- Auto-populate from session (duration cost if not subscribed + inventory consumptions)
- Add extra items if needed
- Calculate subtotal
- Apply discounts
- Calculate total
- Set due date
- Set invoice status (Paid/Unpaid/Pending)

**Acceptance Criteria:**

- Auto-generates from session end
- Itemized breakdown (session + inventory)
- Real-time total calculation
- Currency formatting (EGP)
- Invoice auto-numbering (e.g., INV-0001)

#### 6.2 Invoice Management

- **Priority**: High
- **Description**: View and manage invoices

**Requirements:**

- List all invoices
- Filter by status, customer, date range
- View invoice details (with session/inventory breakdown)
- Edit invoice status
- Mark as paid/unpaid
- Print/Export invoice

**Acceptance Criteria:**

- Search by invoice number
- Status badges (Paid: Green, Unpaid: Red, Pending: Orange)
- Invoice detail view shows all line items
- Print-optimized layout

#### 6.3 Payment Tracking

- **Priority**: Medium
- **Description**: Track invoice payments

**Requirements:**

- Record payment date
- Record payment method
- Add payment notes
- Partial payments support
- Payment history per invoice

**Acceptance Criteria:**

- Payment method dropdown (Cash/Card/Transfer)
- Partial payments update remaining balance
- Cannot overpay invoice

---

### 7. Reporting

#### 7.1 Dashboard

- **Priority**: High
- **Description**: Real-time business overview

**Requirements:**

- Today's revenue (split: sessions/inventory)
- Today's active sessions
- Today's new customers
- Active subscriptions count
- Resource utilization rate
- Inventory low stock alerts
- Quick actions (New Customer, Start Session)
- Revenue chart (daily/weekly/monthly)

**Acceptance Criteria:**

- Real-time data updates
- Responsive layout (mobile, tablet, desktop)
- Charts with date range selector
- Quick action buttons

#### 7.2 Revenue Reports

- **Priority**: High
- **Description**: Financial performance tracking

**Requirements:**

- Daily revenue breakdown (sessions vs inventory)
- Weekly revenue summary
- Monthly revenue comparison
- Revenue by category (Sessions, Inventory, Subscriptions)
- Top customers by revenue
- Export to CSV/PDF

**Acceptance Criteria:**

- Configurable date ranges
- Drill-down capability (e.g., by session/inventory)
- Visual charts and tables
- Compare periods (e.g., this month vs last month)

#### 7.3 Utilization Reports

- **Priority**: Medium
- **Description**: Resource usage analytics

**Requirements:**

- Most used resources
- Peak hours analysis
- Average session duration
- Resource occupancy rate
- Capacity utilization
- Inventory consumption per session/resource

**Acceptance Criteria:**

- Heatmap for peak hours
- Resource usage bar chart
- Exportable data

#### 7.4 Customer Reports

- **Priority**: Medium
- **Description**: Customer insights

**Requirements:**

- New customers by period
- Most frequent customers
- Customer retention rate
- Subscription renewals
- Customer lifetime value
- Inventory consumption per customer

**Acceptance Criteria:**

- Sortable tables
- Filter by date range
- Export customer list with metrics

#### 7.5 Operation History

- **Priority**: High (Enhanced)
- **Description**: View and filter all operations

**Requirements:**

- Chronological log of actions (sessions start/end, inventory additions, invoices, subscriptions)
- Filter by type, date, customer, resource
- Search by keywords
- Export to CSV/PDF

**Acceptance Criteria:**

- Real-time updates
- Pagination for large logs
- Detailed view per entry

---

### 8. Settings

#### 8.1 General Settings

- **Priority**: Medium
- **Description**: Application configuration

**Requirements:**

- Company name
- Company address
- Contact information
- Currency symbol (EGP)
- Timezone
- Date format
- Tax rate configuration

**Acceptance Criteria:**

- Settings persist across sessions
- Company info appears on invoices

#### 8.2 Theme Settings

- **Priority**: Low
- **Description**: Appearance customization

**Requirements:**

- Light/Dark mode toggle
- Language selection (Arabic/English)
- Auto-detect system theme

**Acceptance Criteria:**

- Theme switches immediately
- Language changes all text
- RTL/LTR support for Arabic/English

#### 8.3 Data Management

- **Priority**: Low
- **Description**: Database operations

**Requirements:**

- Backup database
- Restore database
- Reset database (with warning)
- Export data (CSV)

**Acceptance Criteria:**

- Backup creates timestamped file
- Restore validates data integrity
- Reset requires confirmation

---

## 🎨 Non-Functional Requirements

### Performance

- Application startup time: < 3 seconds
- Page load time: < 1 second
- Database query response: < 500ms
- Support 1000+ customers without performance degradation
- Support 100+ concurrent sessions with inventory additions

### Reliability

- System uptime: > 99.5%
- Data loss rate: 0%
- Automatic crash recovery
- SQLite database with transaction support

### Usability

- Arabic/English language support
- RTL support for Arabic
- Intuitive UI with minimal training (e.g., simple inventory add button in session view)
- Consistent design system
- Accessibility (WCAG 2.1 AA)
- Keyboard navigation support

### Security

- Input validation on all forms
- SQL injection prevention (parameterized queries)
- Local database encryption (optional)
- No external data transmission
- Audit logging for critical actions (e.g., inventory price changes)

### Compatibility

- Windows 10/11
- macOS 12+ (Monterey)
- Linux (Ubuntu 22.04+, Debian 11+)
- Minimum 4GB RAM
- 100MB disk space

### Maintainability

- Modular code architecture
- TypeScript strict mode
- Comprehensive error handling
- Clear logging
- Documentation for all features

---

## 🔧 Technical Constraints

### Technology Stack

- **Frontend**: React 19.2.3 + TypeScript
- **Backend**: Rust 1.77.2+ via Tauri v2
- **Database**: SQLite (rusqlite)
- **Styling**: TailwindCSS 4.0.15
- **Routing**: TanStack Router
- **State Management**: TanStack Query
- **Forms**: TanStack Form + Zod Validation
- **UI Components**: shadcn/ui (base-vega)
- **Testing**: Playwright (E2E), Vitest (Unit)
- **Package Manager**: Bun 1.3.5

### Limitations

- No cloud sync (local-only)
- No multi-user support (single user per instance)
- No API for external integrations
- No mobile app (desktop-only)

---

## 📅 Development Roadmap

### Phase 1: Core Features (Completed ✅)

- Customer CRUD
- Resource CRUD
- Session Management
- Inventory CRUD
- Subscription CRUD
- Invoice CRUD
- Basic Reports

### Phase 2: Validation & Testing (Completed ✅)

- Egyptian phone validation
- Email validation
- Unit tests (Frontend & Backend)
- E2E tests
- Code quality improvements

### Phase 3: Enhancements (In Progress ⏳)

- Dashboard real-time data connection
- Advanced reporting features with operation history
- Invoice printing
- Data export functionality
- Mid-session inventory consumption integration

### Phase 4: Polish (Planned 📋)

- Performance optimization
- Accessibility improvements
- Documentation completion
- User onboarding flow
- Shortcuts and hotkeys (e.g., quick inventory add)

### Phase 5: Future Features (Consideration 💡)

- Multi-language support (beyond AR/EN)
- Resource booking system
- Automated subscription renewals
- SMS/Email notifications
- Cloud backup option
- Mobile companion app
- Accounting software integration

---

## 🚨 Risk Assessment

### High Priority Risks

1. **Data Loss**: Mitigate with automatic backups and validation
2. **Corrupted Database**: Implement database integrity checks and repair tools
3. **Performance Issues**: Optimize queries and implement caching for real-time inventory additions

### Medium Priority Risks

1. **User Error**: Add confirmations for destructive actions (e.g., price changes)
2. **Confusing UI**: User testing and iterative improvements for mid-session flows
3. **Missing Features**: Clear documentation and planned enhancements

### Low Priority Risks

1. **Compatibility**: Regular testing on different OS versions
2. **Security**: Regular code reviews and security audits
3. **Scalability**: Monitor performance as data grows

---

## 📊 Success Criteria

The product will be considered successful when:

- [ ] All Phase 1, 2, and 3 features are implemented, including mid-session inventory
- [ ] All critical and high priority bugs are resolved
- [ ] System handles 1000+ customers and 100+ concurrent sessions
- [ ] Average session booking time is under 30 seconds; inventory add < 10 seconds
- [ ] User satisfaction rate > 4/5
- [ ] Zero data loss incidents
- [ ] 95%+ test coverage for critical features

---

## 📝 Change History

| Date        | Version | Changes                                                                                                              | Author      |
| ----------- | ------- | -------------------------------------------------------------------------------------------------------------------- | ----------- |
| Jan 5, 2026 | 1.0.0   | Initial PRD document                                                                                                 | System      |
| Jan 6, 2026 | 1.0.1   | Updated for day-based subscriptions (no hours), mid-session inventory consumption, enhanced reports, dynamic pricing | AI Reviewer |

---

## 📚 Related Documents

- [ERP Design Document](./ERP_DESIGN.md)
- [Database Schema](../src-tauri/src/database.rs)
- [API Documentation](../src/lib/tauri-api.ts)
- [Design System](./design-system.md)

# Design System

This document defines the single source of truth for all design decisions in the Backspace application. All new components must follow these rules to maintain consistency. Updates include enhancements for mid-session inventory addition UI (e.g., quick-add buttons) and report filtering visuals.

## Table of Contents

- [Colors](#colors)
- [Typography](#typography)
- [Spacing](#spacing)
- [Border Radius](#border-radius)
- [Component Patterns](#component-patterns)

---

## Colors

All colors are defined in `src/index.css` using OKLCH color space. Use CSS variables, not hard-coded values.

### Semantic Color Tokens

```css
/* Primary */
--primary: oklch(0.852 0.199 91.936);
--primary-foreground: oklch(0.421 0.095 57.708);

/* Secondary */
--secondary: oklch(0.967 0.001 286.375);
--secondary-foreground: oklch(0.21 0.006 285.885);

/* Neutral */
--background: oklch(1 0 0);
--foreground: oklch(0.145 0 0);
--muted: oklch(0.97 0 0);
--muted-foreground: oklch(0.556 0 0);
--border: oklch(0.922 0 0);
--input: oklch(0.922 0 0);
--ring: oklch(0.708 0 0);

/* Destructive */
--destructive: oklch(0.58 0.22 27);
```

### Status Colors (light mode)

```css
--color-blue: oklch(0.55 0.22 251);
--color-purple: oklch(0.55 0.22 301);
--color-emerald: oklch(0.55 0.22 142);
--color-orange: oklch(0.55 0.22 45);
--color-amber: oklch(0.55 0.22 70);

/* Background variants */
--color-blue-bg: oklch(0.96 0.02 251);
--color-purple-bg: oklch(0.96 0.02 301);
--color-emerald-bg: oklch(0.96 0.02 142);
--color-orange-bg: oklch(0.96 0.02 45);
--color-amber-bg: oklch(0.96 0.02 70);

/* Border variants */
--color-blue-border: oklch(0.88 0.04 251);
--color-purple-border: oklch(0.88 0.04 301);
--color-emerald-border: oklch(0.88 0.04 142);
--color-orange-border: oklch(0.88 0.04 45);
--color-amber-border: oklch(0.88 0.04 70);
```

## Typography

### Font Family

```css
--font-sans: "Noto Sans Variable", sans-serif;
```

### Typography Scale

| Tailwind Class | Font Size       | Usage                                                       |
| -------------- | --------------- | ----------------------------------------------------------- |
| `text-xs`      | 0.75rem (12px)  | Table headers, badges, small labels                         |
| `text-sm`      | 0.875rem (14px) | Card titles, button text, table cells, inventory add labels |
| `text-base`    | 1rem (16px)     | Body text, subheaders                                       |
| `text-lg`      | 1.125rem (18px) | Section headings                                            |
| `text-xl`      | 1.25rem (20px)  | Page headings                                               |
| `text-2xl`     | 1.5rem (24px)   | Page titles                                                 |
| `text-3xl`     | 1.875rem (30px) | Hero titles                                                 |

### Font Weight

| Tailwind Class   | Usage                        |
| ---------------- | ---------------------------- |
| `font-extrabold` | Card titles, section headers |
| `font-bold`      | Emphasized text, navigation  |
| `font-semibold`  | Labels, values               |
| `font-medium`    | Body text, descriptions      |
| `font-normal`    | Regular text                 |

---

## Spacing

### Spacing Scale

| Tailwind Class | Value          | Usage                                           |
| -------------- | -------------- | ----------------------------------------------- |
| `gap-2`        | 0.5rem (8px)   | Icon with text                                  |
| `gap-3`        | 0.75rem (12px) | Card content, form fields, inventory list items |
| `gap-4`        | 1rem (16px)    | Cards, sections, layout                         |
| `space-y-2`    | 0.5rem (8px)   | Form fields                                     |
| `space-y-3`    | 0.75rem (12px) | Related items                                   |
| `space-y-4`    | 1rem (16px)    | Sections, cards                                 |
| `space-y-6`    | 1.5rem (24px)  | Major sections                                  |

### Padding

| Element        | Padding                         |
| -------------- | ------------------------------- |
| Card content   | `p-4`                           |
| Card header    | `pb-3`                          |
| Dialog content | `p-4`                           |
| Page container | `p-6` (desktop), `p-4` (mobile) |
| Button         | `px-4 py-2` (default)           |
| Input          | `px-3 py-1`                     |

## Border Radius

### Radius Scale

```css
--radius-sm: calc(var(--radius) - 4px);   /* 0.25rem */
--radius-md: calc(var(--radius) - 2px);   /* 0.5rem */
--radius-lg: var(--radius);                 /* 0.75rem (12px) - DEFAULT */
--radius-xl: calc(var(--radius) + 4px);   /* 1rem */
--radius-2xl: calc(var(--radius) + 8px);  /* 1.5rem */
--radius-3xl: calc(var(--radius) + 12px); /* 2rem */
--radius-4xl: calc(var(--radius) + 16px); /* 2.5rem */
```

### Component Border Radius

| Component      | Radius   | Tailwind Class |
| -------------- | -------- | -------------- |
| Card (default) | 0.75rem  | `rounded-lg`   |
| Dialog         | 0.75rem  | `rounded-lg`   |
| Button         | 0.375rem | `rounded-md`   |
| Input          | 0.375rem | `rounded-md`   |
| Badge          | 9999px   | `rounded-4xl`  |
| Table cells    | 0        | `rounded-none` |
| Avatar         | 9999px   | `rounded-full` |

## Icons

### Icon Sizes

| Usage                    | Tailwind Class | Size |
| ------------------------ | -------------- | ---- |
| With text (button/label) | `h-4 w-4`      | 16px |
| Section header icon      | `h-4 w-4`      | 16px |
| Large icon (hero)        | `h-5 w-5`      | 20px |
| Extra large              | `h-6 w-6`      | 24px |
| Inventory add button     | `h-4 w-4`      | 16px |

## Quick Reference

### Common Classes

- **Card**: `rounded-lg border shadow-sm`
- **Card Title**: `text-sm font-extrabold`
- **Button**: `h-9 px-4`
- **Input**: `h-9 px-3 py-1 rounded-md`
- **Table Header**: `text-xs font-bold uppercase tracking-wider text-muted-foreground`
- **Table Cell**: `text-sm font-medium py-3`
- **Badge**: `px-2 py-0.5 text-[10px] font-bold`
- **Icon**: `h-4 w-4`
- **Spacing**: `space-y-4`, `gap-4`
- **Inventory Add Button**: `bg-primary text-primary-foreground rounded-md px-3 py-1` (quick-add in session view)

---

## Checklist for New Components

When creating a new component, verify it follows these rules:

- [ ] Uses CSS variables for colors (e.g., `bg-[var(--color-emerald-bg)]`)
- [ ] Uses `rounded-lg` for cards, `rounded-md` for buttons/inputs
- [ ] Uses `text-sm font-extrabold` for card titles
- [ ] Uses `text-xs font-bold uppercase` for table headers
- [ ] Uses `text-sm font-medium` for table cells
- [ ] Uses `h-9` for inputs and buttons
- [ ] Uses `h-4 w-4` for icons
- [ ] Uses `space-y-4` for card spacing
- [ ] Uses `gap-4` for grid layouts
- [ ] Uses `p-4` for card content
- [ ] Follows the component patterns above
- [ ] For session views: Quick-add inventory uses compact layout with `gap-3`

---

## Resources

- **Colors**: `src/index.css` (lines 7-116)
- **Theme**: `components.json`
- **Base components**: `src/components/ui/`

---

# Backspace - ERP System Design Document

## 📋 Document Information

**Product**: Backspace ERP System
**Version**: 1.0.1 (Updated for session-inventory integration, day-based subscriptions, and enhanced reports)
**Last Updated**: January 6, 2026
**Status**: Active
**Authors**: Backspace Development Team

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│                    (React + TypeScript)                     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │     Hooks    │      │
│  │  (Routes)    │  │   (UI Lib)   │  │ (Custom &   │      │
│  │              │  │              │  │  Query)     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                       │
│                    │  State Mgmt     │                       │
│                    │ (TanStack Query)│                       │
│                    └───────┬────────┘                       │
└────────────────────────────┼────────────────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │  Tauri IPC Bridge (API)     │
              │  (invoke commands)           │
              └──────────────┬──────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                   Backend Layer (Rust)                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Commands   │  │  Validation  │  │   Database   │      │
│  │   (Handlers) │  │    Module    │  │  (SQLite)    │      │
│  └──────────────┘  └──────────────┘  └──────┬───────┘      │
│                                              │              │
└──────────────────────────────────────────────┘              │
                                              │
                             ┌──────────────▼──────────────┐
                             │   Local SQLite Database      │
                             │   (Single File Storage)      │
                             └─────────────────────────────┘
```

### Technology Stack

#### Frontend

| Technology      | Version | Purpose                 |
| --------------- | ------- | ----------------------- |
| React           | 19.2.3  | UI Framework            |
| TypeScript      | 5.x     | Type Safety             |
| TanStack Router | 1.141.1 | Client-side Routing     |
| TanStack Query  | 5.90.12 | Server State Management |
| TanStack Form   | 1.12.3  | Form State Management   |
| Zod             | 4.1.13  | Schema Validation       |
| TailwindCSS     | 4.0.15  | Styling                 |
| shadcn/ui       | Latest  | UI Components           |
| Lucide React    | 0.473.0 | Icons                   |
| Next Themes     | 0.4.6   | Theme Management        |
| Sonner          | 2.0.5   | Toast Notifications     |

#### Backend

| Technology        | Version | Purpose            |
| ----------------- | ------- | ------------------ |
| Rust              | 1.77.2+ | Backend Language   |
| Tauri             | 2.9.5   | Desktop Framework  |
| SQLite (rusqlite) | 0.32    | Database Engine    |
| UUID              | 4.x     | Unique IDs         |
| Chrono            | 0.4     | Date/Time Handling |
| Serde             | 1.x     | Serialization      |

---

## 🗄️ Database Design

### Entity Relationship Diagram

```
┌─────────────────┐
│   customers     │
├─────────────────┤
│ id (PK)         │───────┐
│ human_id        │       │
│ name            │       │
│ phone           │       │
│ email           │       │
│ customer_type   │       │
│ balance         │       │
│ notes           │       │
│ created_at      │       │
└─────────────────┘       │
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        │                 │                 │
┌───────▼────────┐  ┌────▼─────────┐  ┌──▼──────────────┐
│   sessions     │  │  invoices    │  │  subscriptions   │
├────────────────┤  ├──────────────┤  ├─────────────────┤
│ id (PK)        │  │ id (PK)      │  │ id (PK)         │
│ customer_id FK │  │ customer_id FK│ │ customer_id FK   │
│ resource_id FK  │  │ session_id FK │ │ plan_type       │
│ started_at     │  │ amount       │  │ start_date      │
│ ended_at       │  │ status       │  │ end_date        │
│ duration_min   │  │ due_date     │  │ is_active       │
│ amount         │  │ paid_date    │  │ created_at      │
│ created_at     │  │ created_at   │  └─────────────────┘
└────────────────┘  └──────────────┘
        │
        │
┌───────▼────────┐  ┌─────────────────┐
│   resources     │  │   inventory     │
├────────────────┤  ├─────────────────┤
│ id (PK)         │  │ id (PK)         │
│ name            │  │ name            │
│ resource_type   │  │ quantity        │
│ rate_per_hour   │  │ min_stock       │
│ is_available    │  │ price           │
│ created_at      │  │ created_at      │
└────────────────┘  └──────┬──────────┘
                           │
                           │
              ┌────────────▼─────────────┐
              │   inventory_consumptions │
              ├──────────────────────────┤
              │ id (PK)                  │
              │ session_id FK             │
              │ inventory_id FK           │
              │ quantity                 │
              │ price_at_consumption      │
              │ created_at                │
              └──────────────────────────┘
```

### Table Schemas

#### 1. customers

```sql
CREATE TABLE customers (
    id TEXT PRIMARY KEY,                    -- UUID
    human_id TEXT NOT NULL UNIQUE,          -- Human-readable ID (C-001)
    name TEXT NOT NULL,                     -- Full name
    phone TEXT NOT NULL UNIQUE,             -- Phone number
    email TEXT,                            -- Email address
    customer_type TEXT NOT NULL,           -- 'visitor' | 'weekly' | 'half-monthly' | 'monthly'
    balance REAL DEFAULT 0,                 -- Account balance
    notes TEXT,                            -- Additional notes
    created_at TEXT NOT NULL                -- ISO 8601 timestamp
);

CREATE INDEX idx_customers_human_id ON customers(human_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_type ON customers(customer_type);
```

**Constraints:**

- `human_id`: Auto-incremented format (C-001, C-002, ...)
- `phone`: Must be valid Egyptian format (10 or 11 digits starting with 1)
- `customer_type`: Enum values
- `balance`: Can be negative (debt) or positive (credit)

#### 2. resources

```sql
CREATE TABLE resources (
    id TEXT PRIMARY KEY,                    -- UUID
    name TEXT NOT NULL,                     -- Resource name (e.g., "Seat A1")
    resource_type TEXT NOT NULL,            -- 'seat' | 'room' | 'desk'
    rate_per_hour REAL NOT NULL,            -- Hourly rate
    is_available INTEGER NOT NULL DEFAULT 1, -- Boolean (0 or 1)
    created_at TEXT NOT NULL                -- ISO 8601 timestamp
);

CREATE INDEX idx_resources_type ON resources(resource_type);
CREATE INDEX idx_resources_availability ON resources(is_available);
```

**Constraints:**

- `rate_per_hour`: Must be > 0
- `is_available`: 1 = available, 0 = occupied
- `resource_type`: Enum values

#### 3. sessions

```sql
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,                    -- UUID
    customer_id TEXT NOT NULL,              -- Customer UUID
    resource_id TEXT NOT NULL,              -- Resource UUID
    started_at TEXT NOT NULL,                -- Session start time
    ended_at TEXT,                         -- Session end time (NULL if active)
    duration_minutes INTEGER,                -- Duration in minutes (NULL if active)
    amount REAL,                           -- Calculated session cost (NULL if active; 0 if subscribed)
    created_at TEXT NOT NULL                -- ISO 8601 timestamp
);

CREATE INDEX idx_sessions_customer ON sessions(customer_id);
CREATE INDEX idx_sessions_resource ON sessions(resource_id);
CREATE INDEX idx_sessions_started_at ON sessions(started_at);
CREATE INDEX idx_sessions_ended_at ON sessions(ended_at);
CREATE INDEX idx_sessions_active ON sessions(ended_at) WHERE ended_at IS NULL;

FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE RESTRICT
```

**Constraints:**

- `started_at`: Cannot be in the future
- `ended_at`: Must be >= started_at if not NULL
- `duration_minutes`: Auto-calculated on session end
- `amount`: Auto-calculated as `(duration_minutes / 60) * resource.rate_per_hour` if not subscribed; 0 if subscribed

#### 4. subscriptions

```sql
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY,                    -- UUID
    customer_id TEXT NOT NULL,              -- Customer UUID
    plan_type TEXT NOT NULL,                -- 'weekly' | 'half-monthly' | 'monthly'
    start_date TEXT NOT NULL,               -- Subscription start date
    end_date TEXT NOT NULL,                 -- Subscription end date
    is_active INTEGER NOT NULL DEFAULT 1,    -- Boolean (0 or 1)
    created_at TEXT NOT NULL                -- ISO 8601 timestamp
);

CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_plan_type ON subscriptions(plan_type);
CREATE INDEX idx_subscriptions_active ON subscriptions(is_active);
CREATE INDEX idx_subscriptions_dates ON subscriptions(start_date, end_date);

FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
```

**Constraints:**

- `plan_type`: Enum values
- `start_date`: Cannot be in the future
- `end_date`: Auto-calculated based on plan_type (weekly: +7 days, half-monthly: +15 days, monthly: +30 days)
- `is_active`: 1 = active, 0 = inactive
- No hours_allowance (unlimited access during period)

#### 5. invoices

```sql
CREATE TABLE invoices (
    id TEXT PRIMARY KEY,                    -- UUID
    customer_id TEXT NOT NULL,              -- Customer UUID
    session_id TEXT,                        -- Optional Session UUID
    amount REAL NOT NULL,                   -- Total amount (session + inventory)
    status TEXT NOT NULL,                   -- 'paid' | 'unpaid' | 'pending'
    due_date TEXT,                          -- Due date
    paid_date TEXT,                         -- Paid date
    created_at TEXT NOT NULL                -- ISO 8601 timestamp
);

CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_session ON invoices(session_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);

FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
```

**Constraints:**

- `amount`: Must be >= 0
- `status`: Enum values

#### 6. inventory

```sql
CREATE TABLE inventory (
    id TEXT PRIMARY KEY,                    -- UUID
    name TEXT NOT NULL,                     -- Item name
    quantity INTEGER NOT NULL DEFAULT 0,     -- Current stock
    min_stock INTEGER NOT NULL DEFAULT 0,    -- Minimum threshold
    price REAL NOT NULL,                    -- Current price (editable)
    category TEXT,                          -- e.g., 'beverage', 'snack'
    created_at TEXT NOT NULL                -- ISO 8601 timestamp
);

CREATE INDEX idx_inventory_name ON inventory(name);
CREATE INDEX idx_inventory_category ON inventory(category);
```

**Constraints:**

- `quantity`: Must be >= 0
- `price`: Must be > 0

#### 7. inventory_consumptions (New Table)

```sql
CREATE TABLE inventory_consumptions (
    id TEXT PRIMARY KEY,                    -- UUID
    session_id TEXT NOT NULL,               -- Session UUID
    inventory_id TEXT NOT NULL,             -- Inventory UUID
    quantity INTEGER NOT NULL,              -- Consumed quantity
    price_at_consumption REAL NOT NULL,     -- Price locked at consumption time
    created_at TEXT NOT NULL                -- ISO 8601 timestamp
);

CREATE INDEX idx_consumptions_session ON inventory_consumptions(session_id);
CREATE INDEX idx_consumptions_inventory ON inventory_consumptions(inventory_id);
CREATE INDEX idx_consumptions_created_at ON inventory_consumptions(created_at);

FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE RESTRICT
```

**Constraints:**

- `quantity`: Must be > 0
- `price_at_consumption`: Copied from inventory.price at addition time (for dynamic pricing)

---

## 🔒 Security Design

### Input Validation

#### Frontend Validation

```typescript
// Egyptian Phone Validation
const egyptianPhoneSchema = z.string().regex(
  /^(\+20|0)?1[0125]\d{8}$/,
  'Invalid Egyptian phone number'
);

// Email Validation (RFC 5322)
const emailSchema = z.string()
  .email('Invalid email address')
  .refine(email => !isDisposableEmail(email), 'Disposable emails not allowed');
```

#### Backend Validation

```rust
// Egyptian Phone Validation (Rust)
pub fn validate_egyptian_phone(phone: &str) -> Result<(), AppError> {
    let normalized = normalize_phone(phone)?;
    if !regex::Regex::new(r"^1[0125]\d{8}$")?.is_match(&normalized) {
        return Err(AppError::Validation(
            "Invalid Egyptian phone number".to_string()
        ));
    }
    Ok(())
}

```

### SQL Injection Prevention

```rust
// Parameterized queries (rusqlite)
conn.execute(
    "INSERT INTO customers (id, name, phone) VALUES (?, ?, ?)",
    params![id, name, phone]
)?;

// Safe - no string concatenation
```

### Data Sanitization

```rust
// Input trimming and validation
pub fn sanitize_string(input: &str) -> String {
    input.trim().to_string()
}
```

---

## 📊 Validation Module

### Egyptian Phone Validator

**Features:**

- Normalize phone numbers (+20 → 0)
- Validate Egyptian carrier prefixes (010, 011, 012, 015)
- Detect carrier type (Vodafone, Etisalat, Orange, WE)
- International format support

**Implementation:**

```typescript
// src/lib/validation/validators/egyptian-phone.ts
export function validateEgyptianPhone(
  phone: string
): Result<ValidatedPhone, ValidationError> {
  const normalized = normalizePhone(phone);
  const carrier = detectCarrier(normalized);

  if (!isValidPhone(normalized)) {
    return { success: false, error: 'Invalid Egyptian phone number' };
  }

  return {
    success: true,
    data: {
      original: phone,
      normalized,
      international: `+20${normalized.substring(1)}`,
      carrier,
    },
  };
}
```

### Email Validator

**Features:**

- RFC 5322 compliant validation
- Disposable email detection
- Common typos detection
- Domain validation

**Implementation:**

```typescript
// src/lib/validation/validators/email.ts
export function validateEmail(
  email: string
): Result<ValidatedEmail, ValidationError> {
  if (!isValidEmailFormat(email)) {
    return { success: false, error: 'Invalid email format' };
  }

  if (isDisposableEmail(email)) {
    return { success: false, error: 'Disposable emails not allowed' };
  }

  return {
    success: true,
    data: {
      email: email.toLowerCase(),
      domain: extractDomain(email),
      suggestions: suggestCorrections(email),
    },
  };
}
```

---

## 🧪 Testing Strategy

### Unit Tests

#### Frontend (Vitest)

```typescript
// Example: egyptian-phone.test.ts
import { describe, it, expect } from 'vitest';
import { validateEgyptianPhone } from './egyptian-phone';

describe('validateEgyptianPhone', () => {
  it('should validate valid Vodafone number', () => {
    const result = validateEgyptianPhone('01012345678');
    expect(result.success).toBe(true);
    expect(result.data?.carrier).toBe('Vodafone');
  });

  it('should reject invalid phone number', () => {
    const result = validateEgyptianPhone('1234567890');
    expect(result.success).toBe(false);
  });
});
```

#### Backend (Rust)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_egyptian_phone_valid() {
        let result = validate_egyptian_phone("01012345678");
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_egyptian_phone_invalid() {
        let result = validate_egyptian_phone("1234567890");
        assert!(result.is_err());
    }
}
```

### E2E Tests (Playwright)

```typescript
// Example: session-inventory.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Session Management', () => {
  test('should add inventory during active session', async ({ page }) => {
    await page.goto('/sessions');
    // Assume session started
    await page.getByRole('button', { name: 'Add Inventory' }).click();
    await page.getByLabel('Item').selectOption('Tea');
    await page.getByLabel('Quantity').fill('2');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Inventory added')).toBeVisible();
  });
});
```

### Test Coverage Goals

- Unit tests: 80%+ coverage
- E2E tests: Critical user flows (including mid-session inventory)
- Integration tests: API commands

---

## 📈 Performance Optimization

### Frontend Optimization

1. **Code Splitting**: Lazy load routes and components
2. **Memoization**: React.memo, useMemo, useCallback
3. **Query Caching**: TanStack Query caching for inventory lists
4. **Virtual Scrolling**: For long operation history logs
5. **Bundle Size**: Tree shaking, minification

### Backend Optimization

1. **Database Indexing**: Indexed queries for consumptions and reports
2. **Query Optimization**: JOIN efficiency for session + consumptions
3. **Connection Pooling**: SQLite connection management
4. **Caching**: In-memory caching for frequently accessed data (e.g., current prices)

### Performance Targets

- Initial load: < 3 seconds
- Page navigation: < 1 second
- API response: < 500ms
- Inventory addition: < 200ms
- Form submission: < 1 second

---

## 🔄 Data Flow

### Session Lifecycle with Inventory

```
User Action           Frontend          Backend           Database
   │                    │                 │                  │
   │  Start Session     │                 │                  │
   ├───────────────────>│                 │                  │
   │                    │  invoke()       │                  │
   │                    ├────────────────>│                  │
   │                    │                 │  INSERT sessions   │
   │                    │                 ├─────────────────>│
   │                    │                 │<─────────────────┤
   │                    │<────────────────┤                  │
   │<───────────────────┤                 │                  │
   │                    │                 │                  │
   │  Add Inventory     │                 │                  │
   ├───────────────────>│                 │                  │
   │                    │  invoke()       │                  │
   │                    ├────────────────>│                  │
   │                    │                 │  INSERT consumptions │
   │                    │                 │  UPDATE inventory qty │
   │                    │                 ├─────────────────>│
   │                    │                 │<─────────────────┤
   │                    │<────────────────┤                  │
   │<───────────────────┤                 │                  │
   │                    │                 │                  │
   │  End Session       │                 │                  │
   ├───────────────────>│                 │                  │
   │                    │  invoke()       │                  │
   │                    ├────────────────>│                  │
   │                    │                 │  UPDATE sessions   │
   │                    │                 │  (calc duration,  │
   │                    │                 │   amount if not sub) │
   │                    │                 │  SUM consumptions  │
   │                    │                 │  INSERT invoice    │
   │                    │                 ├─────────────────>│
   │                    │                 │<─────────────────┤
   │                    │<────────────────┤                  │
   │<───────────────────┤                 │                  │
```

### Invoice Creation Flow

```
1. End Session → Calculate Session Cost (0 if subscribed)
2. Sum Inventory Consumptions → Calculate Line Items
3. Review Invoice → Display Summary (session + itemized inventory)
4. Confirm → Create Invoice Record
5. Print → Generate PDF/Print View
```

---

## 🚨 Error Handling

### Error Types

```typescript
// Frontend Error Types
enum AppError {
  ValidationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  NetworkError,
  StockInsufficient, // New for inventory
}

// Backend Error Types
enum AppError {
  Validation(String),
  NotFound(String),
  Conflict(String),
  Database(String),
  InsufficientStock(String), // New
}
```

### Error Display

```typescript
// Toast notifications (Sonner)
toast.error(
  language === 'ar'
    ? `فشل: ${errorMessage}`
    : `Failed: ${errorMessage}`
);

// Form errors
<ErrorMessage>{errors.name?.message}</ErrorMessage>
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  /* Single column layout */
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  /* Two column layout */
}

/* Desktop */
@media (min-width: 1025px) {
  /* Multi column layout */
}
```

### Mobile Optimizations

- Touch-friendly buttons (min 44x44px)
- Bottom navigation
- Swipe gestures for history logs
- Optimized forms for inventory add

---

## 🌐 Internationalization

### Supported Languages

- **Arabic (ar)**: RTL support, Egyptian phone formats
- **English (en)**: LTR support

### Translation Structure

```typescript
// src/lib/i18n.ts
export const translations = {
  sessions: {
    addInventory: {
      ar: 'إضافة استهلاك من المخزون',
      en: 'Add Inventory Consumption',
    },
    // ...
  },
};

// Usage
const t = translations.sessions.addInventory[language];
```

### RTL/LTR Support

```typescript
const { dir } = useI18n(); // 'rtl' or 'ltr'

<div dir={dir}>
  {/* Content */}
</div>
```

---

## 📊 Analytics & Monitoring

### Metrics to Track

- Page load times
- API response times
- User actions (create, update, delete, inventory add)
- Error rates
- Feature usage (e.g., mid-session additions)

### Logging

```typescript
// Console logging
console.log('[App]', 'Action completed', data);

// Error logging
console.error('[App]', 'Error occurred', error);

// Backend logging (Rust)
println!("[INFO] Inventory consumed: {} for session {}", item_id, session_id);
```

---

## 🔄 Future Enhancements

### Potential Features

1. **Multi-user support**: Role-based access control
2. **Cloud sync**: Backup to cloud storage
3. **API integration**: External accounting software
4. **SMS notifications**: Session reminders
5. **Mobile app**: iOS and Android apps
6. **Resource booking**: Future reservations
7. **Automated workflows**: Subscription renewals

### Scalability Considerations

- Database migration (PostgreSQL for cloud)
- API layer (REST or GraphQL)
- Microservices architecture
- Load balancing

---

## 📚 Documentation

### Code Documentation

- JSDoc for TypeScript
- Rustdoc for Rust
- README for each feature module

### User Documentation

- User manual (Arabic/English)
- Video tutorials
- FAQ section
- Support contact

---

## ✅ Version History

| Version | Date        | Changes                                                                                                                                   |
| ------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0.0   | Jan 5, 2026 | Initial design document                                                                                                                   |
| 1.0.1   | Jan 6, 2026 | Updated DB schema (removed hours_allowance, added inventory_consumptions), data flows for mid-session inventory, enhanced testing/reports | AI Reviewer |

---

## 📝 Change Requests

All change requests must be submitted through the project management system and approved by the technical lead before implementation.

---

## 🔗 Related Documents

- [Product Requirements Document (PRD)](./PRD.md)
- [Design System](./design-system.md)
- [API Documentation](../src/lib/tauri-api.ts)
- [Database Schema](../src-tauri/src/database.rs)
