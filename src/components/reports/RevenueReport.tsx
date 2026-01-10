import type { RevenueData, RevenueDataPoint, TopCustomer } from '@/types'
import { TrendingUp, TrendingDown, Download, Users } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface RevenueReportProps {
  revenueData: RevenueData
  revenueChart: RevenueDataPoint[]
  topCustomers: TopCustomer[]
  onCustomerClick?: (id: string) => void
  onExport?: () => void
}

export function RevenueReport({ revenueData, revenueChart, topCustomers, onCustomerClick, onExport }: RevenueReportProps) {
  const t = useAppStore((state) => state.t)
  const formatCurrency = (amount: number) => `${amount.toLocaleString()} ${t('egpCurrency')}`
  const percentChange = revenueData.comparison.percentChange
  const isPositive = percentChange >= 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">{t('today')}</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">{formatCurrency(revenueData.today.total)}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{t('sessions')}: {formatCurrency(revenueData.today.sessions)} · {t('inventory')}: {formatCurrency(revenueData.today.inventory)}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">{t('thisWeek')}</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">{formatCurrency(revenueData.thisWeek.total)}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{t('sessions')}: {formatCurrency(revenueData.thisWeek.sessions)} · {t('inventory')}: {formatCurrency(revenueData.thisWeek.inventory)}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">{t('thisMonth')}</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(revenueData.thisMonth.total)}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{t('sessions')}: {formatCurrency(revenueData.thisMonth.sessions)} · {t('inventory')}: {formatCurrency(revenueData.thisMonth.inventory)}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">{t('vsLastMonth')}</p>
          <div className="flex items-center gap-2 mt-1">
            {isPositive ? <TrendingUp className="h-5 w-5 text-emerald-500" /> : <TrendingDown className="h-5 w-5 text-red-500" />}
            <p className={`text-2xl font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{isPositive ? '+' : ''}{percentChange.toFixed(1)}%</p>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{t('lastMonth')}: {formatCurrency(revenueData.comparison.lastMonth.total)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">{t('revenueTrend')}</h3>
          </div>
          <div className="flex items-end gap-2 h-48">
            {revenueChart.map((point, index) => {
              const maxValue = Math.max(...revenueChart.map(d => d.sessions + d.inventory))
              const sessionHeight = (point.sessions / maxValue) * 100
              const inventoryHeight = (point.inventory / maxValue) * 100
              const date = new Date(point.date)
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col-reverse items-center" style={{ height: '160px' }}>
                    <div className="w-full max-w-8 bg-amber-500 rounded-t" style={{ height: `${sessionHeight}%` }} />
                    <div className="w-full max-w-8 bg-emerald-500 rounded-t" style={{ height: `${inventoryHeight}%` }} />
                  </div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-xs text-stone-600 dark:text-stone-400">{t('sessions')}</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-stone-600 dark:text-stone-400">{t('inventory')}</span></div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><Users className="h-4 w-4 text-stone-500" /><h3 className="font-semibold text-stone-900 dark:text-stone-100">{t('topCustomers')}</h3></div>
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <button key={customer.id} onClick={() => onCustomerClick?.(customer.id)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left">
                <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-300">{index + 1}</span>
                <div className="flex-1 min-w-0"><p className="font-medium text-stone-900 dark:text-stone-100 truncate">{customer.name}</p></div>
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(customer.revenue)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
