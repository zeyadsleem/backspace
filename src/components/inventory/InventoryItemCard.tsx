import type { InventoryItem, CategoryOption } from '@/types'
import { Minus, Plus, Pencil, Trash2, Package, Coffee, Cookie, Box, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface InventoryItemCardProps {
  item: InventoryItem
  category: CategoryOption
  onEdit?: () => void
  onDelete?: () => void
  onAdjustQuantity?: (delta: number) => void
}

export function InventoryItemCard({ item, category, onEdit, onDelete, onAdjustQuantity }: InventoryItemCardProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)
  
  const getStockStatus = () => {
    if (item.quantity === 0) return 'out-of-stock'
    if (item.quantity <= item.minStock) return 'low-stock'
    return 'in-stock'
  }

  const status = getStockStatus()
  const statusColors = {
    'in-stock': 'text-stone-900 dark:text-stone-100',
    'low-stock': 'text-amber-600 dark:text-amber-400',
    'out-of-stock': 'text-red-600 dark:text-red-400',
  }
  
  const categoryIcons = {
    beverage: <Coffee className="w-4 h-4" />,
    snack: <Cookie className="w-4 h-4" />,
    other: <Box className="w-4 h-4" />,
  }

  return (
    <div className={`group relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl flex flex-col h-full shadow-sm hover:shadow-md transition-all duration-200 ${status === 'out-of-stock' ? 'border-l-4 border-l-red-500' : 'hover:border-amber-400/50'}`}>
      
      {/* 1. Top Row: Category & Actions */}
      <div className="p-4 pb-0 flex items-start justify-between">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
          {categoryIcons[item.category as keyof typeof categoryIcons] || <Package className="w-4 h-4" />}
          <span className="text-xs font-bold uppercase tracking-wider">
            {isRTL ? category.labelAr : category.labelEn}
          </span>
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Hero Info: Name & Price */}
      <div className="px-4 py-3 flex-1 flex flex-col items-center text-center">
        <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 leading-tight mb-1 line-clamp-2" title={item.name}>
          {item.name}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-lg font-bold text-amber-600 dark:text-amber-500">{item.price}</span>
          <span className="text-xs font-medium text-stone-400 uppercase">{t('egp')}</span>
        </div>
      </div>

      {/* 3. Footer: Unified Stock Control */}
      <div className="p-3 mt-auto border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 rounded-b-xl flex items-center justify-between">
        
        {/* Stock Indicator */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold font-mono ${statusColors[status]}`}>
              {item.quantity}
            </span>
            {status !== 'in-stock' && (
              <AlertCircle className={`w-4 h-4 ${status === 'out-of-stock' ? 'text-red-500' : 'text-amber-500'}`} />
            )}
          </div>
          <span className="text-xs font-medium text-stone-400 uppercase tracking-tight">
            {t('minStock')}: {item.minStock}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 p-1 shadow-sm">
          <button 
            onClick={() => onAdjustQuantity?.(-1)}
            disabled={item.quantity <= 0}
            className="w-7 h-7 flex items-center justify-center rounded bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-red-100 hover:text-red-600 disabled:opacity-30 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onAdjustQuantity?.(1)}
            className="w-7 h-7 flex items-center justify-center rounded bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}