import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/useAppStore'
import { CustomerProfile } from '@/components/customers'
import { CustomerDialog } from '@/components/customers'
import { InvoiceDialog } from '@/components/invoices/InvoiceDialog'
import { DeleteConfirmDialog } from '@/components/shared'
import { useTranslation } from '@/stores/hooks'
import type { CustomerType } from '@/types'

const customerTypes: CustomerType[] = ['visitor', 'weekly', 'half-monthly', 'monthly']

export function CustomerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const t = useTranslation()
  const customers = useAppStore((state) => state.customers)
  const invoices = useAppStore((state) => state.invoices)
  const operationHistory = useAppStore((state) => state.operationHistory)
  const updateCustomer = useAppStore((state) => state.updateCustomer)
  const deleteCustomer = useAppStore((state) => state.deleteCustomer)

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)

  const customer = customers.find(c => c.id === id)
  if (!customer) return <div className="p-6">{t('customerNotFound')}</div>

  const customerInvoices = invoices
    .filter(inv => inv.customerId === id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const customerHistory = operationHistory
    .filter(op => op.customerId === id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const selectedInvoice = selectedInvoiceId ? invoices.find(i => i.id === selectedInvoiceId) : null

  const handleEdit = () => {
    setShowEditDialog(true)
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const handleUpdateCustomer = (data: { name: string; phone: string; email?: string; notes?: string }) => {
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
      <div className="flex flex-col p-6">
        <CustomerProfile
          customer={customer}
          invoices={customerInvoices}
          history={customerHistory}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBack={() => navigate('/customers')}
          onViewInvoice={(id) => setSelectedInvoiceId(id)}
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

      {selectedInvoice && (
        <InvoiceDialog
          isOpen={!!selectedInvoice}
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}

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
