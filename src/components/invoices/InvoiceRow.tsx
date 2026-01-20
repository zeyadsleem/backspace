import type { Invoice, InvoiceStatus } from '@/types'
import { Eye, CreditCard } from 'lucide-react'
import { useTranslation } from '@/stores/hooks'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

interface InvoiceRowProps {
  invoice: Invoice
  onView?: () => void
  onRecordPayment?: () => void
}

const statusConfig: Record<Exclude<InvoiceStatus, 'pending'>, { color: string; bg: string }> = {
  paid: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  unpaid: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
}

export function InvoiceRow({ invoice, onView, onRecordPayment }: InvoiceRowProps) {
  const t = useTranslation()
  const isRTL = useAppStore((state) => state.isRTL)
  const config = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.unpaid
  
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
  
  const formatCurrency = (amount: number) => `${amount.toLocaleString()} ${t('egpCurrency')}`

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors text-start">
      <div className="col-span-1 md:col-span-2 flex items-center">
        <span className="font-mono text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-tight">
          {invoice.invoiceNumber}
        </span>
      </div>
      
      <div className="col-span-1 md:col-span-3 flex items-center">
        <div className="text-start">
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{invoice.customerName}</p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">{invoice.customerPhone}</p>
        </div>
      </div>
      
      <div className="col-span-1 md:col-span-2 flex items-center md:justify-center">
        <div className="md:text-center text-start">
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 font-mono">{formatCurrency(invoice.total)}</p>
          {invoice.status === 'unpaid' && invoice.paidAmount > 0 && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium font-mono uppercase">
              {formatCurrency(invoice.total - invoice.paidAmount)} {t('remaining')}
            </p>
          )}
        </div>
      </div>
      
      <div className="col-span-1 md:col-span-2 flex items-center">
        <span className={cn(
          "px-2.5 py-1 text-xs font-medium rounded-full uppercase tracking-wider",
          config.bg,
          config.color
        )}>
          {t(invoice.status)}
        </span>
      </div>
      
      <div className="col-span-1 md:col-span-1 flex items-center">
        <span className="text-sm text-stone-600 dark:text-stone-400 font-medium">
          {formatDate(invoice.dueDate)}
        </span>
      </div>
      
      <div className="col-span-1 md:col-span-2 flex items-center gap-1 justify-end">
        <button 
          onClick={onView} 
          className="p-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors" 
          title={t('viewInvoice')}
        >
          <Eye className="h-4 w-4" />
        </button>
        {invoice.status !== 'paid' && (
          <button 
            onClick={onRecordPayment} 
            className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" 
            title={t('recordPayment')}
          >
            <CreditCard className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

