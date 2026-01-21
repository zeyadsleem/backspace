import type { Invoice, InvoiceStatus } from '@/types'
import { X, FileText, CreditCard } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/shared'

interface InvoiceDialogProps {
  isOpen: boolean
  invoice: Invoice | null
  onClose?: () => void
  onRecordPayment?: () => void
}

const statusConfig: Record<Exclude<InvoiceStatus, 'pending'>, { color: string; bg: string }> = {
  paid: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
  unpaid: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/20' },
}

export function InvoiceDialog({ isOpen, invoice, onClose, onRecordPayment }: InvoiceDialogProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)

  if (!isOpen || !invoice) return null

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} ${t('egpCurrency')}`
  const remainingAmount = invoice.total - invoice.paidAmount
  const status = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.unpaid

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose!}
      showCloseButton={false}
      maxWidth="max-w-lg"
      className="overflow-hidden flex flex-col max-h-[90vh]"
    >
      {/* Header - Simple */}
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 px-6 py-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-600" />
          <span className="text-lg font-bold text-stone-900 dark:text-stone-100">{invoice.invoiceNumber}</span>
        </div>
        <button onClick={onClose} className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6 space-y-4 overflow-y-auto flex-1">
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">{t('customer')}</p>
            <p className="font-semibold text-base text-stone-900 dark:text-stone-100">{invoice.customerName}</p>
          </div>
          <div className="space-y-1 text-end">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">{t('status')}</p>
            <div>
              <span className={cn("px-2.5 py-0.5 text-xs font-bold rounded-full uppercase", status.bg, status.color)}>
                {t(invoice.status)}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">{t('date')}</p>
            <p className="text-sm text-stone-600 dark:text-stone-400 font-medium">{formatDate(invoice.createdAt)}</p>
          </div>
          <div className="space-y-1 text-end">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">{t('dueDate')}</p>
            <p className="text-sm text-stone-600 dark:text-stone-400 font-medium">{formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        {/* Items Table - Simplified */}
        <div className="border border-stone-100 dark:border-stone-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-stone-800/50 text-stone-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-start">{t('description')}</th>
                <th className="px-4 py-3 text-end">{t('amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 dark:divide-stone-800/50">
              {invoice.lineItems.map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-stone-700 dark:text-stone-300">{item.description}</td>
                  <td className="px-4 py-3 text-end font-mono font-medium">{item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary - Compact */}
        <div className="space-y-2 border-t border-stone-100 dark:border-stone-800 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-stone-500 font-medium">{t('total')}</span>
            <span className="font-bold text-lg text-stone-900 dark:text-stone-100 font-mono">{formatCurrency(invoice.total)}</span>
          </div>
          <div className="flex justify-between text-sm text-emerald-600 font-medium">
            <span>{t('paid')}</span>
            <span className="font-mono">{formatCurrency(invoice.paidAmount)}</span>
          </div>
          {remainingAmount > 0 && (
            <div className="flex justify-between text-base font-bold text-red-600 border-t border-dashed border-stone-200 dark:border-stone-700 pt-3 mt-1">
              <span>{t('balanceDue')}</span>
              <span className="font-mono">{formatCurrency(remainingAmount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      {invoice.status !== 'paid' && onRecordPayment && (
        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-100 dark:border-stone-800">
          <button
            onClick={onRecordPayment}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl font-bold text-base text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-[0.98]"
          >
            <CreditCard className="h-5 w-5" />
            <span>{t('recordPayment')}</span>
          </button>
        </div>
      )}
    </Modal>
  )
}


