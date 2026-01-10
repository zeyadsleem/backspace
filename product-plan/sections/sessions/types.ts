// =============================================================================
// Data Types
// =============================================================================

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

export interface AvailableInventoryItem {
  id: string
  name: string
  price: number
  quantity: number
}

export interface SessionStartData {
  customerId: string
  resourceId: string
}

export interface InventoryAddData {
  inventoryId: string
  quantity: number
}


// =============================================================================
// Component Props
// =============================================================================

export interface ActiveSessionsProps {
  /** List of currently active sessions */
  activeSessions: ActiveSession[]
  /** Available inventory items for adding to sessions */
  availableInventory: AvailableInventoryItem[]
  /** Called when user clicks to add inventory to a session */
  onAddInventory?: (sessionId: string, data: InventoryAddData) => void
  /** Called when user clicks to end a session */
  onEndSession?: (sessionId: string) => void
  /** Called when user clicks to view session details */
  onViewDetails?: (sessionId: string) => void
  /** Called when user clicks to start a new session */
  onStartSession?: () => void
}

export interface SessionHistoryProps {
  /** List of completed sessions */
  sessions: CompletedSession[]
  /** Called when user clicks to view session details */
  onViewDetails?: (sessionId: string) => void
  /** Called when user clicks to regenerate invoice */
  onRegenerateInvoice?: (sessionId: string) => void
  /** Called when user wants to export session history */
  onExport?: () => void
}

export interface SessionStartFormProps {
  /** Available customers for selection */
  customers: Array<{ id: string; name: string; humanId: string; isSubscribed: boolean }>
  /** Available resources for selection (only available ones) */
  resources: Array<{ id: string; name: string; resourceType: string; ratePerHour: number }>
  /** Called when form is submitted */
  onSubmit?: (data: SessionStartData) => void
  /** Called when user cancels */
  onCancel?: () => void
  /** Whether the form is in a loading state */
  isLoading?: boolean
}

export interface InventoryAddModalProps {
  /** Session to add inventory to */
  session: ActiveSession
  /** Available inventory items */
  availableInventory: AvailableInventoryItem[]
  /** Called when inventory is added */
  onAdd?: (data: InventoryAddData) => void
  /** Called when modal is closed */
  onClose?: () => void
  /** Whether the form is in a loading state */
  isLoading?: boolean
}
