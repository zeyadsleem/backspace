import { useState } from 'react'
import type { OperationHistoryProps, OperationType } from '../types'
import { Download, Search, Play, Square, Coffee, UserPlus, Receipt, CreditCard, History } from 'lucide-react'

const operationConfig: Record<OperationType, { icon: typeof Play; label: string; color: string; bg: string }> = {
  session_start: { icon: Play, label: 'Session Started', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  session_end: { icon: Square, label: 'Session Ended', color: 'text-stone-600 dark:text-stone-400', bg: 'bg-stone-100 dark:bg-stone-800' },
  inventory_add: { icon: Coffee, label: 'Inventory Added', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  invoice_created: { icon: Receipt, label: 'Invoice Created', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  payment_received: { icon: CreditCard, label: 'Payment Received', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  customer_new: { icon: UserPlus, label: 'New Customer', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  subscription_new: { icon: CreditCard, label: 'New Subscription', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
}

export function OperationHistory({
  operations,
  onOperationClick,
  onExport,
}: OperationHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<OperationType | 'all'>('all')

  const filteredOperations = operations.filter((op) => {
    const matchesSearch = op.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || op.type === typeFilter
    return matchesSearch && matchesType
  })

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search operations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-stone-900
                     border border-stone-200 dark:border-stone-700 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as OperationType | 'all')}
          className="px-3 py-2 text-sm bg-white dark:bg-stone-900
                   border border-stone-200 dark:border-stone-700 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        >
          <option value="all">All Types</option>
          {Object.entries(operationConfig).map(([type, config]) => (
            <option key={type} value={type}>
              {config.label}
            </option>
          ))}
        </select>

        {/* Export */}
        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                   text-stone-600 dark:text-stone-400 bg-white dark:bg-stone-900
                   border border-stone-200 dark:border-stone-700 rounded-lg
                   hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Operations List */}
      {filteredOperations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-full mb-4">
            <History className="h-8 w-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">
            No operations found
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {searchQuery || typeFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Operations will appear here as they happen'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {filteredOperations.map((operation) => {
              const config = operationConfig[operation.type]
              const Icon = config.icon

              return (
                <button
                  key={operation.id}
                  onClick={() => onOperationClick?.(operation.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 
                           transition-colors text-left"
                >
                  <div className={`p-2 rounded-lg flex-shrink-0 ${config.bg}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      {operation.description}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {config.label}
                    </p>
                  </div>
                  <span className="text-xs text-stone-500 dark:text-stone-400 flex-shrink-0">
                    {formatTime(operation.timestamp)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
