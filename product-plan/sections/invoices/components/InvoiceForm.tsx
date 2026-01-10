import type { InvoiceFormProps, LineItem } from '../types'
import { useState } from 'react'
import { Loader2, User, Plus, Trash2, Calendar, Percent } from 'lucide-react'

export function InvoiceForm({
  initialData,
  customers,
  onSubmit,
  onCancel,
  isLoading = false,
}: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    customerId: initialData?.customerId ?? '',
    lineItems: initialData?.lineItems ?? [
      { description: '', quantity: 1, rate: 0, amount: 0 },
    ],
    discount: initialData?.discount ?? 0,
    dueDate: initialData?.dueDate ?? new Date().toISOString().split('T')[0],
  })

  const [searchCustomer, setSearchCustomer] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
      c.humanId.toLowerCase().includes(searchCustomer.toLowerCase())
  )

  const selectedCustomer = customers.find((c) => c.id === formData.customerId)

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...formData.lineItems]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Auto-calculate amount
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate
    }
    
    setFormData({ ...formData, lineItems: newItems })
  }

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, { description: '', quantity: 1, rate: 0, amount: 0 }],
    })
  }

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length > 1) {
      setFormData({
        ...formData,
        lineItems: formData.lineItems.filter((_, i) => i !== index),
      })
    }
  }

  const subtotal = formData.lineItems.reduce((sum, item) => sum + item.amount, 0)
  const discountAmount = (subtotal * formData.discount) / 100
  const total = subtotal - discountAmount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!formData.customerId) {
      newErrors.customerId = 'Please select a customer'
    }

    if (formData.lineItems.every((item) => !item.description.trim())) {
      newErrors.lineItems = 'At least one line item is required'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onSubmit?.({
        customerId: formData.customerId,
        lineItems: formData.lineItems.filter((item) => item.description.trim()),
        discount: formData.discount,
        dueDate: formData.dueDate,
      })
    }
  }

  const isEditing = !!initialData

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
          <User className="h-4 w-4" />
          Customer
          <span className="text-red-500">*</span>
        </label>

        <input
          type="text"
          value={searchCustomer}
          onChange={(e) => setSearchCustomer(e.target.value)}
          placeholder="Search by name or ID..."
          className="h-9 w-full rounded-md border border-stone-300 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        />

        <div className="max-h-32 overflow-y-auto rounded-md border border-stone-200 dark:border-stone-700">
          {filteredCustomers.length === 0 ? (
            <p className="p-3 text-center text-sm text-stone-500 dark:text-stone-400">
              No customers found
            </p>
          ) : (
            filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => setFormData({ ...formData, customerId: customer.id })}
                className={`flex w-full items-center justify-between p-3 text-start transition-colors ${
                  formData.customerId === customer.id
                    ? 'bg-amber-50 dark:bg-amber-900/20'
                    : 'hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                    {customer.name}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {customer.humanId}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {errors.customerId && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.customerId}</p>
        )}
      </div>

      {/* Line Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Line Items
          </label>
          <button
            type="button"
            onClick={addLineItem}
            className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>

        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-stone-500 dark:text-stone-400">
            <div className="col-span-5">Description</div>
            <div className="col-span-2">Qty</div>
            <div className="col-span-2">Rate</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-1" />
          </div>

          {/* Items */}
          {formData.lineItems.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2">
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                placeholder="Item description"
                className="col-span-5 h-9 rounded-md border border-stone-300 px-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
              />
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                className="col-span-2 h-9 rounded-md border border-stone-300 px-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
              />
              <input
                type="number"
                min="0"
                step="0.5"
                value={item.rate}
                onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                className="col-span-2 h-9 rounded-md border border-stone-300 px-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
              />
              <div className="col-span-2 flex h-9 items-center text-sm font-medium text-stone-900 dark:text-stone-100">
                {item.amount.toFixed(2)}
              </div>
              <button
                type="button"
                onClick={() => removeLineItem(index)}
                disabled={formData.lineItems.length === 1}
                className="col-span-1 flex h-9 items-center justify-center text-stone-400 hover:text-red-600 disabled:opacity-30 dark:hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {errors.lineItems && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.lineItems}</p>
        )}
      </div>

      {/* Discount and Due Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="discount"
            className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            <Percent className="h-4 w-4" />
            Discount (%)
          </label>
          <input
            id="discount"
            type="number"
            min="0"
            max="100"
            value={formData.discount}
            onChange={(e) =>
              setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })
            }
            className="h-10 w-full rounded-md border border-stone-300 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="dueDate"
            className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            <Calendar className="h-4 w-4" />
            Due Date
          </label>
          <input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="h-10 w-full rounded-md border border-stone-300 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-stone-50 p-4 dark:bg-stone-800">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-600 dark:text-stone-400">Subtotal</span>
            <span className="font-medium text-stone-900 dark:text-stone-100">
              {subtotal.toFixed(2)} EGP
            </span>
          </div>
          {formData.discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Discount ({formData.discount}%)</span>
              <span>-{discountAmount.toFixed(2)} EGP</span>
            </div>
          )}
          <div className="flex justify-between border-t border-stone-200 pt-2 dark:border-stone-700">
            <span className="font-semibold text-stone-900 dark:text-stone-100">Total</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {total.toFixed(2)} EGP
            </span>
          </div>
        </div>
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
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? 'Update Invoice' : 'Create Invoice'}
        </button>
      </div>
    </form>
  )
}
