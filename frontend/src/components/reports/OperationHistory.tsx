import {
	Coffee,
	CreditCard,
	FileText,
	Filter,
	History as HistoryIcon,
	Play,
	Receipt,
	Search,
	Square,
	UserPlus,
} from "lucide-react";
import { useState } from "react";
import { DashboardCard } from "@/components/shared";
import { EmptyState } from "@/components/shared/EmptyState";
import type { TranslationKey } from "@/lib/translations";
import { useAppStore } from "@/stores/use-app-store";
import type { OperationRecord, OperationType } from "@/types";

const operationConfig: Record<
	string,
	{ icon: typeof Play; labelKey: TranslationKey; color: string; bg: string }
> = {
	session_start: {
		icon: Play,
		labelKey: "session_start",
		color: "text-emerald-600 dark:text-emerald-400",
		bg: "bg-emerald-100 dark:bg-emerald-900/30",
	},
	session_end: {
		icon: Square,
		labelKey: "session_end",
		color: "text-stone-600 dark:text-stone-400",
		bg: "bg-stone-100 dark:bg-stone-800",
	},
	inventory_add: {
		icon: Coffee,
		labelKey: "inventory_add",
		color: "text-amber-600 dark:text-amber-400",
		bg: "bg-amber-100 dark:bg-amber-900/30",
	},
	invoice_created: {
		icon: FileText,
		labelKey: "invoice_created",
		color: "text-teal-600 dark:text-teal-400",
		bg: "bg-teal-100 dark:bg-teal-900/30",
	},
	payment_received: {
		icon: CreditCard,
		labelKey: "payment_received",
		color: "text-emerald-600 dark:text-emerald-400",
		bg: "bg-emerald-100 dark:bg-emerald-900/30",
	},
	invoice_paid: {
		icon: Receipt,
		labelKey: "payment_received",
		color: "text-emerald-600 dark:text-emerald-400",
		bg: "bg-emerald-100 dark:bg-emerald-900/30",
	},
	customer_new: {
		icon: UserPlus,
		labelKey: "customer_new",
		color: "text-purple-600 dark:text-purple-400",
		bg: "bg-purple-100 dark:bg-purple-900/30",
	},
	subscription_new: {
		icon: CreditCard,
		labelKey: "subscription_new",
		color: "text-indigo-600 dark:text-indigo-400",
		bg: "bg-indigo-100 dark:bg-indigo-900/30",
	},
};

interface OperationHistoryProps {
	operations: OperationRecord[];
	onOperationClick?: (id: string) => void;
}

export function OperationHistory({ operations, onOperationClick }: OperationHistoryProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState<OperationType | "all">("all");
	const t = useAppStore((state) => state.t);
	const language = useAppStore((state) => state.language);

	const filteredOperations = operations.filter((op) => {
		const matchesSearch = op.description.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesType = typeFilter === "all" || op.type === typeFilter;
		return matchesSearch && matchesType;
	});

	const formatTime = (timestamp: string) =>
		new Date(timestamp).toLocaleString(language === "ar" ? "ar-EG-u-nu-latn" : "en-US", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});

	return (
		<div className="flex h-full flex-1 flex-col space-y-6">
			<div className="flex flex-shrink-0 flex-col gap-3 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
					<input
						className="w-full rounded-lg border border-stone-200 bg-white py-2 ps-10 pe-4 text-start text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900"
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder={t("searchByNamePhone")}
						type="text"
						value={searchQuery}
					/>
				</div>
				<div className="relative">
					<Filter className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
					<select
						className="cursor-pointer appearance-none rounded-lg border border-stone-200 bg-white py-2 ps-10 pe-8 text-start text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900"
						onChange={(e) => setTypeFilter(e.target.value as OperationType | "all")}
						value={typeFilter}
					>
						<option value="all">{t("allTypes")}</option>
						{Object.entries(operationConfig).map(([type, config]) => (
							<option key={type} value={type}>
								{t(config.labelKey)}
							</option>
						))}
					</select>
				</div>
			</div>

			<DashboardCard
				className="flex-1"
				contentClassName="divide-y divide-stone-100 dark:divide-stone-800"
				icon={<HistoryIcon className="h-4 w-4" />}
				title={t("operationHistory")}
			>
				{filteredOperations.length === 0 ? (
					<EmptyState
						description={
							searchQuery || typeFilter !== "all" ? t("tryAdjustingFilters") : t("noOperations")
						}
						icon="history"
						size="sm"
						title={t("noOperations")}
					/>
				) : (
					filteredOperations.map((operation) => {
						const config = operationConfig[operation.type] || {
							icon: HistoryIcon,
							labelKey: "history",
							color: "text-stone-500",
							bg: "bg-stone-100",
						};
						const Icon = config.icon;
						return (
							<button
								className="flex w-full items-center gap-4 p-4 text-start transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50"
								key={operation.id}
								onClick={() => onOperationClick?.(operation.id)}
								type="button"
							>
								<div className={`flex-shrink-0 rounded-lg p-2 ${config.bg}`}>
									<Icon className={`h-4 w-4 ${config.color}`} />
								</div>
								<div className="min-w-0 flex-1 text-start">
									<p className="font-medium text-sm text-stone-900 dark:text-stone-100">
										{operation.description}
									</p>
									<p className="mt-0.5 text-stone-500 text-xs dark:text-stone-400">
										{t(config.labelKey as TranslationKey)}
									</p>
								</div>
								<span className="flex-shrink-0 text-stone-500 text-xs dark:text-stone-400">
									{formatTime(operation.timestamp)}
								</span>
							</button>
						);
					})
				)}
			</DashboardCard>
		</div>
	);
}
