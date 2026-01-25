import type { Subscription, PlanTypeOption } from '../types'
import { Calendar, Clock, XCircle, ChevronRight } from 'lucide-react'

interface SubscriptionCardProps {
  subscription: Subscription
  planType: PlanTypeOption
  onView?: () => void
  onDeactivate?: () => void
  language?: 'en' | 'ar'
}

export function SubscriptionCard({
  subscription,
  planType,
  onView,
  onDeactivate,
  language = 'en',
}: SubscriptionCardProps) {
  const initials = subscription.customerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusConfig = () => {
    if (!subscription.isActive) {
      return {
        label: language === 'ar' ? 'غير نشط' : 'Inactive',
        color: 'text-stone-600 dark:text-stone-400',
        bg: 'bg-stone-100 dark:bg-stone-800',
      }
    }
    if (subscription.daysRemaining <= 3) {
      return {
        label: language === 'ar' ? 'ينتهي قريباً' : 'Expiring Soon',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
      }
    }
    return {
      label: language === 'ar' ? 'نشط' : 'Active',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    }
  }

  const status = getStatusConfig()

  return (
    <div
      className={`bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 
                rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer
                ${!subscription.isActive ? 'opacity-75' : ''}`}
      onClick={onView}
    >
      {/* Header */}
      <div className="p-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                {initials}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                {subscription.customerName}
              </h3>
              <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${status.bg} ${status.color}`}>
                {status.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Plan Type */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-500 dark:text-stone-400">
            {language === 'ar' ? 'الخطة' : 'Plan'}
          </span>
          <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            {language === 'ar' ? planType.labelAr : planType.labelEn}
          </span>
        </div>

        {/* Date Range */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{language === 'ar' ? 'الفترة' : 'Period'}</span>
          </div>
          <span className="text-sm text-stone-700 dark:text-stone-300">
            {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
          </span>
        </div>

        {/* Days Remaining */}
        {subscription.isActive && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{language === 'ar' ? 'المتبقي' : 'Remaining'}</span>
            </div>
            <span
              className={`text-sm font-semibold ${
                subscription.daysRemaining <= 3
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {subscription.daysRemaining} {language === 'ar' ? 'يوم' : 'days'}
            </span>
          </div>
        )}

        {/* Progress Bar */}
        {subscription.isActive && (
          <div className="pt-2">
            <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  subscription.daysRemaining <= 3 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{
                  width: `${Math.max(0, (subscription.daysRemaining / planType.days) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        className="p-3 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-100 dark:border-stone-800 
                  flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {subscription.isActive ? (
          <button
            onClick={onDeactivate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                     text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 
                     rounded-lg transition-colors"
          >
            <XCircle className="h-4 w-4" />
            {language === 'ar' ? 'إلغاء' : 'Deactivate'}
          </button>
        ) : (
          <span className="text-sm text-stone-400">{language === 'ar' ? 'منتهي' : 'Expired'}</span>
        )}
        <button
          onClick={onView}
          className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400
                   hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
        >
          {language === 'ar' ? 'التفاصيل' : 'Details'}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
