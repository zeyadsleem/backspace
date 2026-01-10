import { useState } from 'react'
import type { Invoice, PaymentMethod } from '@/types'
import { X, DollarSign, Calendar, FileText, Loader2 } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { RTLIcon } from '@/components/ui/RTLIcon'

interface PaymentDialogProps {
  isOpen: boolean
  invoice: Invoice | null
  onSubmit?: (data: { amount: number; method: PaymentMethod; date: string; notes?: string }) => void
  onClose?: () => void
  isLoading?: boolean
}

export function PaymentDialog({ isOpen, invoice, onSubmit, onClose, isLoading }: PaymentDialogProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)
  const remainingBalance = invoice ? invoice.total - invoice.paidAmount : 0
  const [formData, setFormData] = useState({ amount: remainingBalance, method: 'cash' as PaymentMethod, date: new Date().toISOString().split('T')[0], notes: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen || !invoice) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (formData.amount <= 0) newErrors.amount = t('amountMustBeGreater')
    if (formData.amount > remainingBalance) newErrors.amount = t('amountCannotExceed', { amount: remainingBalance.toFixed(2) })
    if (!formData.date) newErrors.date = t('paymentDateRequired')
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) onSubmit?.(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} />
      <div className="relative z-10 my-8 w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl dark:bg-stone-900">
        <div className={`mb-6 flex items-center justify-between`}>
          <div className={`flex items-center gap-3 ${isRTL ? '' : 'flex-row-reverse'}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30"><RTLIcon><DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></RTLIcon></div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('recordPayment')}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg bg-stone-50 p-4 dark:bg-stone-800">
            <h4 className={`mb-3 text-sm font-medium text-stone-700 dark:text-stone-300 ${isRTL ? 'text-end' : 'text-start'}`}>{t('invoiceSummary')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-stone-600 dark:text-stone-400">{t('invoiceNumber')}</span><span className="font-medium text-stone-900 dark:text-stone-100">{invoice.invoiceNumber}</span></div>
              <div className="flex justify-between"><span className="text-stone-600 dark:text-stone-400">{t('totalAmount')}</span><span className="font-medium text-stone-900 dark:text-stone-100">{invoice.total.toFixed(2)} {t('egp')}</span></div>
              <div className="flex justify-between"><span className="text-stone-600 dark:text-stone-400">{t('alreadyPaid')}</span><span className="font-medium text-emerald-600 dark:text-emerald-400">{invoice.paidAmount.toFixed(2)} {t('egp')}</span></div>
              <div className="flex justify-between border-t border-stone-200 pt-2 dark:border-stone-700"><span className="font-semibold text-stone-900 dark:text-stone-100">{t('remainingBalance')}</span><span className="font-bold text-amber-600 dark:text-amber-400">{remainingBalance.toFixed(2)} {t('egp')}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className={`flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300 ${isRTL ? 'justify-start' : 'justify-start'}`}>
                {isRTL ? (
                  <>
                    <RTLIcon><DollarSign className="h-4 w-4" /></RTLIcon>
                    <span>{t('paymentAmount')}</span>
                    <span className="text-red-500">*</span>
                  </>
                ) : (
                  <>
                    <RTLIcon><DollarSign className="h-4 w-4" /></RTLIcon>
                    <span>{t('paymentAmount')}</span>
                    <span className="text-red-500">*</span>
                  </>
                )}
              </label>
              <input type="number" min="0" max={remainingBalance} step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${errors.amount ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600'}`} />
              {errors.amount && <p className={`text-sm text-red-600 dark:text-red-400 ${isRTL ? 'text-end' : 'text-start'}`}>{errors.amount}</p>}
              <button type="button" onClick={() => setFormData({ ...formData, amount: remainingBalance })} className={`text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 ${isRTL ? 'text-end' : 'text-start'}`}>{t('payFullBalance')}</button>
            </div>

            <div className="space-y-1.5">
              <label className={`flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300 ${isRTL ? 'justify-start' : 'justify-start'}`}>
                {isRTL ? (
                  <>
                    <RTLIcon><Calendar className="h-4 w-4" /></RTLIcon>
                    <span>{t('paymentDate')}</span>
                    <span className="text-red-500">*</span>
                  </>
                ) : (
                  <>
                    <RTLIcon><Calendar className="h-4 w-4" /></RTLIcon>
                    <span>{t('paymentDate')}</span>
                    <span className="text-red-500">*</span>
                  </>
                )}
              </label>
              <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${errors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600'}`} />
              {errors.date && <p className={`text-sm text-red-600 dark:text-red-400 ${isRTL ? 'text-end' : 'text-start'}`}>{errors.date}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300 ${isRTL ? 'justify-start' : 'justify-start'}`}>
              {isRTL ? (
                <>
                  <RTLIcon><FileText className="h-4 w-4" /></RTLIcon>
                  <span>{t('paymentNotes')}</span>
                  <span className="text-stone-400">({t('optional')})</span>
                </>
              ) : (
                <>
                  <RTLIcon><FileText className="h-4 w-4" /></RTLIcon>
                  <span>{t('paymentNotes')}</span>
                  <span className="text-stone-400">({t('optional')})</span>
                </>
              )}
            </label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder={t('addPaymentNotes')} rows={2} className={`w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 ${isRTL ? 'text-end' : 'text-start'}`} dir={isRTL ? 'rtl' : 'ltr'} />
          </div>

          <div className={`flex gap-3 pt-2`}>
            <button type="submit" disabled={isLoading} className="flex flex-1 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600">{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}{t('recordPayment')}</button>
            <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700">{t('cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
