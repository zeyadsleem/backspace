import type { ReactNode } from "react";

interface MetricCardProps {
	title: string;
	value: string;
	subtitle?: string;
	icon?: ReactNode;
	variant?: "default" | "primary" | "success";
	onClick?: () => void;
}

export function MetricCard({
	title,
	value,
	subtitle,
	icon,
	variant = "default",
	onClick,
}: MetricCardProps) {
	const variantStyles = {
		default: {
			container: "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800",
			icon: "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400",
			value: "text-stone-900 dark:text-stone-100",
		},
		primary: {
			container: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50",
			icon: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400",
			value: "text-amber-700 dark:text-amber-300",
		},
		success: {
			container:
				"bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50",
			icon: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
			value: "text-emerald-700 dark:text-emerald-300",
		},
	};

	const styles = variantStyles[variant];

	return (
		<button
			className={`w-full rounded-xl border 3xl:p-6 p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] ${styles.container} ${onClick ? "cursor-pointer" : "cursor-default"} text-start`}
			onClick={onClick}
			type="button"
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1 text-start">
					<p className="font-medium 3xl:text-sm text-[11px] text-stone-500 dark:text-stone-400">
						{title}
					</p>
					<p className={`mt-1 font-normal text-2xl lg:text-3xl ${styles.value} 3xl:text-4xl`}>
						{value}
					</p>
					{subtitle && (
						<p className="mt-1.5 font-medium 3xl:text-sm text-stone-600 text-xs dark:text-stone-400">
							{subtitle}
						</p>
					)}
				</div>
				{icon && (
					<div className={`flex-shrink-0 rounded-xl 3xl:p-3.5 p-2.5 ${styles.icon}`}>{icon}</div>
				)}
			</div>
		</button>
	);
}
