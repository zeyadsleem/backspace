import {
	ArrowLeft,
	Calendar,
	Clock,
	CreditCard,
	Edit,
	FileText,
	History as HistoryIcon,
	Mail,
	Phone,
	Receipt,
	Trash2,
} from "lucide-react";
import { useAppStore, useLanguage, useTranslation } from "@/stores/hooks";
import type { Customer, CustomerType, Invoice, OperationRecord } from "@/types";
import { InvoiceRow } from "../invoices/InvoiceRow";

interface CustomerProfileProps {
	customer: Customer;
	invoices?: Invoice[];
	history?: OperationRecord[];
	onEdit?: () => void;
	onDelete?: () => void;
	onBack?: () => void;
	onViewInvoice?: (id: string) => void;
}

export function CustomerProfile({
	customer,
	invoices = [],
	history = [],
	onEdit,
	onDelete,
	onBack,
	onViewInvoice,
}: CustomerProfileProps) {
	const t = useTranslation();
	const language = useLanguage();
	const isRTL = useAppStore((state) => state.isRTL);

	const customerTypeLabels: Record<CustomerType, { label: string; color: string }> = {
		visitor: {
			label: t("visitorType"),
			color: "bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300",
		},
		weekly: {
			label: t("weeklyMember"),
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		},
		"half-monthly": {
			label: t("halfMonthlyMember"),
			color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		},
		monthly: {
			label: t("monthlyMember"),
			color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
		},
	};

	const typeInfo = customerTypeLabels[customer.customerType];
	const initials = customer.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
	const formatDate = (dateStr: string) =>
		new Date(dateStr).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	const formatCurrency = (amount: number) => `${amount.toLocaleString("en-EG")} ${t("egp")}`;

	// Calculate real-time statistics from props
	const realTotalSpent = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
	const realTotalSessions = history.filter((op) => op.type === "session_end").length;
	const avgPerSession = realTotalSessions > 0 ? Math.round(realTotalSpent / realTotalSessions) : 0;

	return (
		<div className="space-y-6">
			{/* Header Actions */}
			<div className="flex items-center justify-between">
				<button
					className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
					onClick={onBack}
					type="button"
				>
					<ArrowLeft className="h-4 w-4 rtl:rotate-180" />
					{t("backToCustomers")}
				</button>
				<div className="flex gap-2">
					<button
						className="flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 font-medium text-sm text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
						onClick={onEdit}
						type="button"
					>
						<Edit className="h-4 w-4" />
						{t("edit")}
					</button>
					<button
						className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 font-medium text-sm text-white hover:bg-red-700"
						onClick={onDelete}
						type="button"
					>
						<Trash2 className="h-4 w-4" />
						{t("delete")}
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
				{/* Left Column: Info & Stats */}
				<div className="space-y-6 lg:col-span-1">
					{/* Info Card */}
					<div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
						<div className="flex flex-col items-center text-center">
							<div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 text-3xl shadow-sm dark:bg-amber-900/30 dark:text-amber-400">
								{initials}
							</div>
							<h2 className="mb-1 font-bold text-stone-900 text-xl dark:text-stone-100">
								{customer.name}
							</h2>
							<span
								className={`mb-2 rounded-full px-2.5 py-0.5 font-bold text-xs uppercase tracking-wider ${typeInfo.color}`}
							>
								{typeInfo.label}
							</span>
							<p className="font-mono text-stone-400 text-xs uppercase tracking-widest dark:text-stone-500">
								{customer.humanId}
							</p>
						</div>

						<div className="mt-6 space-y-3 border-stone-100 border-t pt-4 dark:border-stone-800">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-stone-600 text-sm dark:text-stone-400">
									<Phone className="h-4 w-4" />
									<span>{t("phone")}</span>
								</div>
								<span className="font-medium text-stone-900 text-sm dark:text-stone-100" dir="ltr">
									{customer.phone}
								</span>
							</div>

							{customer.email && (
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-stone-600 text-sm dark:text-stone-400">
										<Mail className="h-4 w-4" />
										<span>{t("email")}</span>
									</div>
									<span className="font-medium text-stone-900 text-sm dark:text-stone-100">
										{customer.email}
									</span>
								</div>
							)}

							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-stone-600 text-sm dark:text-stone-400">
									<Calendar className="h-4 w-4" />
									<span>{t("memberSince")}</span>
								</div>
								<span className="font-medium text-stone-900 text-sm dark:text-stone-100">
									{formatDate(customer.createdAt)}
								</span>
							</div>

							<div className="flex items-center justify-between border-stone-100 border-t pt-3 dark:border-stone-800">
								<span className="font-bold text-stone-500 text-xs uppercase tracking-wider">
									{t("balance")}
								</span>
								<span
									className={`font-black text-lg ${customer.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
								>
									{formatCurrency(customer.balance)}
								</span>
							</div>
						</div>

						{customer.notes && (
							<div className="mt-4 rounded-lg border border-stone-100 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-800/50">
								<p className="text-center text-stone-600 text-xs leading-relaxed italic dark:text-stone-400">
									"{customer.notes}"
								</p>
							</div>
						)}
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 gap-3">
						<div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
							<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
								<Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<p className="font-bold text-[10px] text-stone-400 uppercase tracking-wider">
									{t("totalSessions")}
								</p>
								<p className="font-black text-lg text-stone-900 dark:text-stone-100">
									{realTotalSessions}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
							<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
								<Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
							</div>
							<div>
								<p className="font-bold text-[10px] text-stone-400 uppercase tracking-wider">
									{t("totalSpent")}
								</p>
								<p className="font-black text-lg text-stone-900 dark:text-stone-100">
									{formatCurrency(realTotalSpent)}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
							<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
								<CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
							</div>
							<div>
								<p className="font-bold text-[10px] text-stone-400 uppercase tracking-wider">
									{t("avgPerSession")}
								</p>
								<p className="font-black text-lg text-stone-900 dark:text-stone-100">
									{formatCurrency(avgPerSession)}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column: Invoices & History */}
				<div className="space-y-6 lg:col-span-3">
					{/* Invoices Section */}
					<div className="space-y-4">
						<h3 className="flex items-center gap-2 font-bold text-lg text-stone-900 dark:text-stone-100">
							<FileText className="h-5 w-5 text-stone-400" />
							{t("invoices")}
						</h3>

						{invoices.length > 0 ? (
							<div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
								<div
									className={`hidden grid-cols-12 gap-4 border-stone-200 border-b bg-stone-50 px-4 py-3 md:grid dark:border-stone-800 dark:bg-stone-800/50 ${isRTL ? "text-end" : "text-start"}`}
								>
									<div className="col-span-2 font-semibold text-stone-500 text-xs uppercase dark:text-stone-400">
										{t("invoiceNumber")}
									</div>
									<div className="col-span-3 font-semibold text-stone-500 text-xs uppercase dark:text-stone-400">
										{t("customer")}
									</div>
									<div className="col-span-2 text-center font-semibold text-stone-500 text-xs uppercase dark:text-stone-400">
										{t("amount")}
									</div>
									<div className="col-span-2 text-center font-semibold text-stone-500 text-xs uppercase dark:text-stone-400">
										{t("status")}
									</div>
									<div className="col-span-1 text-center font-semibold text-stone-500 text-xs uppercase dark:text-stone-400">
										{t("dueDate")}
									</div>
									<div className="col-span-2 text-center font-semibold text-stone-500 text-xs uppercase dark:text-stone-400">
										{t("actions")}
									</div>
								</div>

								<div className="scrollbar-thin max-h-[350px] divide-y divide-stone-100 overflow-y-auto dark:divide-stone-800">
									{invoices.map((invoice) => (
										<InvoiceRow
											invoice={invoice}
											key={invoice.id}
											onView={() => onViewInvoice?.(invoice.id)}
										/>
									))}
								</div>
							</div>
						) : (
							<div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 py-12 text-center text-stone-500 dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-400">
								<FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
								<p>{t("noInvoicesFound")}</p>
							</div>
						)}
					</div>

					{/* History Section */}
					<div className="space-y-4">
						<h3 className="flex items-center gap-2 font-bold text-lg text-stone-900 dark:text-stone-100">
							<HistoryIcon className="h-5 w-5 text-stone-400" />
							{t("history")}
						</h3>

						{history.length > 0 ? (
							<div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
								<div className="scrollbar-thin max-h-[350px] divide-y divide-stone-100 overflow-y-auto dark:divide-stone-800">
									{history.map((op) => (
										<div
											className="flex items-center justify-between p-4 hover:bg-stone-50 dark:hover:bg-stone-800/50"
											key={op.id}
										>
											<div>
												<p className="font-medium text-stone-900 text-sm dark:text-stone-100">
													{op.description}
												</p>
												<p className="mt-0.5 text-stone-500 text-xs dark:text-stone-400">
													{new Date(op.timestamp).toLocaleString(
														language === "ar" ? "ar-EG" : "en-US",
													)}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						) : (
							<div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 py-12 text-center text-stone-500 dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-400">
								<HistoryIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
								<p>{t("noOperations")}</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
