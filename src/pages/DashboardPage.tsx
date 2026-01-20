import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dashboard } from '@/components/dashboard'
import { StartSessionDialog } from '@/components/sessions/StartSessionDialog'
import { CustomerDialog } from '@/components/customers/CustomerDialog'
import { InvoiceDialog } from '@/components/invoices/InvoiceDialog'
import { PaymentDialog } from '@/components/invoices/PaymentDialog'
import { CustomerDebtDialog } from '@/components/dashboard/CustomerDebtDialog'
import { useAppStore } from '@/stores/useAppStore'
import type { CustomerType } from '@/types'

const customerTypes: CustomerType[] = ['visitor', 'weekly', 'half-monthly', 'monthly']

export function DashboardPage() {
  const navigate = useNavigate()
  const [showStartSessionDialog, setShowStartSessionDialog] = useState(false)
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false)
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null)
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null)
  const [customerDebtId, setCustomerDebtId] = useState<string | null>(null)
  
  // Get data from store
  const {
    customers,
    resources,
    subscriptions,
    invoices,
    startSession,
    addCustomer,
    recordPayment,
    recordBulkPayment,
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
  
  const customerDebtInvoices = customerDebtId 
    ? invoices.filter(i => i.customerId === customerDebtId && i.status !== 'paid') 
    : []
  const debtCustomer = customerDebtId ? customers.find(c => c.id === customerDebtId) : null

  return (
    <>
      <Dashboard
        onStartSession={() => setShowStartSessionDialog(true)}
        onNewCustomer={() => setShowNewCustomerDialog(true)}
        onNavigateToSection={(section) => navigate(`/${section}`)}
        onViewInventoryItem={(id) => navigate(`/inventory?highlight=${id}`)}
        onViewCustomerDebt={(customerId) => setCustomerDebtId(customerId)}
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

      <CustomerDebtDialog
        isOpen={!!customerDebtId}
        customerName={debtCustomer?.name || ''}
        invoices={customerDebtInvoices}
        onClose={() => setCustomerDebtId(null)}
        onRecordBulkPayment={(ids, amount, notes) => recordBulkPayment(ids, amount, notes)}
        onGoToProfile={() => { if (customerDebtId) navigate(`/customers/${customerDebtId}`); setCustomerDebtId(null); }}
      />
    </>
  )
}
