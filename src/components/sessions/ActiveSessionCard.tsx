import { useState, useEffect } from 'react'
import type { ActiveSession } from '@/types'
import { Clock, Square, PlusCircle, Monitor } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface ActiveSessionCardProps {
  session: ActiveSession
  onAddInventory?: () => void
  onEndSession?: () => void
}

export function ActiveSessionCard({
  session,
  onAddInventory,
  onEndSession,
}: ActiveSessionCardProps) {
  const t = useAppStore((state) => state.t)
  const [elapsedTime, setElapsedTime] = useState('')
  const [sessionCost, setSessionCost] = useState(0)

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(session.startedAt)
      const now = new Date()
      const diffMs = now.getTime() - start.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60

      setElapsedTime(hours > 0 ? `${hours}${t('hour').charAt(0)} ${mins}${t('minute').charAt(0)}` : `${mins}${t('minute').charAt(0)}`)

      if (!session.isSubscribed) {
        const cost = (diffMins / 60) * session.resourceRate
        setSessionCost(Math.round(cost))
      }
    }
    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [session.startedAt, session.resourceRate, session.isSubscribed, t])

  const totalCost = sessionCost + session.inventoryTotal
  const initials = session.customerName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl flex flex-col h-full w-full shadow-sm overflow-hidden border-b-4 border-b-amber-500/10">

      {/* 1. Header: Customer & Live Time */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-500 dark:text-stone-400 font-medium text-xs flex-shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-medium text-stone-900 dark:text-stone-100 leading-tight truncate">{session.customerName}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-stone-400">
              <Monitor className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider truncate">{session.resourceName}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-100 dark:border-amber-800/30 shadow-sm">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-medium font-mono">{elapsedTime}</span>
          </div>
          {session.isSubscribed && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.1em]">{t('subscribed')}</span>
          )}
        </div>
      </div>

      {/* 2. Billing Breakdown: Centered & Clear */}
      <div className="px-4 pb-4 space-y-5 flex-grow">
        <div className="grid grid-cols-2 gap-4 border-t border-stone-50 dark:border-stone-800 pt-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">{t('session')}</p>
            <p className={`text-base font-semibold ${session.isSubscribed ? 'text-emerald-600' : 'text-stone-900 dark:text-stone-100'}`}>
              {session.isSubscribed ? t('covered') : `${sessionCost} ${t('egp')}`}
            </p>
          </div>
          <div className="text-center space-y-1 border-s border-stone-100 dark:border-stone-800">
            <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">{t('inventoryLabel')}</p>
            <div className="flex flex-col items-center gap-0.5">
              <p className="text-base font-semibold text-stone-900 dark:text-stone-100">{session.inventoryTotal} {t('egp')}</p>
              {session.inventoryConsumptions.length > 0 && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {t('items', { count: session.inventoryConsumptions.length })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. The Total: Integrated Premium Box (#FFFBEB) */}
        <div className="bg-[#FFFBEB] dark:bg-amber-900/10 px-4 py-3 rounded-xl border border-amber-100 dark:border-amber-900/20 flex items-center justify-between shadow-sm">
          <span className="text-xs font-medium text-amber-800/70 dark:text-amber-400 uppercase tracking-widest">{t('totalToPay')}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-semibold text-amber-700 dark:text-amber-400">{totalCost}</span>
            <span className="text-xs font-medium text-amber-600/70 uppercase">{t('egpCurrency')}</span>
          </div>
        </div>
      </div>

      {/* 4. Actions: Slim & Practical */}
      <div className="mt-auto grid grid-cols-2 gap-px bg-stone-100 dark:bg-stone-800 border-t border-stone-100 dark:border-stone-800">
        <button
          onClick={onAddInventory}
          className="bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 py-3 flex items-center justify-center gap-2 text-xs font-medium text-stone-600 dark:text-stone-300 transition-colors"
        >
          <PlusCircle className="w-4 h-4 text-amber-500" />
          {t('addItem')}
        </button>
        <button
          onClick={onEndSession}
          className="bg-white dark:bg-stone-900 hover:bg-red-50 dark:hover:bg-red-900/10 py-3 flex items-center justify-center gap-2 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-red-600 transition-colors"
        >
          <Square className="w-4 h-4 fill-current" />
          {t('end')}
        </button>
      </div>
    </div>
  )
}
