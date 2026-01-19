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
  const updateCustomer = useAppStore((state) => state.updateCustomer)
  const deleteCustomer = useAppStore((state) => state.deleteCustomer)
  const t = useAppStore((state) => state.t)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const editingCustomer = editId ? customers.find(c => c.id === editId) : undefined

  return (
    <>
      <CustomersList
        customers={customers}
        customerTypes={customerTypes}
        onView={(id: string) => navigate(`/customers/${id}`)}
        onEdit={(id: string) => setEditId(id)}
        onDelete={(id: string) => setDeleteId(id)}
        onCreate={() => setShowCreateDialog(true)}
      />
      <CustomerDialog
        isOpen={showCreateDialog || !!editId}
        title={editId ? t('updateCustomer') : t('newCustomer')}
        customerTypes={customerTypes}
        initialData={editingCustomer ? {
          name: editingCustomer.name,
          phone: editingCustomer.phone,
          email: editingCustomer.email,
          customerType: editingCustomer.customerType,
          notes: editingCustomer.notes || ''
        } : undefined}
        onSubmit={(data: any) => {
          if (editId) {
            updateCustomer(editId, { ...data, email: data.email || null, notes: data.notes || '' })
            setEditId(null)
          } else {
            addCustomer({ ...data, email: data.email || null, notes: data.notes || '', balance: 0 })
            setShowCreateDialog(false)
          }
        }}
        onClose={() => {
          setShowCreateDialog(false)
          setEditId(null)
        }}
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
