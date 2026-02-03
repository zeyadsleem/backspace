import { User } from "lucide-react";
import { Modal } from "@/components/shared";
import type { CustomerType } from "@/types";
import { CustomerForm } from "./CustomerForm";

interface CustomerDialogProps {
	isOpen: boolean;
	title: string;
	onClose?: () => void;
	initialData?: {
		name: string;
		phone: string;
		email: string | null;
		customerType: CustomerType;
		notes: string;
	};
	customerTypes: CustomerType[];
	onSubmit?: (data: {
		name: string;
		phone: string;
		email?: string;
		customerType: CustomerType;
		notes?: string;
	}) => void;
	isLoading?: boolean;
}

export function CustomerDialog({ isOpen, title, onClose, ...formProps }: CustomerDialogProps) {
	if (isOpen === false) {
		return null;
	}

	return (
		<Modal
			isOpen={isOpen}
			maxWidth="2xl"
			onClose={onClose || (() => {})}
			title={
				<div className="flex items-center gap-3">
					<div className="rounded-xl bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
						<User className="h-5 w-5" />
					</div>
					<h2>{title}</h2>
				</div>
			}
		>
			<div className="scrollbar-thin flex-1 overflow-y-auto p-6">
				<CustomerForm {...formProps} onCancel={onClose} />
			</div>
		</Modal>
	);
}
