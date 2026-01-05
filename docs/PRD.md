# Backspace - Product Requirements Document (PRD)

## 📋 Executive Summary

**Product Name**: Backspace
**Version**: 1.0.0
**Last Updated**: January 5, 2026
**Status**: Active Development

Backspace is a comprehensive coworking space management system designed to simplify daily operations for coworking space owners and managers. Built as a modern desktop application using Tauri v2, it provides tools for customer management, resource scheduling, session tracking, inventory control, subscription handling, and billing.

---

## 🎯 Product Vision

To create an intuitive, efficient, and comprehensive management system that empowers coworking space operators to focus on their core business while the software handles the complexities of daily operations.

### Core Values

- **Simplicity**: Easy-to-use interface with minimal training required
- **Efficiency**: Streamlined workflows that save time and reduce errors
- **Reliability**: Stable desktop application that works offline
- **Flexibility**: Adaptable to different coworking space sizes and business models
- **Localization**: Full Arabic/English support with RTL capabilities

---

## 👥 Target Audience

### Primary Users

- **Coworking Space Owners**: Small to medium-sized space operators
- **Space Managers**: Daily operations staff
- **Receptionists**: Front desk personnel handling check-ins and payments
- **Administrators**: Users managing subscriptions and reporting

### Secondary Users

- **Accountants**: Users requiring financial reports and invoice data
- **Technical Staff**: Users managing resources and inventory

### User Personas

#### Ahmed (Space Owner)

- Runs a 20-seat coworking space in Tanta
- Needs quick access to revenue and usage statistics
- Prefers Arabic interface
- Wants to track subscription renewals

#### Sara (Receptionist)

- Handles daily check-ins and check-outs
- Needs fast resource selection
- Manages customer registrations
- Creates invoices for session and product purchases

#### Mohamed (Manager)

- Monitors space utilization
- Reviews weekly reports
- Manages inventory levels
- Handles subscription modifications

---

## 🏢 Business Requirements

### Key Business Objectives

1. **Increase Operational Efficiency**: Reduce time spent on administrative tasks by 50%
2. **Improve Customer Experience**: Faster check-in/check-out processes
3. **Revenue Tracking**: Real-time visibility into daily, weekly, and monthly revenue
4. **Resource Optimization**: Better utilization tracking of seats and rooms
5. **Inventory Control**: Maintain optimal stock levels of refreshments and supplies

### Success Metrics

- Average session booking time: < 30 seconds
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
- Select customer type (Visitor/Monthly Member/Quarterly Member/Annual Member)
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
- View customer history (sessions, subscriptions, invoices)
- Track customer balance
- View customer statistics (total sessions, total spent)
- Search customers by name, phone, or ID

**Acceptance Criteria:**

- Profile updates reflect immediately
- History shows chronological order
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
- Optional: Select subscription if applicable
- Display estimated hourly cost

**Acceptance Criteria:**

- Session starts with one click
- Resources filter by availability
- Start time accurate to the second
- Subscription hours deducted automatically

#### 3.2 Session End

- **Priority**: Critical
- **Description**: Complete a customer session

**Requirements:**

- Auto-capture end time (current time)
- Calculate duration in minutes
- Calculate cost based on hourly rate
- Apply subscription discount if applicable
- Display final amount
- Option to create invoice immediately
- Release resource for new sessions

**Acceptance Criteria:**

- Cost calculation accurate to the minute
- Duration calculation includes partial hours
- Resource becomes available immediately
- Invoice creation optional

#### 3.3 Active Sessions View

- **Priority**: High
- **Description**: Monitor all ongoing sessions

**Requirements:**

- List all active sessions
- Show customer name and resource
- Display elapsed time (real-time)
- Show current cost (real-time)
- One-click end session
- Filter by resource type

**Acceptance Criteria:**

- Updates every second
- Shows 10+ sessions simultaneously
- Sort by start time or elapsed time
- Total active sessions displayed

#### 3.4 Session History

- **Priority**: Medium
- **Description**: View completed sessions

**Requirements:**

- Browse past sessions
- Filter by date range
- Filter by customer
- Search by resource
- View session details
- Re-generate invoice

**Acceptance Criteria:**

- History unlimited or configurable
- Date range picker
- Export to CSV

---

### 4. Subscription Management

#### 4.1 Subscription Plans

- **Priority**: High
- **Description**: Define subscription types

**Requirements:**

- Weekly Plan: 7 days, X hours included
- Half-Monthly Plan: 15 days, Y hours included
- Monthly Plan: 30 days, Z hours included
- Customizable hours allowance per plan
- Auto-calculate end date based on plan type

**Acceptance Criteria:**

- Plan labels in Arabic and English
- Hours allowance configurable per subscription
- End date auto-calculated

#### 4.2 Create Subscription

- **Priority**: High
- **Description**: Assign subscription to customer

**Requirements:**

- Select customer
- Select plan type
- Set start date (default: today)
- Set hours allowance
- Auto-calculate end date
- Mark as active

**Acceptance Criteria:**

- Customer can have multiple subscriptions
- Overlapping subscriptions allowed
- Hours tracked separately per subscription
- Active subscriptions appear in customer profile

#### 4.3 Manage Subscriptions

- **Priority**: High
- **Description**: View and modify subscriptions

**Requirements:**

- View all subscriptions
- Filter by plan type
- Filter by active/inactive status
- Edit subscription details
- Deactivate subscriptions
- View subscription history per customer

**Acceptance Criteria:**

- List shows customer name and plan type
- Filter by plan type (Weekly/Half-Monthly/Monthly)
- Show active/inactive toggle
- Deactivation retains history

#### 4.4 Hours Tracking

- **Priority**: High
- **Description**: Track subscription hours usage

**Requirements:**

- Deduct hours from active subscription
- Show remaining hours in customer profile
- Alert when hours running low
- Prevent sessions without sufficient hours (optional)

**Acceptance Criteria:**

- Hours calculated from session duration
- Partial hours supported (e.g., 30 minutes = 0.5 hours)
- Rounding configurable (nearest 15, 30, or 60 minutes)
- Real-time remaining hours display

---

### 5. Inventory Management

#### 5.1 Inventory Setup

- **Priority**: Medium
- **Description**: Define inventory items

**Requirements:**

- Pre-defined product list (67 items):
  - Beverages (15 products): Tea, Coffee, Nescafé, Soft drinks, Juices
  - Snacks (8 products): Chips, Biscuits, Chocolate, Nuts
  - Meals (6 products): Instant noodles, Sandwiches, Toast, Pizza
- Default prices per item
- Default quantity per item
- Minimum stock threshold per item
- Item categories

**Acceptance Criteria:**

- Items can be added/removed
- Prices and quantities editable
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
- Quick price updates

**Acceptance Criteria:**

- Quantity changes save instantly
- Minimum stock warnings visible
- Out-of-stock items disabled in invoices
- Bulk quantity updates supported

#### 5.3 Inventory Reports

- **Priority**: Low
- **Description**: Generate inventory reports

**Requirements:**

- View consumption by period
- Fast-moving items report
- Low stock report
- Inventory value summary

**Acceptance Criteria:**

- Reports exportable to PDF/CSV
- Configurable date ranges
- Visual charts and graphs

---

### 6. Invoicing

#### 6.1 Create Invoice

- **Priority**: High
- **Description**: Generate customer invoices

**Requirements:**

- Select customer
- Add session charges
- Add inventory items
- Calculate subtotal
- Apply discounts
- Calculate total
- Set due date
- Set invoice status (Paid/Unpaid/Pending)

**Acceptance Criteria:**

- Auto-populate from active session
- Search and add multiple inventory items
- Real-time total calculation
- Currency formatting (EGP)
- Invoice auto-numbering (e.g., INV-0001)

#### 6.2 Invoice Management

- **Priority**: High
- **Description**: View and manage invoices

**Requirements:**

- List all invoices
- Filter by status
- Filter by customer
- Filter by date range
- View invoice details
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

- Today's revenue
- Today's active sessions
- Today's new customers
- Active subscriptions count
- Resource utilization rate
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

- Daily revenue breakdown
- Weekly revenue summary
- Monthly revenue comparison
- Revenue by category (Sessions, Inventory, Subscriptions)
- Top customers by revenue
- Export to CSV/PDF

**Acceptance Criteria:**

- Configurable date ranges
- Drill-down capability
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

**Acceptance Criteria:**

- Sortable tables
- Filter by date range
- Export customer list with metrics

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
- Support 100+ concurrent sessions

### Reliability

- System uptime: > 99.5%
- Data loss rate: 0%
- Automatic crash recovery
- SQLite database with transaction support

### Usability

- Arabic/English language support
- RTL support for Arabic
- Intuitive UI with minimal training
- Consistent design system
- Accessibility (WCAG 2.1 AA)
- Keyboard navigation support

### Security

- Input validation on all forms
- SQL injection prevention (parameterized queries)
- Local database encryption (optional)
- No external data transmission
- Audit logging for critical actions

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
- Advanced reporting features
- Invoice printing
- Data export functionality

### Phase 4: Polish (Planned 📋)

- Performance optimization
- Accessibility improvements
- Documentation completion
- User onboarding flow
- Shortcuts and hotkeys

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
3. **Performance Issues**: Optimize queries and implement caching

### Medium Priority Risks

1. **User Error**: Add confirmations for destructive actions
2. **Confusing UI**: User testing and iterative improvements
3. **Missing Features**: Clear documentation and planned enhancements

### Low Priority Risks

1. **Compatibility**: Regular testing on different OS versions
2. **Security**: Regular code reviews and security audits
3. **Scalability**: Monitor performance as data grows

---

## 📊 Success Criteria

The product will be considered successful when:

- [ ] All Phase 1, 2, and 3 features are implemented
- [ ] All critical and high priority bugs are resolved
- [ ] System handles 1000+ customers and 100+ concurrent sessions
- [ ] Average session booking time is under 30 seconds
- [ ] User satisfaction rate > 4/5
- [ ] Zero data loss incidents
- [ ] 95%+ test coverage for critical features

---

## 📝 Change History

| Date        | Version | Changes              | Author |
| ----------- | ------- | -------------------- | ------ |
| Jan 5, 2026 | 1.0.0   | Initial PRD document | System |

---

## 📚 Related Documents

- [ERP Design Document](./ERP_DESIGN.md)
- [Database Schema](../src-tauri/src/database.rs)
- [API Documentation](../src/lib/tauri-api.ts)
- [Design System](./design-system.md)
