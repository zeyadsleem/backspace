// =============================================================================
// Data Types
// =============================================================================

export interface DashboardMetrics {
  todayRevenue: number
  sessionRevenue: number
  inventoryRevenue: number
  activeSessions: number
  newCustomersToday: number
  activeSubscriptions: number
  resourceUtilization: number
}

export interface LowStockAlert {
  id: string
  name: string
  quantity: number
  minStock: number
}

export interface RecentActivity {
  id: string
  type: 'session_start' | 'session_end' | 'inventory_add' | 'customer_new' | 'invoice_paid' | 'subscription_new'
  description: string
  timestamp: string
}

export interface RevenueDataPoint {
  date: string
  sessions: number
  inventory: number
}

// =============================================================================
// Component Props
// =============================================================================

export interface DashboardProps {
  /** Key performance metrics for the dashboard */
  metrics: DashboardMetrics
  /** Inventory items below minimum stock threshold */
  lowStockAlerts: LowStockAlert[]
  /** Recent operations for the activity feed */
  recentActivity: RecentActivity[]
  /** Historical revenue data for the chart */
  revenueChart: RevenueDataPoint[]
  /** Called when user clicks "New Customer" quick action */
  onNewCustomer?: () => void
  /** Called when user clicks "Start Session" quick action */
  onStartSession?: () => void
  /** Called when user clicks on a metric card to navigate to details */
  onNavigateToSection?: (section: 'sessions' | 'customers' | 'subscriptions' | 'resources' | 'inventory') => void
  /** Called when user clicks on a low stock alert item */
  onViewInventoryItem?: (id: string) => void
}
