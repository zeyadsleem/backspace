// =============================================================================
// Data Types
// =============================================================================

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

export interface PlanTypeOption {
  id: PlanType
  labelEn: string
  labelAr: string
  days: number
}

export interface SubscriptionFormData {
  customerId: string
  planType: PlanType
  startDate: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface SubscriptionsListProps {
  subscriptions: Subscription[]
  planTypes: PlanTypeOption[]
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDeactivate?: (id: string) => void
  onCreate?: () => void
  language?: 'en' | 'ar'
}

export interface SubscriptionFormProps {
  initialData?: SubscriptionFormData
  customers: Array<{ id: string; name: string; humanId: string }>
  planTypes: PlanTypeOption[]
  onSubmit?: (data: SubscriptionFormData) => void
  onCancel?: () => void
  isLoading?: boolean
  language?: 'en' | 'ar'
}

export interface SubscriptionCardProps {
  subscription: Subscription
  planType: PlanTypeOption
  onView?: () => void
  onDeactivate?: () => void
  language?: 'en' | 'ar'
}
