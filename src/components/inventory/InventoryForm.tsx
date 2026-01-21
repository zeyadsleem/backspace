import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Package, DollarSign, Hash } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { inventorySchema, type InventoryFormData } from '@/lib/validations'
import type { InventoryCategory } from '@/types'

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
        <div className="space-y-1.5">
          <label htmlFor="name" className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
            <Package className="h-4 w-4" />
            <span>{t('itemName') || 'Item Name'}</span>
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="name"
              type="text"
              {...register('name')}
              placeholder={t('inventoryExample') || 'Enter item name'}
              className={`h-11 w-full rounded-xl border px-3 text-sm font-medium focus:outline-none focus:ring-2 transition-all dark:bg-stone-800 dark:text-stone-100 ${errors.name
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-stone-200 focus:border-amber-500 focus:ring-amber-500/20 dark:border-stone-700'
                }`}
              disabled={isLoading}
            />
          </div>
          {errors.name && <p className="text-xs text-red-600 dark:text-red-400 font-bold">{errors.name.message}</p>}
        </div>

        {/* Price Field */}
        <div className="space-y-1.5">
          <label htmlFor="price" className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
            <DollarSign className="h-4 w-4" />
            <span>{t('price') || `Price (${t('egp')})`}</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...register('price', { valueAsNumber: true })}
            placeholder="0.00"
            className={`h-11 w-full rounded-xl border px-3 text-sm font-medium focus:outline-none focus:ring-2 transition-all dark:bg-stone-800 dark:text-stone-100 ${errors.price
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-stone-200 focus:border-amber-500 focus:ring-amber-500/20 dark:border-stone-700'
              }`}
            disabled={isLoading}
          />
          {errors.price && <p className="text-xs text-red-600 dark:text-red-400 font-bold">{errors.price.message}</p>}
        </div>

        {/* Quantity Field */}
        <div className="space-y-1.5">
          <label htmlFor="quantity" className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
            <Hash className="h-4 w-4" />
            <span>{t('quantity') || 'Quantity'}</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            id="quantity"
            type="number"
            min="0"
            {...register('quantity', { valueAsNumber: true })}
            placeholder="0"
            className={`h-11 w-full rounded-xl border px-3 text-sm font-medium focus:outline-none focus:ring-2 transition-all dark:bg-stone-800 dark:text-stone-100 ${errors.quantity
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-stone-200 focus:border-amber-500 focus:ring-amber-500/20 dark:border-stone-700'
              }`}
            disabled={isLoading}
          />
          {errors.quantity && <p className="text-xs text-red-600 dark:text-red-400 font-bold">{errors.quantity.message}</p>}
        </div>

        {/* Min Stock Field */}
        <div className="space-y-1.5">
          <label htmlFor="minStock" className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
            <Hash className="h-4 w-4" />
            <span>{t('minStock') || 'Minimum Stock'}</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            id="minStock"
            type="number"
            min="0"
            {...register('minStock', { valueAsNumber: true })}
            placeholder="5"
            className={`h-11 w-full rounded-xl border px-3 text-sm font-medium focus:outline-none focus:ring-2 transition-all dark:bg-stone-800 dark:text-stone-100 ${errors.minStock
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-stone-200 focus:border-amber-500 focus:ring-amber-500/20 dark:border-stone-700'
              }`}
            disabled={isLoading}
          />
          {errors.minStock && <p className="text-xs text-red-600 dark:text-red-400 font-bold">{errors.minStock.message}</p>}
        </div>
      </div>

      {/* Category Field - Full Width */}
      <div className="space-y-1.5">
        <label htmlFor="category" className="block text-xs font-bold text-stone-400 uppercase tracking-widest">
          {t('category') || 'Category'}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div>
          <select
            id="category"
            {...register('category')}
            className={`h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm font-medium focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 transition-all`}
            disabled={isLoading}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {language === 'ar' ? category.labelAr : category.labelEn}
              </option>
            ))}
          </select>
        </div>
        {errors.category && <p className="text-xs text-red-600 dark:text-red-400 font-bold">{errors.category.message}</p>}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          className="px-6 h-11 rounded-xl border border-stone-200 bg-white text-sm font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 transition-colors"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={isLoading || !isValid || (!isDirty && !isEditing)}
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-amber-500 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-amber-600 dark:hover:bg-amber-500 shadow-lg shadow-amber-500/10 transition-all active:scale-[0.98]"
        >
          {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
          {isEditing ? t('updateItem') : t('newItem')}
        </button>
      </div>
    </form>
  )
}