import { CreditCard } from "lucide-react";
import { Modal } from "@/components/shared";
import type { Customer, PlanTypeOption } from "@/types";
import { SubscriptionForm } from "./SubscriptionForm";

interface SubscriptionDialogProps {
	isOpen: boolean;
	title: string;
	customers: Customer[];
	planTypes: PlanTypeOption[];
	onSubmit?: (data: { customerId: string; planType: string; startDate: string }) => void;
	onClose?: () => void;
	isLoading?: boolean;
}

export function SubscriptionDialog({
	isOpen,
	title,
	customers,
	planTypes,
	onSubmit,
	onClose,
	isLoading,
}: SubscriptionDialogProps) {
	return (
		<Modal
			className="flex max-h-[85vh] flex-col overflow-hidden"
			isOpen={isOpen}
			maxWidth="3xl"
			onClose={onClose || (() => {})}
			title={
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
						<CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
					</div>
					<span className="font-semibold text-lg">{title}</span>
				</div>
			}
		>
			<div className="flex-1 overflow-y-auto p-6">
				<SubscriptionForm
					customers={customers}
					isLoading={isLoading}
					onCancel={onClose}
					onSubmit={onSubmit}
					planTypes={planTypes}
				/>
			</div>
		</Modal>
	);
}
