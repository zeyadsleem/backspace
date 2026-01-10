// =============================================================================
// Data Types
// =============================================================================

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

export interface CategoryOption {
  id: InventoryCategory
  labelEn: string
  labelAr: string
}

export interface InventoryFormData {
  name: string
  category: InventoryCategory
  price: number
  quantity: number
  minStock: number
}

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock'

// =============================================================================
// Component Props
// =============================================================================

export interface InventoryListProps {
  /** List of inventory items to display */
  inventory: InventoryItem[]
  /** Available categories */
  categories: CategoryOption[]
  /** Called when user clicks to view item details */
  onView?: (id: string) => void
  /** Called when user clicks to edit an item */
  onEdit?: (id: string) => void
  /** Called when user clicks to delete an item */
  onDelete?: (id: string) => void
  /** Called when user clicks to create a new item */
  onCreate?: () => void
  /** Called when user adjusts quantity (+/-) */
  onAdjustQuantity?: (id: string, delta: number) => void
  /** Called when user updates price */
  onUpdatePrice?: (id: string, newPrice: number) => void
  /** Current language for labels */
  language?: 'en' | 'ar'
}

export interface InventoryFormProps {
  /** Initial form data for editing, undefined for new item */
  initialData?: InventoryFormData
  /** Available categories */
  categories: CategoryOption[]
  /** Called when form is submitted with valid data */
  onSubmit?: (data: InventoryFormData) => void
  /** Called when user cancels the form */
  onCancel?: () => void
  /** Whether the form is in a loading/submitting state */
  isLoading?: boolean
  /** Current language for labels */
  language?: 'en' | 'ar'
}

export interface InventoryItemCardProps {
  /** The inventory item to display */
  item: InventoryItem
  /** Category details for labels */
  category: CategoryOption
  /** Called when user clicks to edit */
  onEdit?: () => void
  /** Called when user clicks to delete */
  onDelete?: () => void
  /** Called when user adjusts quantity */
  onAdjustQuantity?: (delta: number) => void
  /** Current language for labels */
  language?: 'en' | 'ar'
}

export interface LowStockAlertProps {
  /** Items below minimum stock threshold */
  lowStockItems: InventoryItem[]
  /** Called when user clicks on an item */
  onItemClick?: (id: string) => void
  /** Called when user dismisses the alert */
  onDismiss?: () => void
}
