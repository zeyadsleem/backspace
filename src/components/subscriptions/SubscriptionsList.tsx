import { useState } from 'react'
import type { Subscription, PlanType, PlanTypeOption } from '@/types'
import { SubscriptionCard } from './SubscriptionCard'
import { Plus, CreditCard } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface SubscriptionsListProps {
  subscriptions: Subscription[]
  planTypes: PlanTypeOption[]
  onView?: (id: string) => void
  onDeactivate?: (id: string) => void
  onCreate?: () => void
}

export function SubscriptionsList({
  subscriptions,
  planTypes,
  onView,
  onDeactivate,
  onCreate,
}: SubscriptionsListProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [typeFilter, setTypeFilter] = useState<PlanType | 'all'>('all')

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && sub.isActive) ||
      (statusFilter === 'inactive' && !sub.isActive)
    const matchesType = typeFilter === 'all' || sub.planType === typeFilter
    return matchesStatus && matchesType
  })

  const activeCount = subscriptions.filter((s) => s.isActive).length
  const expiringCount = subscriptions.filter((s) => s.isActive && s.daysRemaining <= 3).length

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {t('subscriptions')}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            <span className="text-emerald-600 dark:text-emerald-400">{activeCount} {t('active')}</span>
            {expiringCount > 0 && (
              <>
                {' · '}
                <span className="text-amber-600 dark:text-amber-400">{expiringCount} {t('expiringSoon')}</span>
              </>
            )}
          </p>
        </div>
        <button onClick={onCreate} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors">
          <Plus className="h-4 w-4" />
          {t('newSubscription')}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
          {(['all', 'active', 'inactive'] as const).map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${statusFilter === status ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'}`}>
              {status === 'all' ? t('all') : status === 'active' ? t('active') : t('inactive')}
            </button>
          ))}
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as PlanType | 'all')} className="px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
          <option value="all">{t('allPlans')}</option>
          {planTypes.map((plan) => (
            <option key={plan.id} value={plan.id}>{isRTL ? plan.labelAr : plan.labelEn}</option>
          ))}
        </select>
      </div>

      {filteredSubscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-full mb-4"><CreditCard className="h-8 w-8 text-stone-400" /></div>
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">{t('noSubscriptionsFound')}</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {statusFilter !== 'all' || typeFilter !== 'all' ? t('tryAdjustingFilters') : t('createFirstSubscription')}
          </p>
          {statusFilter === 'all' && typeFilter === 'all' && (
            <button onClick={onCreate} className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors">
              <Plus className="h-4 w-4" />{t('newSubscription')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {filteredSubscriptions.map((subscription) => {
            const planType = planTypes.find((p) => p.id === subscription.planType)!
            return <SubscriptionCard key={subscription.id} subscription={subscription} planType={planType} onView={() => onView?.(subscription.id)} onDeactivate={() => onDeactivate?.(subscription.id)} />
          })}
        </div>
      )}
    </div>
  )
}
