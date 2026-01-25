import { useState } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { InvoicesList, InvoiceDialog, PaymentDialog } from '@/components/invoices'

export function InvoicesPage() {
  const invoices = useAppStore((state) => state.invoices)
  const recordPayment = useAppStore((state) => state.recordPayment)
  const [viewId, setViewId] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)

  const viewInvoice = viewId ? invoices.find(i => i.id === viewId) ?? null : null
  const paymentInvoice = paymentId ? invoices.find(i => i.id === paymentId) ?? null : null

  return (
    <>
      <InvoicesList
        invoices={invoices}
        onView={(id) => setViewId(id)}
        onRecordPayment={(id) => setPaymentId(id)}
      />
      <InvoiceDialog
        isOpen={!!viewId}
        invoice={viewInvoice}
        onClose={() => setViewId(null)}
        onRecordPayment={() => { setPaymentId(viewId); setViewId(null) }}
      />
      <PaymentDialog
        isOpen={!!paymentId}
        invoice={paymentInvoice}
        onSubmit={(data) => { if (paymentId) recordPayment(paymentId, data.amount, data.method, data.notes); setPaymentId(null) }}
        onClose={() => setPaymentId(null)}
      />
    </>
  )
}
