// =============================================================================
// Shared Component Types
// =============================================================================

import type { ReactNode } from 'react'

// =============================================================================
// DeleteConfirmDialog
// =============================================================================

export interface DeleteConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Title of the dialog */
  title: string
  /** Description/message explaining what will be deleted */
  description: string
  /** Text for the confirm button */
  confirmText?: string
  /** Text for the cancel button */
  cancelText?: string
  /** Called when user confirms deletion */
  onConfirm?: () => void
  /** Called when user cancels or closes the dialog */
  onCancel?: () => void
  /** Whether the deletion is in progress */
  isLoading?: boolean
}

// =============================================================================
// EmptyState
// =============================================================================

export type EmptyStateIcon = 'users' | 'resources' | 'sessions' | 'inventory' | 'invoices' | 'subscriptions' | 'search' | 'default'

export interface EmptyStateProps {
  /** Icon to display */
  icon?: EmptyStateIcon
  /** Title text */
  title: string
  /** Description text */
  description?: string
  /** Action button text */
  actionText?: string
  /** Called when action button is clicked */
  onAction?: () => void
}

// =============================================================================
// LoadingState
// =============================================================================

export type LoadingVariant = 'spinner' | 'skeleton' | 'dots'

export interface LoadingStateProps {
  /** Loading variant */
  variant?: LoadingVariant
  /** Loading text to display */
  text?: string
  /** Whether to show full page loading */
  fullPage?: boolean
  /** Number of skeleton items to show */
  skeletonCount?: number
}

// =============================================================================
// FormField
// =============================================================================

export interface FormFieldProps {
  /** Field label */
  label: string
  /** Whether the field is required */
  required?: boolean
  /** Error message to display */
  error?: string
  /** Helper text for additional guidance */
  helperText?: string
  /** The form control (input, select, etc.) */
  children: ReactNode
  /** HTML for attribute for the label */
  htmlFor?: string
}

// =============================================================================
// PageHeader
// =============================================================================

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface PageHeaderProps {
  /** Page title */
  title: string
  /** Optional subtitle */
  subtitle?: string
  /** Breadcrumb items */
  breadcrumbs?: BreadcrumbItem[]
  /** Action buttons */
  actions?: ReactNode
  /** Called when breadcrumb is clicked */
  onBreadcrumbClick?: (href: string) => void
}

// =============================================================================
// SearchInput
// =============================================================================

export interface SearchInputProps {
  /** Current search value */
  value: string
  /** Placeholder text */
  placeholder?: string
  /** Called when value changes */
  onChange?: (value: string) => void
  /** Called when search is submitted (Enter key) */
  onSubmit?: (value: string) => void
  /** Debounce delay in ms */
  debounceMs?: number
}

// =============================================================================
// SuccessDialog
// =============================================================================

export interface SuccessDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Title of the dialog */
  title: string
  /** Description/message */
  description?: string
  /** Text for the primary action button */
  primaryActionText?: string
  /** Text for the secondary action button */
  secondaryActionText?: string
  /** Called when primary action is clicked */
  onPrimaryAction?: () => void
  /** Called when secondary action is clicked */
  onSecondaryAction?: () => void
  /** Called when dialog is closed */
  onClose?: () => void
}
