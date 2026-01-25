import type { SubscriptionFormProps } from '../types'
import { SubscriptionForm } from './SubscriptionForm'
import { X, CreditCard } from 'lucide-react'

interface SubscriptionDialogProps extends SubscriptionFormProps {
  isOpen: boolean
  title: string
  onClose?: () => void
}

export function SubscriptionDialog({
  isOpen,
  title,
  onClose,
  ...formProps
}: SubscriptionDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose?.()}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-stone-900">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <SubscriptionForm {...formProps} onCancel={onClose} />
      </div>
    </div>
  )
}
