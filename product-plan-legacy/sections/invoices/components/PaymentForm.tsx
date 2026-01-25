import type { PaymentFormProps, PaymentMethod } from '../types'
import { useState } from 'react'
import { Loader2, DollarSign, Calendar, CreditCard, Banknote, Building2, FileText } from 'lucide-react'

const paymentMethodIcons: Record<PaymentMethod, React.ComponentType<{ className?: string }>> = {
  cash: Banknote,
  card: CreditCard,
  transfer: Building2,
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  transfer: 'Bank Transfer',
}

export function PaymentForm({
  invoice,
  paymentMethods,
  onSubmit,
  onCancel,
  isLoading = false,
}: PaymentFormProps) {
  const remainingBalance = invoice.total - invoice.paidAmount

  const [formData, setFormData] = useState({
    amount: remainingBalance,
    method: 'cash' as PaymentMethod,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (formData.amount > remainingBalance) {
      newErrors.amount = `Amount cannot exceed remaining balance (${remainingBalance.toFixed(2)} EGP)`
    }

    if (!formData.date) {
      newErrors.date = 'Payment date is required'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onSubmit?.({
        amount: formData.amount,
        method: formData.method,
        date: formData.date,
        notes: formData.notes || undefined,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Invoice Summary */}
      <div className="rounded-lg bg-stone-50 p-4 dark:bg-stone-800">
        <h4 className="mb-3 text-sm font-medium text-stone-700 dark:text-stone-300">
          Invoice Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-600 dark:text-stone-400">Invoice</span>
            <span className="font-medium text-stone-900 dark:text-stone-100">
              {invoice.invoiceNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-600 dark:text-stone-400">Customer</span>
            <span className="font-medium text-stone-900 dark:text-stone-100">
              {invoice.customerName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-600 dark:text-stone-400">Total Amount</span>
            <span className="font-medium text-stone-900 dark:text-stone-100">
              {invoice.total.toFixed(2)} EGP
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-600 dark:text-stone-400">Already Paid</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {invoice.paidAmount.toFixed(2)} EGP
            </span>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-2 dark:border-stone-700">
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              Remaining Balance
            </span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {remainingBalance.toFixed(2)} EGP
            </span>
          </div>
        </div>
      </div>

      {/* Amount Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="amount"
          className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          <DollarSign className="h-4 w-4" />
          Payment Amount (EGP)
          <span className="text-red-500">*</span>
        </label>
        <input
          id="amount"
          type="number"
          min="0"
          max={remainingBalance}
          step="0.01"
          value={formData.amount}
          onChange={(e) =>
            setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
          }
          className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${
            errors.amount
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600'
          }`}
        />
        {errors.amount && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
        )}
        <button
          type="button"
          onClick={() => setFormData({ ...formData, amount: remainingBalance })}
          className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
        >
          Pay full remaining balance
        </button>
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Payment Method
        </label>
        <div className="grid grid-cols-3 gap-3">
          {paymentMethods.map((method) => {
            const Icon = paymentMethodIcons[method]
            const isSelected = formData.method === method
            return (
              <button
                key={method}
                type="button"
                onClick={() => setFormData({ ...formData, method })}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-900/20'
                    : 'border-stone-200 hover:border-stone-300 dark:border-stone-700 dark:hover:border-stone-600'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isSelected
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isSelected
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {paymentMethodLabels[method]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Payment Date */}
      <div className="space-y-1.5">
        <label
          htmlFor="date"
          className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          <Calendar className="h-4 w-4" />
          Payment Date
          <span className="text-red-500">*</span>
        </label>
        <input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${
            errors.date
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600'
          }`}
        />
        {errors.date && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.date}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label
          htmlFor="notes"
          className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          <FileText className="h-4 w-4" />
          Notes
          <span className="text-stone-400">(optional)</span>
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add any notes about this payment..."
          rows={2}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Record Payment
        </button>
      </div>
    </form>
  )
}
