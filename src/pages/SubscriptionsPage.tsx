import { useState } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { SubscriptionsList, SubscriptionDialog } from '@/components/subscriptions'

export function SubscriptionsPage() {
  const subscriptions = useAppStore((state) => state.subscriptions)
  const customers = useAppStore((state) => state.customers)
  const planTypes = useAppStore((state) => state.planTypes)
  const addSubscription = useAppStore((state) => state.addSubscription)
  const deactivateSubscription = useAppStore((state) => state.deactivateSubscription)
  const t = useAppStore((state) => state.t)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  return (
    <>
      <SubscriptionsList
        subscriptions={subscriptions}
        planTypes={planTypes}
        onDeactivate={deactivateSubscription}
        onCreate={() => setShowCreateDialog(true)}
      />
      <SubscriptionDialog
        isOpen={showCreateDialog}
        title={t('newSubscription')}
        customers={customers}
        planTypes={planTypes}
        onSubmit={(data) => { addSubscription(data.customerId, data.planType, data.startDate); setShowCreateDialog(false) }}
        onClose={() => setShowCreateDialog(false)}
      />
    </>
  )
}
