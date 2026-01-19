import type { CustomerType } from '@/types'
import { CustomerForm } from './CustomerForm'
import { X } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface CustomerDialogProps {
  isOpen: boolean
  title: string
  onClose?: () => void
  initialData?: { name: string; phone: string; email: string | null; customerType: CustomerType; notes: string }
  customerTypes: CustomerType[]
  onSubmit?: (data: { name: string; phone: string; email?: string; customerType: CustomerType; notes?: string }) => void
  isLoading?: boolean
}

export function CustomerDialog({ isOpen, title, onClose, ...formProps }: CustomerDialogProps) {
  const isRTL = useAppStore((state) => state.isRTL)
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-lg max-h-[90vh] flex flex-col rounded-lg bg-white shadow-xl dark:bg-stone-900 ${isRTL ? 'rtl-dialog' : 'ltr-dialog'}`}>
        {/* Header - Fixed */}
        <div className={`flex-shrink-0 flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-800 ${isRTL ? '' : 'flex-row-reverse'}`}>
          <h2 className={`text-lg font-semibold text-stone-900 dark:text-stone-100 ${isRTL ? 'text-right' : 'text-left'}`}>{title}</h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
          <CustomerForm {...formProps} onCancel={onClose} />
        </div>
      </div>
    </div>
  )
}
