import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Monitor, DollarSign } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { resourceSchema, type ResourceFormData } from '@/lib/validations'
import type { ResourceType } from '@/types'
import { Button } from '@/components/ui/button'
import { FormField, FormLabel, FormInput, FormSelect, FormError } from '@/components/ui/form'

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Name Field */}
        <FormField>
          <FormLabel htmlFor="name" icon={<Monitor className="h-4 w-4" />} required>
            {t('resourceName') || 'Resource Name'}
          </FormLabel>
          <FormInput
            id="name"
            type="text"
            {...register('name')}
            placeholder="Enter resource name"
            error={!!errors.name}
            isRTL={isRTL}
            disabled={isLoading}
          />
          <FormError>{errors.name?.message}</FormError>
        </FormField>

        {/* Rate Per Hour Field */}
        <FormField>
          <FormLabel htmlFor="ratePerHour" icon={<DollarSign className="h-4 w-4" />} required>
            {t('ratePerHour') || `Rate (${t('egp')}/hr)`}
          </FormLabel>
          <FormInput
            id="ratePerHour"
            type="number"
            step="any"
            min="0"
            {...register('ratePerHour', { valueAsNumber: true })}
            placeholder="0.00"
            error={!!errors.ratePerHour}
            disabled={isLoading}
          />
          <FormError>{errors.ratePerHour?.message}</FormError>
        </FormField>
      </div>

      {/* Resource Type Field - Full Width */}
      <FormField>
        <FormLabel htmlFor="resourceType" required>
          {t('resourceType') || 'Resource Type'}
        </FormLabel>
        <FormSelect
          id="resourceType"
          {...register('resourceType')}
          error={!!errors.resourceType}
          disabled={isLoading}
        >
          {Object.entries(resourceTypeLabels).map(([type, label]) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </FormSelect>
        <FormError>{errors.resourceType?.message}</FormError>
      </FormField>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
        <Button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          variant="outline"
        >
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !isValid || (!isDirty && !isEditing)}
          variant="primary"
          isLoading={isLoading}
          className="flex-1"
        >
          {isEditing ? t('updateResource') || 'Update Resource' : t('createResource') || 'Create Resource'}
        </Button>
      </div>
    </form>
  )
}
