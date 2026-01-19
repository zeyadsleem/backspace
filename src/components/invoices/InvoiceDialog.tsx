import type { Invoice } from '@/types'
import { X, FileText, Calendar, User, CreditCard } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { RTLIcon } from '@/components/ui/RTLIcon'

interface InvoiceDialogProps {
  isOpen: boolean
  invoice: Invoice | null
  onClose?: () => void
  onRecordPayment?: () => void
}

export function InvoiceDialog({ isOpen, invoice, onClose, onRecordPayment }: InvoiceDialogProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)
  
  if (!isOpen || !invoice) return null

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const formatCurrency = (amount: number) => `${amount.toLocaleString()} ${t('egpCurrency')}`
  const remainingAmount = invoice.total - invoice.paidAmount

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 my-8 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-stone-900">
        <div className={`mb-6 flex items-center justify-between`}>
          <div className={`flex items-center gap-3 ${isRTL ? '' : 'flex-row-reverse'}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30"><RTLIcon><FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" /></RTLIcon></div>
            <div className={isRTL ? 'text-end' : 'text-start'}>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-tight">{invoice.invoiceNumber}</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">{t('createdOn')} {formatDate(invoice.createdAt)}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className={`flex items-center gap-2 ${isRTL ? '' : 'flex-row-reverse'}`}><RTLIcon><User className="h-4 w-4 text-stone-400" /></RTLIcon><div className={isRTL ? 'text-end' : 'text-start'}><p className="text-xs text-stone-500">{t('customer')}</p><p className="font-medium text-stone-900 dark:text-stone-100">{invoice.customerName}</p></div></div>
            <div className={`flex items-center gap-2 ${isRTL ? '' : 'flex-row-reverse'}`}><RTLIcon><Calendar className="h-4 w-4 text-stone-400" /></RTLIcon><div className={isRTL ? 'text-end' : 'text-start'}><p className="text-xs text-stone-500">{t('dueDate')}</p><p className="font-medium text-stone-900 dark:text-stone-100">{formatDate(invoice.dueDate)}</p></div></div>
          </div>

          <div className="border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
            <div className={`grid grid-cols-12 gap-2 px-4 py-2 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-500 uppercase ${isRTL ? 'text-end' : 'text-start'}`}>
              <div className="col-span-6">{t('description')}</div><div className={`col-span-2 ${isRTL ? 'text-end' : 'text-start'}`}>{t('quantity')}</div><div className={`col-span-2 ${isRTL ? 'text-end' : 'text-start'}`}>{t('rate')}</div><div className={`col-span-2 ${isRTL ? 'text-end' : 'text-start'}`}>{t('amount')}</div>
            </div>
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {invoice.lineItems.map((item, i) => (
                <div key={i} className={`grid grid-cols-12 gap-2 px-4 py-3 text-sm ${isRTL ? 'text-end' : 'text-start'}`}>
                  <div className="col-span-6 text-stone-900 dark:text-stone-100">{item.description}</div>
                  <div className={`col-span-2 text-stone-600 dark:text-stone-400 ${isRTL ? 'text-end' : 'text-start'}`}>{item.quantity}</div>
                  <div className={`col-span-2 text-stone-600 dark:text-stone-400 ${isRTL ? 'text-end' : 'text-start'}`}>{item.rate}</div>
                  <div className={`col-span-2 font-medium text-stone-900 dark:text-stone-100 ${isRTL ? 'text-end' : 'text-start'}`}>{item.amount}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
            <div className={`w-64 space-y-2 text-sm ${isRTL ? 'text-end' : 'text-start'}`}>
              <div className="flex justify-between"><span className="text-stone-500">{t('subtotal')}</span><span className="text-stone-900 dark:text-stone-100">{formatCurrency(invoice.amount)}</span></div>
              {invoice.discount > 0 && <div className="flex justify-between text-emerald-600"><span>{t('discount')}</span><span>-{formatCurrency(invoice.discount)}</span></div>}
              <div className="flex justify-between border-t pt-2 font-semibold"><span className="text-stone-900 dark:text-stone-100">{t('total')}</span><span className="text-amber-600">{formatCurrency(invoice.total)}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">{t('paid')}</span><span className="text-emerald-600">{formatCurrency(invoice.paidAmount)}</span></div>
              {remainingAmount > 0 && <div className="flex justify-between font-semibold"><span className="text-stone-900 dark:text-stone-100">{t('balanceDue')}</span><span className="text-red-600">{formatCurrency(remainingAmount)}</span></div>}
            </div>
          </div>

          {invoice.status !== 'paid' && (
            <div className={`flex justify-start pt-4 border-t border-stone-200 dark:border-stone-700`}>
              <button onClick={onRecordPayment} className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors ${isRTL ? '' : 'flex-row-reverse'}`}><RTLIcon><CreditCard className="h-4 w-4" /></RTLIcon>{t('recordPayment')}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
