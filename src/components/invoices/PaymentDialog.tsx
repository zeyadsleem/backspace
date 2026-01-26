import { useState, useEffect } from 'react'
import type { Invoice, PaymentMethod } from '@/types'
import { CreditCard, Wallet, Receipt } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { Modal } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { FormField, FormLabel, FormInput, FormError } from '@/components/ui/form'

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <Modal
      isOpen={isOpen}
      onClose={onClose!}
      showCloseButton={false}
      maxWidth="max-w-md"
      className="overflow-hidden"
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">{t('recordPayment')}</h2>
            <p className="text-xs text-stone-500 font-mono">#{invoice.invoiceNumber}</p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">

        {/* Helper Card */}
        <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800 flex justify-between items-center">
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-1">{t('remainingBalance')}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-xl font-bold text-stone-900 dark:text-stone-100">{remainingBalance.toLocaleString()}</p>
              <span className="text-xs font-medium text-stone-500">{t('egp')}</span>
            </div>
          </div>
          <div className="p-2 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
            <Wallet className="h-5 w-5 text-stone-400" />
          </div>
        </div>

        <div className="space-y-4">
          <FormField>
            <div className="flex justify-between items-center mb-2">
              <FormLabel className="mb-0">{t('paymentAmount')}</FormLabel>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amount: remainingBalance })}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase transition-colors"
              >
                {t('payFullBalance')}
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className={`w-full h-14 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 text-2xl font-medium font-mono outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${isRTL ? 'pl-10' : 'pr-10'}`}
              />
              <span className={`absolute top-1/2 -translate-y-1/2 text-sm font-medium text-stone-400 uppercase pointer-events-none ${isRTL ? 'left-4' : 'right-4'}`}>{t('egp')}</span>
            </div>
            <FormError>{errors.amount}</FormError>
          </FormField>

          <FormField>
            <FormLabel>{t('paymentDate')}</FormLabel>
            <FormInput
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </FormField>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={isLoading}
            className="flex-1"
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            variant="success"
            isLoading={isLoading}
            className="flex-[2]"
          >
            <CreditCard className="h-4 w-4" />
            <span>{t('confirmPayment')}</span>
          </Button>
        </div>
      </form>
    </Modal>
  )
}
