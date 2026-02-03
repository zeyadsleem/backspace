import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Badge Variants (CVA)
// ============================================================================
const badgeVariants = cva(
	"inline-flex items-center justify-center rounded-full px-2.5 py-0.5 font-bold text-xs uppercase transition-colors",
	{
		variants: {
			variant: {
				default: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
				primary: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
				success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
				warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
				danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
				info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
				outline:
					"border border-stone-200 bg-transparent text-stone-600 dark:border-stone-700 dark:text-stone-300",
			},
			size: {
				sm: "px-2 py-0.5 text-[10px]",
				md: "px-2.5 py-0.5 text-xs",
				lg: "px-3 py-1 text-xs",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	},
);

// ============================================================================
// Badge Component
// ============================================================================
export interface BadgeProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
	({ className, variant, size, ...props }, ref) => {
		return (
			<span className={cn(badgeVariants({ variant, size, className }))} ref={ref} {...props} />
		);
	},
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
