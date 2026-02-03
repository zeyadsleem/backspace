import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Card
// ============================================================================
const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div
			className={cn(
				"rounded-xl border border-stone-200 bg-white shadow-sm",
				"dark:border-stone-800 dark:bg-stone-900",
				className,
			)}
			ref={ref}
			{...props}
		/>
	),
);
Card.displayName = "Card";

// ============================================================================
// CardHeader
// ============================================================================
const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div
			className={cn(
				"flex flex-col space-y-1.5 border-stone-100 border-b p-6 dark:border-stone-800",
				className,
			)}
			ref={ref}
			{...props}
		/>
	),
);
CardHeader.displayName = "CardHeader";

// ============================================================================
// CardTitle
// ============================================================================
const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({ className, ...props }, ref) => (
		<h3
			className={cn("font-bold text-lg text-stone-900 dark:text-stone-100", className)}
			ref={ref}
			{...props}
		/>
	),
);
CardTitle.displayName = "CardTitle";

// ============================================================================
// CardDescription
// ============================================================================
const CardDescription = forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p className={cn("text-sm text-stone-500 dark:text-stone-400", className)} ref={ref} {...props} />
));
CardDescription.displayName = "CardDescription";

// ============================================================================
// CardContent
// ============================================================================
const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => <div className={cn("p-6", className)} ref={ref} {...props} />,
);
CardContent.displayName = "CardContent";

// ============================================================================
// CardFooter
// ============================================================================
const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div
			className={cn(
				"flex items-center border-stone-100 border-t p-6 dark:border-stone-800",
				className,
			)}
			ref={ref}
			{...props}
		/>
	),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
