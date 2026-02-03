import { CreditCard, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/stores/hooks";
import { useAppStore } from "@/stores/use-app-store";
import type { Invoice, InvoiceStatus } from "@/types";

interface InvoiceRowProps {
	invoice: Invoice;
	onView?: () => void;
	onRecordPayment?: () => void;
}

const statusConfig: Record<Exclude<InvoiceStatus, "pending">, { color: string; bg: string }> = {
	paid: {
		color: "text-emerald-600 dark:text-emerald-400",
		bg: "bg-emerald-100 dark:bg-emerald-900/30",
	},
	unpaid: {
		color: "text-red-600 dark:text-red-400",
		bg: "bg-red-100 dark:bg-red-900/30",
	},
	cancelled: {
		color: "text-stone-500 dark:text-stone-400",
		bg: "bg-stone-100 dark:bg-stone-800",
	},
};

export function InvoiceRow({ invoice, onView, onRecordPayment }: InvoiceRowProps) {
	const t = useTranslation();
	const isRTL = useAppStore((state) => state.isRTL);
	const config = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.unpaid;

	const formatDate = (dateStr: string) =>
		new Date(dateStr).toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
			month: "short",
			day: "numeric",
		});

	const getTypeLabel = (type?: string) => {
		switch (type) {
			case "withdrawal":
				return t("withdrawal");
			case "refund":
				return t("refund");
			default:
				return t("invoice"); // Or just leave empty for sales
		}
	};

	return (
		<div className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-stone-50 md:grid md:grid-cols-12 md:gap-4 dark:hover:bg-stone-800/50">
			{/* Invoice info */}
			<div className="flex items-center gap-2 md:col-span-2">
				<span className="font-bold font-mono text-stone-500 text-xs uppercase tracking-tight dark:text-stone-400">
					{invoice.invoiceNumber}
				</span>
				{(invoice.invoiceType === "withdrawal" || invoice.invoiceType === "refund") && (
					<span
						className={cn(
							"rounded-md px-1.5 py-0.5 font-bold text-[9px] uppercase tracking-wider",
							invoice.invoiceType === "withdrawal"
								? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
								: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
						)}
					>
						{getTypeLabel(invoice.invoiceType)}
					</span>
				)}
			</div>

			{/* Customer section */}
			<div className="flex items-center md:col-span-3">
				<div className="text-start">
					<p className="font-semibold text-sm text-stone-900 dark:text-stone-100">
						{invoice.customerName}
					</p>
					<p className="font-mono text-stone-400 text-xs dark:text-stone-500">
						{invoice.customerPhone}
					</p>
				</div>
			</div>

			{/* Amount info */}
			<div className="flex items-center justify-between border-stone-100 border-t pt-3 md:col-span-2 md:justify-center md:border-0 md:pt-0">
				<span className="text-[10px] text-stone-400 uppercase tracking-widest md:hidden">
					{t("amount")}
				</span>
				<div className="text-end md:text-center">
					<p className="font-black font-mono text-sm text-stone-900 dark:text-stone-100">
						{formatCurrency(invoice.total)}
					</p>
					{invoice.status === "unpaid" && invoice.paidAmount > 0 && (
						<p className="font-bold font-mono text-[10px] text-amber-600 uppercase dark:text-amber-400">
							{formatCurrency(invoice.total - invoice.paidAmount)} {t("remaining")}
						</p>
					)}
				</div>
			</div>

			{/* Status */}
			<div className="flex items-center justify-between md:col-span-2 md:justify-center">
				<span className="text-[10px] text-stone-400 uppercase tracking-widest md:hidden">
					{t("status")}
				</span>
				<span
					className={cn(
						"rounded-full px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider",
						config.bg,
						config.color,
					)}
				>
					{t(invoice.status)}
				</span>
			</div>

			{/* Due Date */}
			<div className="flex items-center justify-between md:col-span-1 md:justify-center">
				<span className="text-[10px] text-stone-400 uppercase tracking-widest md:hidden">
					{t("dueDate")}
				</span>
				<span className="font-medium text-stone-600 text-xs dark:text-stone-400">
					{formatDate(invoice.dueDate)}
				</span>
			</div>

			{/* Actions */}
			<div className="flex justify-end gap-2 md:col-span-2 md:justify-center">
				<Button
					className="flex-1 md:flex-none md:bg-transparent md:text-stone-400 md:hover:bg-transparent md:hover:text-stone-700 dark:md:text-stone-400 dark:md:hover:text-stone-300"
					onClick={onView}
					size="sm"
					title={t("viewInvoice")}
					variant="ghost"
				>
					<Eye className="h-4 w-4" />
					<span className="font-medium text-[10px] uppercase md:hidden">{t("view")}</span>
				</Button>
				{invoice.status !== "paid" && invoice.status !== "cancelled" && (
					<Button
						className="flex-1 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 md:flex-none md:bg-transparent md:text-emerald-500 md:hover:bg-transparent md:hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
						onClick={onRecordPayment}
						size="sm"
						title={t("recordPayment")}
						variant="ghost"
					>
						<CreditCard className="h-4 w-4" />
						<span className="font-medium text-[10px] uppercase md:hidden">{t("payNow")}</span>
					</Button>
				)}
			</div>
		</div>
	);
}
