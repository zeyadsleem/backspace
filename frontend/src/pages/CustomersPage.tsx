import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerDialog, CustomersList } from "@/components/customers";
import { DeleteConfirmDialog } from "@/components/shared";
import { useAppStore } from "@/stores/use-app-store";
import type { CustomerType } from "@/types";

const customerTypes: CustomerType[] = ["visitor", "weekly", "half-monthly", "monthly"];

export function CustomersPage() {
	const navigate = useNavigate();
	const customers = useAppStore((state) => state.customers);
	const addCustomer = useAppStore((state) => state.addCustomer);
	const updateCustomer = useAppStore((state) => state.updateCustomer);
	const deleteCustomer = useAppStore((state) => state.deleteCustomer);
	const t = useAppStore((state) => state.t);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [editId, setEditId] = useState<string | null>(null);
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const editingCustomer = editId ? customers.find((c) => c.id === editId) : undefined;

	return (
		<>
			<CustomersList
				customers={customers}
				customerTypes={customerTypes}
				onCreate={() => setShowCreateDialog(true)}
				onDelete={(id: string) => setDeleteId(id)}
				onEdit={(id: string) => setEditId(id)}
				onView={(id: string) => navigate(`/customers/${id}`)}
			/>
			<CustomerDialog
				customerTypes={customerTypes}
				initialData={
					editingCustomer
						? {
								name: editingCustomer.name,
								phone: editingCustomer.phone,
								email: editingCustomer.email,
								customerType: editingCustomer.customerType,
								notes: editingCustomer.notes || "",
							}
						: undefined
				}
				isOpen={showCreateDialog || !!editId}
				onClose={() => {
					setShowCreateDialog(false);
					setEditId(null);
				}}
				onSubmit={(data: {
					name: string;
					phone: string;
					email?: string;
					customerType?: CustomerType;
					notes?: string;
				}) => {
					if (editId) {
						updateCustomer(editId, {
							...data,
							email: data.email || null,
							notes: data.notes || "",
						});
						setEditId(null);
					} else {
						addCustomer({
							...data,
							email: data.email || null,
							notes: data.notes || "",
							balance: 0,
						});
						setShowCreateDialog(false);
					}
				}}
				title={editId ? t("updateCustomer") : t("newCustomer")}
			/>
			<DeleteConfirmDialog
				description={t("areYouSureCustomer")}
				isOpen={!!deleteId}
				onCancel={() => setDeleteId(null)}
				onConfirm={() => {
					if (deleteId) {
						deleteCustomer(deleteId);
					}
					setDeleteId(null);
				}}
				title={t("deleteCustomer")}
			/>
		</>
	);
}
