import type { Invoice, InvoiceStatus } from '@/types'
import { X, FileText, CreditCard } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-stone-900 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header - Simple */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" />
            <span className="text-lg font-bold text-stone-900 dark:text-stone-100">{invoice.invoiceNumber}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">{t('customer')}</p>
              <p className="font-semibold text-stone-900 dark:text-stone-100">{invoice.customerName}</p>
            </div>
            <div className="space-y-0.5 text-end">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">{t('status')}</p>
              <div>
                <span className={cn("px-2 py-0.5 text-xs font-bold rounded-full uppercase", status.bg, status.color)}>
                  {t(invoice.status)}
                </span>
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">{t('date')}</p>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">{formatDate(invoice.createdAt)}</p>
            </div>
            <div className="space-y-0.5 text-end">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">{t('dueDate')}</p>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          {/* Items Table - Simplified */}
          <div className="border border-stone-100 dark:border-stone-800 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-stone-50 dark:bg-stone-800/50 text-stone-500 font-bold uppercase">
                <tr>
                  <th className="px-3 py-2 text-start">{t('description')}</th>
                  <th className="px-3 py-2 text-end">{t('amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50 dark:divide-stone-800/50">
                {invoice.lineItems.map((item, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-stone-700 dark:text-stone-300">{item.description}</td>
                    <td className="px-3 py-2 text-end font-mono font-medium">{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary - Compact */}
          <div className="space-y-1.5 border-t border-stone-100 dark:border-stone-800 pt-3">
            <div className="flex justify-between text-xs">
              <span className="text-stone-500 font-medium">{t('total')}</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100 font-mono">{formatCurrency(invoice.total)}</span>
            </div>
            <div className="flex justify-between text-xs text-emerald-600 font-medium">
              <span>{t('paid')}</span>
              <span className="font-mono">{formatCurrency(invoice.paidAmount)}</span>
            </div>
            {remainingAmount > 0 && (
              <div className="flex justify-between text-sm font-semibold text-red-600 border-t border-dashed border-stone-200 dark:border-stone-700 pt-2 mt-1">
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
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all active:scale-[0.98]"
            >
              <CreditCard className="h-4 w-4" />
              <span>{t('recordPayment')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


