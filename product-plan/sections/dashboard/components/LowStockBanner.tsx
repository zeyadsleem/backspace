import type { LowStockAlert } from '../types'
import { AlertTriangle, ChevronRight } from 'lucide-react'

interface LowStockBannerProps {
  alerts: LowStockAlert[]
  onViewItem?: (id: string) => void
  onViewAll?: () => void
}

export function LowStockBanner({ alerts, onViewItem, onViewAll }: LowStockBannerProps) {
  if (alerts.length === 0) return null

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200">
            Low Stock Alert
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            {alerts.length} item{alerts.length > 1 ? 's' : ''} below minimum stock level
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {alerts.slice(0, 3).map((alert) => (
              <button
                key={alert.id}
                onClick={() => onViewItem?.(alert.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-900 
                         border border-amber-200 dark:border-amber-800 rounded-lg text-sm
                         hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
              >
                <span className="font-medium text-stone-700 dark:text-stone-300">
                  {alert.name}
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  {alert.quantity}/{alert.minStock}
                </span>
              </button>
            ))}
            {alerts.length > 3 && (
              <span className="text-sm text-amber-600 dark:text-amber-400 self-center">
                +{alerts.length - 3} more
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-sm font-medium text-amber-700 dark:text-amber-300 
                   hover:text-amber-800 dark:hover:text-amber-200 transition-colors flex-shrink-0"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
