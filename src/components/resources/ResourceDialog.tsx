import type { ResourceType } from '@/types'
import { ResourceForm } from './ResourceForm'
import { X } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { Modal } from '@/components/shared'

interface ResourceDialogProps {
  isOpen: boolean
  title: string
  onClose?: () => void
  initialData?: { name: string; resourceType: ResourceType; ratePerHour: number }
  resourceTypes: ResourceType[]
  onSubmit?: (data: { name: string; resourceType: ResourceType; ratePerHour: number }) => void
  isLoading?: boolean
}

export function ResourceDialog({ isOpen, title, onClose, ...formProps }: ResourceDialogProps) {
  const isRTL = useAppStore((state) => state.isRTL)

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose!}
      title={title}
      maxWidth="max-w-lg"
    >
      <div className="p-6 pt-2">
        <ResourceForm {...formProps} onCancel={onClose} />
      </div>
    </Modal>
  )
}
