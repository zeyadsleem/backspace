import type { InventoryItem, CategoryOption, StockStatus } from '../types'
import { Minus, Plus, Pencil, Trash2 } from 'lucide-react'

interface InventoryItemCardProps {
  item: InventoryItem
  category: CategoryOption
  onEdit?: () => void
  onDelete?: () => void
  onAdjustQuantity?: (delta: number) => void
  language?: 'en' | 'ar'
}

export function InventoryItemCard({
  item,
  category,
  onEdit,
  onDelete,
  onAdjustQuantity,
  language = 'en',
}: InventoryItemCardProps) {
  const getStockStatus = (): StockStatus => {
    if (item.quantity === 0) return 'out-of-stock'
    if (item.quantity <= item.minStock) return 'low-stock'
    return 'in-stock'
  }

  const status = getStockStatus()

  const statusConfig = {
    'in-stock': {
      label: language === 'ar' ? 'متوفر' : 'In Stock',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    'low-stock': {
      label: language === 'ar' ? 'مخزون منخفض' : 'Low Stock',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
    'out-of-stock': {
      label: language === 'ar' ? 'نفذ' : 'Out of Stock',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
    },
  }

  const config = statusConfig[status]

  return (
    <div
      className={`bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 
                rounded-xl overflow-hidden hover:shadow-md transition-all
                ${status === 'out-of-stock' ? 'opacity-75' : ''}`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">{item.name}</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {language === 'ar' ? category.labelAr : category.labelEn}
            </p>
          </div>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.color}`}>
            {config.label}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 mt-3">
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {item.price}
          </span>
          <span className="text-sm text-stone-500 dark:text-stone-400">EGP</span>
        </div>
      </div>

      {/* Quantity Control */}
      <div className="px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-100 dark:border-stone-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {language === 'ar' ? 'الكمية' : 'Quantity'}
            </p>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Min: {item.minStock}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAdjustQuantity?.(-1)}
              disabled={item.quantity <= 0}
              className="p-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 
                       dark:border-stone-700 disabled:opacity-50 disabled:cursor-not-allowed
                       hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span
              className={`w-12 text-center text-lg font-bold ${
                status === 'out-of-stock'
                  ? 'text-red-600 dark:text-red-400'
                  : status === 'low-stock'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-stone-900 dark:text-stone-100'
              }`}
            >
              {item.quantity}
            </span>
            <button
              onClick={() => onAdjustQuantity?.(1)}
              className="p-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 
                       dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-2 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-1">
        <button
          onClick={onEdit}
          className="p-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300
                   hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          title={language === 'ar' ? 'تعديل' : 'Edit'}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-stone-500 hover:text-red-600 dark:hover:text-red-400
                   hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title={language === 'ar' ? 'حذف' : 'Delete'}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
