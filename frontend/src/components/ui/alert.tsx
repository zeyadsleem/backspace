import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { IconButton } from "./button";

// ============================================================================
// Alert Variants (CVA)
// ============================================================================
const alertVariants = cva("relative flex items-start gap-3 rounded-xl border p-4 transition-all", {
	variants: {
		variant: {
			info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-300",
			success:
				"border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-300",
			warning:
				"border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-300",
			danger:
				"border-red-200 bg-red-50 text-red-900 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300",
			default:
				"border-stone-200 bg-stone-50 text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

const alertIconVariants = cva("h-5 w-5 flex-shrink-0", {
	variants: {
		variant: {
			info: "text-blue-600 dark:text-blue-400",
			success: "text-emerald-600 dark:text-emerald-400",
			warning: "text-amber-600 dark:text-amber-400",
			danger: "text-red-600 dark:text-red-400",
			default: "text-stone-600 dark:text-stone-400",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

// ============================================================================
// Alert Component
// ============================================================================
export interface AlertProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof alertVariants> {
	icon?: React.ReactNode;
	showIcon?: boolean;
	dismissible?: boolean;
	onDismiss?: () => void;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
	(
		{
			className,
			variant,
			icon,
			showIcon = true,
			dismissible = false,
			onDismiss,
			children,
			...props
		},
		ref,
	) => {
		const defaultIcon = {
			info: <Info className={alertIconVariants({ variant })} />,
			success: <CheckCircle className={alertIconVariants({ variant })} />,
			warning: <AlertTriangle className={alertIconVariants({ variant })} />,
			danger: <AlertCircle className={alertIconVariants({ variant })} />,
			default: <Info className={alertIconVariants({ variant })} />,
		};

		return (
			<div className={cn(alertVariants({ variant, className }))} ref={ref} {...props}>
				{showIcon && (icon || defaultIcon[variant || "default"])}
				<div className="flex-1">{children}</div>
				{dismissible && onDismiss && (
					<IconButton
						className="absolute end-2 top-2"
						icon={<X className="h-4 w-4" />}
						label="Dismiss"
						onClick={onDismiss}
						variant="ghost"
					/>
				)}
			</div>
		);
	},
);

Alert.displayName = "Alert";

// ============================================================================
// AlertTitle Component
// ============================================================================
const AlertTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({ className, ...props }, ref) => (
		<h5 className={cn("mb-1 font-bold text-sm leading-none", className)} ref={ref} {...props} />
	),
);

AlertTitle.displayName = "AlertTitle";

// ============================================================================
// AlertDescription Component
// ============================================================================
const AlertDescription = forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<div className={cn("text-sm leading-relaxed opacity-90", className)} ref={ref} {...props} />
));

AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription, alertVariants };
