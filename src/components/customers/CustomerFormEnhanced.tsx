import type { CustomerType } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, User, Phone, Mail, FileText, CheckCircle } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { customerSchema, type CustomerFormData } from '@/lib/validations'
import { FormField, TextareaField, SelectField } from '@/components/ui/FormField'
import { notifications } from '@/lib/notifications'

interface CustomerFormProps {
  initialData?: { name: string; phone: string; email: string | null; customerType: CustomerType; notes: string }
  customerTypes: CustomerType[]
  onSubmit?: (data: { name: string; phone: string; email?: string; customerType: CustomerType; notes?: string }) => void | Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function CustomerFormEnhanced({ initialData, customerTypes, onSubmit, onCancel, isLoading = false }: CustomerFormProps) {
  const t = useAppStore((state) => state.t)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
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

  const onFormSubmit = async (data: CustomerFormData) => {
    try {
      const loadingToast = notifications.loading('Processing...')
      
      const transformedData = {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || undefined,
        customerType: data.customerType,
        notes: data.notes?.trim() || undefined,
      }
      
      await onSubmit?.(transformedData)
      
      notifications.dismiss(loadingToast)
      notifications.success(
        initialData 
          ? `Customer "${initialData.name}" updated successfully`
          : 'Customer created successfully'
      )
    } catch (error) {
      notifications.dismiss()
      notifications.error('Failed to save customer. Please try again.')
    }
  }

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

  const isEditing = !!initialData
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

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
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
        <SelectField
          id="customerType"
          label={t('customerType')}
          required
          options={customerTypeOptions}
          error={errors.customerType?.message}
          disabled={isFormDisabled}
          {...register('customerType')}
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
        {isDirty && isValid && !isSubmitting && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            Form is ready to submit
          </div>
        )}

        {isDirty && !isValid && (
          <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-center">
            Please fix the errors above
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