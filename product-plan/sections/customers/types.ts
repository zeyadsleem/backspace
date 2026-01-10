// =============================================================================
// Data Types
// =============================================================================

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

export interface CustomerFormData {
  name: string
  phone: string
  email?: string
  customerType: CustomerType
  notes?: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface CustomersListProps {
  /** List of customers to display */
  customers: Customer[]
  /** Available customer types for filtering */
  customerTypes: CustomerType[]
  /** Called when user clicks to view a customer's profile */
  onView?: (id: string) => void
  /** Called when user clicks to edit a customer */
  onEdit?: (id: string) => void
  /** Called when user clicks to delete a customer */
  onDelete?: (id: string) => void
  /** Called when user clicks to create a new customer */
  onCreate?: () => void
  /** Called when user wants to export customer list */
  onExport?: () => void
}

export interface CustomerFormProps {
  /** Initial form data for editing, undefined for new customer */
  initialData?: CustomerFormData
  /** Available customer types */
  customerTypes: CustomerType[]
  /** Called when form is submitted with valid data */
  onSubmit?: (data: CustomerFormData) => void
  /** Called when user cancels the form */
  onCancel?: () => void
  /** Whether the form is in a loading/submitting state */
  isLoading?: boolean
}

export interface CustomerProfileProps {
  /** The customer to display */
  customer: Customer
  /** Called when user clicks to edit the customer */
  onEdit?: () => void
  /** Called when user clicks to delete the customer */
  onDelete?: () => void
  /** Called when user clicks back to return to list */
  onBack?: () => void
}
