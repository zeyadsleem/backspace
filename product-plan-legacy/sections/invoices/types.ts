// =============================================================================
// Data Types
// =============================================================================

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

export interface InvoiceFormData {
  customerId: string
  lineItems: LineItem[]
  discount?: number
  dueDate: string
}

export interface PaymentFormData {
  amount: number
  method: PaymentMethod
  date: string
  notes?: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface InvoicesListProps {
  /** List of invoices to display */
  invoices: Invoice[]
  /** Called when user clicks to view invoice details */
  onView?: (id: string) => void
  /** Called when user clicks to edit an invoice */
  onEdit?: (id: string) => void
  /** Called when user clicks to record a payment */
  onRecordPayment?: (id: string) => void
  /** Called when user clicks to print an invoice */
  onPrint?: (id: string) => void
  /** Called when user clicks to create a new invoice */
  onCreate?: () => void
  /** Called when user wants to export invoices */
  onExport?: () => void
}

export interface InvoiceDetailProps {
  /** The invoice to display */
  invoice: Invoice
  /** Called when user clicks to edit */
  onEdit?: () => void
  /** Called when user clicks to record a payment */
  onRecordPayment?: () => void
  /** Called when user clicks to print */
  onPrint?: () => void
  /** Called when user clicks back */
  onBack?: () => void
}

export interface InvoiceFormProps {
  /** Initial form data for editing, undefined for new invoice */
  initialData?: InvoiceFormData
  /** Available customers for selection */
  customers: Array<{ id: string; name: string; humanId: string }>
  /** Called when form is submitted with valid data */
  onSubmit?: (data: InvoiceFormData) => void
  /** Called when user cancels the form */
  onCancel?: () => void
  /** Whether the form is in a loading/submitting state */
  isLoading?: boolean
}

export interface PaymentFormProps {
  /** Invoice being paid */
  invoice: Invoice
  /** Available payment methods */
  paymentMethods: PaymentMethod[]
  /** Called when payment is recorded */
  onSubmit?: (data: PaymentFormData) => void
  /** Called when user cancels */
  onCancel?: () => void
  /** Whether the form is in a loading state */
  isLoading?: boolean
}

export interface InvoicePrintViewProps {
  /** The invoice to print */
  invoice: Invoice
  /** Company information for header */
  company?: {
    name: string
    address: string
    phone: string
    email: string
  }
}
