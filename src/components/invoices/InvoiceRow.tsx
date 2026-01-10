import type { Invoice, InvoiceStatus } from '@/types'
import { Eye, CreditCard } from 'lucide-react'
import { useTranslation } from '@/stores/hooks'
import { useAppStore } from '@/stores/useAppStore'

interface InvoiceRowProps {
  invoice: Invoice
  onView?: () => void
  onRecordPayment?: () => void
}

const statusConfig: Record<InvoiceStatus, { labelEn: string; labelAr: string; color: string; bg: string }> = {
  paid: { labelEn: 'Paid', labelAr: 'مدفوعة', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  unpaid: { labelEn: 'Unpaid', labelAr: 'غير مدفوعة', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  pending: { labelEn: 'Pending', labelAr: 'معلقة', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
}

export function InvoiceRow({ invoice, onView, onRecordPayment }: InvoiceRowProps) {
  const t = useTranslation()
  const isRTL = useAppStore((state) => state.isRTL)
  const config = statusConfig[invoice.status]
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })
  const formatCurrency = (amount: number) => `${amount.toLocaleString()} ${t('egp')}`
  const remainingAmount = invoice.total - invoice.paidAmount

  return (
    <div className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors ${isRTL ? 'text-end' : 'text-start'}`}>
      <div className="col-span-1 md:col-span-2 flex items-center"><span className="font-mono font-medium text-stone-900 dark:text-stone-100">{invoice.invoiceNumber}</span></div>
      <div className="col-span-1 md:col-span-3 flex items-center">
        <div className={isRTL ? 'text-end' : 'text-start'}><p className="font-medium text-stone-900 dark:text-stone-100">{invoice.customerName}</p><p className="text-xs text-stone-500 dark:text-stone-400">{invoice.customerPhone}</p></div>
      </div>
      <div className={`col-span-1 md:col-span-2 flex items-center ${isRTL ? 'justify-start' : 'md:justify-end'}`}>
        <div className={isRTL ? 'text-start' : 'text-end'}>
          <p className="font-semibold text-stone-900 dark:text-stone-100 font-mono">{formatCurrency(invoice.total)}</p>
          {invoice.status === 'pending' && remainingAmount > 0 && <p className="text-xs text-amber-600 dark:text-amber-400 font-mono">{formatCurrency(remainingAmount)} {t('remaining')}</p>}
        </div>
      </div>
      <div className="col-span-1 md:col-span-2 flex items-center"><span className={`px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.color}`}>{isRTL ? config.labelAr : config.labelEn}</span></div>
      <div className="col-span-1 md:col-span-1 flex items-center"><span className="text-sm text-stone-600 dark:text-stone-400">{formatDate(invoice.dueDate)}</span></div>
      <div className={`col-span-1 md:col-span-2 flex items-center gap-1 ${isRTL ? 'justify-start' : 'justify-end'}`}>
        <button onClick={onView} className="p-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors" title={t('view')}><Eye className="h-4 w-4" /></button>
        {invoice.status !== 'paid' && <button onClick={onRecordPayment} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" title={t('recordPayment')}><CreditCard className="h-4 w-4" /></button>}
      </div>
    </div>
  )
}
