import { useState } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { ActiveSessions, StartSessionDialog } from '@/components/sessions'

export function SessionsPage() {
  const activeSessions = useAppStore((state) => state.activeSessions)
  const customers = useAppStore((state) => state.customers)
  const resources = useAppStore((state) => state.resources)
  const subscriptions = useAppStore((state) => state.subscriptions)
  const inventory = useAppStore((state) => state.inventory)
  const startSession = useAppStore((state) => state.startSession)
  const endSession = useAppStore((state) => state.endSession)
  const addInventoryToSession = useAppStore((state) => state.addInventoryToSession)
  const [showStartDialog, setShowStartDialog] = useState(false)

  return (
    <>
      <ActiveSessions
        activeSessions={activeSessions}
        availableInventory={inventory}
        onAddInventory={(sessionId, items) => {
          // Add each item to the session
          items.forEach(item => {
            addInventoryToSession(sessionId, item.inventoryId, item.quantity)
          })
        }}
        onEndSession={endSession}
        onStartSession={() => setShowStartDialog(true)}
      />
      <StartSessionDialog
        isOpen={showStartDialog}
        customers={customers}
        resources={resources}
        subscriptions={subscriptions}
        onSubmit={(data) => { startSession(data.customerId, data.resourceId); setShowStartDialog(false) }}
        onClose={() => setShowStartDialog(false)}
      />
    </>
  )
}
