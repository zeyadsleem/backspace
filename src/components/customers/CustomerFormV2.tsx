import type { CustomerType } from '@/types'
import { useForm, Controller } from 'react-hook-form'
import { Loader2, User, Phone, Mail, FileText } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { FormField, TextareaField, SelectField } from '@/components/ui/FormField'

interface CustomerFormData {
  name: string
  phone: string
  email: string
  customerType: CustomerType
  notes: string
}

interface CustomerFormProps {
  initialData?: { name: string; phone: string; email: string | null; customerType: CustomerType; notes: string }
  customerTypes: CustomerType[]
  onSubmit?: (data: { name: string; phone: string; email?: string; customerType: CustomerType; notes?: string }) => void
  onCancel?: () => void
  isLoading?: boolean
}

export function CustomerFormV2({ initialData, customerTypes, onSubmit, onCancel, isLoading = false }: CustomerFormProps) {
  const t = useAppStore((state) => state.t)
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<CustomerFormData>({
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

  const customerTypeOptions = customerTypes.map(type => ({
    value: type,
    label: customerTypeLabels[type]
  }))

  const validatePhone = (phone: string): boolean | string => {
    if (!phone.trim()) return t('phoneRequired')
    const normalized = phone.replace(/[\s\-\+]/g, '')
    return /^(0|20)?1[0125]\d{8}$/.test(normalized) || t('invalidPhone')
  }

  const validateEmail = (email: string): boolean | string => {
    if (!email) return true
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || t('invalidEmail')
  }

  const onFormSubmit = (data: CustomerFormData) => {
    onSubmit?.({
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim() || undefined,
      customerType: data.customerType,
      notes: data.notes.trim() || undefined,
    })
  }

  const handleReset = () => {
    reset()
    onCancel?.()
  }

  const isEditing = !!initialData

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Name Field */}
      <FormField
        id="name"
        label={t('customerName')}
        icon={<User className="h-4 w-4" />}
        required
        placeholder={t('enterCustomerName')}
        error={errors.name?.message}
        disabled={isLoading}
        {...register('name', {
          required: t('nameRequired'),
          minLength: { value: 2, message: 'Name must be at least 2 characters' },
          maxLength: { value: 50, message: 'Name must be less than 50 characters' },
        })}
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
        disabled={isLoading}
        {...register('phone', {
          required: t('phoneRequired'),
          validate: validatePhone,
        })}
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
        disabled={isLoading}
        {...register('email', {
          validate: validateEmail,
        })}
      />

      {/* Customer Type Field */}
      <Controller
        name="customerType"
        control={control}
        rules={{ required: 'Customer type is required' }}
        render={({ field }) => (
          <SelectField
            id="customerType"
            label={t('customerType')}
            required
            options={customerTypeOptions}
            error={errors.customerType?.message}
            disabled={isLoading}
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
        disabled={isLoading}
        {...register('notes', {
          maxLength: { value: 500, message: 'Notes must be less than 500 characters' },
        })}
      />

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          className="flex-1 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 transition-colors"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={isLoading || !isValid || (!isDirty && !isEditing)}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-amber-600 dark:hover:bg-amber-500 transition-colors"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? t('updateCustomer') : t('createCustomer')}
        </button>
      </div>

      {/* Form Status Indicator */}
      {isDirty && !isValid && (
        <div className="text-sm text-amber-600 dark:text-amber-400 text-center">
          'Please fix the errors above'
        </div>
      )}
    </form>
  )
}