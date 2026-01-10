import { useState } from 'react'
import type { ReportsPageProps } from '../types'
import { RevenueReport } from './RevenueReport'
import { UtilizationReport } from './UtilizationReport'
import { OperationHistory } from './OperationHistory'
import { BarChart3, Activity, History } from 'lucide-react'

type Tab = 'revenue' | 'utilization' | 'history'

export function ReportsPage({
  revenueData,
  revenueChart,
  topCustomers,
  utilizationData,
  customerInsights,
  operationHistory,
  onCustomerClick,
  onResourceClick,
  onOperationClick,
  onExportRevenue,
  onExportUtilization,
  onExportHistory,
}: ReportsPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('revenue')

  const tabs = [
    { id: 'revenue' as Tab, label: 'Revenue', icon: BarChart3 },
    { id: 'utilization' as Tab, label: 'Utilization', icon: Activity },
    { id: 'history' as Tab, label: 'History', icon: History },
  ]

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Reports</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Analytics and insights for your coworking space
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'revenue' && (
        <RevenueReport
          revenueData={revenueData}
          revenueChart={revenueChart}
          topCustomers={topCustomers}
          onCustomerClick={onCustomerClick}
          onExport={onExportRevenue}
        />
      )}

      {activeTab === 'utilization' && (
        <UtilizationReport
          utilizationData={utilizationData}
          onResourceClick={onResourceClick}
          onExport={onExportUtilization}
        />
      )}

      {activeTab === 'history' && (
        <OperationHistory
          operations={operationHistory}
          onOperationClick={onOperationClick}
          onExport={onExportHistory}
        />
      )}
    </div>
  )
}
