import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/useAppStore'
import { CustomersList, CustomerDialog } from '@/components/customers'
import { DeleteConfirmDialog } from '@/components/shared'
import type { CustomerType } from '@/types'

const customerTypes: CustomerType[] = ['visitor', 'weekly', 'half-monthly', 'monthly']

export function CustomersPage() {
  const navigate = useNavigate()
  const customers = useAppStore((state) => state.customers)
  const addCustomer = useAppStore((state) => state.addCustomer)
  const deleteCustomer = useAppStore((state) => state.deleteCustomer)
  const t = useAppStore((state) => state.t)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  return (
    <>
      <CustomersList
        customers={customers}
        customerTypes={customerTypes}
        onView={(id: string) => navigate(`/customers/${id}`)}
        onEdit={(id: string) => navigate(`/customers/${id}`)}
        onDelete={(id: string) => setDeleteId(id)}
        onCreate={() => setShowCreateDialog(true)}
      />
      <CustomerDialog
        isOpen={showCreateDialog}
        title={t('newCustomer')}
        customerTypes={customerTypes}
        onSubmit={(data: any) => { addCustomer({ ...data, email: data.email || null, notes: data.notes || '', balance: 0 }); setShowCreateDialog(false) }}
        onClose={() => setShowCreateDialog(false)}
      />
      <DeleteConfirmDialog
        isOpen={!!deleteId}
        title={t('deleteCustomer')}
        description={t('areYouSureCustomer')}
        onConfirm={() => { if (deleteId) deleteCustomer(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}
