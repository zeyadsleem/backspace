import {
	Clock,
	CreditCard,
	FileText,
	History as HistoryIcon,
	Inbox,
	Monitor,
	Package,
	Plus,
	Search,
	Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EmptyStateIcon =
	| "users"
	| "resources"
	| "sessions"
	| "inventory"
	| "invoices"
	| "subscriptions"
	| "search"
	| "history"
	| "default";

export interface EmptyStateProps {
	icon?: EmptyStateIcon;
	title: string;
	description?: string;
	actionText?: string;
	actionIcon?: React.ReactNode;
	onAction?: () => void;
	className?: string;
	size?: "default" | "sm";
}

const iconMap: Record<EmptyStateIcon, React.ComponentType<{ className?: string }>> = {
	users: Users,
	resources: Monitor,
	sessions: Clock,
	inventory: Package,
	invoices: FileText,
	subscriptions: CreditCard,
	search: Search,
	history: HistoryIcon,
	default: Inbox,
};

export function EmptyState({
	icon = "default",
	title,
	description,
	actionText,
	actionIcon = <Plus className="h-4 w-4" />,
	onAction,
	className,
	size = "default",
}: EmptyStateProps) {
	const IconComponent = iconMap[icon];

	if (size === "sm") {
		return (
			<div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
				<IconComponent className="mb-2 h-6 w-6 text-stone-300 dark:text-stone-600" />
				<h3 className="font-medium text-stone-500 text-xs dark:text-stone-400">{title}</h3>
				{description && (
					<p className="mt-1 max-w-[200px] text-[10px] text-stone-400 dark:text-stone-500">
						{description}
					</p>
				)}
				{actionText && onAction && (
					<Button className="mt-3 h-8 text-xs" onClick={onAction} size="sm" variant="outline">
						{actionIcon}
						{actionText}
					</Button>
				)}
			</div>
		);
	}

	return (
		<div className={cn("flex flex-col items-center justify-center py-10 text-center", className)}>
			<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
				<IconComponent className="h-7 w-7 text-stone-400 dark:text-stone-500" />
			</div>
			<h3 className="font-semibold text-base text-stone-900 dark:text-stone-100">{title}</h3>
			{description && (
				<p className="mt-2 max-w-sm text-sm text-stone-600 dark:text-stone-400">{description}</p>
			)}
			{actionText && onAction && (
				<Button className="mt-6" onClick={onAction} size="md" variant="primary">
					{actionIcon}
					{actionText}
				</Button>
			)}
		</div>
	);
}
