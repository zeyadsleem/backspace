import type { InventoryCategory, CategoryOption } from '@/types'
import { InventoryForm } from './InventoryForm'
import { X, Package } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-stone-900 ${isRTL ? 'rtl-dialog' : 'ltr-dialog'}`}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30"><Package className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>
            <h2 className={`text-lg font-semibold text-stone-900 dark:text-stone-100 ${isRTL ? 'text-end' : 'text-start'}`}>{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"><X className="h-5 w-5" /></button>
        </div>
        <InventoryForm initialData={initialData} categories={categories} onSubmit={onSubmit} onCancel={onClose} isLoading={isLoading} />
      </div>
    </div>
  )
}
