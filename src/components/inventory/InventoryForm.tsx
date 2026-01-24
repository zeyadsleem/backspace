import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Package, DollarSign, Hash } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { inventorySchema, type InventoryFormData } from '@/lib/validations'
import type { InventoryCategory } from '@/types'
import { Button } from '@/components/ui/button'
import { FormField, FormLabel, FormInput, FormSelect, FormError } from '@/components/ui/form'

interface InventoryFormProps {
  initialData?: {
    name: string
    category: InventoryCategory
    price: number
    quantity: number
    minStock: number
  }
  categories: Array<{ id: InventoryCategory; labelEn: string; labelAr: string }>
  onSubmit?: (data: InventoryFormData) => void
  onCancel?: () => void
  isLoading?: boolean
}

export function InventoryForm({ initialData, categories, onSubmit, onCancel, isLoading = false }: InventoryFormProps) {
  const t = useAppStore((state) => state.t)
  const language = useAppStore((state) => state.language)
  const isRTL = useAppStore((state) => state.isRTL)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: initialData?.name ?? '',
      category: initialData?.category ?? 'beverage',
      price: initialData?.price ?? 0,
      quantity: initialData?.quantity ?? 0,
      minStock: initialData?.minStock ?? 5,
    },
    mode: 'onChange',
  })

  const onFormSubmit = (data: InventoryFormData) => {
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
          <FormLabel htmlFor="name" icon={<Package className="h-4 w-4" />} required>
            {t('itemName') || 'Item Name'}
          </FormLabel>
          <FormInput
            id="name"
            type="text"
            {...register('name')}
            placeholder={t('inventoryExample') || 'Enter item name'}
            error={!!errors.name}
            isRTL={isRTL}
            disabled={isLoading}
          />
          <FormError>{errors.name?.message}</FormError>
        </FormField>

        {/* Price Field */}
        <FormField>
          <FormLabel htmlFor="price" icon={<DollarSign className="h-4 w-4" />} required>
            {t('price') || `Price (${t('egp')})`}
          </FormLabel>
          <FormInput
            id="price"
            type="number"
            step="any"
            min="0"
            {...register('price', { valueAsNumber: true })}
            placeholder="0.00"
            error={!!errors.price}
            disabled={isLoading}
          />
          <FormError>{errors.price?.message}</FormError>
        </FormField>

        {/* Quantity Field */}
        <FormField>
          <FormLabel htmlFor="quantity" icon={<Hash className="h-4 w-4" />} required>
            {t('quantity') || 'Quantity'}
          </FormLabel>
          <FormInput
            id="quantity"
            type="number"
            min="0"
            {...register('quantity', { valueAsNumber: true })}
            placeholder="0"
            error={!!errors.quantity}
            disabled={isLoading}
          />
          <FormError>{errors.quantity?.message}</FormError>
        </FormField>

        {/* Min Stock Field */}
        <FormField>
          <FormLabel htmlFor="minStock" icon={<Hash className="h-4 w-4" />} required>
            {t('minStock') || 'Minimum Stock'}
          </FormLabel>
          <FormInput
            id="minStock"
            type="number"
            min="0"
            {...register('minStock', { valueAsNumber: true })}
            placeholder="5"
            error={!!errors.minStock}
            disabled={isLoading}
          />
          <FormError>{errors.minStock?.message}</FormError>
        </FormField>
      </div>

      {/* Category Field - Full Width */}
      <FormField>
        <FormLabel htmlFor="category" required>
          {t('category') || 'Category'}
        </FormLabel>
        <FormSelect
          id="category"
          {...register('category')}
          error={!!errors.category}
          disabled={isLoading}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {language === 'ar' ? category.labelAr : category.labelEn}
            </option>
          ))}
        </FormSelect>
        <FormError>{errors.category?.message}</FormError>
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
          {isEditing ? t('updateItem') : t('newItem')}
        </Button>
      </div>
    </form>
  )
}
