// =============================================================================
// Backspace Data Model Types
// =============================================================================

// -----------------------------------------------------------------------------
// Customer
// -----------------------------------------------------------------------------

export type CustomerType = "visitor" | "weekly" | "half-monthly" | "monthly";

export interface Customer {
	id: string;
	humanId: string;
	name: string;
	phone: string;
	email: string | null;
	customerType: CustomerType;
	balance: number;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	totalSessions: number;
	totalSpent: number;
}

// -----------------------------------------------------------------------------
// Resource
// -----------------------------------------------------------------------------

export type ResourceType = "seat" | "room" | "desk";

export interface Resource {
	id: string;
	name: string;
	resourceType: ResourceType;
	ratePerHour: number;
	isAvailable: boolean;
	createdAt: string;
	updatedAt: string;
	utilizationRate: number;
}

// -----------------------------------------------------------------------------
// Session
// -----------------------------------------------------------------------------

export interface InventoryConsumption {
	id: string;
	itemName: string;
	quantity: number;
	price: number;
	addedAt: string;
}

export interface ActiveSession {
	id: string;
	customerId: string;
	customerName: string;
	resourceId: string;
	resourceName: string;
	resourceRate: number;
	startedAt: string;
	isSubscribed: boolean;
	inventoryConsumptions: InventoryConsumption[];
	inventoryTotal: number;
}

export interface CompletedSession {
	id: string;
	customerId: string;
	customerName: string;
	resourceId: string;
	resourceName: string;
	startedAt: string;
	endedAt: string;
	durationMinutes: number;
	sessionCost: number;
	inventoryTotal: number;
	totalAmount: number;
	isSubscribed: boolean;
}

// -----------------------------------------------------------------------------
// Subscription
// -----------------------------------------------------------------------------

export type PlanType = "weekly" | "half-monthly" | "monthly";

export type SubscriptionStatus = "active" | "expired" | "inactive";

export interface Subscription {
	id: string;
	customerId: string;
	customerName: string;
	planType: PlanType;
	startDate: string;
	endDate: string;
	isActive: boolean;
	status: SubscriptionStatus;
	daysRemaining: number;
	createdAt: string;
	updatedAt: string;
}

export interface PlanTypeOption {
	id: PlanType;
	labelEn: string;
	labelAr: string;
	days: number;
	price: number;
}

// -----------------------------------------------------------------------------
// Inventory
// -----------------------------------------------------------------------------

export type InventoryCategory = "beverage" | "snack" | "other";

export interface InventoryItem {
	id: string;
	name: string;
	category: InventoryCategory;
	price: number;
	quantity: number;
	minStock: number;
	createdAt: string;
}

export interface CategoryOption {
	id: InventoryCategory;
	labelEn: string;
	labelAr: string;
}

// -----------------------------------------------------------------------------
// Invoice
// -----------------------------------------------------------------------------

export type InvoiceStatus = "paid" | "unpaid" | "pending" | "cancelled";
export type PaymentMethod = "cash" | "card" | "transfer";

export interface LineItem {
	description: string;
	quantity: number;
	rate: number;
	amount: number;
}

export interface Payment {
	id: string;
	amount: number;
	method: PaymentMethod;
	date: string;
	notes: string;
}

export interface Invoice {
	id: string;
	invoiceNumber: string;
	customerId: string;
	customerName: string;
	customerPhone: string;
	sessionId: string | null;
	amount: number;
	discount: number;
	total: number;
	paidAmount: number;
	status: InvoiceStatus;
	dueDate: string;
	paidDate: string | null;
	createdAt: string;
	lineItems: LineItem[];
	payments: Payment[];
}

// -----------------------------------------------------------------------------
// Settings
// -----------------------------------------------------------------------------

export type ThemeOption = "light" | "dark" | "system";
export type LanguageOption = "en" | "ar";

export interface CompanySettings {
	name: string;
	address: string;
	phone: string;
	email: string;
}

export interface RegionalSettings {
	currency: string;
	currencySymbol: string;
	timezone: string;
	dateFormat: string;
}

export interface TaxSettings {
	enabled: boolean;
	rate: number;
}

export interface AppearanceSettings {
	theme: ThemeOption;
	language: LanguageOption;
}

export interface DiscountSettings {
	enabled: boolean;
	value: number;
	label: string;
}

export interface Settings {
	company: CompanySettings;
	regional: RegionalSettings;
	tax: TaxSettings;
	appearance: AppearanceSettings;
	discounts: DiscountSettings;
}

// -----------------------------------------------------------------------------
// Reports
// -----------------------------------------------------------------------------

export interface RevenueSummary {
	sessions: number;
	inventory: number;
	total: number;
}

export interface RevenueData {
	today: RevenueSummary;
	thisWeek: RevenueSummary;
	thisMonth: RevenueSummary;
	comparison: {
		lastMonth: RevenueSummary;
		percentChange: number;
	};
}

export interface RevenueDataPoint {
	date: string;
	sessions: number;
	inventory: number;
}

export interface TopCustomer {
	id: string;
	name: string;
	revenue: number;
}

export interface ResourceUtilization {
	id: string;
	name: string;
	rate: number;
}

export interface PeakHour {
	hour: number;
	occupancy: number;
}

export interface UtilizationData {
	overallRate: number;
	byResource: ResourceUtilization[];
	peakHours: PeakHour[];
	averageSessionDuration: number;
}

export type OperationType =
	| "session_start"
	| "session_end"
	| "inventory_add"
	| "invoice_created"
	| "payment_received"
	| "customer_new"
	| "subscription_new";

export interface OperationRecord {
	id: string;
	type: OperationType;
	description: string;
	customerId: string | null;
	resourceId: string | null;
	timestamp: string;
}

// -----------------------------------------------------------------------------
// Dashboard
// -----------------------------------------------------------------------------

export interface DashboardMetrics {
	todayRevenue: number; // In piasters
	activeSessions: number;
	newCustomersToday: number;
	activeSubscriptions: number;
}

export interface LowStockAlert {
	id: string;
	name: string;
	quantity: number;
	minStock: number;
}

export interface RecentActivity {
	id: string;
	type:
		| "session_start"
		| "session_end"
		| "inventory_add"
		| "customer_new"
		| "invoice_paid"
		| "subscription_new"
		| "invoice_created";
	description: string;
	timestamp: string;
}

export interface RecentActivityView {
	id: string;
	description: string;
	operation_type: string;
	timestamp: string;
}
