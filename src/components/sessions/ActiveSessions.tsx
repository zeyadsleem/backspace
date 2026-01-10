import { useState } from 'react'
import type { ActiveSession, InventoryItem } from '@/types'
import { ActiveSessionCard } from './ActiveSessionCard'
import { InventoryAddModal } from './InventoryAddModal'
import { Plus, Clock } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface ActiveSessionsProps {
  activeSessions: ActiveSession[]
  availableInventory: InventoryItem[]
  onAddInventory?: (sessionId: string, data: { inventoryId: string; quantity: number }[]) => void
  onEndSession?: (sessionId: string) => void
  onViewDetails?: (sessionId: string) => void
  onStartSession?: () => void
}

export function ActiveSessions({
  activeSessions,
  availableInventory,
  onAddInventory,
  onEndSession,
  onViewDetails,
  onStartSession,
}: ActiveSessionsProps) {
  const t = useAppStore((state) => state.t)
  const [inventoryModalSession, setInventoryModalSession] = useState<string | null>(null)
  const selectedSession = activeSessions.find((s) => s.id === inventoryModalSession)

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('activeSessions')}</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{t('sessionsInProgress', { count: activeSessions.length })}</p>
        </div>
        <button onClick={onStartSession} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors">
          <Plus className="h-4 w-4" />{t('startSession')}
        </button>
      </div>

      {activeSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-full mb-4"><Clock className="h-8 w-8 text-stone-400" /></div>
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">{t('noActiveSessions')}</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{t('startNewSession')}</p>
          <button onClick={onStartSession} className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors">
            <Plus className="h-4 w-4" />{t('startSession')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
          {activeSessions.map((session) => (
            <ActiveSessionCard key={session.id} session={session} onAddInventory={() => setInventoryModalSession(session.id)} onEndSession={() => onEndSession?.(session.id)} onViewDetails={() => onViewDetails?.(session.id)} />
          ))}
        </div>
      )}

      {selectedSession && (
        <InventoryAddModal session={selectedSession} availableInventory={availableInventory} onAdd={(data) => { onAddInventory?.(selectedSession.id, data); setInventoryModalSession(null) }} onClose={() => setInventoryModalSession(null)} />
      )}
    </div>
  )
}
