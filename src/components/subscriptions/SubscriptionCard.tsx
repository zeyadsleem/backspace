import type { Subscription, PlanTypeOption } from '@/types'
import { useAppStore } from '@/stores/useAppStore'

interface SubscriptionCardProps {
  subscription: Subscription
  planType: PlanTypeOption
  onView?: (id: string) => void
}

export function SubscriptionCard({ subscription, planType, onView }: SubscriptionCardProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)

  const formatDate = (date: string) => new Date(date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })

  const isExpiringSoon = subscription.status === 'active' && subscription.daysRemaining <= 3
  
  const getStatusColor = () => {
    if (subscription.status === 'active') return isExpiringSoon ? 'bg-amber-500' : 'bg-emerald-500'
    if (subscription.status === 'expired') return 'bg-red-500'
    return 'bg-stone-200 dark:bg-stone-800'
  }

  const getTextColor = () => {
    if (subscription.status === 'active') return isExpiringSoon ? 'text-amber-500' : 'text-emerald-500'
    if (subscription.status === 'expired') return 'text-red-500'
    return 'text-stone-400'
  }

  return (
    <div 
      className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
      onClick={() => onView?.(subscription.id)}
    >
      <div className={`h-1.5 w-full ${getStatusColor()}`} />
      
      <div className="p-4 sm:p-5 space-y-4 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 truncate">{subscription.customerName}</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">{isRTL ? planType.labelAr : planType.labelEn}</p>
          </div>
          {subscription.status === 'active' && (
            <div className="text-end shrink-0">
              <span className={`text-xs font-black ${getTextColor()}`}>
                {subscription.daysRemaining} {t('days')}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-end gap-3">
          <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-tight">
            <span>{formatDate(subscription.startDate)}</span>
            <span>{formatDate(subscription.endDate)}</span>
          </div>

          {subscription.status === 'active' ? (
            <div className="h-1 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isExpiringSoon ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.min(100, Math.max(0, (subscription.daysRemaining / planType.days) * 100))}%` }} 
              />
            </div>
          ) : (
            <div className={`text-[10px] uppercase tracking-widest font-black text-center py-1 rounded ${subscription.status === 'expired' ? 'bg-red-50 dark:bg-red-900/10 text-red-500' : 'bg-stone-100 dark:bg-stone-800/50 text-stone-400'}`}>
              {t(subscription.status)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
