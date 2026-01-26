import { Clock, Plus } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import type { ActiveSession, InventoryItem, InvoiceStatus, PaymentMethod } from "@/types";
import { ActiveSessionCard } from "./ActiveSessionCard";
import { EditInventoryModal } from "./EditInventoryModal";
import { EndSessionDialog } from "./EndSessionDialog";
import { InventoryAddModal } from "./InventoryAddModal";

interface ActiveSessionsProps {
  activeSessions: ActiveSession[];
  availableInventory: InventoryItem[];
  onAddInventory?: (sessionId: string, data: { inventoryId: string; quantity: number }[]) => void;
  onUpdateInventory?: (sessionId: string, consumptionId: string, newQuantity: number) => void;
  onRemoveInventory?: (sessionId: string, consumptionId: string) => void;
  onEndSession?: (
    sessionId: string,
    paymentData: {
      amount: number;
      method: PaymentMethod;
      date: string;
      notes?: string;
      status: InvoiceStatus;
    }
  ) => void;
  onStartSession?: () => void;
}

export function ActiveSessions({
  activeSessions,
  availableInventory,
  onAddInventory,
  onUpdateInventory,
  onRemoveInventory,
  onEndSession,
  onStartSession,
}: ActiveSessionsProps) {
  const t = useAppStore((state) => state.t);
  const [inventoryModalSession, setInventoryModalSession] = useState<string | null>(null);
  const [editInventorySessionId, setEditInventorySessionId] = useState<string | null>(null);
  const [endSessionModalId, setEndSessionModalId] = useState<string | null>(null);

  const selectedSession = activeSessions.find((s) => s.id === inventoryModalSession);
  const sessionToEditInventory = activeSessions.find((s) => s.id === editInventorySessionId);
  const sessionToEnd = activeSessions.find((s) => s.id === endSessionModalId);

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-bold text-2xl text-stone-900 dark:text-stone-100">
            {t("activeSessions")}
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {t("sessionsInProgress", { count: activeSessions.length })}
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-amber-600"
          onClick={onStartSession}
          type="button"
        >
          <Plus className="h-4 w-4" />
          {t("startSession")}
        </button>
      </div>

      {activeSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-stone-100 p-4 dark:bg-stone-800">
            <Clock className="h-8 w-8 text-stone-400" />
          </div>
          <h3 className="font-medium text-lg text-stone-900 dark:text-stone-100">
            {t("noActiveSessions")}
          </h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {t("startNewSessionPrompt")}
          </p>
          <button
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-amber-600"
            onClick={onStartSession}
          >
            <Plus className="h-4 w-4" />
            {t("startSession")}
          </button>
        </div>
      ) : (
        <div className="grid 3xl:grid-cols-6 4xl:grid-cols-8 grid-cols-1 items-stretch gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {activeSessions.map((session) => (
            <ActiveSessionCard
              key={session.id}
              onAddInventory={() => setInventoryModalSession(session.id)}
              onEndSession={() => setEndSessionModalId(session.id)}
              session={session}
            />
          ))}
        </div>
      )}

      {selectedSession && (
        <InventoryAddModal
          availableInventory={availableInventory}
          onAdd={(data) => {
            onAddInventory?.(selectedSession.id, data);
            setInventoryModalSession(null);
          }}
          onClose={() => setInventoryModalSession(null)}
          session={selectedSession}
        />
      )}

      {sessionToEditInventory && (
        <EditInventoryModal
          isOpen={!!editInventorySessionId}
          onClose={() => setEditInventorySessionId(null)}
          onRemoveItem={(consumptionId) =>
            onRemoveInventory?.(sessionToEditInventory.id, consumptionId)
          }
          onUpdateItem={(consumptionId, newQuantity) =>
            onUpdateInventory?.(sessionToEditInventory.id, consumptionId, newQuantity)
          }
          session={sessionToEditInventory}
        />
      )}

      {sessionToEnd && (
        <EndSessionDialog
          isOpen={!!sessionToEnd}
          onClose={() => setEndSessionModalId(null)}
          onConfirm={(paymentData) => {
            onEndSession?.(sessionToEnd.id, paymentData);
            setEndSessionModalId(null);
          }}
          onRemoveItem={(consumptionId) => onRemoveInventory?.(sessionToEnd.id, consumptionId)}
          session={sessionToEnd}
        />
      )}
    </div>
  );
}
