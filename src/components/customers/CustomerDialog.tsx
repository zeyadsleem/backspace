import type { CustomerType } from '@/types'
import { CustomerForm } from './CustomerForm'
import { User } from 'lucide-react'
import { Modal } from '@/components/shared'

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
  if (isOpen === false) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose!}
      maxWidth="max-w-2xl"
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
            <User className="h-5 w-5" />
          </div>
          <h2>{title}</h2>
        </div>
      }
    >
      <div className="p-6 flex-1 overflow-y-auto scrollbar-thin">
        <CustomerForm {...formProps} onCancel={onClose} />
      </div>
    </Modal>
  )
}
