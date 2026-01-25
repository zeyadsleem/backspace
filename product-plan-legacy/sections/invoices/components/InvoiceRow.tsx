import type { Invoice, InvoiceStatus } from '../types'
import { Eye, CreditCard, Printer } from 'lucide-react'

interface InvoiceRowProps {
  invoice: Invoice
  onView?: () => void
  onRecordPayment?: () => void
  onPrint?: () => void
}

const statusConfig: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  paid: {
    label: 'Paid',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  unpaid: {
    label: 'Unpaid',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
  },
  pending: {
    label: 'Pending',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
}

export function InvoiceRow({ invoice, onView, onRecordPayment, onPrint }: InvoiceRowProps) {
  const config = statusConfig[invoice.status]

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} EGP`

  const remainingAmount = invoice.total - invoice.paidAmount

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
      {/* Invoice Number */}
      <div className="col-span-1 md:col-span-2 flex items-center">
        <span className="font-mono font-medium text-stone-900 dark:text-stone-100">
          {invoice.invoiceNumber}
        </span>
      </div>

      {/* Customer */}
      <div className="col-span-1 md:col-span-3 flex items-center">
        <div>
          <p className="font-medium text-stone-900 dark:text-stone-100">{invoice.customerName}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">{invoice.customerPhone}</p>
        </div>
      </div>

      {/* Amount */}
      <div className="col-span-1 md:col-span-2 flex items-center md:justify-end">
        <div className="text-right">
          <p className="font-semibold text-stone-900 dark:text-stone-100">
            {formatCurrency(invoice.total)}
          </p>
          {invoice.status === 'pending' && remainingAmount > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {formatCurrency(remainingAmount)} remaining
            </p>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="col-span-1 md:col-span-2 flex items-center">
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.color}`}>
          {config.label}
        </span>
      </div>

      {/* Due Date */}
      <div className="col-span-1 md:col-span-1 flex items-center">
        <span className="text-sm text-stone-600 dark:text-stone-400">
          {formatDate(invoice.dueDate)}
        </span>
      </div>

      {/* Actions */}
      <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-1">
        <button
          onClick={onView}
          className="p-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300
                   hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </button>
        {invoice.status !== 'paid' && (
          <button
            onClick={onRecordPayment}
            className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 
                     dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
            title="Record Payment"
          >
            <CreditCard className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={onPrint}
          className="p-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300
                   hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          title="Print"
        >
          <Printer className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
