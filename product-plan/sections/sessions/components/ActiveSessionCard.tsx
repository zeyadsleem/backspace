import { useState, useEffect } from 'react'
import type { ActiveSession } from '../types'
import { Clock, Coffee, Square, ChevronRight, CreditCard } from 'lucide-react'

interface ActiveSessionCardProps {
  session: ActiveSession
  onAddInventory?: () => void
  onEndSession?: () => void
  onViewDetails?: () => void
}

export function ActiveSessionCard({
  session,
  onAddInventory,
  onEndSession,
  onViewDetails,
}: ActiveSessionCardProps) {
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
      setElapsedTime(hours > 0 ? `${hours}h ${mins}m` : `${mins}m`)
      if (!session.isSubscribed) {
        const cost = (diffMins / 60) * session.resourceRate
        setSessionCost(Math.round(cost * 100) / 100)
      }
    }
    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [session.startedAt, session.resourceRate, session.isSubscribed])

  const totalCost = sessionCost + session.inventoryTotal
  const initials = session.customerName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const formatCurrency = (amount: number) => `${amount.toFixed(0)} EGP`

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">{initials}</span>
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100">{session.customerName}</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">{session.resourceName}</p>
            </div>
          </div>
          {session.isSubscribed && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
              <CreditCard className="h-3 w-3" />Subscribed
            </span>
          )}
        </div>
      </div>

      {/* Timer & Costs */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400"><Clock className="h-4 w-4" /><span className="text-sm">Elapsed</span></div>
          <span className="text-lg font-bold text-stone-900 dark:text-stone-100 font-mono">{elapsedTime}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-500 dark:text-stone-400">Session</span>
          <span className={`text-sm font-medium ${session.isSubscribed ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-700 dark:text-stone-300'}`}>
            {session.isSubscribed ? 'Covered' : formatCurrency(sessionCost)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-500 dark:text-stone-400">Inventory</span>
            {session.inventoryConsumptions.length > 0 && <span className="text-xs text-stone-400">({session.inventoryConsumptions.length} items)</span>}
          </div>
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{formatCurrency(session.inventoryTotal)}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
          <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">Total</span>
          <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{formatCurrency(totalCost)}</span>
        </div>
        {session.inventoryConsumptions.length > 0 && (
          <div className="pt-2">
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">Recent items:</p>
            <div className="flex flex-wrap gap-1">
              {session.inventoryConsumptions.slice(-3).map((item) => (
                <span key={item.id} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded">{item.itemName} ×{item.quantity}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-100 dark:border-stone-800 flex gap-2">
        <button onClick={onAddInventory} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
          <Coffee className="h-4 w-4" />Add Item
        </button>
        <button onClick={onEndSession} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
          <Square className="h-4 w-4" />End
        </button>
        <button onClick={onViewDetails} className="p-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-white dark:hover:bg-stone-900 rounded-lg transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
