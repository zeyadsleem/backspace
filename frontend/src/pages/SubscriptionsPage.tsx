import { useState } from "react";
import {
  SubscriptionDetailsDialog,
  SubscriptionDialog,
  SubscriptionsList,
} from "@/components/subscriptions";
import { useAppStore } from "@/stores/useAppStore";

export function SubscriptionsPage() {
  const subscriptions = useAppStore((state) => state.subscriptions);
  const customers = useAppStore((state) => state.customers);
  const planTypes = useAppStore((state) => state.planTypes);
  const addSubscription = useAppStore((state) => state.addSubscription);
  const deactivateSubscription = useAppStore((state) => state.deactivateSubscription);
  const changeSubscription = useAppStore((state) => state.changeSubscription);
  const cancelSubscription = useAppStore((state) => state.cancelSubscription);
  const deleteSubscription = useAppStore((state) => state.deleteSubscription);
  const t = useAppStore((state) => state.t);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);

  const selectedSubscription = selectedSubscriptionId
    ? subscriptions.find((s) => s.id === selectedSubscriptionId)
    : null;

  const selectedPlan = selectedSubscription
    ? planTypes.find((p) => p.id === selectedSubscription.planType)
    : null;

  const selectedCustomer = selectedSubscription
    ? customers.find((c) => c.id === selectedSubscription.customerId)
    : null;

  return (
    <>
      <SubscriptionsList
        onCreate={() => setShowCreateDialog(true)}
        onDeactivate={deactivateSubscription}
        onView={(id) => setSelectedSubscriptionId(id)}
        planTypes={planTypes}
        subscriptions={subscriptions}
      />

      <SubscriptionDialog
        customers={customers}
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={(data) => {
          addSubscription(data.customerId, data.planType, data.startDate);
          setShowCreateDialog(false);
        }}
        planTypes={planTypes}
        title={t("newSubscription")}
      />

      {selectedSubscription && selectedPlan && selectedCustomer && (
        <SubscriptionDetailsDialog
          isOpen={!!selectedSubscriptionId}
          onCancelSubscription={cancelSubscription}
          onChangePlan={changeSubscription}
          onClose={() => setSelectedSubscriptionId(null)}
          onDeleteSubscription={deleteSubscription}
          plan={selectedPlan}
          planTypes={planTypes}
          subscription={selectedSubscription}
        />
      )}
    </>
  );
}
