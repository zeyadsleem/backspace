import type { Customer, CustomerType } from '../types'
import { Eye, Pencil, Trash2, MoreVertical } from 'lucide-react'

interface CustomerRowProps {
  customer: Customer
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

const typeConfig: Record<CustomerType, { label: string; color: string; bg: string }> = {
  visitor: {
    label: 'Visitor',
    color: 'text-stone-600 dark:text-stone-400',
    bg: 'bg-stone-100 dark:bg-stone-800',
  },
  weekly: {
    label: 'Weekly',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/30',
  },
  'half-monthly': {
    label: 'Half-Monthly',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/30',
  },
  monthly: {
    label: 'Monthly',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/30',
  },
}

export function CustomerRow({ customer, onView, onEdit, onDelete }: CustomerRowProps) {
  const config = typeConfig[customer.customerType]
  const initials = customer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const formatBalance = (balance: number) => {
    const formatted = Math.abs(balance).toLocaleString('en-EG')
    if (balance < 0) return `-${formatted} EGP`
    if (balance > 0) return `+${formatted} EGP`
    return '0 EGP'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
      {/* ID - Mobile: inline with name */}
      <div className="hidden md:flex col-span-1 items-center">
        <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
          {customer.humanId}
        </span>
      </div>

      {/* Customer Info */}
      <div className="col-span-1 md:col-span-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            {initials}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-stone-900 dark:text-stone-100 truncate">
              {customer.name}
            </p>
            <span className="md:hidden text-xs font-mono text-stone-400">
              {customer.humanId}
            </span>
          </div>
          {customer.email && (
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
              {customer.email}
            </p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="col-span-1 md:col-span-2 flex items-center">
        <span className="text-sm text-stone-600 dark:text-stone-400 font-mono">
          {customer.phone}
        </span>
      </div>

      {/* Type Badge */}
      <div className="col-span-1 md:col-span-2 flex items-center">
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.color}`}>
          {config.label}
        </span>
      </div>

      {/* Balance */}
      <div className="col-span-1 md:col-span-2 flex items-center md:justify-end">
        <span
          className={`text-sm font-medium ${
            customer.balance < 0
              ? 'text-red-600 dark:text-red-400'
              : customer.balance > 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          {formatBalance(customer.balance)}
        </span>
      </div>

      {/* Actions */}
      <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-1">
        <button
          onClick={onView}
          className="p-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300
                   hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          onClick={onEdit}
          className="p-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300
                   hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-stone-500 hover:text-red-600 dark:hover:text-red-400
                   hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
