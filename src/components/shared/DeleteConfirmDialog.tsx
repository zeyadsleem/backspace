import { AlertTriangle } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { Modal } from '@/components/shared'
import { Button } from '@/components/ui/button'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  isLoading?: boolean
}

export function DeleteConfirmDialog({
  isOpen,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  const t = useAppStore((state) => state.t)

  if (!isOpen) return null

  return (

    <Modal
      isOpen={isOpen}
      onClose={onCancel!}
      showCloseButton={false}
      maxWidth="max-w-sm"
    >
      <div className="p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">{title}</h3>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{description}</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            variant="ghost"
            className="font-semibold"
          >
            {cancelText || t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            variant="danger"
            isLoading={isLoading}
          >
            {confirmText || t('delete')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
