import type { CustomerType } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, User, Phone, Mail, FileText } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { customerSchema, type CustomerFormData } from '@/lib/validations'
import { RTLIcon } from '../ui/RTLIcon'

interface CustomerFormProps {
  initialData?: { name: string; phone: string; email: string | null; customerType: CustomerType; notes: string }
  customerTypes: CustomerType[]
  onSubmit?: (data: { name: string; phone: string; email?: string; customerType: CustomerType; notes?: string }) => void
  onCancel?: () => void
  isLoading?: boolean
}

export function CustomerForm({ initialData, customerTypes, onSubmit, onCancel, isLoading = false }: CustomerFormProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      phone: initialData?.phone ?? '',
      email: initialData?.email ?? '',
      customerType: initialData?.customerType ?? 'visitor',
      notes: initialData?.notes ?? '',
    },
    mode: 'onChange',
  })

  const customerTypeLabels: Record<CustomerType, string> = {
    visitor: t('visitorType'),
    weekly: t('weeklyMember'),
    'half-monthly': t('halfMonthlyMember'),
    monthly: t('monthlyMember'),
  }

  const onFormSubmit = (data: CustomerFormData) => {
    onSubmit?.({
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || undefined,
      customerType: data.customerType,
      notes: data.notes?.trim() || undefined,
    })
  }

  const handleReset = () => {
    reset()
    onCancel?.()
  }

  const isEditing = !!initialData

  return (
    <div className="h-full flex flex-col">
      <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col h-full">
        {/* Form Fields - Scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-thin pe-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label htmlFor="name" className={`flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300 ${isRTL ? 'justify-start' : 'justify-start'}`}>
                {isRTL ? (
                  <>
                    <RTLIcon>
                      <User className="h-4 w-4" />
                    </RTLIcon>
                    <span>{t('customerName')}</span>
                    <span className="text-red-500">*</span>
                  </>
                ) : (
                  <>
                    <RTLIcon>
                      <User className="h-4 w-4" />
                    </RTLIcon>
                    <span>{t('customerName')}</span>
                    <span className="text-red-500">*</span>
                  </>
                )}
              </label>
              <div className={isRTL ? 'rtl-input-wrapper' : 'ltr-input-wrapper'}>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  placeholder={t('enterCustomerName')}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${
                    errors.name 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600'
                  } ${isRTL ? 'rtl-text-input' : 'ltr-text-input'}`}
                  disabled={isLoading}
                />
              </div>
              {errors.name && <p className={`text-sm text-red-600 dark:text-red-400 ${isRTL ? 'text-end' : 'text-start'}`}>{errors.name.message}</p>}
            </div>

            {/* Phone Field */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className={`flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300 ${isRTL ? 'justify-start' : 'justify-start'}`}>
                {isRTL ? (
                  <>
                    <RTLIcon>
                      <Phone className="h-4 w-4" />
                    </RTLIcon>
                    <span>{t('phoneNumber')}</span>
                    <span className="text-red-500">*</span>
                  </>
                ) : (
                  <>
                    <RTLIcon>
                      <Phone className="h-4 w-4" />
                    </RTLIcon>
                    <span>{t('phoneNumber')}</span>
                    <span className="text-red-500">*</span>
                  </>
                )}
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder={t('phoneExample')}
                dir="ltr"
                className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${
                  errors.phone 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600'
                }`}
                disabled={isLoading}
              />
              {errors.phone ? (
                <p className={`text-sm text-red-600 dark:text-red-400 ${isRTL ? 'text-end' : 'text-start'}`}>{errors.phone.message}</p>
              ) : (
                <p className={`text-sm text-stone-500 dark:text-stone-400 ${isRTL ? 'text-end' : 'text-start'}`}>{t('egyptianFormat')}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className={`flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300 ${isRTL ? 'justify-start' : 'justify-start'}`}>
                {isRTL ? (
                  <>
                    <RTLIcon>
                      <Mail className="h-4 w-4" />
                    </RTLIcon>
                    <span>{t('email')}</span>
                    <span className="text-stone-400">({t('optional')})</span>
                  </>
                ) : (
                  <>
                    <RTLIcon>
                      <Mail className="h-4 w-4" />
                    </RTLIcon>
                    <span>{t('email')}</span>
                    <span className="text-stone-400">({t('optional')})</span>
                  </>
                )}
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                placeholder={t('emailExample')}
                dir="ltr"
                className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600'
                }`}
                disabled={isLoading}
              />
              {errors.email && <p className={`text-sm text-red-600 dark:text-red-400 ${isRTL ? 'text-end' : 'text-start'}`}>{errors.email.message}</p>}
            </div>

            {/* Customer Type Field */}
            <div className="space-y-1.5">
              <label htmlFor="customerType" className={`block text-sm font-medium text-stone-700 dark:text-stone-300 ${isRTL ? 'text-end' : 'text-start'}`}>
                {t('customerType')}
              </label>
              <div className={isRTL ? 'rtl-input-wrapper' : 'ltr-input-wrapper'}>
                <select
                  id="customerType"
                  {...register('customerType')}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className={`h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 ${isRTL ? 'rtl-text-input' : 'ltr-text-input'}`}
                  disabled={isLoading}
                >
                  {customerTypes.map((type) => (
                    <option key={type} value={type}>
                      {customerTypeLabels[type]}
                    </option>
                  ))}
                </select>
              </div>
              {errors.customerType && <p className={`text-sm text-red-600 dark:text-red-400 ${isRTL ? 'text-end' : 'text-start'}`}>{errors.customerType.message}</p>}
            </div>
          </div>

          {/* Notes Field - Full Width */}
          <div className="space-y-1.5 mt-6">
            <label htmlFor="notes" className={`flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300 ${isRTL ? 'justify-start' : 'justify-start'}`}>
              {isRTL ? (
                <>
                  <RTLIcon>
                    <FileText className="h-4 w-4" />
                  </RTLIcon>
                  <span>{t('notes')}</span>
                  <span className="text-stone-400">({t('optional')})</span>
                </>
              ) : (
                <>
                  <RTLIcon>
                    <FileText className="h-4 w-4" />
                  </RTLIcon>
                  <span>{t('notes')}</span>
                  <span className="text-stone-400">({t('optional')})</span>
                </>
              )}
            </label>
            <div className={isRTL ? 'rtl-input-wrapper' : 'ltr-input-wrapper'}>
              <textarea
                id="notes"
                {...register('notes')}
                placeholder={t('customerNotes')}
                rows={3}
                dir={isRTL ? 'rtl' : 'ltr'}
                className={`w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 ${isRTL ? 'rtl-text-input' : 'ltr-text-input'}`}
                disabled={isLoading}
              />
            </div>
            {errors.notes && <p className={`text-sm text-red-600 dark:text-red-400 ${isRTL ? 'text-end' : 'text-start'}`}>{errors.notes.message}</p>}
          </div>
        </div>

        {/* Action Buttons - Fixed */}
        <div className={`flex-shrink-0 flex gap-3 pt-6 border-t border-stone-200 dark:border-stone-800 mt-6 ${isRTL ? '' : 'flex-row-reverse'}`}>
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="flex-1 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-amber-600 dark:hover:bg-amber-500"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? t('updateCustomer') : t('createCustomer')}
          </button>
        </div>
      </form>
    </div>
  )
}