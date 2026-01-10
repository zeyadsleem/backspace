import type { Subscription, PlanTypeOption } from '@/types'
import { Calendar, Clock, XCircle, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { RTLIcon } from '../ui/RTLIcon'

interface SubscriptionCardProps {
  subscription: Subscription
  planType: PlanTypeOption
  onView?: () => void
  onDeactivate?: () => void
}

export function SubscriptionCard({ subscription, planType, onView, onDeactivate }: SubscriptionCardProps) {
  const t = useAppStore((state) => state.t)
  const language = useAppStore((state) => state.language)
  const isRTL = useAppStore((state) => state.isRTL)
  const initials = subscription.customerName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })

  const getStatusConfig = () => {
    if (!subscription.isActive) return { label: t('inactive'), color: 'text-stone-600 dark:text-stone-400', bg: 'bg-stone-100 dark:bg-stone-800' }
    if (subscription.daysRemaining <= 3) return { label: t('expiringSoon'), color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' }
    return { label: t('active'), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' }
  }

  const status = getStatusConfig()

  return (
    <div className={`bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer ${!subscription.isActive ? 'opacity-75' : ''}`} onClick={onView}>
      <div className="p-4 border-b border-stone-100 dark:border-stone-800">
        <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">{initials}</span>
            </div>
            <div className={isRTL ? 'text-end' : 'text-start'}>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100">{subscription.customerName}</h3>
              <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${status.bg} ${status.color}`}>{status.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-sm text-stone-500 dark:text-stone-400">{t('plan')}</span>
          <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">{isRTL ? planType.labelAr : planType.labelEn}</span>
        </div>
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-1.5 text-stone-500 dark:text-stone-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <RTLIcon>
              <Calendar className="h-4 w-4" />
            </RTLIcon>
            <span className="text-sm">{t('period')}</span>
          </div>
          <span className="text-sm text-stone-700 dark:text-stone-300">{formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}</span>
        </div>
        {subscription.isActive && (
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-1.5 text-stone-500 dark:text-stone-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <RTLIcon>
                <Clock className="h-4 w-4" />
              </RTLIcon>
              <span className="text-sm">{t('remaining')}</span>
            </div>
            <span className={`text-sm font-semibold ${subscription.daysRemaining <= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{subscription.daysRemaining} {t('days')}</span>
          </div>
        )}
        {subscription.isActive && (
          <div className="pt-2">
            <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${subscription.daysRemaining <= 3 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.max(0, (subscription.daysRemaining / planType.days) * 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className={`p-3 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`} onClick={(e) => e.stopPropagation()}>
        {subscription.isActive ? (
          <button onClick={onDeactivate} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
            <RTLIcon>
              <XCircle className="h-4 w-4" />
            </RTLIcon>
            {t('deactivate')}
          </button>
        ) : (
          <span className="text-sm text-stone-400">{t('expired')}</span>
        )}
        <button onClick={onView} className={`inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
          {t('details')}
          <RTLIcon>
            <ChevronRight className="h-4 w-4" />
          </RTLIcon>
        </button>
      </div>
    </div>
  )
}
