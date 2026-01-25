// =============================================================================
// Backspace Data Model Types
// =============================================================================

// -----------------------------------------------------------------------------
// Customer
// -----------------------------------------------------------------------------

export type CustomerType = 'visitor' | 'weekly' | 'half-monthly' | 'monthly'

export interface Customer {
  id: string
  humanId: string
  name: string
  phone: string
  email: string | null
  customerType: CustomerType
  balance: number
  notes: string
  createdAt: string
  totalSessions: number
  totalSpent: number
}

// -----------------------------------------------------------------------------
// Resource
// -----------------------------------------------------------------------------

export type ResourceType = 'seat' | 'room' | 'desk'

export interface Resource {
  id: string
  name: string
  resourceType: ResourceType
  ratePerHour: number
  isAvailable: boolean
  createdAt: string
  utilizationRate: number
}

// -----------------------------------------------------------------------------
// Session
// -----------------------------------------------------------------------------

export interface InventoryConsumption {
  id: string
  itemName: string
  quantity: number
  price: number
  addedAt: string
}

export interface ActiveSession {
  id: string
  customerId: string
  customerName: string
  resourceId: string
  resourceName: string
  resourceRate: number
  startedAt: string
  isSubscribed: boolean
  inventoryConsumptions: InventoryConsumption[]
  inventoryTotal: number
}

export interface CompletedSession {
  id: string
  customerId: string
  customerName: string
  resourceId: string
  resourceName: string
  startedAt: string
  endedAt: string
  durationMinutes: number
  sessionCost: number
  inventoryTotal: number
  totalAmount: number
  isSubscribed: boolean
}

// -----------------------------------------------------------------------------
// Subscription
// -----------------------------------------------------------------------------

export type PlanType = 'weekly' | 'half-monthly' | 'monthly'

export interface Subscription {
  id: string
  customerId: string
  customerName: string
  planType: PlanType
  startDate: string
  endDate: string
  isActive: boolean
  daysRemaining: number
  createdAt: string
}

// -----------------------------------------------------------------------------
// Inventory
// -----------------------------------------------------------------------------

export type InventoryCategory = 'beverage' | 'snack' | 'meal'

export interface InventoryItem {
  id: string
  name: string
  category: InventoryCategory
  price: number
  quantity: number
  minStock: number
  createdAt: string
}

// -----------------------------------------------------------------------------
// Invoice
// -----------------------------------------------------------------------------

export type InvoiceStatus = 'paid' | 'unpaid' | 'pending'
export type PaymentMethod = 'cash' | 'card' | 'transfer'

export interface LineItem {
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface Payment {
  id: string
  amount: number
  method: PaymentMethod
  date: string
  notes: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  customerPhone: string
  sessionId: string | null
  amount: number
  discount: number
  total: number
  paidAmount: number
  status: InvoiceStatus
  dueDate: string
  paidDate: string | null
  createdAt: string
  lineItems: LineItem[]
  payments: Payment[]
}
