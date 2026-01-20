import { useState } from 'react'
import type { Invoice } from '@/types'
import { X, User, FileText, CreditCard, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

interface CustomerDebtDialogProps {
  isOpen: boolean
  customerName: string
  invoices: Invoice[]
  onClose: () => void
  onRecordPayment: (id: string) => void
  onGoToProfile: () => void
}

export function CustomerDebtDialog({ 
  isOpen, 
  customerName, 
  invoices, 
  onClose, 
  onRecordPayment,
  onGoToProfile 
}: CustomerDebtDialogProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null)
  
  if (!isOpen) return null

  const totalDebt = invoices.reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0)
  const sortedInvoices = [...invoices].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const formatDate = (date: string) => new Date(date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })

  const toggleExpand = (id: string) => {
    setExpandedInvoiceId(expandedInvoiceId === id ? null : id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-stone-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">{customerName}</h2>
              <p className="text-xs text-stone-500 font-medium">{t('unpaidInvoices')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Total Debt Banner */}
        <div className="p-5 bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20 flex flex-col items-center justify-center gap-1">
            <span className="text-xs font-bold text-red-600/70 uppercase tracking-widest">{t('totalDue')}</span>
            <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-red-700 dark:text-red-400">{totalDebt.toLocaleString()}</span>
                <span className="text-sm font-bold text-red-600/70">{t('egp')}</span>
            </div>
        </div>

        {/* Invoices List */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <div className="space-y-3">
                {sortedInvoices.map((invoice) => {
                    const isExpanded = expandedInvoiceId === invoice.id
                    return (
                        <div key={invoice.id} className={cn(
                            "rounded-xl border transition-all overflow-hidden",
                            isExpanded ? "border-red-200 dark:border-red-900/50 bg-red-50/10" : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                        )}>
                            <div 
                                className="p-3 flex items-center justify-between cursor-pointer hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors"
                                onClick={() => toggleExpand(invoice.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-9 w-9 rounded-lg flex items-center justify-center text-xs border transition-colors",
                                        isExpanded ? "bg-red-100 border-red-200 text-red-600" : "bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500"
                                    )}>
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-stone-900 dark:text-stone-100">{invoice.invoiceNumber}</p>
                                        <p className="text-[10px] text-stone-500 font-medium">{t('dueDate')}: {formatDate(invoice.dueDate)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-end">
                                        <p className="text-sm font-bold text-stone-900 dark:text-stone-100">{(invoice.total - invoice.paidAmount).toLocaleString()} <span className="text-[10px] text-stone-400 font-medium">{t('egp')}</span></p>
                                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">{t('unpaid')}</p>
                                    </div>
                                    {isExpanded ? <ChevronUp className="h-4 w-4 text-stone-400" /> : <ChevronDown className="h-4 w-4 text-stone-400" />}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="px-3 pb-3 pt-1 border-t border-red-100 dark:border-red-900/20 animate-fade-in">
                                    <div className="bg-white/50 dark:bg-stone-800/50 rounded-lg p-2 mb-3">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="text-stone-400 font-bold uppercase tracking-wider border-b border-stone-100 dark:border-stone-700/50">
                                                    <th className="py-1.5 text-start px-1">{t('description')}</th>
                                                    <th className="py-1.5 text-end px-1">{t('amount')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-100 dark:divide-stone-700/30">
                                                {invoice.lineItems.map((item, i) => (
                                                    <tr key={i} className="text-stone-600 dark:text-stone-300">
                                                        <td className="py-2 px-1 font-medium">{item.description}</td>
                                                        <td className="py-2 px-1 text-end font-mono font-bold">{item.amount.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onRecordPayment(invoice.id); }}
                                        className="w-full h-9 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
                                    >
                                        <CreditCard className="h-3.5 w-3.5" />
                                        <span>{t('recordPayment')}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
            <button 
                onClick={onGoToProfile}
                className="w-full h-10 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-stone-100 transition-colors uppercase tracking-wider shadow-sm"
            >
                {t('viewCustomerProfile')}
            </button>
        </div>
      </div>
    </div>
  )
}
