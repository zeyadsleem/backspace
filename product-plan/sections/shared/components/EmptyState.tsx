import type { EmptyStateProps, EmptyStateIcon } from '../types'
import {
  Users,
  Monitor,
  Clock,
  Package,
  FileText,
  CreditCard,
  Search,
  Inbox,
} from 'lucide-react'

const iconMap: Record<EmptyStateIcon, React.ComponentType<{ className?: string }>> = {
  users: Users,
  resources: Monitor,
  sessions: Clock,
  inventory: Package,
  invoices: FileText,
  subscriptions: CreditCard,
  search: Search,
  default: Inbox,
}

export function EmptyState({
  icon = 'default',
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  const IconComponent = iconMap[icon]

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {/* Icon */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
        <IconComponent className="h-8 w-8 text-stone-400 dark:text-stone-500" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="mt-2 max-w-sm text-sm text-stone-600 dark:text-stone-400">
          {description}
        </p>
      )}

      {/* Action Button */}
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}
