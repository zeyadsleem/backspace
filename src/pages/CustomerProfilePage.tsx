import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/useAppStore'
import { CustomerProfile } from '@/components/customers'
import { CustomerDialog } from '@/components/customers'
import { DeleteConfirmDialog } from '@/components/shared'
import { useTranslation } from '@/stores/hooks'
import type { CustomerType } from '@/types'

const customerTypes: CustomerType[] = ['visitor', 'weekly', 'half-monthly', 'monthly']

export function CustomerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const t = useTranslation()
  const customers = useAppStore((state) => state.customers)
  const updateCustomer = useAppStore((state) => state.updateCustomer)
  const deleteCustomer = useAppStore((state) => state.deleteCustomer)
  
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const customer = customers.find(c => c.id === id)
  if (!customer) return <div className="p-6">{t('customerNotFound')}</div>

  const handleEdit = () => {
    setShowEditDialog(true)
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const handleUpdateCustomer = (data: any) => {
    updateCustomer(customer.id, {
      ...data,
      email: data.email || null,
      notes: data.notes || ''
    })
    setShowEditDialog(false)
  }

  const handleDeleteConfirm = () => {
    deleteCustomer(customer.id)
    setShowDeleteDialog(false)
    navigate('/customers')
  }

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto">
        <CustomerProfile
          customer={customer}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBack={() => navigate('/customers')}
        />
      </div>

      <CustomerDialog
        isOpen={showEditDialog}
        title={t('edit') + ' ' + t('customer')}
        initialData={{
          name: customer.name,
          phone: customer.phone,
          email: customer.email || '',
          customerType: customer.customerType,
          notes: customer.notes || ''
        }}
        customerTypes={customerTypes}
        onSubmit={handleUpdateCustomer}
        onClose={() => setShowEditDialog(false)}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        title={t('deleteCustomer')}
        description={t('areYouSureCustomer')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  )
}
