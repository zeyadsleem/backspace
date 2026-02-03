import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomerDialog, CustomerProfile } from "@/components/customers";
import { InvoiceDialog } from "@/components/invoices/InvoiceDialog";
import { DeleteConfirmDialog } from "@/components/shared";
import { useTranslation } from "@/stores/hooks";
import { useAppStore } from "@/stores/use-app-store";
import type { CustomerType } from "@/types";

const customerTypes: CustomerType[] = ["visitor", "weekly", "half-monthly", "monthly"];

export function CustomerProfilePage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const t = useTranslation();
	const customers = useAppStore((state) => state.customers);
	const invoices = useAppStore((state) => state.invoices);
	const operationHistory = useAppStore((state) => state.operationHistory);
	const updateCustomer = useAppStore((state) => state.updateCustomer);
	const deleteCustomer = useAppStore((state) => state.deleteCustomer);
	const withdrawBalance = useAppStore((state) => state.withdrawBalance);

	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

	const customer = customers.find((c) => c.id === id);
	if (!customer) {
		return <div className="p-6">{t("customerNotFound")}</div>;
	}

	const customerInvoices = invoices
		.filter((inv) => inv.customerId === id)
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	const customerHistory = operationHistory
		.filter((op) => op.customerId === id)
		.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

	const selectedInvoice = selectedInvoiceId
		? invoices.find((i) => i.id === selectedInvoiceId)
		: null;

	const handleEdit = () => {
		setShowEditDialog(true);
	};

	const handleDelete = () => {
		setShowDeleteDialog(true);
	};

	const handleUpdateCustomer = (data: {
		name: string;
		phone: string;
		email?: string;
		notes?: string;
	}) => {
		updateCustomer(customer.id, {
			...data,
			email: data.email || null,
			notes: data.notes || "",
		});
		setShowEditDialog(false);
	};

	const handleDeleteConfirm = () => {
		deleteCustomer(customer.id);
		setShowDeleteDialog(false);
		navigate("/customers");
	};

	return (
		<>
			<div className="flex flex-col p-6">
				<CustomerProfile
					customer={customer}
					history={customerHistory}
					invoices={customerInvoices}
					onBack={() => navigate("/customers")}
					onDelete={handleDelete}
					onEdit={handleEdit}
					onViewInvoice={(id) => setSelectedInvoiceId(id)}
					onWithdraw={(amount) => withdrawBalance(customer.id, amount)}
				/>
			</div>

			<CustomerDialog
				customerTypes={customerTypes}
				initialData={{
					name: customer.name,
					phone: customer.phone,
					email: customer.email || "",
					customerType: customer.customerType,
					notes: customer.notes || "",
				}}
				isOpen={showEditDialog}
				onClose={() => setShowEditDialog(false)}
				onSubmit={handleUpdateCustomer}
				title={`${t("edit")} ${t("customer")}`}
			/>

			{selectedInvoice && (
				<InvoiceDialog
					invoice={selectedInvoice}
					isOpen={!!selectedInvoice}
					onClose={() => setSelectedInvoiceId(null)}
				/>
			)}

			<DeleteConfirmDialog
				description={t("areYouSureCustomer")}
				isOpen={showDeleteDialog}
				onCancel={() => setShowDeleteDialog(false)}
				onConfirm={handleDeleteConfirm}
				title={t("deleteCustomer")}
			/>
		</>
	);
}
