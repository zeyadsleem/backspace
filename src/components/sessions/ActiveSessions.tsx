import { useState } from 'react'
import type { ActiveSession, InventoryItem, PaymentMethod, InvoiceStatus } from '@/types'
import { ActiveSessionCard } from './ActiveSessionCard'
import { InventoryAddModal } from './InventoryAddModal'
import { EndSessionDialog } from './EndSessionDialog'
import { EditInventoryModal } from './EditInventoryModal'
import { Plus, Clock } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface ActiveSessionsProps {
  activeSessions: ActiveSession[]
  availableInventory: InventoryItem[]
  onAddInventory?: (sessionId: string, data: { inventoryId: string; quantity: number }[]) => void
  onUpdateInventory?: (sessionId: string, consumptionId: string, newQuantity: number) => void
  onRemoveInventory?: (sessionId: string, consumptionId: string) => void
  onEndSession?: (sessionId: string, paymentData: { amount: number; method: PaymentMethod; date: string; notes?: string; status: InvoiceStatus }) => void
  onViewDetails?: (sessionId: string) => void
  onStartSession?: () => void
}

export function ActiveSessions({
  activeSessions,
  availableInventory,
  onAddInventory,
  onUpdateInventory,
  onRemoveInventory,
  onEndSession,
  onViewDetails,
  onStartSession,
}: ActiveSessionsProps) {
  const t = useAppStore((state) => state.t)
  const [inventoryModalSession, setInventoryModalSession] = useState<string | null>(null)
  const [editInventorySessionId, setEditInventorySessionId] = useState<string | null>(null)
  const [endSessionModalId, setEndSessionModalId] = useState<string | null>(null)
  
  const selectedSession = activeSessions.find((s) => s.id === inventoryModalSession)
  const sessionToEditInventory = activeSessions.find((s) => s.id === editInventorySessionId)
  const sessionToEnd = activeSessions.find((s) => s.id === endSessionModalId)

  return (
    <div className="flex flex-col p-6 space-y-6">
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
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{t('startNewSessionPrompt')}</p>
          <button onClick={onStartSession} className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors">
            <Plus className="h-4 w-4" />{t('startSession')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch pb-6">
          {activeSessions.map((session) => (
            <ActiveSessionCard 
              key={session.id} 
              session={session} 
              onAddInventory={() => setInventoryModalSession(session.id)} 
              onEndSession={() => setEndSessionModalId(session.id)} 
              onViewDetails={() => setEditInventorySessionId(session.id)} 
            />
          ))}
        </div>
      )}

      {selectedSession && (
        <InventoryAddModal 
          session={selectedSession} 
          availableInventory={availableInventory} 
          onAdd={(data) => { onAddInventory?.(selectedSession.id, data); setInventoryModalSession(null) }} 
          onClose={() => setInventoryModalSession(null)} 
        />
      )}

      {sessionToEditInventory && (
        <EditInventoryModal
          session={sessionToEditInventory}
          isOpen={!!editInventorySessionId}
          onClose={() => setEditInventorySessionId(null)}
          onUpdateItem={(consumptionId, newQuantity) => onUpdateInventory?.(sessionToEditInventory.id, consumptionId, newQuantity)}
          onRemoveItem={(consumptionId) => onRemoveInventory?.(sessionToEditInventory.id, consumptionId)}
        />
      )}

      {sessionToEnd && (
        <EndSessionDialog
          isOpen={!!sessionToEnd}
          session={sessionToEnd}
          onClose={() => setEndSessionModalId(null)}
          onRemoveItem={(consumptionId) => onRemoveInventory?.(sessionToEnd.id, consumptionId)}
          onConfirm={(paymentData) => {
            onEndSession?.(sessionToEnd.id, paymentData)
            setEndSessionModalId(null)
          }}
        />
      )}
    </div>
  )
}
