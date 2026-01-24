import type { InventoryCategory, CategoryOption } from '@/types'
import { InventoryForm } from './InventoryForm'
import { Package } from 'lucide-react'
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
  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose!}
      maxWidth="max-w-2xl"
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
            <Package className="h-5 w-5" />
          </div>
          <h2>{title}</h2>
        </div>
      }
    >
      <div className="p-6 flex-1 overflow-y-auto scrollbar-thin">
        <InventoryForm initialData={initialData} categories={categories} onSubmit={onSubmit} onCancel={onClose} isLoading={isLoading} />
      </div>
    </Modal>
  )
}
