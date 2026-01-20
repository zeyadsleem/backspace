import { useState } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { SubscriptionsList, SubscriptionDialog, SubscriptionDetailsDialog } from '@/components/subscriptions'

export function SubscriptionsPage() {
  const subscriptions = useAppStore((state) => state.subscriptions)
  const customers = useAppStore((state) => state.customers)
  const planTypes = useAppStore((state) => state.planTypes)
  const addSubscription = useAppStore((state) => state.addSubscription)
  const deactivateSubscription = useAppStore((state) => state.deactivateSubscription)
  const changeSubscription = useAppStore((state) => state.changeSubscription)
  const cancelSubscription = useAppStore((state) => state.cancelSubscription)
  const t = useAppStore((state) => state.t)
  
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null)

  const selectedSubscription = selectedSubscriptionId 
    ? subscriptions.find(s => s.id === selectedSubscriptionId) 
    : null
  
  const selectedPlan = selectedSubscription 
    ? planTypes.find(p => p.id === selectedSubscription.planType) 
    : null
    
  const selectedCustomer = selectedSubscription
    ? customers.find(c => c.id === selectedSubscription.customerId)
    : null

  return (
    <>
      <SubscriptionsList
        subscriptions={subscriptions}
        planTypes={planTypes}
        onView={(id) => setSelectedSubscriptionId(id)}
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

      {selectedSubscription && selectedPlan && selectedCustomer && (
        <SubscriptionDetailsDialog
          isOpen={!!selectedSubscriptionId}
          subscription={selectedSubscription}
          plan={selectedPlan}
          planTypes={planTypes}
          onChangePlan={changeSubscription}
          onCancelSubscription={cancelSubscription}
          onClose={() => setSelectedSubscriptionId(null)}
        />
      )}
    </>
  )
}
