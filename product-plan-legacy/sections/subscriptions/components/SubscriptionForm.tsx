import type { SubscriptionFormProps, PlanType } from '../types'
import { useState } from 'react'
import { Loader2, User, Calendar, CreditCard } from 'lucide-react'

export function SubscriptionForm({
  initialData,
  customers,
  planTypes,
  onSubmit,
  onCancel,
  isLoading = false,
  language = 'en',
}: SubscriptionFormProps) {
  const [formData, setFormData] = useState({
    customerId: initialData?.customerId ?? '',
    planType: initialData?.planType ?? 'weekly',
    startDate: initialData?.startDate ?? new Date().toISOString().split('T')[0],
  })

  const [searchCustomer, setSearchCustomer] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
      c.humanId.toLowerCase().includes(searchCustomer.toLowerCase())
  )

  const selectedCustomer = customers.find((c) => c.id === formData.customerId)
  const selectedPlan = planTypes.find((p) => p.id === formData.planType)

  const calculateEndDate = (startDate: string, days: number): string => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!formData.customerId) {
      newErrors.customerId = language === 'ar' ? 'يرجى اختيار عميل' : 'Please select a customer'
    }

    if (!formData.startDate) {
      newErrors.startDate = language === 'ar' ? 'تاريخ البدء مطلوب' : 'Start date is required'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onSubmit?.({
        customerId: formData.customerId,
        planType: formData.planType as PlanType,
        startDate: formData.startDate,
      })
    }
  }

  const isEditing = !!initialData

  const labels = {
    customer: language === 'ar' ? 'العميل' : 'Customer',
    plan: language === 'ar' ? 'نوع الاشتراك' : 'Plan Type',
    startDate: language === 'ar' ? 'تاريخ البدء' : 'Start Date',
    endDate: language === 'ar' ? 'تاريخ الانتهاء' : 'End Date',
    cancel: language === 'ar' ? 'إلغاء' : 'Cancel',
    create: language === 'ar' ? 'إنشاء اشتراك' : 'Create Subscription',
    update: language === 'ar' ? 'تحديث الاشتراك' : 'Update Subscription',
    searchPlaceholder: language === 'ar' ? 'ابحث بالاسم أو الرقم...' : 'Search by name or ID...',
    noCustomers: language === 'ar' ? 'لا يوجد عملاء' : 'No customers found',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
          <User className="h-4 w-4" />
          {labels.customer}
          <span className="text-red-500">*</span>
        </label>

        {/* Search */}
        <input
          type="text"
          value={searchCustomer}
          onChange={(e) => setSearchCustomer(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="h-9 w-full rounded-md border border-stone-300 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        />

        {/* Customer List */}
        <div className="max-h-32 overflow-y-auto rounded-md border border-stone-200 dark:border-stone-700">
          {filteredCustomers.length === 0 ? (
            <p className="p-3 text-center text-sm text-stone-500 dark:text-stone-400">
              {labels.noCustomers}
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

      {/* Plan Type Selection */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
          <CreditCard className="h-4 w-4" />
          {labels.plan}
        </label>

        <div className="grid grid-cols-3 gap-3">
          {planTypes.map((plan) => {
            const isSelected = formData.planType === plan.id
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setFormData({ ...formData, planType: plan.id })}
                className={`rounded-lg border-2 p-3 text-center transition-colors ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-900/20'
                    : 'border-stone-200 hover:border-stone-300 dark:border-stone-700 dark:hover:border-stone-600'
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    isSelected
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {language === 'ar' ? plan.labelAr : plan.labelEn}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {plan.days} {language === 'ar' ? 'يوم' : 'days'}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Date Fields */}
      <div className="grid grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="space-y-1.5">
          <label
            htmlFor="startDate"
            className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            <Calendar className="h-4 w-4" />
            {labels.startDate}
          </label>
          <input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${
              errors.startDate
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600'
            }`}
          />
          {errors.startDate && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>
          )}
        </div>

        {/* End Date (Calculated) */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
            <Calendar className="h-4 w-4" />
            {labels.endDate}
          </label>
          <input
            type="date"
            value={
              selectedPlan
                ? calculateEndDate(formData.startDate, selectedPlan.days)
                : ''
            }
            disabled
            className="h-10 w-full rounded-md border border-stone-200 bg-stone-50 px-3 text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400"
          />
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {language === 'ar' ? 'يتم حسابه تلقائياً' : 'Auto-calculated'}
          </p>
        </div>
      </div>

      {/* Summary */}
      {selectedCustomer && selectedPlan && (
        <div className="rounded-lg bg-stone-50 p-4 dark:bg-stone-800">
          <h4 className="mb-2 text-sm font-medium text-stone-700 dark:text-stone-300">
            {language === 'ar' ? 'ملخص الاشتراك' : 'Subscription Summary'}
          </h4>
          <div className="space-y-1 text-sm">
            <p className="text-stone-600 dark:text-stone-400">
              {language === 'ar' ? 'العميل:' : 'Customer:'}{' '}
              <span className="font-medium text-stone-900 dark:text-stone-100">
                {selectedCustomer.name}
              </span>
            </p>
            <p className="text-stone-600 dark:text-stone-400">
              {language === 'ar' ? 'الخطة:' : 'Plan:'}{' '}
              <span className="font-medium text-stone-900 dark:text-stone-100">
                {language === 'ar' ? selectedPlan.labelAr : selectedPlan.labelEn}
              </span>
            </p>
            <p className="text-stone-600 dark:text-stone-400">
              {language === 'ar' ? 'المدة:' : 'Duration:'}{' '}
              <span className="font-medium text-stone-900 dark:text-stone-100">
                {formData.startDate} → {calculateEndDate(formData.startDate, selectedPlan.days)}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
        >
          {labels.cancel}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? labels.update : labels.create}
        </button>
      </div>
    </form>
  )
}
