import type { RecentActivity } from '@/types'
import { Play, Square, Coffee, UserPlus, Receipt, CreditCard, Activity } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface ActivityFeedProps {
  activities: RecentActivity[]
}

const activityConfig: Record<RecentActivity['type'], { icon: typeof Play; color: string; bg: string }> = {
  session_start: { icon: Play, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/50' },
  session_end: { icon: Square, color: 'text-stone-600 dark:text-stone-400', bg: 'bg-stone-100 dark:bg-stone-800' },
  inventory_add: { icon: Coffee, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/50' },
  customer_new: { icon: UserPlus, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/50' },
  invoice_paid: { icon: Receipt, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/50' },
  subscription_new: { icon: CreditCard, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/50' },
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const t = useAppStore((state) => state.t)
  const language = useAppStore((state) => state.language)
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return t('justNow')
    if (diffMins < 60) return language === 'ar' ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return language === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl flex flex-col h-96">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 flex items-center gap-2 p-5 border-b border-stone-200 dark:border-stone-800">
        <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg">
          <Activity className="h-4 w-4 text-stone-600 dark:text-stone-400" />
        </div>
        <h3 className="font-semibold text-stone-900 dark:text-stone-100">{t('recentActivity')}</h3>
      </div>
      
      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-stone-400 text-center py-8">{t('noRecentActivity')}</p>
          ) : (
            activities.map((activity) => {
              const config = activityConfig[activity.type]
              const Icon = config.icon
              return (
                <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${config.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700 dark:text-stone-300 line-clamp-2">{activity.description}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-500 mt-0.5">{formatTime(activity.timestamp)}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
