import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/use-app-store";
import type { Customer, CustomerType } from "@/types";

interface CustomerRowProps {
	customer: Customer;
	onView?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
}

export function CustomerRow({ customer, onView, onEdit, onDelete }: CustomerRowProps) {
	const t = useAppStore((state) => state.t);

	const typeConfig: Record<CustomerType, { labelKey: TranslationKey; color: string; bg: string }> =
		{
			visitor: {
				labelKey: "visitorType",
				color: "text-stone-600 dark:text-stone-400",
				bg: "bg-stone-100 dark:bg-stone-800",
			},
			weekly: {
				labelKey: "weeklyMember",
				color: "text-blue-600 dark:text-blue-400",
				bg: "bg-blue-50 dark:bg-blue-900/30",
			},
			"half-monthly": {
				labelKey: "halfMonthlyMember",
				color: "text-purple-600 dark:text-purple-400",
				bg: "bg-purple-50 dark:bg-purple-900/30",
			},
			monthly: {
				labelKey: "monthlyMember",
				color: "text-amber-600 dark:text-amber-400",
				bg: "bg-amber-50 dark:bg-amber-900/30",
			},
		};

	const config = typeConfig[customer.customerType];
	const initials = customer.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
	const formatBalance = (balance: number) => {
		const formatted = Math.abs(balance).toLocaleString("en-EG");
		if (balance < 0) {
			return `-${formatted} ${t("egp")}`;
		}
		if (balance > 0) {
			return `+${formatted} ${t("egp")}`;
		}
		return `0 ${t("egp")}`;
	};

	return (
		<div className="flex flex-col gap-4 p-4 transition-colors hover:bg-stone-50 md:grid md:grid-cols-12 md:gap-4 dark:hover:bg-stone-800/50">
			{/* ID section */}
			<div className="flex items-center md:col-span-1">
				<span className="font-mono text-[10px] text-stone-400 uppercase tracking-tight">
					{customer.humanId}
				</span>
			</div>

			{/* Name section */}
			<div className="flex items-center gap-3 md:col-span-3">
				<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
					<span className="font-semibold text-amber-700 text-xs dark:text-amber-300">
						{initials}
					</span>
				</div>
				<div className="min-w-0 flex-1 text-start">
					<p className="truncate font-semibold text-sm text-stone-900 dark:text-stone-100">
						{customer.name}
					</p>
				</div>
			</div>

			{/* Phone section */}
			<div className="flex items-center gap-2 md:col-span-2">
				<span className="font-mono text-sm text-stone-600 md:text-stone-500 dark:text-stone-400">
					{customer.phone}
				</span>
			</div>

			{/* Type section */}
			<div className="flex items-center md:col-span-2">
				<span
					className={`rounded-full px-2.5 py-1 font-medium text-xs ${config.bg} ${config.color}`}
				>
					{t(config.labelKey)}
				</span>
			</div>

			{/* Balance section */}
			<div className="flex items-center justify-between border-stone-100 border-t pt-3 md:col-span-2 md:justify-center md:border-0 md:pt-0">
				<span className="text-stone-400 text-xs uppercase tracking-widest md:hidden">
					{t("balance")}
				</span>
				<span
					className={cn(
						"font-bold text-sm",
						customer.balance < 0 && "text-red-600 dark:text-red-400",
						customer.balance > 0 && "text-emerald-600 dark:text-emerald-400",
						customer.balance === 0 && "text-stone-500 dark:text-stone-400",
					)}
				>
					{formatBalance(customer.balance)}
				</span>
			</div>

			{/* Actions section */}
			<div className="flex items-center justify-end gap-2 md:col-span-2 md:justify-center">
				<Button
					className="flex-1 md:flex-none md:bg-transparent md:text-stone-400 md:hover:bg-transparent md:hover:text-stone-700 dark:md:text-stone-400 dark:md:hover:text-stone-300"
					onClick={onView}
					size="sm"
					title={t("view")}
					variant="ghost"
				>
					<Eye className="h-4 w-4" />
					<span className="ml-2 font-medium text-xs md:hidden">{t("view")}</span>
				</Button>
				<Button
					className="flex-1 md:flex-none md:bg-transparent md:text-stone-400 md:hover:bg-transparent md:hover:text-amber-600 dark:text-stone-400 dark:hover:bg-amber-900/20"
					onClick={onEdit}
					size="sm"
					title={t("edit")}
					variant="ghost"
				>
					<Pencil className="h-4 w-4" />
					<span className="ml-2 font-medium text-xs md:hidden">{t("edit")}</span>
				</Button>
				<Button
					className="flex-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 md:flex-none md:bg-transparent md:text-stone-400 md:hover:bg-transparent md:hover:text-red-600 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
					onClick={onDelete}
					size="sm"
					title={t("delete")}
					variant="ghost"
				>
					<Trash2 className="h-4 w-4" />
					<span className="ml-2 font-medium text-xs md:hidden">{t("delete")}</span>
				</Button>
			</div>
		</div>
	);
}
