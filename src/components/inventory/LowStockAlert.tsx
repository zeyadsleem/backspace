import type { InventoryItem } from '@/types'
import { AlertTriangle, XCircle } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface LowStockAlertProps {
  lowStockItems: InventoryItem[]
  outOfStockItems: InventoryItem[]
  onItemClick?: (id: string) => void
}

export function LowStockAlert({ lowStockItems, outOfStockItems, onItemClick }: LowStockAlertProps) {
  const t = useAppStore((state) => state.t)
  if (lowStockItems.length === 0 && outOfStockItems.length === 0) return null

  return (
    <div className="space-y-3">
      {outOfStockItems.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg flex-shrink-0"><XCircle className="h-5 w-5 text-red-600 dark:text-red-400" /></div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 dark:text-red-200">{t('outOfStockTitle')}</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{outOfStockItems.length} {t('outOfStockMessage')}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {outOfStockItems.slice(0, 5).map((item) => (
                  <button key={item.id} onClick={() => onItemClick?.(item.id)} className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-stone-900 border border-red-200 dark:border-red-800 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors">
                    <span className="font-medium text-stone-700 dark:text-stone-300">{item.name}</span>
                  </button>
                ))}
                {outOfStockItems.length > 5 && <span className="text-sm text-red-600 dark:text-red-400 self-center">+{outOfStockItems.length - 5} {t('moreItems')}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex-shrink-0"><AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">{t('lowStockWarning')}</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{lowStockItems.length} {t('lowStockMessage')}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {lowStockItems.slice(0, 5).map((item) => (
                  <button key={item.id} onClick={() => onItemClick?.(item.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-800 rounded-lg text-sm hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors">
                    <span className="font-medium text-stone-700 dark:text-stone-300">{item.name}</span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">{item.quantity}/{item.minStock}</span>
                  </button>
                ))}
                {lowStockItems.length > 5 && <span className="text-sm text-amber-600 dark:text-amber-400 self-center">+{lowStockItems.length - 5} {t('moreItems')}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
