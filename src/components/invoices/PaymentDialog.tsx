import { useState, useEffect } from 'react'
import type { Invoice, PaymentMethod } from '@/types'
import { X, CreditCard, Wallet, Landmark, Loader2 } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

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
  
  const [formData, setFormData] = useState({ 
    amount: 0, 
    method: 'cash' as PaymentMethod, 
    date: new Date().toISOString().split('T')[0], 
    notes: '' 
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (invoice && isOpen) {
      setFormData({
        amount: invoice.total - invoice.paidAmount,
        method: 'cash',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      })
      setErrors({})
    }
  }, [invoice, isOpen])

  if (!isOpen || !invoice) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (formData.amount <= 0) newErrors.amount = t('amountMustBeGreater')
    else if (formData.amount > remainingBalance + 0.1) newErrors.amount = t('amountCannotExceed', { amount: remainingBalance.toLocaleString() })
    if (!formData.date) newErrors.date = t('paymentDateRequired')
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) onSubmit?.(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-stone-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 px-5 py-3">
          <h2 className="font-bold text-stone-900 dark:text-stone-100">{t('recordPayment')}</h2>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg flex justify-between items-center text-sm border border-emerald-100 dark:border-emerald-900/20">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
              <Wallet className="h-4 w-4" />
              <span>{t('cash')}</span>
            </div>
            <div className="text-end">
              <p className="text-[10px] text-emerald-600/70 uppercase font-bold">{t('remainingBalance')}</p>
              <p className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">{remainingBalance.toLocaleString()} {t('egpCurrency')}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-400 uppercase">{t('paymentAmount')}</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className={cn(
                  "h-10 w-full rounded-lg border bg-white dark:bg-stone-800 px-3 text-sm font-bold font-mono focus:outline-none focus:ring-2",
                  errors.amount ? "border-red-500 focus:ring-red-500/10" : "border-stone-200 dark:border-stone-700 focus:border-emerald-500 focus:ring-emerald-500/10"
                )}
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amount: remainingBalance })}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase"
              >
                {t('payFullBalance')}
              </button>
            </div>
            {errors.amount && <p className="text-[10px] text-red-600 font-bold">{errors.amount}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-400 uppercase">{t('paymentDate')}</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="h-10 w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>

          <div className="flex gap-2 pt-2 flex-row">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-10 rounded-lg bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              <span>{t('recordPayment')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-10 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-500 font-bold text-sm hover:bg-stone-50"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


