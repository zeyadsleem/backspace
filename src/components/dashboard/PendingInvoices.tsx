import type { Invoice } from '@/types'
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface PendingInvoicesProps {
  invoices: Invoice[]
  onViewCustomerDebt?: (customerId: string) => void
}

export function PendingInvoices({ invoices, onViewCustomerDebt }: PendingInvoicesProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)

  const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid')
  
  // Group invoices by customer
  const grouped = unpaidInvoices.reduce((acc, invoice) => {
    if (!acc[invoice.customerId]) {
      acc[invoice.customerId] = {
        name: invoice.customerName,
        invoices: []
      }
    }
    acc[invoice.customerId].invoices.push(invoice)
    return acc
  }, {} as Record<string, { name: string, invoices: Invoice[] }>)

  const sortedCustomerIds = Object.keys(grouped).sort((a, b) => {
    const totalA = grouped[a].invoices.reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0)
    const totalB = grouped[b].invoices.reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0)
    return totalB - totalA
  })

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-stone-900 dark:text-stone-100">{t('unpaidInvoices')}</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-100 dark:border-red-900/30">
          {sortedCustomerIds.length} {t('customer')}
        </span>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-4">
        {unpaidInvoices.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-8 text-center opacity-50">
            <p className="text-sm font-medium text-stone-500">{t('noInvoicesFound')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCustomerIds.map((customerId) => {
              const group = grouped[customerId]
              const totalDue = group.invoices.reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0)
              return (
                <button
                  key={customerId}
                  onClick={() => onViewCustomerDebt?.(customerId)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-stone-100 dark:border-stone-800/50 hover:bg-red-50/30 dark:hover:bg-red-900/10 hover:border-red-100 transition-all group shadow-sm"
                >
                  <div className="text-start">
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{group.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-xs font-medium text-stone-500 uppercase tracking-tight border border-stone-200 dark:border-stone-700">
                            {group.invoices.length} {t('invoices')}
                        </span>
                    </div>
                  </div>
                  <div className="text-end flex items-center gap-4">
                    <div>
                      <p className="text-base font-semibold text-red-600 font-mono">
                        {totalDue.toLocaleString()}
                      </p>
                      <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">{t('totalDue')}</p>
                    </div>
                    {isRTL ? <ChevronLeft className="h-4 w-4 text-stone-300 group-hover:text-red-400 transition-colors" /> : <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-red-400 transition-colors" />}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
