// =============================================================================
// Data Types
// =============================================================================

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

export interface ResourceFormData {
  name: string
  resourceType: ResourceType
  ratePerHour: number
}

// =============================================================================
// Component Props
// =============================================================================

export interface ResourcesListProps {
  /** List of resources to display */
  resources: Resource[]
  /** Available resource types for filtering */
  resourceTypes: ResourceType[]
  /** Called when user clicks to view a resource's details */
  onView?: (id: string) => void
  /** Called when user clicks to edit a resource */
  onEdit?: (id: string) => void
  /** Called when user clicks to delete a resource */
  onDelete?: (id: string) => void
  /** Called when user clicks to create a new resource */
  onCreate?: () => void
  /** Called when user clicks to toggle resource availability */
  onToggleAvailability?: (id: string) => void
  /** Called when user selects a resource for a new session */
  onSelectForSession?: (id: string) => void
}

export interface ResourceFormProps {
  /** Initial form data for editing, undefined for new resource */
  initialData?: ResourceFormData
  /** Available resource types */
  resourceTypes: ResourceType[]
  /** Called when form is submitted with valid data */
  onSubmit?: (data: ResourceFormData) => void
  /** Called when user cancels the form */
  onCancel?: () => void
  /** Whether the form is in a loading/submitting state */
  isLoading?: boolean
}

export interface ResourceCardProps {
  /** The resource to display */
  resource: Resource
  /** Called when user clicks the card */
  onClick?: () => void
  /** Called when user clicks edit button */
  onEdit?: () => void
  /** Called when user clicks delete button */
  onDelete?: () => void
  /** Whether the card is in a selected state */
  isSelected?: boolean
}
