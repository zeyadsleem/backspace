import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/use-app-store";
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
		},
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
	const [searchQuery, setSearchQuery] = useState("");

	const filteredSessions = useMemo(() => {
		if (!searchQuery) return activeSessions;
		return activeSessions.filter(
			(session) =>
				session.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				session.resourceName?.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [activeSessions, searchQuery]);

	const selectedSession = activeSessions.find((s) => s.id === inventoryModalSession);
	const sessionToEditInventory = activeSessions.find((s) => s.id === editInventorySessionId);
	const sessionToEnd = activeSessions.find((s) => s.id === endSessionModalId);

	return (
		<div className="flex h-full flex-col overflow-hidden">
			<div className="flex-shrink-0 space-y-6 p-6 pb-2">
				<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<h1 className="font-bold text-2xl text-stone-900 dark:text-stone-100">
							{t("activeSessions")}
						</h1>
						<p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
							<span className="text-amber-600 dark:text-amber-400 font-medium">
								{t("sessionsInProgress", { count: activeSessions.length })}
							</span>
						</p>
					</div>
					<Button onClick={onStartSession} size="md" variant="primary">
						<Plus className="h-4 w-4" />
						{t("startSession")}
					</Button>
				</div>

				<div className="relative">
					<Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
					<input
						className="w-full rounded-lg border border-stone-200 bg-white py-2 ps-10 pe-4 text-start text-sm placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900"
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder={t("searchSessions")}
						type="text"
						value={searchQuery}
					/>
				</div>
			</div>

			<div className="min-h-0 flex-1 overflow-y-auto px-6">
				{filteredSessions.length === 0 ? (
					<EmptyState
						description={searchQuery ? t("noSearchResults") : t("startNewSessionPrompt")}
						icon="sessions"
						title={searchQuery ? t("noResultsFound") : t("noActiveSessions")}
					/>
				) : (
					<div className="grid 3xl:grid-cols-6 4xl:grid-cols-8 grid-cols-1 items-stretch gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
						{filteredSessions.map((session) => (
							<ActiveSessionCard
								key={session.id}
								onAddInventory={() => setInventoryModalSession(session.id)}
								onEndSession={() => setEndSessionModalId(session.id)}
								session={session}
							/>
						))}
					</div>
				)}
			</div>

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
