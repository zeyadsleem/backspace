import { useState } from 'react'
import type { Subscription, PlanTypeOption } from '@/types'
import { X, Power, RefreshCw } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { Modal } from '@/components/shared'

interface SubscriptionDetailsDialogProps {
  isOpen: boolean
  subscription: Subscription | null
  plan?: PlanTypeOption
  planTypes: PlanTypeOption[]
  onClose: () => void
  onChangePlan?: (id: string, newPlanType: string) => void
  onCancelSubscription?: (id: string, refundAmount: number) => void
}

export function SubscriptionDetailsDialog({
  isOpen,
  subscription,
  plan,
  planTypes,
  onClose,
  onChangePlan,
  onCancelSubscription
}: SubscriptionDetailsDialogProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)
  const reactivateSubscription = useAppStore((state) => state.reactivateSubscription)
  const [showChangePlan, setShowChangePlan] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [refundAmount, setRefundAmount] = useState(0)

  if (!isOpen || !subscription || !plan) return null

  const handleReactivate = () => {
    reactivateSubscription(subscription.id)
  }

  const handleCancel = () => {
    onCancelSubscription?.(subscription.id, refundAmount)
    setShowCancelConfirm(false)
    onClose()
  }

  const handleChangePlan = (newPlanId: string) => {
    onChangePlan?.(subscription.id, newPlanId)
    setShowChangePlan(false)
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const getStatusColor = () => {
    if (subscription.status === 'active') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    if (subscription.status === 'expired') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    return 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
  }

  const otherPlans = planTypes.filter(p => p.id !== subscription.planType)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      maxWidth="max-w-lg"
      className="overflow-hidden flex flex-col max-h-[90vh]"
    >
      <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-900/50">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">{t('subscriptionDetails')}</h2>
        <button onClick={onClose} className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Customer and Plan Info */}
        <div className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800">
          <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-base">
            {subscription.customerName.charAt(0)}
          </div>
          <div className="flex-grow min-w-0">
            <p className="font-bold text-stone-900 dark:text-stone-100 truncate text-sm">{subscription.customerName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{isRTL ? plan.labelAr : plan.labelEn}</span>
              <span className="h-0.5 w-0.5 rounded-full bg-stone-300" />
              <span className="text-xs font-bold text-amber-600">{plan.price} {t('egp')}</span>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-stone-100 dark:border-stone-800">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-1">{t('startDate')}</label>
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">{formatDate(subscription.startDate)}</p>
          </div>
          <div className="p-3 rounded-lg border border-stone-100 dark:border-stone-800">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-1">{t('endDate')}</label>
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">{formatDate(subscription.endDate)}</p>
          </div>
        </div>

        {/* Status and Remaining */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/30 border border-stone-100 dark:border-stone-800">
          <div className="flex justify-between items-center">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest block">{t('status')}</label>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${getStatusColor()}`}>
                  {t(subscription.status)}
                </span>
              </div>
            </div>
            {subscription.status === 'active' && (
              <div className="text-end">
                <p className="text-xl font-black text-stone-900 dark:text-stone-100 mb-0.5">{subscription.daysRemaining}</p>
                <p className="text-[10px] font-bold text-stone-400 uppercase">{t('daysRemaining')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sub-Actions (Change Plan / Cancel) */}
        {subscription.status === 'active' && !showChangePlan && !showCancelConfirm && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => setShowChangePlan(true)}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-amber-900/50 hover:bg-amber-50/30 transition-all group"
            >
              <RefreshCw className="h-5 w-5 text-amber-500 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400">{t('changePlan')}</span>
            </button>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-red-300 dark:hover:border-red-900/50 hover:bg-red-50/30 transition-all group"
            >
              <Power className="h-5 w-5 text-red-500" />
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400">{t('cancelSubscription')}</span>
            </button>
          </div>
        )}

        {/* Change Plan UI */}
        {showChangePlan && (
          <div className="animate-fade-in p-4 rounded-xl border-2 border-amber-100 dark:border-amber-900/20 bg-amber-50/10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400">{t('chooseNewPlan')}</h3>
              <button onClick={() => setShowChangePlan(false)} className="text-stone-400 hover:text-stone-600"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid gap-2">
              {otherPlans.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleChangePlan(p.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-500 transition-all"
                >
                  <span className="font-bold text-sm text-stone-800 dark:text-stone-200">{isRTL ? p.labelAr : p.labelEn}</span>
                  <span className="font-mono font-bold text-amber-600">{p.price} {t('egp')}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-stone-500 italic text-center">{t('changePlanNote')}</p>
          </div>
        )}

        {/* Cancel Confirm UI */}
        {showCancelConfirm && (
          <div className="animate-fade-in p-4 rounded-xl border-2 border-red-100 dark:border-red-900/20 bg-red-50/10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-red-700 dark:text-red-400">{t('confirmCancellation')}</h3>
              <button onClick={() => setShowCancelConfirm(false)} className="text-stone-400 hover:text-stone-600"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-xs text-red-600/80 leading-relaxed">{t('cancelWarning')}</p>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500 uppercase">{t('refundAmount')} ({t('optional')})</label>
              <div className="relative">
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full h-10 rounded-lg border border-red-200 dark:border-red-900/30 bg-white dark:bg-stone-800 px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/20"
                />
                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">{t('egp')}</span>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="w-full h-10 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-600/10"
            >
              {t('confirmCancelAndRefund')}
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-100 dark:border-stone-800 flex gap-3">
        {subscription.status !== 'active' ? (
          <button onClick={handleReactivate} className="flex-1 flex items-center justify-center gap-2 h-11 text-sm font-bold text-white rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/10">
            <RefreshCw className="h-4 w-4" /> {t('reactivateSubscription')}
          </button>
        ) : (
          <button onClick={onClose} className="flex-1 h-11 text-sm font-bold text-stone-600 dark:text-stone-300 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800 transition-colors">
            {t('close')}
          </button>
        )}
      </div>
    </Modal>
  )
}




