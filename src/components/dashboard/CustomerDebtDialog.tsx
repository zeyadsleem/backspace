import { useState } from 'react'
import type { Invoice } from '@/types'
import { X, User, CreditCard, ChevronDown, ChevronUp, Wallet, Receipt, CheckCircle2 } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

interface CustomerDebtDialogProps {
  isOpen: boolean
  customerName: string
  invoices: Invoice[]
  onClose: () => void
  onRecordBulkPayment: (invoiceIds: string[], totalAmount: number, notes: string) => void
  onGoToProfile: () => void
}

export function CustomerDebtDialog({ 
  isOpen, 
  customerName, 
  invoices, 
  onClose, 
  onRecordBulkPayment,
  onGoToProfile 
}: CustomerDebtDialogProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null)
  const [paymentNotes, setPaymentNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  if (!isOpen) return null

  const totalDebt = invoices.reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0)
  const sortedInvoices = [...invoices].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const formatDate = (date: string) => new Date(date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })

  const handlePayAll = async () => {
    setIsProcessing(true)
    const ids = invoices.map(i => i.id)
    await onRecordBulkPayment(ids, totalDebt, paymentNotes)
    setIsProcessing(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative z-10 w-full max-w-4xl bg-white dark:bg-stone-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        
        {/* Header */}
        <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">{customerName}</h2>
              <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">{t('unpaidInvoices')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            
            {/* RIGHT PANEL: INVOICES LIST */}
            <div className="flex-[1.6] flex flex-col border-e border-stone-100 dark:border-stone-800 bg-stone-50/30 dark:bg-stone-900/30 overflow-hidden">
                <div className="p-3 px-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white/50 dark:bg-stone-800/50">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{t('invoiceList')}</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                        {invoices.length} {t('invoices')}
                    </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 scrollbar-thin space-y-2.5">
                    {sortedInvoices.map((invoice) => {
                        const isExpanded = expandedInvoiceId === invoice.id
                        const balance = invoice.total - invoice.paidAmount
                        return (
                            <div key={invoice.id} className={cn(
                                "rounded-xl border transition-all overflow-hidden",
                                isExpanded ? "border-red-200 dark:border-red-900/50 bg-white dark:bg-stone-800 shadow-sm" : "border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 hover:bg-white"
                            )}>
                                <div 
                                    className="p-2.5 flex items-center justify-between cursor-pointer transition-colors"
                                    onClick={() => setExpandedInvoiceId(isExpanded ? null : invoice.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-8 w-8 rounded-lg flex items-center justify-center border transition-colors",
                                            isExpanded ? "bg-red-50 border-red-100 text-red-600" : "bg-stone-50 dark:bg-stone-800 border-stone-100 dark:border-stone-700 text-stone-400"
                                        )}>
                                            <Receipt className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{invoice.invoiceNumber}</p>
                                            <p className="text-xs text-stone-500 font-medium">{formatDate(invoice.dueDate)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-end">
                                            <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{balance.toLocaleString()} <span className="text-xs text-stone-400 font-medium">{t('egp')}</span></p>
                                            {invoice.paidAmount > 0 && <p className="text-xs text-emerald-600 font-bold uppercase">{t('partial')}</p>}
                                        </div>
                                        {isExpanded ? <ChevronUp className="h-4 w-4 text-stone-400" /> : <ChevronDown className="h-4 w-4 text-stone-400" />}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-3 pb-3 pt-1 border-t border-stone-50 dark:border-stone-700/50 animate-fade-in">
                                        <div className="bg-stone-50/50 dark:bg-stone-900/50 rounded-lg p-2">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="text-stone-400 font-bold uppercase tracking-wider border-b border-stone-100 dark:border-stone-700/50">
                                                        <th className="py-1 text-start px-1">{t('description')}</th>
                                                        <th className="py-1 text-end px-1">{t('amount')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-stone-100 dark:divide-stone-700/30">
                                                    {invoice.lineItems.map((item, i) => (
                                                        <tr key={i} className="text-stone-600 dark:text-stone-300">
                                                            <td className="py-1.5 px-1 font-medium">{item.description}</td>
                                                            <td className="py-1.5 px-1 text-end font-mono font-bold">{item.amount.toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* LEFT PANEL: PAYMENT SUMMARY */}
            <div className="flex-1 flex flex-col bg-white dark:bg-stone-900 p-5 overflow-y-auto">
                <div className="flex-1 flex flex-col gap-6">
                    
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest block">{t('paymentSummary')}</label>
                        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 flex flex-col items-center text-center gap-1">
                            <span className="text-xs font-bold text-red-600/70 uppercase tracking-widest">{t('totalAmountToPay')}</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-medium text-red-700 dark:text-red-400">{totalDebt.toLocaleString()}</span>
                                <span className="text-xs font-medium text-red-600/70">{t('egp')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 block">{t('paymentMethod')}</label>
                            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 flex items-center gap-3">
                                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-800 rounded-lg">
                                    <Wallet className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-bold text-xs">{t('cash')}</p>
                                    <p className="text-xs opacity-70 uppercase font-bold">{t('onlyCashAccepted')}</p>
                                </div>
                                <CheckCircle2 className="h-4 w-4 ms-auto text-emerald-500" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest block">{t('notes')}</label>
                            <textarea
                                value={paymentNotes}
                                onChange={(e) => setPaymentNotes(e.target.value)}
                                placeholder={t('addPaymentNotes')}
                                className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all resize-none h-20"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handlePayAll}
                        disabled={isProcessing || totalDebt <= 0}
                        className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                    >
                        {isProcessing ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <CreditCard className="h-5 w-5" />
                                <span>{t('payAllInvoices')}</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <button 
                        onClick={onGoToProfile}
                        className="w-full py-1 text-xs font-bold text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors uppercase tracking-widest"
                    >
                        {t('viewCustomerProfile')}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
