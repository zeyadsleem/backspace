import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dashboard } from '@/components/dashboard'
import { StartSessionDialog } from '@/components/sessions/StartSessionDialog'
import { CustomerDialog } from '@/components/customers/CustomerDialog'
import { InvoiceDialog } from '@/components/invoices/InvoiceDialog'
import { PaymentDialog } from '@/components/invoices/PaymentDialog'
import { useAppStore } from '@/stores/useAppStore'
import type { CustomerType } from '@/types'

const customerTypes: CustomerType[] = ['visitor', 'weekly', 'half-monthly', 'monthly']

export function DashboardPage() {
  const navigate = useNavigate()
  const [showStartSessionDialog, setShowStartSessionDialog] = useState(false)
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false)
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null)
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null)
  
  // Get data from store
  const {
    customers,
    resources,
    subscriptions,
    invoices,
    startSession,
    addCustomer,
    recordPayment,
    t
  } = useAppStore()

  const handleStartSession = (data: { customerId: string; resourceId: string }) => {
    startSession(data.customerId, data.resourceId)
    setShowStartSessionDialog(false)
  }

  const handleCreateCustomer = (data: { name: string; phone: string; email?: string; customerType: any; notes?: string }) => {
    addCustomer({
      ...data,
      balance: 0,
      email: data.email || null,
      notes: data.notes || ''
    })
    setShowNewCustomerDialog(false)
  }

  const viewInvoice = viewInvoiceId ? invoices.find(i => i.id === viewInvoiceId) ?? null : null
  const paymentInvoice = paymentInvoiceId ? invoices.find(i => i.id === paymentInvoiceId) ?? null : null

  return (
    <>
      <Dashboard
        onStartSession={() => setShowStartSessionDialog(true)}
        onNewCustomer={() => setShowNewCustomerDialog(true)}
        onNavigateToSection={(section) => navigate(`/${section}`)}
        onViewInventoryItem={(id) => navigate(`/inventory?highlight=${id}`)}
        onViewInvoice={(id) => setViewInvoiceId(id)}
      />
      
      <StartSessionDialog
        isOpen={showStartSessionDialog}
        customers={customers}
        resources={resources}
        subscriptions={subscriptions}
        onSubmit={handleStartSession}
        onClose={() => setShowStartSessionDialog(false)}
      />
      
      <CustomerDialog
        isOpen={showNewCustomerDialog}
        title={t('newCustomer')}
        customerTypes={customerTypes}
        onSubmit={handleCreateCustomer}
        onClose={() => setShowNewCustomerDialog(false)}
      />

      <InvoiceDialog
        isOpen={!!viewInvoiceId}
        invoice={viewInvoice}
        onClose={() => setViewInvoiceId(null)}
        onRecordPayment={() => { setPaymentInvoiceId(viewInvoiceId); setViewInvoiceId(null) }}
      />

      <PaymentDialog
        isOpen={!!paymentInvoiceId}
        invoice={paymentInvoice}
        onSubmit={(data) => { if (paymentInvoiceId) recordPayment(paymentInvoiceId, data.amount, data.method, data.date, data.notes); setPaymentInvoiceId(null) }}
        onClose={() => setPaymentInvoiceId(null)}
      />
    </>
  )
}
