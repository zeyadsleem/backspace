// =============================================================================
// Data Types
// =============================================================================

export interface RevenueSummary {
  sessions: number
  inventory: number
  total: number
}

export interface RevenueData {
  today: RevenueSummary
  thisWeek: RevenueSummary
  thisMonth: RevenueSummary
  comparison: {
    lastMonth: RevenueSummary
    percentChange: number
  }
}

export interface RevenueDataPoint {
  date: string
  sessions: number
  inventory: number
}

export interface TopCustomer {
  id: string
  name: string
  revenue: number
}

export interface ResourceUtilization {
  id: string
  name: string
  rate: number
}

export interface PeakHour {
  hour: number
  occupancy: number
}

export interface UtilizationData {
  overallRate: number
  byResource: ResourceUtilization[]
  peakHours: PeakHour[]
  averageSessionDuration: number
}

export interface CustomerTypeDistribution {
  type: string
  count: number
  percentage: number
}

export interface CustomerInsights {
  newCustomersThisMonth: number
  newCustomersLastMonth: number
  retentionRate: number
  subscriptionRenewalRate: number
  typeDistribution: CustomerTypeDistribution[]
}

export type OperationType = 
  | 'session_start' 
  | 'session_end' 
  | 'inventory_add' 
  | 'invoice_created' 
  | 'payment_received' 
  | 'customer_new' 
  | 'subscription_new'

export interface OperationRecord {
  id: string
  type: OperationType
  description: string
  customerId: string | null
  resourceId: string | null
  timestamp: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface RevenueReportProps {
  /** Revenue summary data */
  revenueData: RevenueData
  /** Historical revenue for chart */
  revenueChart: RevenueDataPoint[]
  /** Top customers by revenue */
  topCustomers: TopCustomer[]
  /** Called when user clicks on a customer */
  onCustomerClick?: (id: string) => void
  /** Called when user wants to export the report */
  onExport?: () => void
}

export interface UtilizationReportProps {
  /** Utilization statistics */
  utilizationData: UtilizationData
  /** Called when user clicks on a resource */
  onResourceClick?: (id: string) => void
  /** Called when user wants to export the report */
  onExport?: () => void
}

export interface CustomerInsightsProps {
  /** Customer metrics and distribution */
  insights: CustomerInsights
  /** Called when user wants to export the report */
  onExport?: () => void
}

export interface OperationHistoryProps {
  /** List of operations to display */
  operations: OperationRecord[]
  /** Called when user clicks on an operation */
  onOperationClick?: (id: string) => void
  /** Called when user wants to export the history */
  onExport?: () => void
}

export interface ReportsPageProps {
  /** Revenue data and charts */
  revenueData: RevenueData
  revenueChart: RevenueDataPoint[]
  topCustomers: TopCustomer[]
  /** Utilization statistics */
  utilizationData: UtilizationData
  /** Customer insights */
  customerInsights: CustomerInsights
  /** Operation history */
  operationHistory: OperationRecord[]
  /** Navigation callbacks */
  onCustomerClick?: (id: string) => void
  onResourceClick?: (id: string) => void
  onOperationClick?: (id: string) => void
  /** Export callbacks */
  onExportRevenue?: () => void
  onExportUtilization?: () => void
  onExportCustomers?: () => void
  onExportHistory?: () => void
}
