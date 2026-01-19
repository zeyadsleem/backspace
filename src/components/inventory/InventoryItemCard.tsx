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
  const statusConfig = {
    'in-stock': { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: null },
    'low-stock': { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: <AlertCircle className="w-3.5 h-3.5" /> },
    'out-of-stock': { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  }
  const config = statusConfig[status]

  const categoryIcons = {
    beverage: <Coffee className="w-4 h-4" />,
    snack: <Cookie className="w-4 h-4" />,
    other: <Box className="w-4 h-4" />,
  }

  return (
    <div className={`group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl flex flex-col h-full w-full shadow-sm overflow-hidden transition-all hover:border-stone-300 dark:hover:border-stone-700 ${status === 'out-of-stock' ? 'opacity-90' : ''}`}>
      
      {/* 1. Header with Category Tint */}
      <div className="p-3 flex items-center justify-between border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-400 shadow-sm">
            {categoryIcons[item.category as keyof typeof categoryIcons] || <Package className="w-4 h-4" />}
          </div>
          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">
            {isRTL ? category.labelAr : category.labelEn}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Main Body */}
      <div className="p-4 flex-grow flex flex-col gap-4">
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-base font-medium text-stone-800 dark:text-stone-100 leading-tight truncate">{item.name}</h3>
          <div className="px-2.5 py-1 bg-[#FFFBEB] dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg flex-shrink-0">
            <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{item.price}</span>
            <span className="text-[11px] font-medium text-amber-600/70 ms-1 uppercase">{t('egp')}</span>
          </div>
        </div>

        {/* 3. Stock Status Row */}
        <div className={`px-3 py-2.5 rounded-xl border ${config.bg} ${config.border} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-stone-800 dark:text-stone-100">
                {item.quantity} / {item.minStock}
            </span>
          </div>
          <div className={`flex items-center gap-1.5 ${config.color}`}>
            {config.icon}
          </div>
        </div>
      </div>

      {/* 4. Refined Footer Adjuster */}
      <div className="p-2 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2 bg-stone-50/30 dark:bg-stone-900/50">
        <button 
          onClick={() => onAdjustQuantity?.(-1)} 
          disabled={item.quantity <= 0}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-400 hover:text-red-600 hover:border-red-100 shadow-sm transition-all disabled:opacity-30"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="flex-1 text-center font-medium text-stone-600 dark:text-stone-300 text-sm">
            {item.quantity}
        </div>
        <button 
          onClick={() => onAdjustQuantity?.(1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-400 hover:text-emerald-600 hover:border-emerald-100 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}