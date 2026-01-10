import { useState } from 'react'
import type { RevenueData, RevenueDataPoint, TopCustomer, UtilizationData, OperationRecord } from '@/types'
import { RevenueReport } from './RevenueReport'
import { UtilizationReport } from './UtilizationReport'
import { OperationHistory } from './OperationHistory'
import { BarChart3, Activity, History } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

type Tab = 'revenue' | 'utilization' | 'history'

interface ReportsPageProps {
  revenueData: RevenueData
  revenueChart: RevenueDataPoint[]
  topCustomers: TopCustomer[]
  utilizationData: UtilizationData
  operationHistory: OperationRecord[]
  onCustomerClick?: (id: string) => void
  onResourceClick?: (id: string) => void
  onExportRevenue?: () => void
  onExportUtilization?: () => void
  onExportHistory?: () => void
}

export function ReportsPage({ revenueData, revenueChart, topCustomers, utilizationData, operationHistory, onCustomerClick, onResourceClick, onExportRevenue, onExportUtilization, onExportHistory }: ReportsPageProps) {
  const t = useAppStore((state) => state.t)
  const [activeTab, setActiveTab] = useState<Tab>('revenue')
  const tabs = [
    { id: 'revenue' as Tab, label: t('revenue'), icon: BarChart3 },
    { id: 'utilization' as Tab, label: t('utilization'), icon: Activity },
    { id: 'history' as Tab, label: t('history'), icon: History },
  ]

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('reports')}</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{t('analyticsAndInsights')}</p>
      </div>

      <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab.id ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'}`}>
              <Icon className="h-4 w-4" />{tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'revenue' && <RevenueReport revenueData={revenueData} revenueChart={revenueChart} topCustomers={topCustomers} onCustomerClick={onCustomerClick} onExport={onExportRevenue} />}
      {activeTab === 'utilization' && <UtilizationReport utilizationData={utilizationData} onResourceClick={onResourceClick} onExport={onExportUtilization} />}
      {activeTab === 'history' && <OperationHistory operations={operationHistory} onExport={onExportHistory} />}
    </div>
  )
}
