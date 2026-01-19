import type { Invoice } from '@/types'
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface PendingInvoicesProps {
  invoices: Invoice[]
  onViewInvoice?: (id: string) => void
}

export function PendingInvoices({ invoices, onViewInvoice }: PendingInvoicesProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)

  const pendingByCustomer = invoices
    .filter(inv => inv.status !== 'paid')
    .reduce((acc, invoice) => {
      const existing = acc.find(item => item.customerId === invoice.customerId)
      const balanceDue = invoice.total - invoice.paidAmount
      
      if (existing) {
        existing.totalDue += balanceDue
        existing.count += 1
        // Keep the ID of the most recent invoice for navigation
        if (new Date(invoice.createdAt) > new Date(existing.lastInvoiceDate)) {
            existing.actionInvoiceId = invoice.id
            existing.lastInvoiceDate = invoice.createdAt
        }
      } else {
        acc.push({
          customerId: invoice.customerId,
          customerName: invoice.customerName,
          totalDue: balanceDue,
          count: 1,
          actionInvoiceId: invoice.id,
          lastInvoiceDate: invoice.createdAt
        })
      }
      return acc
    }, [] as { customerId: string, customerName: string, totalDue: number, count: number, actionInvoiceId: string, lastInvoiceDate: string }[])
    .sort((a, b) => b.totalDue - a.totalDue)

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="font-bold text-stone-900 dark:text-stone-100">{t('unpaid')}</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black border border-red-100 dark:border-red-900/30">
          {pendingByCustomer.length} {t('customer')}
        </span>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-4">
        {pendingByCustomer.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-8 text-center opacity-50">
            <p className="text-sm font-medium text-stone-500">{t('noInvoicesFound')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingByCustomer.map((item) => (
              <button
                key={item.customerId}
                onClick={() => onViewInvoice?.(item.actionInvoiceId)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-100 dark:border-stone-800/50 hover:bg-red-50/30 dark:hover:bg-red-900/10 hover:border-red-100 transition-all group"
              >
                <div className="text-start">
                  <p className="text-sm font-bold text-stone-900 dark:text-stone-100">{item.customerName}</p>
                  <p className="text-[10px] text-stone-400 font-mono uppercase">{item.count} {t('invoices')}</p>
                </div>
                <div className="text-end flex items-center gap-3">
                  <div>
                    <p className="text-sm font-black text-red-600 font-mono">
                      {item.totalDue.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-stone-400 font-bold uppercase">{t('totalDue')}</p>
                  </div>
                  {isRTL ? <ChevronLeft className="h-4 w-4 text-stone-300 group-hover:text-red-400 transition-colors" /> : <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-red-400 transition-colors" />}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
