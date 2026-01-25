import type { InventoryFormProps, InventoryCategory } from '../types'
import { useState } from 'react'
import { Loader2, Package, DollarSign, Hash, AlertTriangle } from 'lucide-react'

export function InventoryForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
  language = 'en',
}: InventoryFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    category: initialData?.category ?? 'beverage',
    price: initialData?.price ?? 0,
    quantity: initialData?.quantity ?? 0,
    minStock: initialData?.minStock ?? 5,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = language === 'ar' ? 'اسم المنتج مطلوب' : 'Item name is required'
    }

    if (formData.price <= 0) {
      newErrors.price = language === 'ar' ? 'السعر يجب أن يكون أكبر من 0' : 'Price must be greater than 0'
    }

    if (formData.quantity < 0) {
      newErrors.quantity = language === 'ar' ? 'الكمية لا يمكن أن تكون سالبة' : 'Quantity cannot be negative'
    }

    if (formData.minStock < 0) {
      newErrors.minStock = language === 'ar' ? 'الحد الأدنى لا يمكن أن يكون سالب' : 'Minimum stock cannot be negative'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onSubmit?.({
        name: formData.name.trim(),
        category: formData.category as InventoryCategory,
        price: formData.price,
        quantity: formData.quantity,
        minStock: formData.minStock,
      })
    }
  }

  const isEditing = !!initialData

  const labels = {
    name: language === 'ar' ? 'اسم المنتج' : 'Item Name',
    category: language === 'ar' ? 'الفئة' : 'Category',
    price: language === 'ar' ? 'السعر (ج.م)' : 'Price (EGP)',
    quantity: language === 'ar' ? 'الكمية' : 'Quantity',
    minStock: language === 'ar' ? 'الحد الأدنى للمخزون' : 'Minimum Stock',
    cancel: language === 'ar' ? 'إلغاء' : 'Cancel',
    create: language === 'ar' ? 'إضافة منتج' : 'Add Item',
    update: language === 'ar' ? 'تحديث المنتج' : 'Update Item',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="name"
          className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          <Package className="h-4 w-4" />
          {labels.name}
          <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={language === 'ar' ? 'مثال: شاي، قهوة' : 'e.g., Tea, Coffee'}
          className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${
            errors.name
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600'
          }`}
        />
        {errors.name && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
        )}
      </div>

      {/* Category Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="category"
          className="block text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          {labels.category}
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value as InventoryCategory })
          }
          className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {language === 'ar' ? cat.labelAr : cat.labelEn}
            </option>
          ))}
        </select>
      </div>

      {/* Price and Quantity Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Price Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="price"
            className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            <DollarSign className="h-4 w-4" />
            {labels.price}
            <span className="text-red-500">*</span>
          </label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.5"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
            }
            className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${
              errors.price
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600'
            }`}
          />
          {errors.price && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.price}</p>
          )}
        </div>

        {/* Quantity Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="quantity"
            className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            <Hash className="h-4 w-4" />
            {labels.quantity}
          </label>
          <input
            id="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
            }
            className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${
              errors.quantity
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600'
            }`}
          />
          {errors.quantity && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.quantity}</p>
          )}
        </div>
      </div>

      {/* Min Stock Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="minStock"
          className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          <AlertTriangle className="h-4 w-4" />
          {labels.minStock}
        </label>
        <input
          id="minStock"
          type="number"
          min="0"
          value={formData.minStock}
          onChange={(e) =>
            setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })
          }
          className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${
            errors.minStock
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600'
          }`}
        />
        {errors.minStock && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.minStock}</p>
        )}
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {language === 'ar'
            ? 'سيتم تنبيهك عندما ينخفض المخزون عن هذا الحد'
            : 'You will be alerted when stock falls below this level'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
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
