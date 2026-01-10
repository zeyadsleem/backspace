import type { CustomerType } from '@/types'
import { Controller } from 'react-hook-form'
import { Loader2, User, Phone, Mail, FileText, CheckCircle } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { FormField, TextareaField, SelectField } from '@/components/ui/FormField'
import { useCustomerForm } from '@/hooks/useCustomerForm'

interface CustomerFormProps {
  initialData?: { name: string; phone: string; email: string | null; customerType: CustomerType; notes: string }
  customerTypes: CustomerType[]
  onSubmit?: (data: { name: string; phone: string; email?: string; customerType: CustomerType; notes?: string }) => void
  onCancel?: () => void
  isLoading?: boolean
}

export function CustomerFormV3({ initialData, customerTypes, onSubmit, onCancel, isLoading = false }: CustomerFormProps) {
  const t = useAppStore((state) => state.t)
  
  const {
    register,
    control,
    formState: { errors, isValid, isDirty, isSubmitting },
    reset,
    handleSubmit,
    isEditing,
  } = useCustomerForm({ initialData, onSubmit })

  const customerTypeLabels: Record<CustomerType, string> = {
    visitor: t('visitorType'),
    weekly: t('weeklyMember'),
    'half-monthly': t('halfMonthlyMember'),
    monthly: t('monthlyMember'),
  }

  const customerTypeOptions = customerTypes.map(type => ({
    value: type,
    label: customerTypeLabels[type]
  }))

  const handleReset = () => {
    reset()
    onCancel?.()
  }

  const isFormDisabled = isLoading || isSubmitting

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-stone-200 dark:border-stone-700">
        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20">
          <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            {isEditing ? 'Edit Customer' : 'Add Customer'}
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {isEditing 
              ? 'Update customer information'
              : 'Fill in the customer details below'
            }
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <FormField
          id="name"
          label={t('customerName')}
          icon={<User className="h-4 w-4" />}
          required
          placeholder={t('enterCustomerName')}
          error={errors.name?.message}
          disabled={isFormDisabled}
          {...register('name')}
        />

        {/* Phone Field */}
        <FormField
          id="phone"
          type="tel"
          label={t('phoneNumber')}
          icon={<Phone className="h-4 w-4" />}
          required
          placeholder={t('phoneExample')}
          dir="ltr"
          error={errors.phone?.message}
          helperText={!errors.phone ? t('egyptianFormat') : undefined}
          disabled={isFormDisabled}
          {...register('phone')}
        />

        {/* Email Field */}
        <FormField
          id="email"
          type="email"
          label={`${t('email')} (${t('optional')})`}
          icon={<Mail className="h-4 w-4" />}
          placeholder={t('emailExample')}
          dir="ltr"
          error={errors.email?.message}
          disabled={isFormDisabled}
          {...register('email')}
        />

        {/* Customer Type Field */}
        <Controller
          name="customerType"
          control={control}
          render={({ field }) => (
            <SelectField
              id="customerType"
              label={t('customerType')}
              required
              options={customerTypeOptions}
              error={errors.customerType?.message}
              disabled={isFormDisabled}
              {...field}
            />
          )}
        />

        {/* Notes Field */}
        <TextareaField
          id="notes"
          label={`${t('notes')} (${t('optional')})`}
          icon={<FileText className="h-4 w-4" />}
          placeholder={t('customerNotes')}
          rows={3}
          error={errors.notes?.message}
          disabled={isFormDisabled}
          {...register('notes')}
        />

        {/* Form Status */}
        {isDirty && isValid && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            'Form is ready to submit'
          </div>
        )}

        {isDirty && !isValid && (
          <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-center">
            'Please fix the errors above'
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleReset}
            disabled={isFormDisabled}
            className="flex-1 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={isFormDisabled || !isValid || (!isDirty && !isEditing)}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-amber-600 dark:hover:bg-amber-500 transition-colors"
          >
            {(isLoading || isSubmitting) && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? t('updateCustomer') : t('createCustomer')}
          </button>
        </div>
      </form>
    </div>
  )
}