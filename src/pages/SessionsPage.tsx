import { useState } from "react";
import { ActiveSessions, StartSessionDialog } from "@/components/sessions";
import { useAppStore } from "@/stores/useAppStore";

export function SessionsPage() {
  const activeSessions = useAppStore((state) => state.activeSessions);
  const customers = useAppStore((state) => state.customers);
  const resources = useAppStore((state) => state.resources);
  const subscriptions = useAppStore((state) => state.subscriptions);
  const inventory = useAppStore((state) => state.inventory);
  const startSession = useAppStore((state) => state.startSession);
  const addInventoryToSession = useAppStore((state) => state.addInventoryToSession);
  const updateInventoryInSession = useAppStore((state) => state.updateInventoryInSession);
  const removeInventoryFromSession = useAppStore((state) => state.removeInventoryFromSession);
  const endSessionWithPayment = useAppStore((state) => state.endSessionWithPayment);
  const [showStartDialog, setShowStartDialog] = useState(false);

  return (
    <>
      <ActiveSessions
        activeSessions={activeSessions}
        availableInventory={inventory}
        onAddInventory={(sessionId, items) => {
          // Add each item to the session
          items.forEach((item) => {
            addInventoryToSession(sessionId, item.inventoryId, item.quantity);
          });
        }}
        onEndSession={(sessionId, paymentData) => {
          endSessionWithPayment(sessionId, paymentData.method, paymentData.amount);
        }}
        onRemoveInventory={(sessionId, consumptionId) => {
          removeInventoryFromSession(sessionId, consumptionId);
        }}
        onStartSession={() => setShowStartDialog(true)}
        onUpdateInventory={(sessionId, consumptionId, newQuantity) => {
          updateInventoryInSession(sessionId, consumptionId, newQuantity);
        }}
      />
      <StartSessionDialog
        customers={customers}
        isOpen={showStartDialog}
        onClose={() => setShowStartDialog(false)}
        onSubmit={(data) => {
          startSession(data.customerId, data.resourceId);
          setShowStartDialog(false);
        }}
        resources={resources}
        subscriptions={subscriptions}
      />
    </>
  );
}
