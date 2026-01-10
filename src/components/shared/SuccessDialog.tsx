import { CheckCircle, X } from 'lucide-react'

interface SuccessDialogProps {
  isOpen: boolean
  title: string
  description?: string
  primaryActionText?: string
  secondaryActionText?: string
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
  onClose?: () => void
}

export function SuccessDialog({
  isOpen,
  title,
  description,
  primaryActionText = 'Continue',
  secondaryActionText,
  onPrimaryAction,
  onSecondaryAction,
  onClose,
}: SuccessDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-stone-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
          {description && <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{description}</p>}
        </div>
        <div className="mt-6 flex gap-3">
          {secondaryActionText && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="flex-1 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              {secondaryActionText}
            </button>
          )}
          <button
            type="button"
            onClick={onPrimaryAction}
            className="flex-1 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
          >
            {primaryActionText}
          </button>
        </div>
      </div>
    </div>
  )
}
