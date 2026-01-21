import type { InventoryCategory, CategoryOption } from '@/types'
import { InventoryForm } from './InventoryForm'
import { X, Package } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { Modal } from '@/components/shared'
interface InventoryDialogProps {
  isOpen: boolean
  title: string
  initialData?: { name: string; category: InventoryCategory; price: number; quantity: number; minStock: number }
  categories: CategoryOption[]
  onSubmit?: (data: { name: string; category: InventoryCategory; price: number; quantity: number; minStock: number }) => void
  onClose?: () => void
  isLoading?: boolean
}

export function InventoryDialog({ isOpen, title, initialData, categories, onSubmit, onClose, isLoading }: InventoryDialogProps) {
  const isRTL = useAppStore((state) => state.isRTL)

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose!}
      showCloseButton={false}
      maxWidth="max-w-2xl"
    >
      <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
            <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">{title}</h2>
        </div>
        <button onClick={onClose} className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-6 flex-1 overflow-y-auto scrollbar-thin">
        <InventoryForm initialData={initialData} categories={categories} onSubmit={onSubmit} onCancel={onClose} isLoading={isLoading} />
      </div>
    </Modal>
  )
}
