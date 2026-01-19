import { useState } from 'react'
import type { RevenueDataPoint } from '@/types'
import { TrendingUp } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface RevenueChartProps {
  data: RevenueDataPoint[]
}

type Period = 'today' | 'week' | 'month'

export function RevenueChart({ data }: RevenueChartProps) {
  const t = useAppStore((state) => state.t)
  const language = useAppStore((state) => state.language)
  const [period, setPeriod] = useState<Period>('week')

  const maxValue = Math.max(...data.map(d => d.sessions + d.inventory))
  const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0)
  const totalInventory = data.reduce((sum, d) => sum + d.inventory, 0)
  const total = totalSessions + totalInventory

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', { 
      style: 'decimal', 
      minimumFractionDigits: 0 
    }).format(amount)
  }
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short', day: 'numeric' })
  }

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 flex flex-col h-full">
      <div className="flex-shrink-0 flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">{t('revenueTrend')}</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">{t('total')}: {formatCurrency(total)} {t('egp')}</p>
          </div>
        </div>
        <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
          {(['today', 'week', 'month'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${period === p ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'}`}
            >
              {p === 'today' ? t('today') : p === 'week' ? t('thisWeek') : t('thisMonth')}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-shrink-0 flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs text-stone-600 dark:text-stone-400">{t('sessionsLabel')} ({formatCurrency(totalSessions)} {t('egp')})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs text-stone-600 dark:text-stone-400">{t('inventoryLabel')} ({formatCurrency(totalInventory)} {t('egp')})</span>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 flex items-end gap-2 pt-4">
        {data.map((point, index) => {
          const sessionHeight = (point.sessions / maxValue) * 100
          const inventoryHeight = (point.inventory / maxValue) * 100
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <div className="w-full flex flex-col-reverse items-center flex-1 min-h-0">
                <div className="w-full max-w-10 bg-amber-500 rounded-t transition-all duration-300" style={{ height: `${sessionHeight}%` }} title={`${t('sessionsLabel')}: ${formatCurrency(point.sessions)} ${t('egp')}`} />
                <div className="w-full max-w-10 bg-emerald-500 rounded-t transition-all duration-300" style={{ height: `${inventoryHeight}%` }} title={`${t('inventoryLabel')}: ${formatCurrency(point.inventory)} ${t('egp')}`} />
              </div>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 text-center flex-shrink-0 mt-1">{formatDate(point.date)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
