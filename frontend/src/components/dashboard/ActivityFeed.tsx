import {
	Activity,
	Coffee,
	CreditCard,
	FileText,
	Play,
	Receipt,
	Square,
	UserPlus,
} from "lucide-react";
import { DashboardCard } from "@/components/shared";
import { useAppStore } from "@/stores/use-app-store";
import type { RecentActivity } from "@/types";

interface ActivityFeedProps {
	activities: RecentActivity[];
}

const activityConfig: Record<
	RecentActivity["type"],
	{ icon: typeof Play; color: string; bg: string }
> = {
	session_start: {
		icon: Play,
		color: "text-emerald-600 dark:text-emerald-400",
		bg: "bg-emerald-100 dark:bg-emerald-900/50",
	},
	session_end: {
		icon: Square,
		color: "text-stone-600 dark:text-stone-400",
		bg: "bg-stone-100 dark:bg-stone-800",
	},
	inventory_add: {
		icon: Coffee,
		color: "text-amber-600 dark:text-amber-400",
		bg: "bg-amber-100 dark:bg-amber-900/50",
	},
	customer_new: {
		icon: UserPlus,
		color: "text-blue-600 dark:text-blue-400",
		bg: "bg-blue-100 dark:bg-blue-900/50",
	},
	invoice_paid: {
		icon: Receipt,
		color: "text-emerald-600 dark:text-emerald-400",
		bg: "bg-emerald-100 dark:bg-emerald-900/50",
	},
	subscription_new: {
		icon: CreditCard,
		color: "text-purple-600 dark:text-purple-400",
		bg: "bg-purple-100 dark:bg-purple-900/50",
	},
	invoice_created: {
		icon: FileText,
		color: "text-teal-600 dark:text-teal-400",
		bg: "bg-teal-100 dark:bg-teal-900/50",
	},
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
	const t = useAppStore((state) => state.t);
	const language = useAppStore((state) => state.language);

	const formatTime = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60_000);
		if (diffMins < 1) {
			return t("justNow");
		}
		if (diffMins < 60) {
			return t("mAgo", { m: diffMins });
		}
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) {
			return t("hAgo", { h: diffHours });
		}
		return date.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
			month: "short",
			day: "numeric",
		});
	};

	return (
		<DashboardCard
			contentClassName="p-2"
			icon={<Activity className="h-4 w-4" />}
			title={t("recentActivity")}
		>
			<div className="divide-y divide-stone-100 dark:divide-stone-800/50">
				{activities.length === 0 ? (
					<p className="py-8 text-center text-sm text-stone-500 dark:text-stone-400">
						{t("noRecentActivity")}
					</p>
				) : (
					activities.map((activity) => {
						const config = activityConfig[activity.type];
						const Icon = config.icon;
						return (
							<div
								className="flex items-start gap-3 p-3 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50"
								key={activity.id}
							>
								<div className={`flex-shrink-0 rounded-lg p-2 ${config.bg}`}>
									<Icon className={`h-4 w-4 ${config.color}`} />
								</div>
								<div className="min-w-0 flex-1">
									<p className="font-medium text-sm text-stone-700 leading-snug dark:text-stone-300">
										{activity.description}
									</p>
									<p className="mt-1 text-stone-400 text-xs dark:text-stone-500">
										{formatTime(activity.timestamp)}
									</p>
								</div>
							</div>
						);
					})
				)}
			</div>
		</DashboardCard>
	);
}
