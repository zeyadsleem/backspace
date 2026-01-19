import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Monitor } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { resourceSchema, type ResourceFormData } from '@/lib/validations'
import type { ResourceType } from '@/types'

interface ResourceFormProps {
  initialData?: { name: string; resourceType: ResourceType; ratePerHour: number }
  onSubmit?: (data: ResourceFormData) => void
  onCancel?: () => void
  isLoading?: boolean
}

export function ResourceForm({ initialData, onSubmit, onCancel, isLoading = false }: ResourceFormProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      resourceType: initialData?.resourceType ?? 'seat',
      ratePerHour: initialData?.ratePerHour ?? 0,
    },
    mode: 'onChange',
  })

  const resourceTypeLabels: Record<ResourceType, string> = {
    seat: t('seat') || 'Seat',
    room: t('room') || 'Room',
    desk: t('desk') || 'Desk',
  }

  const onFormSubmit = (data: ResourceFormData) => {
    onSubmit?.(data)
  }

  const handleReset = () => {
    reset()
    onCancel?.()
  }

  const isEditing = !!initialData

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Name Field */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
            <Monitor className="h-4 w-4" />
            <span>{t('resourceName') || 'Resource Name'}</span>
            <span className="text-red-500">*</span>
          </label>
          <div className={isRTL ? 'rtl-input-wrapper' : 'ltr-input-wrapper'}>
            <input
              id="name"
              type="text"
              {...register('name')}
              placeholder={'Enter resource name'}
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
      </div>

      {/* Resource Type Field - Full Width */}
      <div className="space-y-1.5">
        <label htmlFor="resourceType" className={`block text-sm font-medium text-stone-700 dark:text-stone-300 ${isRTL ? 'text-end' : 'text-start'}`}>
          {t('resourceType') || 'Resource Type'}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className={isRTL ? 'rtl-input-wrapper' : 'ltr-input-wrapper'}>
          <select
            id="resourceType"
            {...register('resourceType')}
            dir={isRTL ? 'rtl' : 'ltr'}
            className={`h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 ${isRTL ? 'rtl-text-input' : 'ltr-text-input'}`}
            disabled={isLoading}
          >
            {Object.entries(resourceTypeLabels).map(([type, label]) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {errors.resourceType && <p className={`text-sm text-red-600 dark:text-red-400 ${isRTL ? 'text-end' : 'text-start'}`}>{errors.resourceType.message}</p>}
      </div>

      {/* Action Buttons */}
      <div className={`flex gap-3 pt-4 ${isRTL ? '' : 'flex-row-reverse'}`}>
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
          {isEditing ? t('updateResource') || 'Update Resource' : t('createResource') || 'Create Resource'}
        </button>
      </div>
    </form>
  )
}