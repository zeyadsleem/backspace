import { useState } from "react";
import { DeleteConfirmDialog } from "@/components/shared";
import {
	SubscriptionDetailsDialog,
	SubscriptionDialog,
	SubscriptionsList,
} from "@/components/subscriptions";
import { useAppStore } from "@/stores/use-app-store";

export function SubscriptionsPage() {
	const subscriptions = useAppStore((state) => state.subscriptions);
	const customers = useAppStore((state) => state.customers);
	const planTypes = useAppStore((state) => state.planTypes);
	const addSubscription = useAppStore((state) => state.addSubscription);
	const deactivateSubscription = useAppStore((state) => state.deactivateSubscription);
	const upgradeSubscription = useAppStore((state) => state.upgradeSubscription);
	const refundSubscription = useAppStore((state) => state.refundSubscription);
	const deleteSubscription = useAppStore((state) => state.deleteSubscription);
	const t = useAppStore((state) => state.t);

	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
	const [deleteId, setDeleteId] = useState<string | null>(null);

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
					onClose={() => setSelectedSubscriptionId(null)}
					onDeleteSubscription={(id) => {
						setSelectedSubscriptionId(null);
						setDeleteId(id);
					}}
					onRefund={refundSubscription}
					onUpgrade={upgradeSubscription}
					plan={selectedPlan}
					planTypes={planTypes}
					subscription={selectedSubscription}
				/>
			)}

			<DeleteConfirmDialog
				description={t("areYouSure")}
				isOpen={!!deleteId}
				onCancel={() => setDeleteId(null)}
				onConfirm={() => {
					if (deleteId) {
						deleteSubscription(deleteId);
					}
					setDeleteId(null);
				}}
				title={t("deleteSubscription")}
			/>
		</>
	);
}
