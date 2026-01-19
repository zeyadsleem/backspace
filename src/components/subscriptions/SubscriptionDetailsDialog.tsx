import { useState } from 'react'
import type { Subscription, PlanTypeOption } from '@/types'
import { X, User, Pencil, Power } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface SubscriptionDetailsDialogProps {
  isOpen: boolean
  subscription: Subscription | null
  plan?: PlanTypeOption
  onClose: () => void
  onUpdate?: (id: string, data: any) => void
  onDeactivate?: (id: string) => void
}

export function SubscriptionDetailsDialog({ isOpen, subscription, plan, onClose, onUpdate, onDeactivate }: SubscriptionDetailsDialogProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)
  const [isEditing, setIsEditing] = useState(false)
  const [editedEndDate, setEditedEndDate] = useState(subscription?.endDate || '')

  if (!isOpen || !subscription || !plan) return null

  const handleUpdate = () => {
    onUpdate?.(subscription.id, { endDate: editedEndDate })
    setIsEditing(false)
  }

  const handleDeactivate = () => {
    onDeactivate?.(subscription.id)
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white dark:bg-stone-900 shadow-xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="p-6 border-b border-stone-200 dark:border-stone-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">{t('details')}</h2>
            <button onClick={onClose} className="p-1 rounded-full text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer and Plan Info */}
          <div className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
            <User className="h-6 w-6 text-stone-500 dark:text-stone-400 flex-shrink-0" />
            <div className="flex-grow">
              <p className="font-semibold text-stone-900 dark:text-stone-100">{subscription.customerName}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400">{isRTL ? plan.labelAr : plan.labelEn}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-stone-500 dark:text-stone-400">{t('startDate')}</label>
              <p className="font-semibold text-stone-800 dark:text-stone-200">{formatDate(subscription.startDate)}</p>
            </div>
            <div className="space-y-1">
              <label htmlFor="endDate" className="text-sm text-stone-500 dark:text-stone-400">{t('endDate')}</label>
              {isEditing ? (
                <input
                  id="endDate"
                  type="date"
                  value={editedEndDate}
                  onChange={(e) => setEditedEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              ) : (
                <p className="font-semibold text-stone-800 dark:text-stone-200">{formatDate(subscription.endDate)}</p>
              )}
            </div>
          </div>

          {/* Status and Remaining */}
          <div className="space-y-1">
            <label className="text-sm text-stone-500 dark:text-stone-400">{t('status')}</label>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${subscription.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'}`}>
                {subscription.isActive ? t('active') : t('inactive')}
              </span>
              {subscription.isActive && (
                <span className="text-sm text-stone-600 dark:text-stone-300">
                  · {subscription.daysRemaining} {t('days')} {t('remaining')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-800 flex gap-3">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
                {t('cancel')}
              </button>
              <button onClick={handleUpdate} className="flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg bg-amber-500 hover:bg-amber-600 transition-colors">
                {t('save')}
              </button>
            </>
          ) : (
            <>
              <button onClick={handleDeactivate} disabled={!subscription.isActive} className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <Power className="h-4 w-4" /> {t('deactivate')}
              </button>
              <button onClick={() => setIsEditing(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-300 rounded-lg border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
                <Pencil className="h-4 w-4" /> {t('edit')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
