import { Search } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAppStore } from "@/stores/use-app-store";
import type { Invoice, InvoiceStatus } from "@/types";
import { InvoiceRow } from "./InvoiceRow";

interface InvoicesListProps {
	invoices: Invoice[];
	onView?: (id: string) => void;
	onRecordPayment?: (id: string) => void;
}

export function InvoicesList({ invoices, onView, onRecordPayment }: InvoicesListProps) {
	const t = useAppStore((state) => state.t);
	const isRTL = useAppStore((state) => state.isRTL);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");

	const filteredInvoices = invoices
		.filter((invoice) => {
			const matchesSearch =
				invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
				invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase());

			let matchesStatus = true;
			if (statusFilter === "paid") {
				matchesStatus = invoice.status === "paid";
			} else if (statusFilter === "unpaid") {
				matchesStatus = invoice.status === "unpaid" || invoice.status === "pending";
			} else if (statusFilter === "cancelled") {
				matchesStatus = invoice.status === "cancelled";
			}

			return matchesSearch && matchesStatus;
		})
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	const statusCounts = {
		all: invoices.length,
		paid: invoices.filter((i) => i.status === "paid").length,
		unpaid: invoices.filter((i) => i.status === "unpaid" || i.status === "pending").length,
		cancelled: invoices.filter((i) => i.status === "cancelled").length,
	};
	const totalAmount = filteredInvoices.reduce((sum, i) => sum + i.total, 0);
	const paidAmount = filteredInvoices.reduce((sum, i) => sum + i.paidAmount, 0);

	return (
		<div className="flex h-full flex-col space-y-6 p-6">
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div className={isRTL ? "text-end" : "text-start"}>
					<h1 className="font-bold text-2xl text-stone-900 dark:text-stone-100">{t("invoices")}</h1>
					<p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
						<span className="text-stone-700 dark:text-stone-300 font-medium">
							{t("totalAmount")}: {totalAmount.toLocaleString()} {t("egpCurrency")}
						</span>
						{" · "}
						<span className="text-emerald-600 dark:text-emerald-400 font-medium">
							{t("collectedAmount")}: {paidAmount.toLocaleString()} {t("egpCurrency")}
						</span>
					</p>
				</div>
			</div>

			<div className="flex flex-col gap-3 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
					<input
						className="w-full rounded-lg border border-stone-200 bg-white py-2 ps-10 pe-4 text-start text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900"
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder={t("searchInvoices")}
						type="text"
						value={searchQuery}
					/>
				</div>
				<div className="flex rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
					{(["all", "paid", "unpaid", "cancelled"] as const).map((status) => (
						<button
							className={`rounded-md px-4 py-2 font-medium text-sm transition-all ${statusFilter === status ? "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100" : "text-stone-600 dark:text-stone-400"}`}
							key={status}
							onClick={() => setStatusFilter(status)}
							type="button"
						>
							{status === "all" ? t("all") : t(status)} ({statusCounts[status]})
						</button>
					))}
				</div>
			</div>

			{filteredInvoices.length === 0 ? (
				<EmptyState
					description={
						searchQuery || statusFilter !== "all"
							? t("tryAdjustingFilters")
							: t("createFirstInvoice")
					}
					icon="invoices"
					title={searchQuery || statusFilter !== "all" ? t("noInvoicesFound") : t("noInvoicesYet")}
				/>
			) : (
				<div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
					{/* Table Header - Fixed */}
					<div className="hidden flex-shrink-0 grid-cols-12 gap-4 border-stone-200 border-b bg-stone-50 px-4 py-3 text-start md:grid dark:border-stone-800 dark:bg-stone-800/50">
						<div className="col-span-2 font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
							{t("invoiceNumber")}
						</div>
						<div className="col-span-3 font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
							{t("customer")}
						</div>
						<div className="col-span-2 text-center font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
							{t("amount")}
						</div>
						<div className="col-span-2 text-center font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
							{t("status")}
						</div>
						<div className="col-span-1 text-center font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
							{t("dueDate")}
						</div>
						<div className="col-span-2 text-center font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
							{t("actions")}
						</div>
					</div>

					{/* Table Body - Scrollable */}
					<div className="scrollbar-thin flex-1 overflow-y-auto">
						<div className="divide-y divide-stone-100 dark:divide-stone-800">
							{filteredInvoices.map((invoice) => (
								<InvoiceRow
									invoice={invoice}
									key={invoice.id}
									onRecordPayment={() => onRecordPayment?.(invoice.id)}
									onView={() => onView?.(invoice.id)}
								/>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
